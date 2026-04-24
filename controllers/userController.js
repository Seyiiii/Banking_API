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
    const { name, email, password, bvn, nin, DOB } = req.body;

    if (!name || !email || !password || !DOB) {
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

    const kycType = bvn ? 'BVN' : 'NIN';
    const kycID = bvn || nin;

    console.log(kycType, kycID, DOB)

    // ✅ Call external API BEFORE saving user
    const accountResponse = await nibssClient.post('/api/account/create', {
          data: {
            // name,
            // email,
            kycType: "NIN",
            kycID: "12365478911",   // ← double-check the exact field name NIBSS expects
            DOB: "2005-07-25"
        }
    });

    const generatedAccountNumber =
        accountResponse.data.accountNumber ||
        accountResponse.data.data?.accountNumber;

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