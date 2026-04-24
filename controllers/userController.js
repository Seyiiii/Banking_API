import User from "../models/userModel.js";
import Account from "../models/accountModel.js";
import asyncHandler from "../middlewares/asyncHandler.js"
import jwt from "jsonwebtoken";
import nibssClient from "../services/nibssService.js"

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, bvn, nin } = req.body;

    if (!bvn && !nin) {
        res.status(400);
        throw new Error('Please provide either a BVN or NIN for verification');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    if (bvn) {
        await nibssClient.post('/api/validateBvn', { bvn });
    } else if (nin) {
        await nibssClient.post('/api/validateNin', { nin });
    }

    const user = await User.create({
        name,
        email,
        password,
        bvn: bvn || null,
        nin: nin || null,
        isKycVerified: true
    });

    const accountResponse = await nibssClient.post('/api/account/create', {name, email });

    const generatedAccountNumber = accountResponse.data.accountNumber || accountResponse.data.data.accountNumber;

    const account = await Account.create({
        user: user._id,
        accountNumber: generatedAccountNumber,
        balance: 15000.00
    });
    
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: account.accountNumber,
        token: generateToken(user._id)
    });
})