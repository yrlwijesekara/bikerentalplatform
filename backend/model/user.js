import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    isemailverified: {
        type: Boolean,
        default: false
    },
    isblocked: {
        type: Boolean,
        default: false
    },
    image : {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin','vendor'],
        default: 'user'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
   
   
    


    