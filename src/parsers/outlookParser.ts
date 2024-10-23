export const extractTextFromOutlook = (emailData: any): string => {
    return emailData.body?.content || 'No readable text found';
};
