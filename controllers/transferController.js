import asyncHandler from "../middlewares/asyncHandler.js";
import Account from "../models/accountModel.js";
import Transaction from "../models/transactionModel.js";
import nibssClient from "../services/nibssService.js";

export const transferFunds = asyncHandler(async (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount ) {
        res.status(400);
        throw new Error('Please provide from, to and amount of the transaction')
    }

    if (Number(amount) <= 0) {
        res.status(400);
        throw new Error('Amount must be greater than zero');
    }

    if (from === to) {
        res.status(400);
        throw new Error('Cannot transfer to the same account')
    }

    const senderAccount = await Account.findOne({ accountNumber: from });
    if (!senderAccount) {
        res.status(400);
        throw new Error('Sender account not found');
    }

    if (senderAccount.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to transfer from this account');
    }

    if (senderAccount.balance < Number(amount)) {
        res.status(400);
        throw new Error(`Insufficient funds, Your Balance is ₦${senderAccount.balance}`);
    }

    const enquiryResponse = await nibssClient.get(`/api/account/name-enquiry/${to}`);
    const receiverName = enquiryResponse.data?.accountName || enquiryResponse.data?.data?.accountName;
    const receiverBank = enquiryResponse.data?.bankName || enquiryResponse.data?.data?.bankName;

    if (!receiverName) {
        res.status(400);
        throw new Error('Receiver account not found. Please check the account number.');
    }
    
    const nibssResponse = await nibssClient.post('/api/transfer', {
        from,
        to,
        amount: Number(amount)
    });

    const transactionId = nibssResponse.data?.reference || null;

    const transaction = await Transaction.create({
        user: req.user._id,
        type: 'debit',
        amount: Number(amount),
        from,
        to,
        reference: transactionId,
        status: 'success',
        description: `Transfer to ${receiverName} (${receiverBank})`
    });



    senderAccount.balance -= Number(amount);
    await senderAccount.save();

    const receiverAccount = await Account.findOne({ accountNumber: to });
    if (receiverAccount) {
        receiverAccount.balance += Number(amount);
        await receiverAccount.save();
    }

    res.status(200).json({
        message: "Transfer successful",
        transactionId: transaction.reference,
        amount: transaction.amount,
        from: transaction.from,
        to: transaction.to,
        date: transaction.createdAt
    });
})


export const getTransactionStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const nibssResponse = await nibssClient.get(`/api/transaction/${transactionId}`);

    res.status(200).json(nibssResponse.data);
});

export const getMyTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1});

    res.status(200).json({
        count: transactions.length,
        transactions
    });
});