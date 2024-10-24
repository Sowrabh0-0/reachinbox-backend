import { Request, Response, NextFunction } from 'express';
import { getGmailAuthUrl, fetchGmailTokens, getGmailEmails } from '../services/gmailService';
import logger from '../utils/logger';
import { config } from '../config/env';

declare module 'express-session' {
    interface SessionData {
        gmailTokens: any;
    }
}

export const startGmailOAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        logger.info('Starting Gmail OAuth flow');
        const authUrl = getGmailAuthUrl();
        res.redirect(authUrl);  
    } catch (error) {
        logger.error('Error starting Gmail OAuth process: ' + (error as Error).message);
        res.status(500).send('Error starting Gmail OAuth process');
    }
};

export const handleGmailOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = req.query.code as string;

    if (!code) {
        logger.error('Authorization code not provided for Gmail');
        res.status(400).send('Authorization code not provided');
        return;
    }

    try {
        logger.info('Gmail OAuth callback received, fetching tokens');
        const tokens = await fetchGmailTokens(code);
        req.session.gmailTokens = tokens;  // Store Gmail tokens in session

        logger.info('Gmail tokens successfully stored in session');
        const redirectUrl = `${config.frontendUrl}/oauth-callback?provider=gmail&tokens=${encodeURIComponent(JSON.stringify(tokens))}`;
        logger.info(`Redirecting to ${redirectUrl}`);
        res.redirect(redirectUrl);
    } catch (error) {
        logger.error('Error retrieving Gmail access tokens: ' + (error as Error).message);
        res.status(500).send('Error retrieving Gmail access tokens');
    }
};

export const fetchGmailEmails = async (req: Request, res: Response): Promise<void> => {
    const tokens = req.session.gmailTokens;

    if (!tokens) {
        logger.warn('No Gmail tokens found in session');
        res.status(401).send('Not authenticated');
        return;
    }

    try {
        logger.info('Fetching Gmail emails');
        const emails = await getGmailEmails(tokens);
        logger.info('Gmail emails successfully fetched');
        res.json(emails);  
    } catch (error) {
        logger.error('Error fetching Gmail emails: ' + (error as Error).message);
        res.status(500).send('Error fetching Gmail emails');
    }
};
