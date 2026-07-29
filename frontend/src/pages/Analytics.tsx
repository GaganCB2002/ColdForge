import { BarChart3, TrendingUp, Users, Briefcase, Mail, Target } from 'lucide-react';

const stats = [
  { label: 'Applications', value: '24', change: '+12%', icon: Briefcase, color: 'text-primary' },
  { label: 'Interviews', value: '8', change: '+5%', icon: Users, color: 'text-success' },
  { label: 'Offers', value: '3', change: '+2%', icon: Target, color: 'text-primary' },
  { label: 'Rejections', value: '7', change: '-3%', icon: BarChart3, color: 'text-destructive' },
  { label: 'Response Rate', value: '45%', change: '+8%', icon: TrendingUp, color: 'text-success' },
  { label: 'Emails Sent', value: '156', change: '+23%', icon: Mail, color: 'text-primary' },
];

export default function Analytics() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your application performance and metrics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className={`text-xs font-medium ${s.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
