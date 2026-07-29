import { useEffect, useState, useCallback, useRef } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import ErrorBoundary from '../ErrorBoundary';
import {
  LayoutDashboard, Sparkles, FileText, Building2, FileSpreadsheet,
  Database, FileUp, Clock, BarChart3, Bell, Calendar, Settings,
  HelpCircle, LogOut, Sun, Moon, Search, ChevronLeft, ChevronRight,
  Menu, X, Check, Archive, Inbox, ScrollText
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', path: '/dashboard', icon: Inbox },
  { name: 'AI Email Generator', path: '/campaign/new', icon: Sparkles },
  { name: 'Applications', path: '/applications', icon: FileText },
  { name: 'Companies', path: '/companies', icon: Building2 },
  { name: 'Resumes', path: '/resumes', icon: ScrollText },
  { name: 'Templates', path: '/templates', icon: FileSpreadsheet },
  { name: 'Knowledge Base', path: '/knowledge', icon: Database },
  { name: 'Documents', path: '/project/0', icon: FileUp },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const notifications = [
  { id: 1, title: 'Interview Tomorrow', desc: 'Microsoft - Software Engineer', time: '5 min ago', read: false },
  { id: 2, title: 'Resume Updated', desc: 'Your resume was processed successfully', time: '1 hour ago', read: false },
  { id: 3, title: 'AI Completed Email', desc: 'Cold email generated for Google', time: '2 hours ago', read: true },
  { id: 4, title: 'Reminder Due', desc: 'Follow up with Amazon', time: '3 hours ago', read: true },
];

export default function AppLayout() {
  const { user, isAuthenticated, isLoading, logout, fetchUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!user && !isLoading) {
      fetchUser();
    }
  }, [isAuthenticated, user, isLoading, navigate, fetchUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/project/0') return location.pathname.startsWith('/project/');
    return location.pathname.startsWith(path);
  };

  const mainNav = navItems.filter((_, i) => i <= 6);
  const bottomNav = navItems.filter((_, i) => i >= 7);

  return (
    <div className="h-screen flex bg-[#F7FAFD] dark:bg-background text-foreground overflow-hidden">
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search companies, emails, templates, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted rounded border border-border">ESC</kbd>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                {searchQuery ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Press Enter to search for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</p>
                    {['Microsoft application', 'Google cold email', 'Amazon follow-up', 'Resume v2'].map((item) => (
                      <button
                        key={item}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotifOpen(false)}>
          <div className="absolute right-4 top-16 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Mark all as read">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Archive all">
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/[0.03]' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Link to="/notifications" onClick={() => setNotifOpen(false)} className="block w-full text-center text-sm text-primary font-medium py-1.5 rounded-md hover:bg-primary/5 transition-colors">
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {profileOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setProfileOpen(false)}>
          <div className="absolute right-4 top-16 w-72" onClick={(e) => e.stopPropagation()}>
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-5 border-b border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-base font-bold text-primary-foreground mx-auto mb-3">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <p className="text-sm font-semibold">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
                <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Help & Support
                </Link>
              </div>
              <div className="p-2 border-t border-border">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 relative`}>
        <div className={`h-14 flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'} border-b border-border gap-2.5 shrink-0`}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && <span className="text-sm font-semibold tracking-tight">ColdForge</span>}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5" aria-label="Main Navigation">
          {mainNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted font-normal'
              } ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive(item.path) ? 'text-primary' : ''}`} />
              {!sidebarCollapsed && item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-2 px-2 pb-3 space-y-0.5">
          {bottomNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted font-normal'
              } ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive(item.path) ? 'text-primary' : ''}`} />
              {!sidebarCollapsed && item.name}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center h-8 border-t border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <header className="h-14 border-b border-border bg-background flex items-center gap-3 px-4 shrink-0 z-10">
          <button
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -ml-1"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 max-w-md flex items-center gap-3 px-3.5 py-2 bg-muted/60 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Search companies, emails, templates...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden sm:inline-flex ml-auto items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium bg-background rounded border border-border">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
            </div>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user?.full_name || 'User'}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
