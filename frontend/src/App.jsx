import { MotionConfig } from 'framer-motion';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import GymGuide from './pages/GymGuide.jsx';
import HomeGuide from './pages/HomeGuide.jsx';
import ExerciseGuide from './pages/ExerciseGuide.jsx';
import NutritionTracker from './pages/NutritionTracker.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Profile from './pages/Profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Friends from './pages/Friends.jsx';
import Community from './pages/Community.jsx';
import SocialProfile from './pages/SocialProfile.jsx';
import Reels from './pages/Reels.jsx';

function Landing() { const { user, loading } = useAuth(); return loading ? <LoadingScreen message="Opening your space..." /> : user ? <Navigate to="/community" replace /> : <Home />; }
export default function App() {
  return <MotionConfig reducedMotion="user"><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/register" element={<Register />} /><Route element={<ProtectedRoute />}><Route path="/profile" element={<Profile />} /><Route path="/u/:username" element={<SocialProfile />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/training" element={<ExerciseGuide />} /><Route path="/gym" element={<GymGuide />} /><Route path="/home" element={<HomeGuide />} /><Route path="/reels" element={<Reels />} /><Route path="/nutrition" element={<NutritionTracker />} /><Route path="/friends" element={<Friends />} /><Route path="/community" element={<Community />} /></Route><Route path="*" element={<Landing />} /></Routes></MotionConfig>;
}
