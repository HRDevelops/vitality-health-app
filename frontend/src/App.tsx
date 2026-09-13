import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './core/components/AppLayout';
import ProtectedRoute from './core/components/ProtectedRoute';
import SessionExpiryHandler from './core/components/SessionExpiryHandler';
import AuthScreen from './features/auth/AuthScreen';
import Dashboard from './features/dashboard/Dashboard';
import ExploreView from './features/explore/ExploreView';
import ActivityTracker from './features/activity/ActivityTracker';
import UserProfile from './features/profile/UserProfile';
import NutritionJournal from './features/nutrition/NutritionJournal';
import MindfulnessPodcast from './features/wellness/MindfulnessPodcast';
import HealthView from './features/health/HealthView';
import MoveView from './features/move/MoveView';
import TeamsView from './features/teams/TeamsView';
import CareCircleView from './features/carecircle/CareCircleView';

export default function App() {
  return (
    <>
      <SessionExpiryHandler />
      <Routes>
      <Route path="/login" element={<AuthScreen mode="login" />} />
      <Route path="/signup" element={<AuthScreen mode="signup" />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health" element={<HealthView />} />
        <Route path="/move" element={<MoveView />} />
        <Route path="/teams" element={<TeamsView />} />
        <Route path="/care-circle" element={<CareCircleView />} />
        <Route path="/explore" element={<ExploreView />} />
        <Route path="/activity" element={<ActivityTracker />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/nutrition" element={<NutritionJournal />} />
        <Route path="/wellness/podcast" element={<MindfulnessPodcast />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      </Routes>
    </>
  );
}
