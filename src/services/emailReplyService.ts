import OpenAI from 'openai';
import { config } from '../config/env';
import logger from '../utils/logger';
import { sendGmailReply } from '../utils/gmailReply';
import { sendOutlookEmail } from '../utils/outlookReply';

const openai = new OpenAI({
    apiKey: config.openAiApiKey,
});

async function generateEmailReply(prompt: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',  
            messages: [{ role: 'user', content: prompt }],
        });

        return response?.choices?.[0]?.message?.content?.trim() || 'Unable to generate reply';
    } catch (error) {
        logger.error(`Error generating reply: ${(error as any).message || error}`);
        throw new Error('Failed to generate email reply');
    }
}

async function sendUserEmail(provider: 'gmail' | 'outlook', tokens: any, recipient: string, subject: string, body: string) {
    if (provider === 'gmail') {
        await sendGmailReply(tokens, recipient, subject, body);
    } else if (provider === 'outlook') {
        const accessToken = tokens.access_token; 
        await sendOutlookEmail(accessToken, recipient, subject, body);
    }
}

export async function sendReply(provider: 'gmail' | 'outlook', tokens: any, recipient: string, subject: string, prompt: string) {
    const replyContent = await generateEmailReply(prompt);
    await sendUserEmail(provider, tokens, recipient, `Re: ${subject}`, replyContent);
    logger.info(`Reply sent to ${recipient}`);
}

export async function sendInterestedReply(provider: 'gmail' | 'outlook', tokens: any, recipient: string, subject: string, body: string) {
    const prompt = `You received an email with the subject: "${subject}" and the following content...\n\nGenerate a friendly and engaging reply, mentioning that you're interested in scheduling a demo call. Suggest two possible times for the call. dont Inlcude Warm regard and dont mention names`;
    await sendReply(provider, tokens, recipient, subject, prompt);
}

export async function sendNotInterestedReply(provider: 'gmail' | 'outlook', tokens: any, recipient: string, subject: string, body: string) {
    const prompt = `You received an email with the subject: "${subject}" and the following content...\n\nGenerate a polite reply, thanking them for their interest but expressing that you're not interested at this time. dont Inlcude Warm regard and dont mention names`;
    await sendReply(provider, tokens, recipient, subject, prompt);
}

export async function sendMoreInfoReply(provider: 'gmail' | 'outlook', tokens: any, recipient: string, subject: string, body: string) {
    const prompt = `You received an email with the subject: "${subject}" and the following content...\n\nGenerate a professional reply providing more information about the topic they requested. Make the reply professional and informative. dont Inlcude Warm regard and dont mention names`;
    await sendReply(provider, tokens, recipient, subject, prompt);
}
