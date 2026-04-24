import mongoose, { mongo } from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    balance: {
        type: Number,
        required: true,
        default: 15000.00
    }
}, {
    timestamps: true
})


export default mongoose.model('Account', accountSchema);