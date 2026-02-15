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

    // 🏪 Vendors involved in this order (array of vendor IDs)
    vendors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

    // 🚲 Selected Bikes (array to support multiple bikes)
    bikes: [{
      bike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      pricePerDay: {
        type: Number,
        required: true,
      },
      subtotal: {
        type: Number,
        required: true,
      }
    }],

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
    totalAmount: {
      type: Number,
      required: true,
    },

    // Summary of bikes count
    totalBikes: {
      type: Number,
      required: true,
      default: 0,
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
      default: "No additional notes.",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
