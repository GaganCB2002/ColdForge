import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../lib/api';
import { Sun, Moon, Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const { theme, toggleTheme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/api/auth/register', { email, password, full_name: fullName });
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const loginRes = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      login(loginRes.data.access_token, loginRes.data.refresh_token || '');
      await fetchUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7FAFD] dark:bg-background flex items-center justify-center p-4 font-sans relative">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-muted transition-colors"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ColdForge</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground">Get started with ColdForge</p>
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-foreground mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                placeholder="John Doe" />
            </div>
          </div>
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
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                placeholder="Min. 6 characters" />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
