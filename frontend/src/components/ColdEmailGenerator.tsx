import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import {
  Sparkles, Upload, FileText, ClipboardPaste, Loader2, Check, Copy,
  Mail, X, AlertCircle, FileUp, Trash2, Bot, ArrowRight, PenLine, Printer
} from 'lucide-react';

interface GeneratedEmail {
  subject: string;
  body: string;
}

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ColdEmailGenerator() {
  const [mode, setMode] = useState<'idle' | 'input'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasJd = Boolean(file) || text.trim().length > 0;

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    setResult(null);
    setError('');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  };

  const resetFlow = () => {
    setMode('idle');
    setFile(null);
    setFileName('');
    setText('');
    setError('');
    setResult(null);
    setCopied(false);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasJd || isGenerating) return;
    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (text.trim()) form.append('text', text.trim());

      try {
        const projs = await api.get('/api/projects/');
        if (projs.data.length > 0) form.append('project_id', String(projs.data[0].id));
      } catch {
        /* project is optional */
      }

      const res = await api.post('/api/emails/from-jd', form);
      setResult({ subject: res.data.subject, body: res.data.body });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Generation failed. Make sure the backend and Ollama are running.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInGmail = () => {
    if (!result) return;
    const to = recipientEmail ? `&to=${encodeURIComponent(recipientEmail)}` : '';
    const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1${to}&su=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.body)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Cold Email Generator</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Upload a Job Description &amp; get a crisp cold email in seconds.</p>
            </div>
          </div>

          {mode === 'input' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={resetFlow}
              className="sm:ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'idle' && !result ? (
            /* ── Idle / CTA state ── */
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="mt-6"
            >
              <button
                onClick={() => setMode('input')}
                className="group w-full flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.03] transition-all duration-300 px-6 py-10"
              >
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors"
                >
                  <Upload className="w-6 h-6 text-primary" />
                </motion.div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-foreground">
                    Click here to upload a Job Description
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We will write a crisp, professional cold email for you — only the JD is needed.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                    Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            </motion.div>
          ) : mode === 'input' ? (
            /* ── JD input state ── */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="mt-6"
            >
              {/* Two input options */}
              <form onSubmit={handleGenerate} className="mt-4">
                <div className="grid lg:grid-cols-2 gap-4">
                {/* Option 1: Upload file */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">1</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <FileUp className="w-3.5 h-3.5 text-primary" />
                      Upload Job Description
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.csv"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                  {!file ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      className="flex-1 min-h-[220px] w-full rounded-xl border-2 border-dashed transition-all duration-300 px-6 py-8 flex flex-col items-center justify-center gap-3 ${
                        dragOver
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/[0.02]'
                      }"
                    >
                      <motion.div
                        animate={{ scale: dragOver ? 1.15 : [1, 1.06, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      >
                        <Upload className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {dragOver ? 'Drop the JD here' : 'Drag & drop your Job Description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOCX, or TXT &middot; max 5 MB
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                        Browse files
                      </span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-1 items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3.5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Job Description ready to generate</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFileName(''); }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Option 2: Paste text */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">2</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <ClipboardPaste className="w-3.5 h-3.5 text-primary" />
                      Paste Job Description
                    </span>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); setResult(null); }}
                    placeholder="Paste the full Job Description here... (Role, responsibilities, requirements, etc.)"
                    className="flex-1 w-full px-3.5 py-3 bg-background border border-input rounded-xl text-sm min-h-[220px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors placeholder:text-muted-foreground resize-y"
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] text-muted-foreground">
                      {text.trim().length} characters
                    </p>
                  </div>
                </div>
              </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-destructive font-medium text-xs mb-0.5">Generation failed</p>
                      <p className="text-destructive/80 text-xs">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
                  </motion.div>
                )}

                <div className="flex justify-end items-center gap-4 mt-5">
                  <div className="flex-1 max-w-xs ml-auto">
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Recipient Email (optional)"
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !hasJd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating with Gemma...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Cold Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Result state ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="mt-6 print-area"
            >
              <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                {/* Result toolbar */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 mr-auto">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 text-success" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold">Your crisp cold email</p>
                      <p className="text-[11px] text-muted-foreground">Generated locally by Gemma via Ollama</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 print-hide">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                      title="Print the generated email"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={openInGmail}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-[#EA4335] hover:bg-[#D33426] transition-colors shadow-sm"
                      title="Open in Gmail with the full email pre-filled"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Open in Gmail
                    </button>
                  </div>
                </div>

                {/* Email body */}
                <div className="px-5 py-4 bg-background">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Subject</p>
                  <p className="text-sm font-semibold text-primary mb-5">{result.subject}</p>

                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Message</p>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-muted/20 border border-border rounded-lg p-4">
                    {result.body}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 gap-3 print-hide">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Want a different tone?
                </p>
                <button
                  onClick={() => { setResult(null); setMode('input'); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Generate again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
