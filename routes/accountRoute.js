import express from 'express';
import { getAllAccounts, getMyAccount, getAccountBalance, accountEnquiry} from '../controllers/accountController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/all', protect, getAllAccounts);
router.get('/my-account', protect, getMyAccount);
router.get('/balance/:accountNumber', protect, getAccountBalance);
router.get('/name-enquiry/:accountNumber',protect, accountEnquiry);


export default router; 