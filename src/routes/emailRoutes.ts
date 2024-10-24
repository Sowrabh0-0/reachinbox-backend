import express from 'express';
import gmailRoutes from './gmailRoutes';
import outlookRoutes from './outlookRoutes';

const router = express.Router();

router.use(gmailRoutes);

router.use(outlookRoutes);

export default router;
