import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Clock, Plus, Trash2, Loader2, Sparkles, FileUp, Building2, Calendar, Mail, AlertCircle } from 'lucide-react';

interface Activity {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
}

const actionIcons: Record<string, any> = {
  'Manual Entry': Clock,
  'Interview': Calendar,
  'Networking': Building2,
  'Follow Up': Mail,
  'Email Generated': Sparkles,
  'Document Uploaded': FileUp,
};

export default function History() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newActionType, setNewActionType] = useState('Manual Entry');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchActivities = async () => {
    try {
      const response = await api.get('/api/activities');
      setActivities(response.data);
      setFetchError('');
    } catch (error: any) {
      setFetchError(error.response?.data?.detail || 'Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/api/activities', { action_type: newActionType, description: newDescription });
      setNewDescription('');
      fetchActivities();
    } catch (error: any) {
      setSubmitError(error.response?.data?.detail || 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteError('');
    try {
      await api.delete(`/api/activities/${id}`);
      setActivities(activities.filter(a => a.id !== id));
    } catch (error: any) {
      setDeleteError(error.response?.data?.detail || 'Failed to delete activity');
    }
  };

  const getActionIcon = (type: string) => {
    return actionIcons[type] || Clock;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Activity History</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your job search activities and progress.</p>
      </div>

      {fetchError && (
        <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm mb-6">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{fetchError}</span>
          <button onClick={() => setFetchError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
        </div>
      )}
      {deleteError && (
        <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm mb-6">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{deleteError}</span>
          <button onClick={() => setDeleteError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
        </div>
      )}
      {submitError && (
        <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm mb-6">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{submitError}</span>
          <button onClick={() => setSubmitError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
        </div>
      )}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Add Manual Entry</h2>
        <form onSubmit={handleAddActivity} className="flex flex-col sm:flex-row gap-3">
          <select value={newActionType} onChange={(e) => setNewActionType(e.target.value)}
            className="px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors sm:w-40">
            <option value="Manual Entry">Manual Entry</option>
            <option value="Interview">Interview</option>
            <option value="Networking">Networking</option>
            <option value="Follow Up">Follow Up</option>
          </select>
          <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Describe the activity..."
            className="flex-1 px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
            required />
          <button type="submit" disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Record
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold">Timeline</h2>
          <span className="text-xs text-muted-foreground">{activities.length} records</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity history found.</p>
            <p className="text-xs text-muted-foreground mt-1">Add entries above or start applying to jobs.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.action_type);
              return (
                <div key={activity.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {activity.action_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{activity.description}</p>
                  </div>
                  <button onClick={() => handleDelete(activity.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete record">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
