import { Router } from 'express';
import { careCircleController } from '../controllers/careCircleController';

const router = Router();

router.get('/members', (req, res) => careCircleController.getMonitoredMembers(req, res));
router.get('/members/:subjectId/vitals', (req, res) => careCircleController.getMemberVitalHistory(req, res));
router.post('/generate-code', (req, res) => careCircleController.generateInviteCode(req, res));
router.post('/connect', (req, res) => careCircleController.connectWithCode(req, res));
router.delete('/links/:linkId', (req, res) => careCircleController.revokeLink(req, res));

export default router;
