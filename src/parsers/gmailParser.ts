export const extractTextFromGmail = (emailData: any): string => {
    if (!emailData.payload) return '';

    let messageBody = '';
    const parts = emailData.payload.parts || [];

    for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
            messageBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
    }

    return messageBody || 'No readable text found';
};
