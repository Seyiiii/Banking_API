import express from 'express';
import { getAllAccounts, getAccountBalance } from '../controllers/accountController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/all', getAllAccounts);
router.get('balance', protect, getAccountBalance);


export default router; 