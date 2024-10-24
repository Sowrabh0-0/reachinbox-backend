import express from 'express';
import { startGmailOAuth, handleGmailOAuthCallback, fetchGmailEmails } from '../controllers/gmailController';

const router = express.Router();


router.get('/auth/google', startGmailOAuth);

router.get('/oauth2callback', handleGmailOAuthCallback);

router.get('/fetchGmailEmails', fetchGmailEmails);

export default router;
