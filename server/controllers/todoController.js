import asyncHandler from "../middleware/asyncHandler.js";
import Todo from "../models/Todo.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all todos for logged in user
// @route   GET /todos
// @access  Private
export const getTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });

  // Logic to 'reset' recurring tasks that were completed on previous days
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const updatedTodos = await Promise.all(
    todos.map(async (todo) => {
      if (todo.isRecurring && todo.isCompleted && todo.completedAt) {
        const completedDate = new Date(todo.completedAt);
        completedDate.setHours(0, 0, 0, 0);

        // If completed BEFORE today, reset it for today
        if (completedDate < todayStart) {
          todo.isCompleted = false;
          todo.completedAt = null; // Reset for new day
          await todo.save();
        }
      }
      return todo;
    }),
  );

  res.json(updatedTodos);
});

// @desc    Create a todo
// @route   POST /todos
// @access  Private
export const createTodo = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    manualReminderTime,
    isRecurring,
    priority,
    tags,
  } = req.body;

  // Industry Standard: Map boolean to explicit ENUM type
  const type = isRecurring ? "ROUTINE" : "TASK";

  const todo = new Todo({
    title,
    description,
    manualReminderTime,
    isRecurring, // Keep keeping it in sync
    type,
    priority: priority || "MEDIUM",
    tags: tags || [],
    user: req.user._id,
  });

  const savedTodo = await todo.save();
  res.status(201).json(savedTodo);
});

// @desc    Update a todo
// @route   PUT /todos/:id
// @access  Private
export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  // Check for user
  if (todo.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Handle completion timestamp & History
  if (req.body.isCompleted !== undefined) {
    if (req.body.isCompleted && !todo.isCompleted) {
      // Marking as Done
      req.body.completedAt = new Date();
      if (todo.isRecurring) {
        // Add to history if not already there for today
        const todayStr = new Date().toDateString();
        const alreadyLogged = todo.completionHistory.some(
          (d) => new Date(d).toDateString() === todayStr,
        );
        if (!alreadyLogged) {
          req.body.$push = { completionHistory: new Date() };
        }
      }
    } else if (!req.body.isCompleted) {
      // Marking as Not Done
      req.body.completedAt = null;
      // Optional: Remove from history if unticked same day?
      // For now, let's keep history stricter (only add on completion).
      if (todo.isRecurring) {
        // Logic to pop? Leaving simple for now.
      }
    }
  }

  const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedTodo);
});

// @desc    Delete a todo
// @route   DELETE /todos/:id
// @access  Private
export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  // Check for user
  if (todo.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo removed" });
});

// @desc    Get stats for graphs
// @route   GET /api/todos/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  const { range, timezoneOffset = 0 } = req.query; // timezoneOffset in minutes
  const userId = req.user._id;
  const now = new Date();

  // Helper to get start date
  let startDate = new Date();

  // Aggregation pipeline
  let matchStage = {
    user: userId,
    isCompleted: true,
    completedAt: { $ne: null },
  };

  let groupByFormat;
  let labels = [];

  if (range === "weekly") {
    // Last 7 days
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    matchStage.completedAt = { $gte: startDate };
    groupByFormat = "%Y-%m-%d";
  } else if (range === "monthly") {
    // This entire month (1st to now)
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    matchStage.completedAt = { $gte: startDate };
    groupByFormat = "%Y-%m-%d";
  } else if (range === "yearly") {
    // This entire year (Jan 1st to now)
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
    matchStage.completedAt = { $gte: startDate };
    groupByFormat = "%Y-%m";
  } else {
    // Default to Weekly
    startDate.setDate(now.getDate() - 6);
    matchStage.completedAt = { $gte: startDate };
    groupByFormat = "%Y-%m-%d";
  }

  const stats = await Todo.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: groupByFormat, date: "$completedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing dates/months with 0
  const finalData = [];
  const finalLabels = [];

  if (range === "yearly") {
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), i, 1);
      const key = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleString("default", { month: "short" });

      const found = stats.find((s) => s._id === key);
      finalLabels.push(monthName);
      finalData.push(found ? found.count : 0);
    }
  } else {
    // For Daily/Weekly/Monthly (Day-based)
    // If Monthly, iterate from 1st to today. If Weekly, last 7 days.
    let current = new Date(startDate);
    const end = new Date();

    while (current <= end) {
      const key = current.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = current.getDate().toString(); // Just the day number
      const dayName = current.toLocaleDateString("default", {
        weekday: "short",
      }); // M, T, W...

      const found = stats.find((s) => s._id === key);

      finalLabels.push(range === "weekly" ? dayName : label);
      finalData.push(found ? found.count : 0);

      current.setDate(current.getDate() + 1);
    }
  }

  // Completion Rate (All Time)
  const totalTasks = await Todo.countDocuments({ user: userId });
  const completedTasks = await Todo.countDocuments({
    user: userId,
    isCompleted: true,
  });

  // Streak Calculation (Basic)
  // Find consecutive days with at least 1 completed task backwards from today
  // ... (Simplified for now: just return 0 or calculate if time permits. Let's send basic stats first)

  res.json({
    labels: finalLabels,
    data: finalData,
    completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
    totalCompleted: completedTasks,
  });
});

// @desc    Send email
// @route   POST /send-mail
// @access  Private
export const sendMail = asyncHandler(async (req, res) => {
  const { to, subject, text } = req.body;

  // Basic validation
  if (!to || !subject || !text) {
    res.status(400);
    throw new Error("Please provide to, subject, and text");
  }

  try {
    await sendEmail({ to, subject, text });
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Get history for a specific date
// @route   GET /api/todos/history
// @access  Private
export const getHistory = asyncHandler(async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  // Create start and end of that specific day
  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  // Find tasks that were either:
  // 1. One-off and completed on that day (completedAt)
  // 2. Recurring and have an entry in completionHistory on that day

  const tasks = await Todo.find({
    user: req.user._id,
    $or: [
      {
        isRecurring: false,
        isCompleted: true,
        completedAt: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        isRecurring: true,
        completionHistory: {
          $elemMatch: { $gte: startOfDay, $lte: endOfDay },
        },
      },
    ],
  }).select("title description isRecurring completedAt");

  res.json(tasks);
});
