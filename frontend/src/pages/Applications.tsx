import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, ChevronRight, MapPin, CheckCircle2, Circle, X, FileText, ExternalLink } from 'lucide-react';

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
  date: string;
  logo: string;
  location: string;
  type: string;
  steps: { label: string; status: 'done' | 'current' | 'pending'; date?: string }[];
  notes: string;
}

const applications: Application[] = [
  {
    id: 1, company: 'Google', role: 'Software Engineer', status: 'Interview Scheduled', date: '2026-03-15', logo: 'G', location: 'Mountain View, CA', type: 'Full-time',
    steps: [
      { label: 'Applied', status: 'done', date: 'Mar 10' },
      { label: 'Resume Reviewed', status: 'done', date: 'Mar 12' },
      { label: 'Phone Screening', status: 'done', date: 'Mar 14' },
      { label: 'Technical Interview', status: 'current', date: 'Mar 20' },
      { label: 'On-site Interview', status: 'pending' },
      { label: 'Offer Decision', status: 'pending' },
    ],
    notes: 'Referred by Sarah from internal team. Focus on system design and distributed systems.',
  },
  {
    id: 2, company: 'Microsoft', role: 'Senior Developer', status: 'Assessment Pending', date: '2026-03-12', logo: 'M', location: 'Redmond, WA', type: 'Full-time',
    steps: [
      { label: 'Applied', status: 'done', date: 'Mar 8' },
      { label: 'Resume Reviewed', status: 'done', date: 'Mar 11' },
      { label: 'Online Assessment', status: 'current', date: 'Due Mar 18' },
      { label: 'Technical Interview', status: 'pending' },
      { label: 'Hiring Committee', status: 'pending' },
      { label: 'Offer Decision', status: 'pending' },
    ],
    notes: 'Need to complete the coding assessment on HackerRank. Practice DP and graph problems.',
  },
  {
    id: 3, company: 'Amazon', role: 'SDE II', status: 'Applied', date: '2026-03-10', logo: 'A', location: 'Seattle, WA', type: 'Full-time',
    steps: [
      { label: 'Applied', status: 'done', date: 'Mar 10' },
      { label: 'Resume Reviewed', status: 'pending' },
      { label: 'Online Assessment', status: 'pending' },
      { label: 'Phone Interview', status: 'pending' },
      { label: 'On-site Loop', status: 'pending' },
      { label: 'Bar Raiser', status: 'pending' },
      { label: 'Offer Decision', status: 'pending' },
    ],
    notes: 'Tailor resume to highlight distributed systems experience. Prepare for leadership principles.',
  },
  {
    id: 4, company: 'Meta', role: 'Product Engineer', status: 'Draft', date: '2026-03-08', logo: 'M', location: 'Menlo Park, CA', type: 'Full-time',
    steps: [
      { label: 'Draft Application', status: 'done', date: 'Mar 8' },
      { label: 'Review & Submit', status: 'current' },
      { label: 'Resume Reviewed', status: 'pending' },
      { label: 'Recruiter Screen', status: 'pending' },
      { label: 'Technical Screen', status: 'pending' },
      { label: 'On-site', status: 'pending' },
      { label: 'Offer Decision', status: 'pending' },
    ],
    notes: 'Finish drafting cover letter. Highlight full-stack experience and product sense.',
  },
];

const statusColors: Record<string, string> = {
  'Applied': 'bg-primary/10 text-primary',
  'Assessment Pending': 'bg-warning/10 text-warning',
  'Interview Scheduled': 'bg-success/10 text-success',
  'Draft': 'bg-muted text-muted-foreground',
};

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Applications() {
  const [selected, setSelected] = useState<Application | null>(null);

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: easeOut }}>
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <X className="w-4 h-4" />
          Back to applications
        </button>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                  {selected.logo}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{selected.company}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.role}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{selected.type}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {selected.date}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[selected.status] || 'bg-muted text-muted-foreground'}`}>
                {selected.status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold mb-5">Application Timeline</h3>
            <div className="relative">
              {selected.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                  {/* Connector line */}
                  {i < selected.steps.length - 1 && (
                    <div className={`absolute left-[15px] top-7 bottom-0 w-px ${step.status === 'done' ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  {/* Circle indicator */}
                  <div className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                    step.status === 'done' ? 'border-primary bg-primary/10' :
                    step.status === 'current' ? 'border-primary bg-primary/10' :
                    'border-border bg-card'
                  }`}>
                    {step.status === 'done' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : step.status === 'current' ? (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        step.status === 'done' ? 'text-foreground' :
                        step.status === 'current' ? 'text-primary' :
                        'text-muted-foreground/60'
                      }`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <span className="text-xs text-muted-foreground">{step.date}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="p-6">
            <h3 className="text-sm font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border">{selected.notes}</p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Update Status
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Open Job Posting
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your job applications. Click any row to see full details.</p>
        </div>
        <Link to="/campaign/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{app.logo}</div>
                      <span className="font-medium">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.role}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-muted text-muted-foreground'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{app.date}</td>
                  <td className="px-4 py-3.5">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

