import express from 'express';
import { startOutlookOAuth, handleOutlookOAuthCallback, fetchOutlookEmails } from '../controllers/outlookController';

const router = express.Router();


router.get('/auth/outlook', startOutlookOAuth);


router.get('/outlook/callback', handleOutlookOAuthCallback);


router.get('/fetchOutlookEmails', fetchOutlookEmails);

export default router;
