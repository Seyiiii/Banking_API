import User from "../models/userModel.js";
import Account from "../models/accountModel.js";
import asyncHandler from "../middlewares/asyncHandler.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nibssClient from "../services/nibssService.js"

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, bvn, nin, dob } = req.body;

    if (!name || !email || !password || !dob) {
        res.status(400);
        throw new Error('Please provide name, email, password and DOB');
    }
    if (!bvn && !nin) {
        res.status(400);
        throw new Error('Please provide either a BVN or NIN for verification');
    }


    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Validate KYC first
    if (bvn) {
        await nibssClient.post('/api/validateBvn', { bvn });
    } else if (nin) {
        await nibssClient.post('/api/validateNin', { nin });
    }

    const kycType = bvn ? 'bvn' : 'nin';
    const kycID = bvn || nin;

    console.log(kycType, kycID, dob)

    // ✅ Call external API BEFORE saving user
    const accountResponse = await nibssClient.post('/api/account/create', {
        // name,
        // email,
        kycType,
        kycID,
        dob
    });

    console.log('NIBSS account/create full response:', JSON.stringify(accountResponse.data, null, 2));


    const generatedAccountNumber = accountResponse.data?.account?.accountNumber;

    if (!generatedAccountNumber) {
        res.status(502);
        throw new Error('Failed to generate account number from NIBSS');
    }

    // ✅ Only create user if external API succeeded
    const user = await User.create({
        name,
        email,
        password,
        bvn: bvn || null,
        nin: nin || null,
        isKycVerified: true
    });

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
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});