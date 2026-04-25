import Account from "../models/accountModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { populate } from "dotenv";


export const getAllAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.find({}).populate('user', 'name email');

    res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
    });
});

export const getAccountBalance = asyncHandler(async (req, res) => {
    const account = await Account.findOne({ user: req.user._id });

    if (!account) {
        res.status(404);
        throw new Error('Account not found for this user');
    }

    res.status(200).json({
        accountName: req.user.name,
        accountNumber: account.accountNumber,
        balance: account.balance
    
    });
});