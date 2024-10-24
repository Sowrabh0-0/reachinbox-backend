import { Queue, Worker } from 'bullmq';
import { config } from '../config/env';
import redisClient, { isEmailProcessed, markEmailAsProcessed } from './redisClient';
import logger from './logger';
import { sendInterestedReply, sendNotInterestedReply, sendMoreInfoReply } from '../services/emailReplyService'; 

const redisConnection = {
    host: config.redishost,
    port: 17966,
    password: config.redispassword,
};

export const emailQueue = new Queue('emailQueue', {
    connection: redisConnection,
});

export const emailWorker = new Worker(
    'emailQueue',
    async (job) => {
        logger.info(`Processing job with ID: ${job.id}`);

        const { emailId, subject, body, from, category, provider, tokens } = job.data;

        console.log('Processing email inside :', from, category);

        const alreadyProcessed = await isEmailProcessed(emailId);
        if (alreadyProcessed) {
            logger.info(`Skipping email ${emailId} as it has already been processed.`);
            return;
        }

        logger.info(`Sending reply for email: ${from}, category: ${category}`);

        try {
            // Send reply based on the category of the email and the provider (Gmail or Outlook)
            if (category === 'Interested') {
                logger.info(`Sending interested reply for email: ${from}`);
                await sendInterestedReply(provider, tokens, from, subject, body);
            } else if (category === 'Not Interested') {
                logger.info(`Sending not interested reply for email: ${from}`);
                await sendNotInterestedReply(provider, tokens, from, subject, body);
            } else if (category === 'More Information') {
                logger.info(`Sending more information reply for email: ${from}`);
                await sendMoreInfoReply(provider, tokens, from, subject, body);
            }

            // Only mark email as processed after the reply has been successfully sent
            logger.info(`Marking email ${from} as processed.`);
            await markEmailAsProcessed(emailId);

        } catch (error) {
            logger.error(`Failed to send reply for email ${emailId}: ${(error as Error).message}`);
            // Handle the error gracefully but do not mark as processed
        }
    },
    { connection: redisConnection }
);

emailWorker.on('failed', (job, err) => {
    if (job) {
        logger.error(`Job ${job.id} failed: ${err.message}`);
    } else {
        logger.error(`Job failed: ${err.message}`);
    }
});
