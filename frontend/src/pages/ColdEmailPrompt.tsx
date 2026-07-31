import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import {
  Wand2, Loader2, Check, Copy, Mail, AlertCircle, Bot,
  PenLine, Printer, Send, Zap, MessageSquareText, ChevronDown
} from 'lucide-react';

interface GeneratedEmail {
  subject: string;
  body: string;
}

const toneOptions = [
  { value: 'Professional', label: 'Professional', emoji: '💼' },
  { value: 'Friendly', label: 'Friendly', emoji: '😊' },
  { value: 'Confident', label: 'Confident', emoji: '💪' },
  { value: 'Enthusiastic', label: 'Enthusiastic', emoji: '🚀' },
  { value: 'Formal', label: 'Formal', emoji: '🎩' },
  { value: 'Casual', label: 'Casual', emoji: '👋' },
];

const examplePrompts = [
  'Write a cold email for MLDS role at Google',
  'Email for Senior React Developer position at Microsoft',
  'Cold email applying for Data Scientist at Amazon',
  'Write email for DevOps Engineer role at Netflix',
  'Email for Product Manager position at Stripe',
  'Cold email for ML Engineer at OpenAI',
];

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ColdEmailPrompt() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [toneOpen, setToneOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  const canGenerate = prompt.trim().length >= 5;

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/api/emails/from-context', {
        prompt: prompt.trim(),
        tone,
      });
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

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setResult(null);
    setError('');
  };

  const handleAutoSuggest = () => {
    const suggestions = [
      "Write a highly personalized cold email to Sarah, VP of Engineering at TechFlow. Mention my 5 years of experience building scalable microservices in Go and Kubernetes, and how I can help them optimize their backend latency. Keep it crisp, confident, and ask for a quick 10-minute chat next week.",
      "Draft an email to the hiring manager for the Senior Data Scientist role at Quantum AI. Highlight my recent project where I improved model inference time by 40% using PyTorch. I want the tone to be enthusiastic and value-driven.",
      "Write a cold outreach email to John Doe, CEO of NextGen Startups. Pitch my freelance UI/UX design services. Mention that I noticed their current mobile app has onboarding friction, and I can help redesign it to increase conversion rates."
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setPrompt(random);
    setResult(null);
    setError('');
  };

  const selectedTone = toneOptions.find(t => t.value === tone) || toneOptions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20"
          >
            <Wand2 className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cold Email Generator</h1>
            <p className="text-sm text-muted-foreground">
              Describe what you need — we'll craft a polished cold email for you instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative p-6 lg:p-8">
          <form onSubmit={handleGenerate}>
            {/* Prompt Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-violet-500" />
                  <label className="text-sm font-semibold text-foreground">Your Prompt</label>
                </div>
                <button
                  type="button"
                  onClick={handleAutoSuggest}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-suggest
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); setResult(null); }}
                  placeholder="e.g. Write a cold email for MLDS role at Google, highlighting my experience in deep learning and MLOps..."
                  className="w-full px-4 py-4 bg-background border border-input rounded-xl text-sm min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground resize-y leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className={`text-[11px] font-medium ${prompt.trim().length >= 5 ? 'text-muted-foreground' : 'text-destructive/60'}`}>
                    {prompt.trim().length} chars
                  </span>
                </div>
              </div>
            </div>

            {/* Example Prompts */}
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleExampleClick(ex)}
                      className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted hover:border-violet-500/30 transition-all duration-200"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tone + Generate Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-5">
              {/* Tone Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToneOpen(!toneOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/60 border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  <span>{selectedTone.emoji}</span>
                  <span>{selectedTone.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${toneOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {toneOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setToneOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 z-50 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                      >
                        {toneOptions.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => { setTone(t.value); setToneOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-muted transition-colors text-left ${tone === t.value ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium' : ''}`}
                          >
                            <span>{t.emoji}</span>
                            <span>{t.label}</span>
                            {tone === t.value && <Check className="w-3.5 h-3.5 ml-auto text-violet-500" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Recipient Email Input */}
              <div className="flex-1 sm:ml-4">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Recipient Email (optional)"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors placeholder:text-muted-foreground"
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !canGenerate}
                className="sm:ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Cold Email
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm"
            >
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive font-medium text-xs mb-0.5">Generation failed</p>
                <p className="text-destructive/80 text-xs">{error}</p>
              </div>
              <button onClick={() => setError('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="print-area"
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Result toolbar */}
              <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-border bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
                <div className="flex items-center gap-2 mr-auto">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4 text-violet-500" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold">Your Cold Email</p>
                    <p className="text-[11px] text-muted-foreground">Generated & saved automatically</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 print-hide">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                    title="Print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={openInGmail}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-[#EA4335] hover:bg-[#D33426] transition-colors shadow-sm"
                    title="Open in Gmail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Open in Gmail
                  </button>
                </div>
              </div>

              {/* Email body */}
              <div className="px-5 py-5 bg-background">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Subject</p>
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-5">{result.subject}</p>

                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Message</p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-muted/20 border border-border rounded-lg p-4">
                  {result.body}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 gap-3 print-hide">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                Want a different style? Change the tone and try again.
              </p>
              <button
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-2 rounded-lg transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" />
                Generate again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">How it works:</span> Simply describe your email —
          mention the role, company, and any specifics. ColdForge uses the local{' '}
          <span className="font-medium text-foreground">Gemma model via Ollama</span> to craft a personalized,
          professional cold email. Choose a tone, hit generate, and your email is ready to send. It's automatically saved
          to your campaign history.
        </p>
      </div>
    </motion.div>
  );
}
