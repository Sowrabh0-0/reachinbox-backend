import dotenv from 'dotenv';


dotenv.config();


export const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    sessionSecret: process.env.SESSION_SECRET || '',
    outlookClientId: process.env.OUTLOOK_CLIENT_ID || '',
    outlookClientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
    outlookRedirectUri: process.env.OUTLOOK_REDIRECT_URI || '',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    redispassword: process.env.REDIS_PASS || '',
    redishost: process.env.REDIS_HOST || '',
    port: process.env.PORT ,
    frontendUrl: process.env.FRONTEND_URL || '',
};
