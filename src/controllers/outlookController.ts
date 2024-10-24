import { Request, Response, NextFunction } from 'express';
import { getOutlookAuthUrl, fetchOutlookTokens, getOutlookEmails } from '../services/outlookService';
import logger from '../utils/logger';
import { config } from '../config/env';

declare module 'express-session' {
    interface SessionData {
        outlookAccessToken: string;
    }
}

export const startOutlookOAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info('Starting Outlook OAuth flow');
        const authUrl = await getOutlookAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        logger.error('Error starting Outlook OAuth process: ' + (error as Error).message);
        res.status(500).send('Error starting Outlook OAuth process');
    }
};

export const handleOutlookOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = req.query.code as string;

    if (!code) {
        logger.error('Authorization code not provided for Outlook');
        res.status(400).send('Authorization code not provided');
        return;
    }

    try {
        logger.info('Outlook OAuth callback received, fetching tokens');
        const accessToken = await fetchOutlookTokens(code);
        req.session.outlookAccessToken = accessToken;

        logger.info('Outlook tokens successfully stored in session');
        const redirectUrl = `${config.frontendUrl}/oauth-callback?provider=outlook&tokens=${encodeURIComponent(accessToken)}`;
        logger.info(`Redirecting to ${redirectUrl}`);
        res.redirect(redirectUrl);
    } catch (error) {
        logger.error('Error retrieving Outlook access tokens: ' + (error as Error).message);
        res.status(500).send('Error retrieving Outlook access tokens');
    }
};

export const fetchOutlookEmails = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.session.outlookAccessToken;

    if (!accessToken) {
        logger.warn('No Outlook tokens found in session');
        res.status(401).send('Not authenticated');
        return;
    }

    try {
        logger.info('Fetching Outlook emails');
        const emails = await getOutlookEmails(accessToken);
        logger.info('Outlook emails successfully fetched');
        res.json(emails);
    } catch (error) {
        logger.error('Error fetching Outlook emails: ' + (error as Error).message);
        res.status(500).send('Error fetching Outlook emails');
    }
};
