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
    scheduledTime,
    duration,
    reminderType,
    nagInterval,
    nagDuration,
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
    scheduledTime,
    duration: duration || 30, // Default 30m
    reminderType: reminderType || "NORMAL",
    nagInterval: nagInterval || 5, // Default 5m
    nagDuration: nagDuration || 60, // Default 60m
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
// @desc    Get stats for graphs
// @route   GET /api/todos/stats
// @access  Private
// @desc    Get stats for graphs
// @route   GET /api/todos/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  const { range, year, timezoneOffset = 0 } = req.query; // timezoneOffset in minutes
  const userId = req.user._id;
  const now = new Date();

  // 1. Determine Date Range & Format for Graphs
  let startDate = new Date();
  let endDate = new Date();
  let groupByFormat = "%Y-%m-%d";

  if (range === "weekly") {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "monthly") {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "yearly") {
    const selectedYear = parseInt(year) || now.getFullYear();
    startDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    groupByFormat = "%Y-%m-%d";
  }

  // 2. Main Stats Aggregation (for the specific range graph)
  const rangePipeline = [
    { $match: { user: userId } },
    {
      $project: {
        allCompletions: {
          $concatArrays: [
            { $ifNull: ["$completionHistory", []] },
            {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRecurring", false] },
                    { $ne: ["$completedAt", null] },
                  ],
                },
                ["$completedAt"],
                [],
              ],
            },
          ],
        },
      },
    },
    { $unwind: "$allCompletions" },
    { $match: { allCompletions: { $gte: startDate, $lte: endDate } } }, // Filter by range
    {
      $group: {
        _id: {
          $dateToString: { format: groupByFormat, date: "$allCompletions" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const chartStats = await Todo.aggregate(rangePipeline);

  // 3. Streak Calculation (Requires ALL time history, strictly Daily)
  const streakPipeline = [
    { $match: { user: userId } },
    {
      $project: {
        allCompletions: {
          $concatArrays: [
            { $ifNull: ["$completionHistory", []] },
            {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isRecurring", false] },
                    { $ne: ["$completedAt", null] },
                  ],
                },
                ["$completedAt"],
                [],
              ],
            },
          ],
        },
      },
    },
    { $unwind: "$allCompletions" },
    // We only care about unique dates for streak
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$allCompletions" } },
      },
    },
    { $sort: { _id: -1 } }, // Descending (Today -> Past)
  ];

  const streakData = await Todo.aggregate(streakPipeline);
  const uniqueDates = streakData.map((d) => d._id); // ["2024-02-14", "2024-02-13", ...]

  // Streak Logic
  let streak = 0;
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // If user hasn't done anything today OR yesterday, streak is 0.
  // Exception: If they did it today, streak starts. If they missed today provided it's late?
  // Standard logic: specific check.
  if (uniqueDates.length > 0) {
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      // Streak is active
      let currentTestDate = new Date(uniqueDates[0]); // Start with the latest valid completion

      for (let i = 0; i < uniqueDates.length; i++) {
        const dateStr = uniqueDates[i];
        // Compare dateStr with currentTestDate string
        if (dateStr === currentTestDate.toISOString().slice(0, 10)) {
          streak++;
          currentTestDate.setDate(currentTestDate.getDate() - 1); // Go back one day
        } else {
          // Gap detected
          break;
        }
      }
    }
  }

  // 4. completionRate & Total
  // Using simplified counts for speed
  const totalTasksCreated = await Todo.countDocuments({ user: userId });
  // Total completions and focus time (all time events)
  const totalAgg = await Todo.aggregate([
    { $match: { user: userId } },
    {
      $project: {
        totalCount: {
          $size: {
            $concatArrays: [
              { $ifNull: ["$completionHistory", []] },
              {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isRecurring", false] },
                      { $eq: ["$isCompleted", true] },
                    ],
                  },
                  [1],
                  [],
                ],
              },
            ],
          },
        },
        timeSpent: { $ifNull: ["$timeSpent", 0] },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalCount" }, totalTimeSpent: { $sum: "$timeSpent" } } },
  ]);
  const totalCompleted = totalAgg[0]?.total || 0;
  const totalFocusTime = totalAgg[0]?.totalTimeSpent || 0; // In seconds

  // Daily completion rate: today's completed / today's total tasks
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayTotal = await Todo.countDocuments({
    user: userId,
    $or: [
      { isRecurring: true },
      { isRecurring: false, createdAt: { $gte: todayStart, $lte: todayEnd } },
      { isRecurring: false, isCompleted: false },
    ],
  });

  const todayCompleted = await Todo.countDocuments({
    user: userId,
    isCompleted: true,
    $or: [
      { isRecurring: true, completedAt: { $gte: todayStart } },
      { isRecurring: false, completedAt: { $gte: todayStart } },
    ],
  });

  const completionRate = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  // 5. Format Data for Frontend
  let finalLabels = [];
  let finalData = [];

  if (range === "yearly") {
    // Heatmap format: Array of { date: "YYYY-MM-DD", count: 1 }
    // The frontend contribution graph handles specific days.
    // We pass the raw daily data we got in `chartStats` (which is already grouped by day for Yearly query)
    finalData = chartStats.map((item) => ({
      date: item._id,
      count: item.count,
    }));
    // Labels aren't used for Heatmap the same way
  } else {
    // Bar/Line format logic (Filling gaps)
    const end = new Date();
    let current = new Date(startDate);

    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      const found = chartStats.find((s) => s._id === key);

      let label;
      if (range === "weekly") {
        label = current.toLocaleDateString("default", { weekday: "short" });
      } else {
        label = current.getDate().toString();
      }

      finalLabels.push(label);
      finalData.push(found ? found.count : 0);

      current.setDate(current.getDate() + 1);
    }
  }

  res.json({
    labels: finalLabels,
    data: finalData,
    completionRate,
    totalCompleted,
    totalFocusTime,
    streak,
    todayCompleted,
    todayTotal,
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
