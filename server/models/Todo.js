import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    type: {
      type: String,
      enum: ["TASK", "ROUTINE"],
      default: "TASK",
      index: true, // Faster queries for generic tasks vs routines
    },
    isRecurring: {
      // Keeping for backward compatibility, but ideally should rely on 'type'
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "ARCHIVED"],
      default: "PENDING",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      index: true, // For stats queries
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    manualReminderTime: {
      type: Date,
    },
    completionHistory: [
      {
        type: Date,
      },
    ],
    // 1. Scheduling (Timeline View)
    scheduledTime: {
      type: Date,
      index: true, // For sorting timeline
    },
    duration: {
      type: Number, // in minutes (e.g., 60 for 1 hour)
      default: 30,
    },

    // 2. Nagging Reminders
    reminderType: {
      type: String,
      enum: ["NORMAL", "NAGGING"], // NORMAL = Once, NAGGING = Every X min until done
      default: "NORMAL",
    },
    nagInterval: {
      type: Number, // in minutes (e.g. 2, 5, 10)
      default: 5,
    },

    // 3. Focus Timer
    timeSpent: {
      type: Number, // in seconds (Accumulated focus time)
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true, // Essential for multi-tenant performance
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Compound index for frequent dashboard queries (User + Type + Status)
todoSchema.index({ user: 1, type: 1, status: 1 });
todoSchema.index({ user: 1, completedAt: -1 });

export default mongoose.model("Todo", todoSchema);
