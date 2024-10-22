import express from 'express';
import emailRoutes from './routes/emailRoutes';
import session from 'express-session';
import { config } from './config/env';



const app = express();


app.use(express.json());

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use('/api/emails', emailRoutes);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

export default app;
