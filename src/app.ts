import express from 'express';
import emailRoutes from './routes/emailRoutes';
import session from 'express-session';
import { config } from './config/env';
import cors from 'cors';
import redisClient from './utils/redisClient'; // Import your Redis client

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  
    credentials: true 
}));

app.use(express.json());

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Email-related routes
app.use('/api', emailRoutes);

app.post('/api/flush-redis', async (req, res) => {
    try {
        await redisClient.flushAll();  
        console.log('All Redis data flushed');
        res.status(200).send('All Redis data has been flushed.');
    } catch (err) {
        console.error('Error flushing Redis:', err);
        res.status(500).send('Failed to flush Redis data.');
    }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

export default app;
