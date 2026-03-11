import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    district: {
        type: String,
        default: "Southern Province"
    },

    category: {
        type: String,
        enum: ["Beach", "Mountain", "Historical", "Waterfall", "Wildlife", "Religious", "Scenic"],
        required: true
    },

    image: {
        type: String, // image URL
        required: true
    },

    mapUrl: {
        type: String // Google Maps link
    },

    openingHours: {
        type: String
    },

    entranceFee: {
        type: String
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },

    note: {
        type: String,
        maxlength: 50,
        default: ""
    }

}, { timestamps: true });

const Place =  mongoose.model("Place", placeSchema);
export default Place;
