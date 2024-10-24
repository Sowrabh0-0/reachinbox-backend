import { createClient } from 'redis';
import { config } from '../config/env';
import logger from './logger';

const redisClient = createClient({
    password: config.redispassword,
    socket: {
        host: config.redishost,
        port: 17966,
    }
});


redisClient.on('error', (err: any) => {
    logger.error('Redis Client Error', err);
});


(async () => {
    try {
        await redisClient.connect();
        logger.info('Connected to Redis');
    } catch (err) {
        logger.error('Failed to connect to Redis', err);
    }
})();

export const isEmailProcessed = async (emailId: string): Promise<boolean> => {
    try {
        const exists = await redisClient.exists(emailId);
        logger.info(`Email ${emailId} exists in Redis: ${exists === 1}`);
        return exists === 1;
    } catch (err) {
        logger.error(`Error checking email ${emailId} in Redis:`, err);
        return false;
    }
};

export const markEmailAsProcessed = async (emailId: string): Promise<void> => {
    try {
        await redisClient.set(emailId, 'processed');
        logger.info(`Email ${emailId} marked as processed`);
    } catch (err) {
        logger.error(`Error marking email ${emailId} as processed:`, err);
    }
};

process.on('SIGINT', async () => {
    try {
        await redisClient.quit();
        logger.info('Redis connection closed.');
        process.exit(0);
    } catch (err) {
        logger.error('Error while closing Redis connection:', err);
        process.exit(1);
    }
});

export default redisClient;
