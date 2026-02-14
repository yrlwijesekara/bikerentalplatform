import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderid: {
      type: String,
      required: true,
      unique: true,
    },

    // 👤 Tourist who booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏪 Vendor who owns the bike
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🚲 Selected Bike
    bike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // 📅 Rental Period
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
    },

    // 💰 Pricing
    pricePerDay: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // 💳 Payment Information
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // 📦 Order Status
    orderStatus: {
      type: String,
      enum: [
        "pending", // waiting for vendor confirmation
        "confirmed", // vendor approved
        "ongoing", // bike currently rented
        "completed", // rental finished
        "cancelled", // cancelled by user/vendor
      ],
      default: "pending",
    },

    // ⭐ Review Submitted?
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
    // 💳 Bank Transfer Proof
    paymentProof: {
      slipImage: {
        type: String, // uploaded image URL (Cloudinary/S3/local)
      },

      bankName: {
        type: String,
      },

      accountHolderName: {
        type: String,
      },

      referenceNumber: {
        type: String,
      },

      transferredAmount: {
        type: Number,
      },

      transferDate: {
        type: Date,
      },

      verificationStatus: {
        type: String,
        enum: ["not_uploaded", "pending", "approved", "rejected"],
        default: "not_uploaded",
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // admin or vendor
      },

      verifiedAt: {
        type: Date,
      },

      rejectionReason: {
        type: String,
      },
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
