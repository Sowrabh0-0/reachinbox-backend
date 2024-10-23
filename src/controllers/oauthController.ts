import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { getAuthUrl, fetchTokens, fetchAllEmailDetails } from '../services/oauthService';
import logger from '../utils/logger';
import { config } from '../config/env';

declare module 'express-session' {
    interface SessionData {
        tokens: any;
    }
}


export const startOAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        logger.info('Starting Gmail OAuth flow');
        const authUrl = getAuthUrl();
        res.redirect(authUrl);  
    } catch (error) {
        logger.error('Error starting Gmail OAuth process: ' + (error as Error).message);
        res.status(500).send('Error starting Gmail OAuth process');
    }
};

export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = req.query.code as string;

    if (!code) {
        logger.error('Authorization code not provided for Gmail');
        res.status(400).send('Authorization code not provided');
        return;
    }

    try {
        logger.info('Gmail OAuth callback received, fetching tokens');
        const tokens = await fetchTokens(code);
        console.log(tokens);
        req.session.tokens = tokens;

        logger.info('Gmail tokens successfully stored in session');
        const redirectUrl = `${config.frontendUrl}/oauth-callback?provider=gmail&tokens=${encodeURIComponent(JSON.stringify(tokens))}`;
        console.log(redirectUrl);
        res.redirect(redirectUrl); 
    } catch (error) {
        logger.error('Error retrieving Gmail access tokens: ' + (error as Error).message);
        res.status(500).send('Error retrieving Gmail access tokens');
    }
};

export const fetchEmails = async (req: Request, res: Response): Promise<void> => {
    const tokens = req.session.tokens;

    if (!tokens) {
        logger.warn('No Gmail tokens found in session');
        res.status(401).send('Not authenticated');
        return;
    }

    try {
        logger.info('Fetching Gmail emails');
        const emails = await fetchAllEmailDetails(tokens);
        logger.info('Gmail emails successfully fetched');
        res.json(emails);  
    } catch (error) {
        logger.error('Error fetching Gmail emails: ' + (error as Error).message);
        res.status(500).send('Error fetching Gmail emails');
    }
};
