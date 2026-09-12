import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboardController';

const router = Router();

// Leaderboard Tiers
router.get('/individual', (req, res) => leaderboardController.getIndividualLeaderboard(req, res));
router.get('/teams', (req, res) => leaderboardController.getTeamLeaderboard(req, res));
router.get('/universities', (req, res) => leaderboardController.getUniversityLeaderboard(req, res));

// Lookups & Management
router.get('/universities/list', (req, res) => leaderboardController.getUniversities(req, res));
router.get('/teams/list', (req, res) => leaderboardController.getTeams(req, res));
router.post('/teams/join', (req, res) => leaderboardController.joinTeam(req, res));
router.post('/teams', (req, res) => leaderboardController.createTeam(req, res));

export default router;
