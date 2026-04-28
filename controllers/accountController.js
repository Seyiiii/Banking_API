import Account from "../models/accountModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import nibssClient from "../services/nibssService.js";



export const getAllAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.find({}).populate('user', 'name email');

    const formattedAccounts = accounts.map(account => ({
        userId: account.user._id,
        accountNmae: account.user.name,
        accountNumber: account.accountNumber,
        balance: account.balance
    }));

    res.status(200).json({formattedAccounts});
});

export const getAccountBalance = asyncHandler(async (req, res) => {
    const { accountNumber } = req.params;

    const account = await Account.findOne({ accountNumber }).populate('user', 'name');

    if (!account) {
        res.status(404);
        throw new Error('Account not found.');
    }

    res.status(200).json({
        accountNumber: account.accountNumber,
        balance: account.balance
    });
});

export const accountEnquiry = asyncHandler(async (req, res) => {
    const { accountNumber } = req.params;

    if (!accountNumber || accountNumber.length !== 10) {
        res.status(400);
        throw new Error('Please provide a valid 10-digit account number');
    }

    try {
        const nibssResponse = await nibssClient.get(`/api/account/name-enquiry/${accountNumber}`);

        return res.status(200).json({
            accountNumber: nibssResponse.data.accountNumber || nibssResponse.data.data?.accountNumber,
            accountName: nibssResponse.data.accountName || nibssResponse.data.data?.accountName,
            bankName: nibssResponse.data.bankName || nibssResponse.data.data?.bankName || "OLU Bank"
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {

            const localAccount = await Account.findOne({ accountNumber }).populate('user', 'name');

            if (localAccount) {
                return res.status(200).json({
                    accountNumber: localAccount.accountNumber,
                    accountName: localAccount.user.name,
                    bankName: "OLU Bank"
                });
            }
        }
        res.status(404);
        throw new Error('Account could not be resolved');
    }
    
});