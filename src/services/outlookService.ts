import { msalClient } from '../utils/outlookUtils';
import { config } from '../config/env';
import axios from 'axios';


const SCOPES = ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send'];


export const getAuthUrl = async (): Promise<string> => {
    const authUrl = await msalClient.getAuthCodeUrl({
        redirectUri: config.outlookRedirectUri,
        scopes: SCOPES,
    });
    return authUrl;
};

export const fetchTokens = async (code: string): Promise<string> => {
    const response = await msalClient.acquireTokenByCode({
        code,
        redirectUri: config.outlookRedirectUri,
        scopes: SCOPES,
    });

    if (response && response.accessToken) {
        return response.accessToken;
    } else {
        throw new Error('Failed to acquire token by code.');
    }
};

export const refreshToken = async (refreshToken: string): Promise<string> => {
    const response = await msalClient.acquireTokenByRefreshToken({
        refreshToken,
        scopes: SCOPES,
    });

    if (response && response.accessToken) {
        return response.accessToken;
    } else {
        throw new Error('Failed to acquire token by code.');
    }
};



export const fetchOutlookEmails = async (accessToken: string): Promise<any> => {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data.value;
};