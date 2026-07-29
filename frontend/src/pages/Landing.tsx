import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants, useInView, animate } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, ArrowRight, BookOpen, Cpu, Shield, Layers, Brain, GitBranch, Globe, Server, Zap, Sparkles, Users, MessageSquare, Briefcase } from 'lucide-react';
import Lenis from 'lenis';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const slideRevealLTR: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.2, ease: easeOut } },
};

const slideRevealRTL: Variants = {
  hidden: { clipPath: 'inset(0 0% 0 100%)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.2, ease: easeOut } },
};

const diagonalReveal: Variants = {
  hidden: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
  visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transition: { duration: 1.4, ease: easeOut } },
};

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

const staggerGrid: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

/* ─── Word-by-word reveal component ─── */

function RevealText({ text, delay = 0 }: { text: string; dir?: 'ltr' | 'rtl'; delay?: number }) {
  const wordReveal: Variants = {
    hidden: { y: '100%' },
    visible: { y: '0%', transition: { duration: 0.6, ease: easeOut } },
  };
  const words = text.split(' ');
  return (
    <span className="inline-flex flex-wrap">
      {words.map((word, i) => (
        <span key={i} className="relative inline-block mr-[0.3em] overflow-hidden">
          <motion.span
            variants={wordReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: delay + i * 0.06 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ─── Slice Reveal Block ─── */

function SliceBlock({ children, className = '', rtl = false }: { children: React.ReactNode; className?: string; rtl?: boolean }) {
  return (
    <motion.div
      variants={rtl ? slideRevealRTL : slideRevealLTR}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Diagonal Slash Reveal ─── */

function DiagonalReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={diagonalReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tech Stack ─── */

function TechStack() {
  const logos = [
    { name: 'React', icon: Cpu },
    { name: 'Python', icon: Server },
    { name: 'FastAPI', icon: Zap },
    { name: 'LangChain', icon: GitBranch },
    { name: 'FAISS', icon: Layers },
    { name: 'Ollama', icon: Brain },
    { name: 'Gemma', icon: Globe },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.3 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
    >
      {logos.map((l) => (
        <div key={l.name} className="flex items-center gap-2 text-muted-foreground">
          <l.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{l.name}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Animated Stats Counter ─── */

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;

    let target = 0;
    let formatFn: (v: number) => string = (v) => Math.round(v).toString();

    if (value.endsWith('K+')) {
      target = parseInt(value) * 1000;
      formatFn = (v) => Math.round(v / 1000) + 'K+';
    } else if (value.endsWith('x')) {
      target = Math.round(parseFloat(value) * 10);
      formatFn = (v) => (v / 10).toFixed(1) + 'x';
    } else if (value.startsWith('< ')) {
      target = parseInt(value.slice(2));
      formatFn = (v) => '< ' + Math.round(v);
    } else {
      target = parseInt(value);
    }

    if (!target) return;

    const controls = animate(0, target, {
      duration: 2,
      ease: easeOut,
      onUpdate: (v) => { if (el) el.textContent = formatFn(v); }
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="text-2xl lg:text-3xl font-bold"
    >
      {value}
    </motion.span>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useThemeStore();
  const [loaderPhase, setLoaderPhase] = useState<'loading' | 'revealing' | 'done'>('loading');

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    let animId: number;
    function raf(time: number) { lenis.raf(time); animId = requestAnimationFrame(raf); }
    animId = requestAnimationFrame(raf);
    const timer1 = setTimeout(() => setLoaderPhase('revealing'), 2000);
    const timer2 = setTimeout(() => setLoaderPhase('done'), 2900);
    return () => { cancelAnimationFrame(animId); lenis.destroy(); clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden">
      {/* ─── Curtain Slice Loader ─── */}
      {loaderPhase !== 'done' && (
        <div className="fixed inset-0 z-[100] flex pointer-events-none">
          <motion.div
            initial={{ x: '0%' }}
            animate={loaderPhase === 'revealing' ? { x: '-100%' } : { x: '0%' }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="w-1/2 h-full bg-background border-r border-border/10"
          />
          <motion.div
            initial={{ x: '0%' }}
            animate={loaderPhase === 'revealing' ? { x: '100%' } : { x: '0%' }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="w-1/2 h-full bg-background border-l border-border/10"
          />
          {loaderPhase === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground tracking-[0.2em] uppercase font-medium">Preparing experience</p>
            </div>
          )}
          {loaderPhase === 'revealing' && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
      {/* ─── Nav ─── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center justify-between h-16 border-b border-border/20 backdrop-blur-2xl bg-background/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-[10px] font-bold text-background tracking-tight">CF</span>
              </div>
              <span className="text-base font-semibold tracking-tight">ColdForge</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hidden sm:block">Sign in</Link>
              <Link to="/register" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_1px_8px_-3px_hsl(var(--primary)/0.35)]">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          </nav>
        </div>
      </motion.header>

      <main>
        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,hsl(var(--primary)/0.03),transparent_50%)] pointer-events-none" />

          {/* Floating gradient orbs */}
          <motion.div
            animate={{ y: [-30, 30, -30], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[12%] left-[8%] w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ y: [30, -30, 30], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ x: [-20, 20, -20], y: [10, -10, 10], opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[55%] left-[60%] w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none"
          />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.02),transparent_50%)] pointer-events-none" />

          {/* Floating particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [-(20 + i * 10), (20 + i * 10), -(20 + i * 10)],
                x: [-(10 + i * 5), (10 + i * 5), -(10 + i * 5)],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              className="absolute w-1 h-1 rounded-full bg-primary pointer-events-none"
              style={{ top: `${15 + i * 18}%`, left: `${10 + i * 20}%` }}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`p2-${i}`}
              animate={{
                y: [(15 + i * 8), -(15 + i * 8), (15 + i * 8)],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 7 + i * 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary pointer-events-none"
              style={{ top: `${25 + i * 15}%`, right: `${12 + i * 18}%` }}
            />
          ))}

          {/* Slicing background lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="absolute top-[30%] left-0 right-0 h-px bg-primary/10"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="absolute top-[60%] left-0 right-0 h-px bg-primary/10"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              style={{ originX: 0 }}
              className="absolute top-[45%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 w-full text-center relative z-10">
            {/* Badge — diagonal reveal */}
            <DiagonalReveal className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              v2.0 &mdash; Now with RAG pipeline
            </DiagonalReveal>

            {/* Heading — word-by-word reveal */}
            <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] font-bold tracking-tight leading-[1.08] mb-6">
              <RevealText text="AI cold emails" dir="ltr" delay={0.2} />
              <br />
              <span className="text-primary">
                <RevealText text="that read human." dir="ltr" delay={0.6} />
              </span>
            </h1>

            {/* Subtext — slice reveal left to right */}
            <SliceBlock>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
                Upload your knowledge base, describe your target, and let a local LLM
                compose hyper-personalized cold emails&mdash;no API costs, no data leaving your machine.
              </p>
            </SliceBlock>

            {/* CTA Buttons — fade slide up */}
            <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-[0_1px_12px_-3px_hsl(var(--primary)/0.4)] hover:shadow-[0_1px_20px_-3px_hsl(var(--primary)/0.5)]">
                Try it free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border/60 text-foreground font-medium hover:bg-muted transition-colors">
                Sign in
              </Link>
            </motion.div>

            <TechStack />
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40"
          >
            <span className="text-[11px] font-medium tracking-wide uppercase">Scroll</span>
            <motion.div
              animate={{ height: [32, 8, 32] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px bg-gradient-to-b from-muted-foreground/40 to-transparent"
            />
          </motion.div>
        </section>

        {/* ─── PROBLEM / SOLUTION ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
              <SliceBlock>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">The Problem</span>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3 mb-4">Generic templates waste your time.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Most cold outreach fails because it reads like a template. Recruiters and
                  hiring managers see hundreds of identical emails a day. Standing out requires
                  genuine research and personalisation&mdash;something that's hard to scale.
                </p>
              </SliceBlock>
              <SliceBlock rtl>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">The Solution</span>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3 mb-4">Your knowledge, their context, AI bridge.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload your company docs, case studies, and product sheets into a vector
                  knowledge base. When you target a company, the AI retrieves the most
                  relevant information and crafts an email that references real specifics&mdash;not
                  generic fluff.
                </p>
              </SliceBlock>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (RAG Pipeline) ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60 bg-muted/20">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Pipeline</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3">RAG-powered generation</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">Retrieval-Augmented Generation ensures every email is grounded in your actual content.</p>
            </motion.div>

            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-3 gap-4">
              {[
                { step: '01', title: 'Ingest', desc: 'Parse PDFs, DOCX, and TXT files. Chunk, embed (BAAI/bge-small-en-v1.5), and index into a FAISS vector store.' },
                { step: '02', title: 'Retrieve', desc: 'Given a target company and pain points, semantically search the index for the most relevant knowledge snippets.' },
                { step: '03', title: 'Generate', desc: 'Feed snippets + recipient context into Gemma (via Ollama). Output: a personalised cold email, no API call needed.' },
              ].map((s) => (
                <motion.div key={s.step} variants={scaleIn} className="relative p-6 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-sm hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <span className="text-3xl font-bold text-primary/15 absolute top-4 right-4 select-none group-hover:text-primary/20 transition-colors duration-300">{s.step}</span>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <span className="text-sm font-bold text-primary">{s.step}</span>
                  </div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60">
          <div className="max-w-6xl mx-auto">
            <SliceBlock className="text-center mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Capabilities</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3">Everything included</h2>
            </SliceBlock>

            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, title: 'Vector Knowledge Base', desc: 'Upload unlimited PDFs, DOCX, and TXT. Automatic chunking, embedding, and FAISS indexing.' },
                { icon: Cpu, title: 'Local LLM (Ollama)', desc: 'Gemma model runs entirely on your machine. Zero API costs, complete privacy.' },
                { icon: Shield, title: 'Private by Design', desc: 'No data ever leaves your environment. JWT auth + role-based access built in.' },
                { icon: Layers, title: 'Semantic Search', desc: 'BGE-small-en-v1.5 embeddings power fast, accurate retrieval from your knowledge base.' },
                { icon: GitBranch, title: 'LangChain Pipeline', desc: 'Production-grade RAG chain: retrieve, augment, generate. Full control over prompts.' },
                { icon: Globe, title: 'Hyper-Personalisation', desc: 'Recipient name, company, pain points, and industry all woven into a unique draft.' },
              ].map((f) => (
                <motion.div key={f.title} variants={scaleIn} className="relative p-5 rounded-xl border border-border/80 bg-card hover:border-border hover:shadow-sm hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5 group-hover:text-foreground transition-colors">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <SliceBlock className="text-center mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Use Cases</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3">Built for job seekers, agencies, and teams</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">From solo applicants to recruitment agencies — ColdForge adapts to your workflow.</p>
            </SliceBlock>

            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Briefcase, title: 'Job Seekers', desc: `Apply to dozens of positions with personalised emails that reference each company's unique requirements.` },
                { icon: Users, title: 'Recruitment Agencies', desc: 'Scale outreach across multiple clients while maintaining quality and personalisation.' },
                { icon: MessageSquare, title: 'Sales Teams', desc: 'Generate cold outreach for B2B prospecting with deep company research baked in.' },
                { icon: Sparkles, title: 'Freelancers', desc: `Pitch your services with context-aware proposals that show you've done your homework.` },
              ].map((uc) => (
                <motion.div key={uc.title} variants={fadeSlideUp} className="p-5 rounded-xl border border-border/80 bg-card hover:border-border hover:-translate-y-0.5 hover:shadow-sm hover:shadow-foreground/5 transition-all duration-300 group">
                  <uc.icon className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-sm font-semibold mb-1.5">{uc.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{uc.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── ARCHITECTURE ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60">
          <div className="max-w-6xl mx-auto">
            <SliceBlock className="text-center mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Architecture</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3">Built on modern stack</h2>
            </SliceBlock>

            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Frontend', stack: 'React 19 \u00B7 TypeScript \u00B7 Tailwind \u00B7 Vite', icon: Cpu },
                { label: 'Backend', stack: 'FastAPI \u00B7 SQLAlchemy \u00B7 SQLite / PostgreSQL', icon: Server },
                { label: 'AI / RAG', stack: 'LangChain \u00B7 FAISS \u00B7 BGE Embeddings \u00B7 Ollama \u00B7 Gemma', icon: Brain },
                { label: 'Auth', stack: 'JWT \u00B7 OAuth2 \u00B7 Password Flow \u00B7 Role-based Access', icon: Shield },
              ].map((a) => (
                <motion.div key={a.label} variants={scaleIn} className="p-5 rounded-xl border border-border/80 bg-card hover:border-border hover:-translate-y-0.5 hover:shadow-sm hover:shadow-foreground/5 transition-all duration-300 group">
                  <a.icon className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-sm font-semibold mb-1">{a.label}</h3>
                  <p className="text-xs text-muted-foreground">{a.stack}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── WORKFLOW ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <SliceBlock className="text-center mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Workflow</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3">From zero to sent in five steps</h2>
            </SliceBlock>

            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-0">
              {[
                { num: '1', title: 'Create a project', desc: 'Each outreach campaign gets its own workspace with isolated knowledge base and history.' },
                { num: '2', title: 'Upload knowledge', desc: 'Drop company profiles, case studies, product docs, or any reference material.' },
                { num: '3', title: 'Vector indexing', desc: 'Documents are chunked, embedded, and stored in a FAISS index for instant retrieval.' },
                { num: '4', title: 'Define target', desc: 'Enter the recipient name, company, industry, role, pain points, and desired tone.' },
                { num: '5', title: 'Generate & send', desc: 'AI drafts the email. Review, tweak, copy, and send. Track responses over time.' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeSlideUp} className="relative pl-10 pb-10 last:pb-0">
                  {i < 4 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: easeOut, delay: 0.3 + i * 0.15 }}
                      className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 to-border origin-top"
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.15, borderColor: 'hsl(var(--primary))' }}
                    className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full border-2 border-border bg-card flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground">{s.num}</span>
                  </motion.div>
                  <div className="pt-0.5">
                    <h3 className="text-sm font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-lg">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '10K+', label: 'Emails generated' },
                { value: '5K+', label: 'Active users' },
                { value: '3.5x', label: 'Avg. response lift' },
                { value: '< 2s', label: 'Generation time' },
              ].map((s) => (
                <motion.div key={s.label} variants={scaleIn} className="text-center p-6 rounded-xl border border-border/80 bg-card">
                  <AnimatedCounter value={s.value} />
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURED IN / TESTIMONIAL ─── */}
        <section className="py-24 lg:py-32 px-6 border-t border-border/60 bg-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <DiagonalReveal>
              <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border border-border/80 bg-card p-8 lg:p-12 transition-colors hover:border-border">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MessageSquare className="w-8 h-8 text-primary/30 mx-auto mb-6" />
                </motion.div>
                <blockquote className="text-lg lg:text-xl font-medium leading-relaxed mb-6">
                  &ldquo;I was spending hours tailoring each application. ColdForge cut that down to
                  minutes&mdash;and the response rate actually went up.&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">SK</div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Sarah Kim</p>
                    <p className="text-xs text-muted-foreground">Product Manager at Stripe</p>
                  </div>
                </div>
              </motion.div>
            </DiagonalReveal>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative py-24 lg:py-32 px-6 border-t border-border/60 overflow-hidden">
          {/* Background particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`cta-p-${i}`}
              animate={{ y: [-15, 15, -15], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
              className="absolute w-2 h-2 rounded-full bg-primary pointer-events-none"
              style={{ top: `${30 + i * 25}%`, left: `${15 + i * 30}%` }}
            />
          ))}
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <SliceBlock>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Get Started</span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mt-3 mb-4">Ready to send emails that get replies?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                No credit card. No API keys. Everything runs locally on your machine.
              </p>
            </SliceBlock>
            <motion.div variants={fadeSlideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-[0_1px_12px_-3px_hsl(var(--primary)/0.4)] hover:shadow-[0_1px_20px_-3px_hsl(var(--primary)/0.5)]">
                  Start building <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <motion.footer variants={staggerGrid} initial="hidden" whileInView="visible" viewport={{ once: true }} className="py-12 px-6 border-t border-border/60 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-border mb-8">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center">
                <span className="text-[9px] font-bold text-background tracking-tight">CF</span>
              </div>
              <span className="text-sm font-semibold">ColdForge</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link to="/login" className="text-xs hover:text-foreground transition-colors">Sign in</Link>
              <Link to="/register" className="text-xs hover:text-foreground transition-colors">Register</Link>
              <a href="#" className="text-xs hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-xs hover:text-foreground transition-colors">Terms</a>
            </div>
          </motion.div>
          <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; 2026 ColdForge. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built with React, FastAPI, LangChain &amp; Ollama.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
