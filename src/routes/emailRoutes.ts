import { Router } from 'express';
import { startOAuth, handleOAuthCallback } from '../controllers/emailController';

const router = Router();

router.get('/auth/google', startOAuth);  
router.get('/oauth2callback', handleOAuthCallback);  

export default router;
