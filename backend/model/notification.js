import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      enum: [
        'booking_received',
        'booking_confirmed',
        'booking_cancelled',
        'payment_received',
        'bike_returned',
        'review_received',
        'vendor_approved',
        'vendor_rejected',
        'order_completed',
        'order_cancelled',
        'product_added',
        'product_approved',
        'product_rejected',
        'vendor_registered',
        'high_value_order',
        'general'
      ],
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // For storing additional data like order ID, bike ID, etc.
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;