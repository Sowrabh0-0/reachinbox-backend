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

redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();
    logger.info('Connected to Redis');
})();

export const isEmailProcessed = async (emailId: string): Promise<boolean> => {
    const exists = await redisClient.exists(emailId);
    logger.info(`Email ${emailId} exists in Redis: ${exists === 1}`);
    return exists === 1;
};


export const markEmailAsProcessed = async (emailId: string): Promise<void> => {
    await redisClient.set(emailId, 'processed');
    logger.info(`Email ${emailId} marked as processed`);
};

export default redisClient;
