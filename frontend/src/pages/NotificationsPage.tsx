import { useState } from 'react';
import { Bell, Check, Calendar, FileText, Sparkles, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: number;
  icon: any;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: string;
  fullDesc?: string;
}

const initialNotifications: NotificationItem[] = [
  { id: 1, icon: Calendar, title: 'Interview Tomorrow', desc: 'Microsoft - Software Engineer at 10:00 AM', time: '5 min ago', read: false, type: 'reminder', fullDesc: 'You have an interview scheduled with Microsoft for the Software Engineer position tomorrow at 10:00 AM. Please prepare accordingly and join the call on time.' },
  { id: 2, icon: FileText, title: 'Resume Updated', desc: 'Your resume was processed and indexed', time: '1 hour ago', read: false, type: 'update', fullDesc: 'Your resume "Resume_v2.pdf" has been successfully processed and indexed into the knowledge base. It is now available for AI context when generating cold emails.' },
  { id: 3, icon: Sparkles, title: 'AI Completed Email', desc: 'Cold email generated for Google', time: '2 hours ago', read: true, type: 'ai', fullDesc: 'The AI has completed generating a cold email for Google (Software Engineer position). You can review, edit, and send it from your project dashboard.' },
  { id: 4, icon: Bell, title: 'Reminder Due', desc: 'Follow up with Amazon regarding application', time: '3 hours ago', read: true, type: 'reminder', fullDesc: 'This is a reminder to follow up with Amazon regarding your application for the SDE II position. It has been 5 days since you applied.' },
  { id: 5, icon: Calendar, title: 'Assessment Deadline', desc: 'Complete coding assessment for Amazon', time: '1 day ago', read: true, type: 'deadline', fullDesc: 'Your coding assessment for Amazon (SDE II) is due tomorrow. Please complete it before the deadline to proceed with your application.' },
];

type Filter = 'all' | 'unread' | 'reminder' | 'ai' | 'update';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    // Auto-mark as read when expanded
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'All caught up!'}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <div className="flex gap-1">
            {(['all', 'unread', 'reminder', 'ai', 'update'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${filter === f ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px]">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={markAllRead} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Mark all as read">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filtered.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${!n.read ? 'bg-primary/[0.02]' : ''}`}
                >
                  <button
                    onClick={() => toggleExpand(n.id)}
                    className="w-full flex items-start gap-4 px-4 py-4 hover:bg-muted/30 transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${!n.read ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center shrink-0 mt-0.5`}>
                      <n.icon className={`w-4 h-4 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          <span className="text-xs text-muted-foreground">{n.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                      <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] text-primary font-medium">Click to {expandedId === n.id ? 'collapse' : 'view details'}</span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === n.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border bg-muted/10"
                    >
                      <div className="px-4 py-4 sm:px-8 sm:py-5">
                        <div className="rounded-lg border border-border bg-background p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <n.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold">{n.title}</h3>
                              <p className="text-xs text-muted-foreground">{n.time}</p>
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                              n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {n.read ? 'Read' : 'Unread'}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{n.fullDesc || n.desc}</p>
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                            <button onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                              {n.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              Mark as {n.read ? 'Unread' : 'Read'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
