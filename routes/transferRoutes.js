import express from 'express';
import { transferFunds, getTransactionStatus, getMyTransactions } from '../controllers/transferController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, transferFunds);
router.get('/history', protect, getMyTransactions);
router.get('/status/:transactionId', protect, getTransactionStatus);

export default router;