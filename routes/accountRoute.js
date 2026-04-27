import express from 'express';
import { getAllAccounts, getAccountBalance, accountEnquiry} from '../controllers/accountController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/all', getAllAccounts);
router.get('/balance/:accountNumber', protect, getAccountBalance);
router.get('/name-enquiry/:accountNumber',protect, accountEnquiry);


export default router; 