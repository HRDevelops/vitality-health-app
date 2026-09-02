import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './core/components/AppLayout';
import Dashboard from './features/dashboard/Dashboard';
import ExploreFitness from './features/explore/ExploreFitness';
import ActivityTracker from './features/activity/ActivityTracker';
import UserProfile from './features/profile/UserProfile';
import NutritionJournal from './features/nutrition/NutritionJournal';
import MindfulnessPodcast from './features/wellness/MindfulnessPodcast';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreFitness />} />
        <Route path="/activity" element={<ActivityTracker />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/nutrition" element={<NutritionJournal />} />
        <Route path="/wellness/podcast" element={<MindfulnessPodcast />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
