import { ConfidentialClientApplication } from '@azure/msal-node';
import { config } from '../config/env';


const msalConfig = {
    auth: {
        clientId: config.outlookClientId,
        authority: 'https://login.microsoftonline.com/common',
        clientSecret: config.outlookClientSecret,
    },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);
