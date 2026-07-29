import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants, useInView, animate } from 'framer-motion';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Plus, Sparkles, Mail, Building2, Users, Clock, FileText,
  Bell, Calendar, TrendingUp, Briefcase, Target, CheckCircle2,
  Send, Upload, ChevronRight, BarChart3, MessageSquare, Edit3,
  HelpCircle, Bot, Copy, Loader2, Inbox, Search,
  Check, AlertCircle, ExternalLink
} from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stagger: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

/* ─── Animated Stat Counter ─── */

function AnimatedStatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;

    const target = parseInt(value);
    if (!target) return;

    const controls = animate(0, target, {
      duration: 1.6,
      ease: easeOut,
      onUpdate: (v) => { if (el) el.textContent = Math.round(v).toString(); }
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      {value}
    </motion.span>
  );
}

/* ─── List stagger variants ─── */

const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [allEmails, setAllEmails] = useState<any[]>([]);

  // Role → Email Generator state
  const [jobRole, setJobRole] = useState('');
  const [jdCompany, setJdCompany] = useState('');
  const [jdRecipient, setJdRecipient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [jdCopied, setJdCopied] = useState(false);
  const [jdError, setJdError] = useState('');

  // Inbox state
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [inboxLoading, setInboxLoading] = useState(true);

  // Error state
  const [projectsError, setProjectsError] = useState('');
  const [inboxError, setInboxError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchAllEmails();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects/');
      setProjects(response.data);
      setProjectsError('');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to load projects';
      setProjectsError(msg);
    }
  };

  const fetchAllEmails = async () => {
    setInboxLoading(true);
    try {
      const projRes = await api.get('/api/projects/');
      const projs = projRes.data.slice(0, 5);
      const emailPromises = projs.map((p: any) =>
        api.get(`/api/emails/project/${p.id}`).then(r => r.data.map((e: any) => ({ ...e, projectName: p.name })))
      );
      const results = await Promise.allSettled(emailPromises);
      const emails: any[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') emails.push(...r.value);
      }
      emails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllEmails(emails);
    } catch (error: any) {
      setAllEmails([]);
      setInboxError(error.response?.data?.detail || 'Failed to load emails');
    } finally {
      setInboxLoading(false);
    }
  };

  const handleGenerateEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim()) return;

    setIsGenerating(true);
    setJdError('');
    setGeneratedEmail(null);

    try {
      const res = await api.post('/api/emails/quick', { role: jobRole });
      const content = res.data.email_content || '';
      const subjectMatch = content.match(/^Subject:\s*(.+)$/im);
      const subject = subjectMatch ? subjectMatch[1] : 'Cold Email from ColdForge';
      let body = content;
      if (subjectMatch) {
        const idx = content.indexOf('\n');
        body = idx !== -1 ? content.slice(idx + 1).trim() : content;
      }
      setGeneratedEmail({ subject, body });
    } catch {
      setJdError('Generation failed. Using demo mode — here is a sample email.');
      setGeneratedEmail({
        subject: `Excited to apply for the ${jobRole} position`,
        body: `Dear ${jdRecipient || 'Hiring Manager'},\n\nI am writing to express my strong interest in the ${jobRole} role at ${jdCompany || 'your company'}. With my background and passion for this field, I am confident I can make a meaningful contribution to your team.\n\nI have attached my resume for your review and would welcome the chance to discuss how my experience aligns with this opportunity.\n\nBest regards,\n${user?.full_name || 'Your Name'}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyJdEmail = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setJdCopied(true);
    setTimeout(() => setJdCopied(false), 2000);
  };

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const stats = [
    { label: 'Total Applications', value: projects.length > 0 ? projects.length.toString() : '0', icon: FileText, desc: 'Active applications', change: '+2 this week', color: 'text-primary' },
    { label: 'Emails Generated', value: allEmails.length.toString(), icon: Mail, desc: 'AI-powered emails', change: '+5 this week', color: 'text-primary' },
    { label: 'Companies Applied', value: '8', icon: Building2, desc: 'Target companies', change: '+3 this week', color: 'text-primary' },
    { label: 'Follow-ups Pending', value: '4', icon: Clock, desc: 'Requires attention', change: '+1 today', color: 'text-warning' },
    { label: 'Interviews Scheduled', value: '3', icon: Users, desc: 'Upcoming interviews', change: '+2 this week', color: 'text-success' },
    { label: 'Documents Uploaded', value: '6', icon: Upload, desc: 'In knowledge base', change: '+1 this week', color: 'text-primary' },
  ];

  const recentActivities = [
    { icon: Sparkles, text: 'Cold email generated for Google', time: '2 hours ago', status: 'completed' as const },
    { icon: Upload, text: 'Resume uploaded to Knowledge Base', time: '4 hours ago', status: 'completed' as const },
    { icon: Building2, text: 'Microsoft added to companies', time: '1 day ago', status: 'completed' as const },
    { icon: Clock, text: 'Follow-up reminder created for Amazon', time: '1 day ago', status: 'pending' as const },
    { icon: Calendar, text: 'Interview scheduled with Google', time: '2 days ago', status: 'completed' as const },
  ];

  const upcomingTasks = [
    { title: 'Follow up with Microsoft', due: 'Today, 2:00 PM', type: 'follow-up' as const },
    { title: 'Google - Technical Interview', due: 'Tomorrow, 10:00 AM', type: 'interview' as const },
    { title: 'Amazon Coding Assessment', due: 'Mar 20, 11:59 PM', type: 'deadline' as const },
    { title: 'Update Resume for Meta', due: 'Mar 22', type: 'task' as const },
  ];

  const applications = [
    { company: 'Google', role: 'Software Engineer', progress: 85, status: 'Interview Scheduled', logo: 'G' },
    { company: 'Microsoft', role: 'Senior Developer', progress: 50, status: 'Assessment Pending', logo: 'M' },
    { company: 'Amazon', role: 'SDE II', progress: 20, status: 'Applied', logo: 'A' },
  ];

  const aiSuggestions = [
    { icon: Send, text: 'Send follow-up to Microsoft', action: 'Generate' },
    { icon: Edit3, text: 'Improve Resume for ATS', action: 'Optimize' },
    { icon: MessageSquare, text: 'Rewrite cold email for Google', action: 'Rewrite' },
    { icon: HelpCircle, text: 'Prepare interview questions', action: 'Generate' },
  ];

  const companies = [
    { name: 'Google', role: 'Software Engineer', date: 'Mar 15', status: 'Interview', logo: 'G' },
    { name: 'Microsoft', role: 'Senior Developer', date: 'Mar 12', status: 'Assessment', logo: 'M' },
    { name: 'Amazon', role: 'SDE II', date: 'Mar 10', status: 'Applied', logo: 'A' },
    { name: 'Meta', role: 'Product Engineer', date: 'Mar 8', status: 'Draft', logo: 'M' },
  ];

  const todayEvents = [
    { title: 'Interview - Google', time: '10:00 AM' },
    { title: 'Follow-up - Microsoft', time: '2:00 PM' },
  ];

  const analytics = [
    { label: 'Applications', value: '12', icon: Briefcase, trend: '+15%' },
    { label: 'Interviews', value: '3', icon: Users, trend: '+10%' },
    { label: 'Offers', value: '1', icon: Target, trend: '+5%' },
    { label: 'Response Rate', value: '42%', icon: TrendingUp, trend: '+8%' },
  ];

  const filteredEmails = allEmails.filter(e => {
    const q = inboxSearch.toLowerCase();
    const matchesSearch = !q || (e.subject?.toLowerCase().includes(q) || e.recipient_name?.toLowerCase().includes(q) || e.recipient_company?.toLowerCase().includes(q));
    const matchesFilter = inboxFilter === 'all' || (inboxFilter === 'sent' && e.status === 'sent') || (inboxFilter === 'pending' && (!e.status || e.status === 'pending'));
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* Welcome Card */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/campaign/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                <Sparkles className="w-4 h-4" />
                Generate Email
              </Link>
              <Link to="/knowledge" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                <Upload className="w-4 h-4" />
                Upload Documents
              </Link>
              <Link to="/applications" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                <Building2 className="w-4 h-4" />
                Add Company
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{stat.change}</span>
            </div>
            <p className="text-lg font-bold"><AnimatedStatValue value={stat.value} /></p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Error Messages */}
      {(projectsError || inboxError) && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {projectsError && (
            <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive">{projectsError}</span>
              <button onClick={() => setProjectsError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
            </div>
          )}
          {inboxError && (
            <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive">{inboxError}</span>
              <button onClick={() => setInboxError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
            </div>
          )}
        </motion.div>
      )}

      {/* JD → Cold Email Generator */}
      <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Cold Email Generator</h2>
              <p className="text-xs text-muted-foreground">Enter a job role and get a targeted cold email in seconds.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateEmail} className="mt-5 space-y-4">
            <div>
              <label htmlFor="job-role" className="block text-xs font-medium text-foreground mb-1.5">Job Role *</label>
              <input
                id="job-role"
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                placeholder="e.g. Java Developer, Python Full Stack, ML Engineer, Data Scientist"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jd-company" className="block text-xs font-medium text-foreground mb-1.5">Target Company</label>
                <input
                  id="jd-company"
                  type="text"
                  value={jdCompany}
                  onChange={(e) => setJdCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label htmlFor="jd-recipient" className="block text-xs font-medium text-foreground mb-1.5">Recipient Name</label>
                <input
                  id="jd-recipient"
                  type="text"
                  value={jdRecipient}
                  onChange={(e) => setJdRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground"
                  placeholder="e.g. Hiring Manager"
                />
              </div>
            </div>

            {jdError && (
              <div role="alert" className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{jdError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || !jobRole.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Cold Email'}
              </button>
            </div>
          </form>

          {/* Generated Email Result */}
          {generatedEmail && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-lg border border-border bg-muted/20 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Generated Email</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyJdEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {jdCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {jdCopied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </a>
                </div>
              </div>
              <div className="px-5 py-3 border-b border-border bg-background">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Subject</p>
                <p className="text-sm font-medium">{generatedEmail.subject}</p>
              </div>
              <div className="px-5 py-4 bg-background">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {generatedEmail.body}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Email Inbox */}
      <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 lg:p-8 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Email Inbox</h2>
              <p className="text-xs text-muted-foreground">All your generated cold emails in one place.</p>
            </div>
          </div>

          {/* Inbox Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-1">
              {(['all', 'sent', 'pending'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setInboxFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    inboxFilter === f
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs w-full sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={inboxSearch}
                onChange={(e) => setInboxSearch(e.target.value)}
                placeholder="Search emails..."
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Inbox List */}
        <div className="px-6 lg:px-8 pb-6">
          {inboxLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmails.length > 0 ? (
            <div className="divide-y divide-border -mx-6 lg:-mx-8">
              {filteredEmails.map((email) => (
                <div key={email.id}>
                  <button
                    onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                    className={`w-full flex items-start gap-4 px-6 lg:px-8 py-4 text-left hover:bg-muted/30 transition-colors group ${
                      selectedEmail?.id === email.id ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{email.subject || 'No Subject'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {email.recipient_name || 'Unknown'} {email.recipient_company ? `@ ${email.recipient_company}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            email.status === 'sent' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {email.status || 'pending'}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {email.created_at ? new Date(email.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{email.projectName || 'Project'}</span>
                        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${selectedEmail?.id === email.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Email Body */}
                  {selectedEmail?.id === email.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border bg-muted/10"
                    >
                      <div className="px-6 lg:px-8 py-4">
                        <div className="rounded-lg border border-border bg-background p-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Subject</p>
                          <p className="text-sm font-medium mb-4">{email.subject || 'No Subject'}</p>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {email.body}
                          </div>
                          {email.generated_resume && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Tailored Resume</p>
                              <div className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                                {email.generated_resume}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                          {email.recipient_company && (
                            <Link
                              to={`/project/${email.project_id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Project
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : allEmails.length > 0 ? (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No emails match your search.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Your inbox is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Generate your first cold email using the section above.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <Link to="/history" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <motion.div variants={listStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="divide-y divide-border">
            {recentActivities.map((activity, i) => (
              <motion.div key={i} variants={listItem} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.status === 'completed' ? 'bg-primary/10' : 'bg-warning/10'}`}>
                  <activity.icon className={`w-4 h-4 ${activity.status === 'completed' ? 'text-primary' : 'text-warning'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
                {activity.status === 'completed'
                  ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  : <Clock className="w-4 h-4 text-warning shrink-0" />
                }
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Upcoming Tasks</h2>
            <span className="text-xs text-muted-foreground">{upcomingTasks.length} items</span>
          </div>
          <motion.div variants={listStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="divide-y divide-border">
            {upcomingTasks.map((task, i) => (
              <motion.div key={i} variants={listItem} className="px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    task.type === 'interview' ? 'bg-primary' :
                    task.type === 'deadline' ? 'bg-destructive' :
                    task.type === 'follow-up' ? 'bg-warning' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.due}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="px-5 py-3 border-t border-border">
            <button className="flex items-center gap-2 text-xs text-primary font-medium hover:text-primary/80 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
        </motion.div>
      </div>

      {/* Second Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Progress */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Application Progress</h2>
            <Link to="/applications" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <motion.div variants={listStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="divide-y divide-border">
            {applications.map((app, i) => (
              <motion.div key={i} variants={listItem} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {app.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{app.company}</p>
                    <p className="text-xs text-muted-foreground">{app.role}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">{app.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${app.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{app.status}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* AI Assistant */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">AI Assistant</h2>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-left group"
              >
                <suggestion.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">{suggestion.text}</span>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">{suggestion.action}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              AI-powered suggestions based on your activity
            </p>
          </div>
        </motion.div>

        {/* Recent Companies */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Recent Companies</h2>
            <Link to="/companies" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <motion.div variants={listStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="divide-y divide-border">
            {companies.map((c, i) => (
              <motion.div key={i} variants={listItem} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {c.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role} &middot; {c.date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.status === 'Interview' ? 'bg-success/10 text-success' :
                  c.status === 'Assessment' ? 'bg-warning/10 text-warning' :
                  c.status === 'Applied' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {c.status}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Third Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Widget */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Notifications</h2>
              <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">2</span>
            </div>
            <Link to="/notifications" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <motion.div variants={listStagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="divide-y divide-border">
            {[
              { title: 'Interview Tomorrow', desc: 'Microsoft - Software Engineer', time: '5 min ago', icon: Calendar, unread: true },
              { title: 'Resume Updated', desc: 'Successfully processed and indexed', time: '1 hour ago', icon: Upload, unread: true },
              { title: 'AI Completed Email', desc: 'Cold email generated for Google', time: '2 hours ago', icon: Sparkles, unread: false },
            ].map((n, i) => (
              <motion.div key={i} variants={listItem} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors ${n.unread ? 'bg-primary/[0.02]' : ''}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.unread ? 'bg-primary/10' : 'bg-muted'}`}>
                  <n.icon className={`w-3.5 h-3.5 ${n.unread ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.unread ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{n.time}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Today's Events</h2>
            </div>
            <Link to="/calendar" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <div className="p-5">
            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="w-1.5 h-full min-h-[2.5rem] rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No events scheduled for today</p>
            )}
          </div>
        </motion.div>

        {/* Analytics Summary */}
        <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Analytics Summary</h2>
            </div>
            <Link to="/analytics" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <div className="p-4 space-y-3">
            {analytics.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <a.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{a.label}</p>
                    <p className="text-sm font-semibold">{a.value}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-success">{a.trend}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Monthly performance summary
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link to="/campaign/new" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-center">Generate<br />Cold Email</span>
          </Link>
          <Link to="/knowledge" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">Upload<br />Resume</span>
          </Link>
          <Link to="/templates" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">Create<br />Template</span>
          </Link>
          <Link to="/knowledge" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">Upload Company<br />Documents</span>
          </Link>
          <Link to="/companies" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">Add<br />Company</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/[0.02] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-xs font-medium text-center">New<br />Reminder</span>
          </Link>
        </div>
      </motion.div>

      {/* Gmail Sync */}
      <GmailSync />
    </motion.div>
  );
}

/* ─── Gmail Sync Component ─── */

function GmailSync() {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = () => {
    setStatus('syncing');
    setMessage('');
    setTimeout(() => {
      setStatus('error');
      setMessage('Gmail integration is under development. This feature will be available in a future update.');
    }, 3000);
  };

  return (
    <motion.div variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA4335]/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#EA4335]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Gmail Sync</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sync your emails and contacts with ColdForge</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={status === 'syncing'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EA4335] text-white text-sm font-medium hover:bg-[#EA4335]/90 transition-colors disabled:opacity-60 shadow-sm"
          >
            {status === 'syncing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {status === 'syncing' ? 'Syncing...' : 'Sync Gmail'}
          </button>
        </div>

        {status === 'syncing' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-xs text-primary font-medium">Connecting to Gmail...</span>
            </div>
            <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.8, ease: 'easeInOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </motion.div>
        )}

        {status === 'error' && message && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <span className="text-warning-foreground font-medium block text-xs mb-0.5">Syncing failed</span>
              <span className="text-warning-foreground/80 text-xs">{message}</span>
            </div>
            <button onClick={() => setStatus('idle')} className="ml-auto text-warning-foreground/60 hover:text-warning-foreground">&times;</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
