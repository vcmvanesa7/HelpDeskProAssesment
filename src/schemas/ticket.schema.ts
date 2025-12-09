import mongoose, { Schema, Model } from "mongoose";

export interface ITicketAttachment {
  url: string;
  public_id: string | null;
  format: string | null;
  size: number | null;
  originalName: string | null;
}

export interface ITicketMessage {
  sender: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
  attachments?: ITicketAttachment[];
}

export interface ITicket {
  title: string;
  description: string;

  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";

  category?: string; // optional ticket category

  createdBy: mongoose.Types.ObjectId; // CLIENT
  assignedTo?: mongoose.Types.ObjectId | null; // AGENT (support)

  attachments?: ITicketAttachment[]; // ticket-level attachments

  messages?: ITicketMessage[]; // messaging history

  firstResponseAt?: Date | null;
  resolvedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const AttachmentSchema = new Schema<ITicketAttachment>({
  url: { type: String, required: true },
  public_id: { type: String, default: null },
  format: { type: String, default: null },
  size: { type: Number, default: null },
  originalName: { type: String, default: null },
});

const MessageSchema = new Schema<ITicketMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: () => new Date() },
  attachments: [AttachmentSchema],
});

const TicketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    category: {
      type: String,
      default: "general",
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attachments: [AttachmentSchema],

    messages: [MessageSchema],

    firstResponseAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
