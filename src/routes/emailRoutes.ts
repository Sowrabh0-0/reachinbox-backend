import { Router } from 'express';
import { startOAuth, handleOAuthCallback, fetchEmails } from '../controllers/oauthController';
import { handleOutlookOAuthCallback, startOutlookOAuth, getOutlookEmails } from '../controllers/outlookController';

const router = Router();

//Gmail OAuth
router.get('/auth/google', startOAuth);
router.get('/oauth2callback', handleOAuthCallback);
router.get('/fetchGmailEmails', fetchEmails);


//Outlook OAuth
router.get('/auth/outlook', startOutlookOAuth);  
router.get('/outlook/callback', handleOutlookOAuthCallback);  
router.get('/fetchOutlookEmails', getOutlookEmails); 



export default router;
