import axios from 'axios';
import logger from './logger';

export async function sendOutlookEmail(accessToken: string, recipient: string, subject: string, body: string) {
    try {
        const emailData = {
            message: {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: body,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: recipient,
                        },
                    },
                ],
            },
            saveToSentItems: 'true',
        };

        const response = await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', emailData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        logger.info(`Email sent successfully to ${recipient}`);
        return response;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error sending email to ${recipient}: ${error.message}`);
        } else {
            logger.error(`Error sending email to ${recipient}: ${error}`);
        }
    }
}
