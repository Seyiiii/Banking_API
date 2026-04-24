import mongoose, { mongo } from "mongoose";

const transactionSchema = new mongoose.Schema({
    transactionReference: {
        type: String,
        required: true,
        unique: true
    },
    senderAccount: {
        type: String,
        required: true
    },
    receiverAccount: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    senderBalanceBefore: {
        type: Number,
        required: true
    },
    senderBalanceAfter: {
        type: Number,
        required: true
    },
    receiverBalanceBefore: {
        type: Number,
        default: null
    },
    receiverBalanceAfter: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
})

export default mongoose.model('Transaction', transactionSchema)