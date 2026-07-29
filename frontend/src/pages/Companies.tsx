import { Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const companies = [
  { name: 'Google', industry: 'Technology', status: 'Active', emails: 12 },
  { name: 'Microsoft', industry: 'Technology', status: 'Active', emails: 8 },
  { name: 'Amazon', industry: 'E-commerce', status: 'Pending', emails: 5 },
];

export default function Companies() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage companies you're targeting.</p>
        </div>
        <Link to="/campaign/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Company
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((c) => (
          <div key={c.name} className="rounded-xl border border-border bg-card p-5 card-hover">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{c.industry}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{c.emails} emails</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
