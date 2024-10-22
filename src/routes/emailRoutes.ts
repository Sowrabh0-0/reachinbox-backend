import { Router } from 'express';
import { startOAuth, handleOAuthCallback, fetchEmails } from '../controllers/emailController';

const router = Router();


router.get('/auth/google', startOAuth);


router.get('/oauth2callback', handleOAuthCallback);


router.get('/fetchEmails', fetchEmails);

export default router;
