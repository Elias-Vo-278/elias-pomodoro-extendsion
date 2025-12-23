import { Router } from 'express';
import musicRoutes from './musicRoutes';

const router = Router();

router.use('/api', musicRoutes);

export default router;
