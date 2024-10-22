import { Router } from 'express';
import { startOAuth, handleOAuthCallback, fetchEmails } from '../controllers/oauthController';
import { handleOutlookOAuthCallback, startOutlookOAuth } from '../controllers/outlookController';

const router = Router();


router.get('/auth/google', startOAuth);

router.get('/oauth2callback', handleOAuthCallback);

router.get('/fetchEmails', fetchEmails);


router.get('/auth/outlook', startOutlookOAuth);  
router.get('/outlook/callback', handleOutlookOAuthCallback);  



export default router;
