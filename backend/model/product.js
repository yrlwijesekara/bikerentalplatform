import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
     vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 🏍️ Basic bike details
    bikeName: {
        type: String,
        required: true
    },

    bikeType: {
        type: String,
        enum: ["Scooter", "Gear Bike"],
        required: true
    },

    engineCC: {
        type: Number,
        required: true
    },
    lastServiceDate: {
        type: Date
    },
     fuelType: {
        type: String,
        enum: ["Petrol", "Electric"],
        default: "Petrol"
    },

    // 💰 Rental pricing
    pricePerDay: {
        type: Number,
        required: true
    },

    // 📍 Location (important for nearby search)
    city: {
        type: String,
        required: true
    },

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    // 📸 Bike images
    images: {
        type: [String],
        default: []
    },

    // 📦 Availability
    isAvailable: {
        type: Boolean,
        default: true
    },

    // ⭐ Rating (used in AI recommendations)
    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    // 🛣️ Terrain suitability (AI feature)
    suitableTerrain: {
        type: String,
        enum: ["coastal", "city", "mixed"],
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Bike", productSchema);