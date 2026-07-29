import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/api/projects/', { name, description });
      navigate(`/project/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up a new project to start generating targeted cold emails.</p>
      </div>

      {error && (
        <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="campaignName" className="block text-xs font-medium text-foreground mb-1.5">Campaign Name</label>
            <input id="campaignName" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
              placeholder="e.g. Q3 Software Agency Outreach" />
          </div>
          <div>
            <label htmlFor="campaignDescription" className="block text-xs font-medium text-foreground mb-1.5">Description (Optional)</label>
            <textarea id="campaignDescription" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors h-32 resize-none placeholder:text-muted-foreground"
              placeholder="Brief description of this campaign's goals or target audience..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
