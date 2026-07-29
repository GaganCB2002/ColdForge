import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../lib/api';
import {
  User, Palette, Bell, Bot, Shield, Database,
  Save, Camera, Loader2
} from 'lucide-react';

type Tab = 'profile' | 'appearance' | 'notifications' | 'ai' | 'security' | 'data';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
];

export default function Settings() {
  const { user, fetchUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [formData, setFormData] = useState({
    full_name: '', phone: '', linkedin: '', portfolio: '', bio: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await api.put('/api/auth/me', formData);
      await fetchUser();
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSave} className="space-y-6">
            {message && (
              <div className={`px-4 py-3 rounded-lg text-sm border ${
                message.includes('success')
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}>
                {message}
              </div>
            )}
            <div className="flex items-center gap-5 pb-6 border-b border-border">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                  <Camera className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full px-3.5 py-2.5 bg-muted border border-input rounded-lg text-sm text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">LinkedIn URL</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Portfolio URL</label>
                <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Bio / Professional Summary</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Briefly describe your professional background..."
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground resize-none" />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        );

      case 'appearance':
        return (
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm font-medium">Compact Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing for a denser layout</p>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${compactMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${compactMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm font-medium">Font Size</p>
                <p className="text-xs text-muted-foreground mt-0.5">Adjust the interface text size</p>
              </div>
              <select className="px-3 py-1.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 max-w-lg">
            {[
              { label: 'Email Notifications', desc: 'Receive updates via email', enabled: true },
              { label: 'Browser Notifications', desc: 'Get push notifications in browser', enabled: true },
              { label: 'Reminder Alerts', desc: 'Follow-up and deadline reminders', enabled: true },
              { label: 'AI Updates', desc: 'When AI completes email generation', enabled: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-3 first:pt-0 border-t border-border first:border-0">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                <button
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${n.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${n.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Default Model</label>
              <select className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Gemma (Local)</option>
                <option>GPT-4</option>
                <option>Claude 3</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Choose the AI model for email generation</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Temperature</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7"
                  className="flex-1 accent-primary h-1.5" />
                <span className="text-sm font-medium text-muted-foreground w-8 text-right">0.7</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Higher values make output more creative</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Prompt Style</label>
              <select className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Direct</option>
                <option>Persuasive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Language</label>
              <select className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8 max-w-lg">
            <div>
              <h3 className="text-sm font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Current Password</label>
                  <input type="password" placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">New Password</label>
                  <input type="password" placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                </div>
                <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  Update Password
                </button>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Chrome on Windows</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Active now</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-success" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Safari on macOS</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last active 2 days ago</p>
                  </div>
                  <button className="text-xs text-destructive font-medium hover:text-destructive/80">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6 max-w-lg">
            {[
              { label: 'Export All Data', desc: 'Download all your data as JSON', icon: Database, action: 'Export' },
              { label: 'Import Data', desc: 'Import data from a JSON file', icon: Database, action: 'Import' },
              { label: 'Create Backup', desc: 'Create a backup of your data', icon: Shield, action: 'Backup' },
              { label: 'Restore from Backup', desc: 'Restore your data from a backup', icon: Shield, action: 'Restore' },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between py-3 border-t border-border first:border-0">
                <div>
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                  {d.action}
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
            <h2 className="text-base font-semibold mb-6 capitalize">{activeTab}</h2>
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
