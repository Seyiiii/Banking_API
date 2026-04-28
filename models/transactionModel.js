import mongoose from "mongoose";
import { type } from "node:os";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'   
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    
    },
    from: {
        type: String,
        required: true
        },
    to: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'success'
    },
    description: {
        type: String
    },
}, {
    timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);