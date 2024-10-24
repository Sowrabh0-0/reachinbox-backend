import OpenAI from 'openai';
import { config } from '../config/env';

const client = new OpenAI({
    apiKey: config.openAiApiKey, 
});

export const categorizeEmail = async (subject: string, body: string): Promise<string> => {
    const prompt = `
    You are an email categorization assistant. Classify the given email into one of the categories: 
    - Interested
    - Not Interested
    - More Information

    Be accurate and consider the email content thoroughly.

    Email Subject: "${subject}"
    Email Body: "${body}"

    Classification:
    `;

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
    });

    if (response && response.choices && response.choices.length > 0) {
        const messageContent = response.choices[0]?.message?.content?.trim();
        if (messageContent) {
            return messageContent;
        }
    }

    return 'No classification';
};
