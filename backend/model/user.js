import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },

    location: {
        latitude: Number,
        longitude: Number
    },

    image: { type: String, default: '' },

    role: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        default: 'user'
    },

    isemailverified: { type: Boolean, default: false },
    isblocked: { type: Boolean, default: false },

    vendorDetails: {
        shopName: String,
        shopLicenseNo: String,
        description: String,
        rating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: false }
    },

    preferences: {
        preferredBikeType: {
            type: String,
            enum: ['Scooter', 'Gear Bike']
        },
        travelStyle: {
            type: String,
            enum: ['solo', 'couple', 'adventure']
        },
        budgetRange: Number
    },

   

}, { timestamps: true });


const User = mongoose.model('User', userSchema);
export default User;
   
   
    


    