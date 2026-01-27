import mongoose, { Schema } from "mongoose";

export interface IAutomationExecutionSummary {
  totalStepsExecuted: number;
  totalDelayTimeMs: number;
  failureReason?: string;
}

export interface IAutomationTestRun extends mongoose.Document {
  automationId: mongoose.Types.ObjectId;
  email: string;
  status: "running" | "completed" | "failed";
  currentStep: string;
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
  summary?: IAutomationExecutionSummary;
  createdAt: Date;
  updatedAt: Date;
}

const automationTestRunSchema = new Schema<IAutomationTestRun>(
  {
    automationId: {
      type: Schema.Types.ObjectId,
      ref: "Automation",
      required: [true, "Automation ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    currentStep: {
      type: String,
      default: "",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    summary: {
      totalStepsExecuted: { type: Number, default: 0 },
      totalDelayTimeMs: { type: Number, default: 0 },
      failureReason: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

const AutomationTestRun = mongoose.model<IAutomationTestRun>(
  "AutomationTestRun",
  automationTestRunSchema,
);

export default AutomationTestRun;
