import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import EmailGenerator from './pages/EmailGenerator';
import ColdEmailPrompt from './pages/ColdEmailPrompt';
import ResumeBuilder from './pages/ResumeBuilder';
import ProjectDetail from './pages/ProjectDetail';
import History from './pages/History';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Applications from './pages/Applications';
import Companies from './pages/Companies';
import Templates from './pages/Templates';
import Resumes from './pages/Resumes';
import KnowledgeBase from './pages/KnowledgeBase';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaign/new" element={<NewProject />} />
          <Route path="/email-generator" element={<EmailGenerator />} />
          <Route path="/prompt-email" element={<ColdEmailPrompt />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
