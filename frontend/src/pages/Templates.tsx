import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileSpreadsheet, Plus, Edit3, Save, X, Send, ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: number;
  name: string;
  type: string;
  subject: string;
  body: string;
  tone: string;
  usage: number;
  updated: string;
}

const initialTemplates: Template[] = [
  { id: 1, name: 'Software Engineer Outreach', type: 'Cold Email', subject: 'Excited about the {{role}} opportunity at {{company}}', body: 'Dear {{name}},\n\nI came across the {{role}} position at {{company}} and was immediately drawn to the opportunity. With my experience in {{skill}}, I believe I can make a strong contribution to your team.\n\nI have attached my resume for your review and would welcome a chance to discuss further.\n\nBest regards,\n{{sender}}', tone: 'Professional', usage: 24, updated: '2 days ago' },
  { id: 2, name: 'Follow-up Sequence', type: 'Follow-up', subject: 'Following up on my application for {{role}}', body: 'Dear {{name}},\n\nI wanted to follow up on my application for the {{role}} position at {{company}}. I remain very interested in the opportunity and would love to hear about any updates.\n\nThank you for your time.\n\nBest regards,\n{{sender}}', tone: 'Friendly', usage: 18, updated: '1 week ago' },
  { id: 3, name: 'Interview Thank You', type: 'Thank You', subject: 'Thank you for the interview — {{role}} at {{company}}', body: 'Dear {{name}},\n\nThank you so much for taking the time to interview me for the {{role}} position. I really enjoyed learning more about the team at {{company}} and the exciting work you are doing.\n\nI am very enthusiastic about the opportunity and look forward to the next steps.\n\nBest regards,\n{{sender}}', tone: 'Professional', usage: 12, updated: '2 weeks ago' },
  { id: 4, name: 'Networking Outreach', type: 'Cold Email', subject: 'Hello from {{sender}} — admirer of your work at {{company}}', body: 'Hi {{name}},\n\nI have been following the work at {{company}} and am particularly impressed by {{achievement}}. I am a {{sender_role}} with a background in {{skill}} and would love to connect.\n\nWould you be open to a brief chat?\n\nBest,\n{{sender}}', tone: 'Friendly', usage: 9, updated: '3 weeks ago' },
];

const toneOptions = ['Professional', 'Friendly', 'Direct', 'Persuasive'];

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(initialTemplates);
  const [selected, setSelected] = useState<Template | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Template | null>(null);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleSelect = (t: Template) => {
    setSelected(t);
    setEditData({ ...t });
    setEditing(false);
    setSaved(false);
  };

  const handleBack = () => {
    setSelected(null);
    setEditing(false);
    setEditData(null);
    setSaved(false);
  };

  const handleEdit = () => {
    if (editData) setEditing(true);
  };

  const handleSave = () => {
    if (!editData) return;
    setTemplates(prev => prev.map(t => t.id === editData.id ? { ...editData, updated: 'Just now' } : t));
    setSelected(editData);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProceed = () => {
    if (editData) navigate('/campaign/new');
  };

  const handleCopyBody = (id: number, body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (selected && editData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: easeOut }}>
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to templates
        </button>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-base font-semibold bg-background px-2 py-1 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <h2 className="text-base font-semibold">{selected.name}</h2>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{selected.type} &middot; Used {selected.usage} times &middot; {selected.updated}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-success font-medium">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              {editing ? (
                <>
                  <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditData({ ...selected }); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={handleProceed} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Send className="w-3.5 h-3.5" /> Use Template
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Template Name</label>
                {editing ? (
                  <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
                ) : (
                  <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">{selected.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Type</label>
                {editing ? (
                  <select value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                    <option>Cold Email</option>
                    <option>Follow-up</option>
                    <option>Thank You</option>
                    <option>Networking</option>
                  </select>
                ) : (
                  <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">{selected.type}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Subject</label>
              {editing ? (
                <input type="text" value={editData.subject} onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
              ) : (
                <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">{selected.subject}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">Available placeholders: {'{{name}}'}, {'{{company}}'}, {'{{role}}'}, {'{{skill}}'}, {'{{sender}}'}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email Body</label>
              {editing ? (
                <textarea value={editData.body} onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors h-48 resize-none font-mono leading-relaxed" />
              ) : (
                <div className="text-sm text-foreground bg-muted/30 px-3 py-3 rounded-lg whitespace-pre-wrap leading-relaxed">{selected.body}</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Tone</label>
                {editing ? (
                  <select value={editData.tone} onChange={(e) => setEditData({ ...editData, tone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                    {toneOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">{selected.tone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Usage</label>
                <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">{selected.usage} times</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button onClick={() => handleCopyBody(editData.id, editData.body)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                {copiedId === editData.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === editData.id ? 'Copied' : 'Copy Body'}
              </button>
              <button onClick={handleProceed}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors ml-auto">
                <Sparkles className="w-3.5 h-3.5" />
                Generate Email with This Template
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your email templates. Click any template to view full details and edit.</p>
        </div>
        <Link to="/campaign/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create Template
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => handleSelect(t)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 card-hover text-left w-full group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</span>
            </div>
            <h3 className="font-semibold text-sm">{t.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.subject}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t.tone}</span>
              <span>Used {t.usage} times</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

