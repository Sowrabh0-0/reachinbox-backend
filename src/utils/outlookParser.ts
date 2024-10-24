
export const parseOutlookEmail = (emailData: any) => {
    const subject = emailData.subject || 'No Subject';
    const body = emailData.body?.content || 'No Body Content';

    return {
        subject,
        body,
    };
};
