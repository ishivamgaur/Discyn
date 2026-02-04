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
