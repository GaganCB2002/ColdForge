import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ThemeToggle from '../components/ThemeToggle';
import api from '../lib/api';
import { Sparkles, Mail, Lock, Loader2, ArrowLeft, Home } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const response = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      login(response.data.access_token, response.data.refresh_token || '');
      await fetchUser();
      navigate('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to the server. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7FAFD] dark:bg-background flex items-center justify-center p-4 font-sans relative">
      <Link
        to="/"
        className="absolute top-6 left-6 group flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-muted transition-all"
        aria-label="Back to home"
      >
        <div className="relative">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <Home className="w-0 h-0 opacity-0 absolute" />
        </div>
        <span className="text-xs font-medium hidden sm:inline">Home</span>
      </Link>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ColdForge</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-2.5 text-center">Quick login with test account</p>
          <button
            type="button"
            onClick={() => { setEmail('test@example.com'); setPassword('password123'); }}
            className="w-full flex items-center justify-between text-xs bg-background border border-border hover:border-primary/50 px-3.5 py-2.5 rounded-lg transition-all group"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">test@example.com</span>
              <span className="text-muted-foreground mt-0.5">password123</span>
            </div>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">Autofill</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                placeholder="Enter your password" />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">Create one</Link>
        </p>
      </div>
    </main>
  );
}
