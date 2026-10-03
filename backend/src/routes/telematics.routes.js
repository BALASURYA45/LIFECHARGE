import { Router } from 'express';
import { getSessions, getSessionById, deleteSession } from '../controllers/telematics.controller.js';

const router = Router();

router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);
router.delete('/sessions/:id', deleteSession);

export default router;
