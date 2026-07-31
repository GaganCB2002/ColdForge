import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

function playToggleSound(toDark: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);

    const now = ctx.currentTime;

    // Soft "pop"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(toDark ? 420 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(toDark ? 720 : 820, now + 0.09);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 0.2);

    // Gentle "whoosh" shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(toDark ? 1400 : 1200, now + 0.05);
    shimmer.frequency.exponentialRampToValueAtTime(toDark ? 300 : 200, now + 0.4);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, now + 0.05);
    sg.gain.exponentialRampToValueAtTime(0.5, now + 0.12);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    shimmer.connect(sg).connect(master);
    shimmer.start(now + 0.05);
    shimmer.stop(now + 0.5);

    setTimeout(() => ctx.close(), 700);
  } catch {
    // Sound is optional — never block the toggle on audio failure.
  }
}

function ThemeModeBanner({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  return (
    <motion.div
      key="banner"
      initial={{ y: -120, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -140, opacity: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="fixed top-5 left-1/2 z-[200] -translate-x-1/2 pointer-events-none"
    >
      <div className={`relative overflow-hidden rounded-2xl border px-6 py-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3
        ${isDark ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'}`}>
        <motion.div
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1.15, 1] }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`flex items-center justify-center w-9 h-9 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-400/20 text-amber-500'}`}
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </motion.div>
        <div>
          <p className="text-sm font-semibold leading-tight">
            {isDark ? 'Dark mode enabled' : 'Bright mode enabled'}
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isDark ? 'Easier on the eyes in low light' : 'Crisp and clear in bright environments'}
          </p>
        </div>
        <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
      </div>
    </motion.div>
  );
}

export default function ThemeToggle({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [bannerVisible, setBannerVisible] = useState(false);
  const isDark = theme === 'dark';
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggle = useCallback(() => {
    playToggleSound(!isDark);
    toggleTheme();
    setBannerVisible(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setBannerVisible(false), 1800);
  }, [isDark, toggleTheme]);

  const trackClass = size === 'lg'
    ? 'w-[72px] h-[38px] p-[4px]'
    : 'w-[64px] h-[34px] p-[4px]';
  const knobClass = size === 'lg' ? 'w-[30px] h-[30px]' : 'w-[26px] h-[26px]';

  return (
    <>
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
        className={`relative shrink-0 rounded-full border transition-colors duration-300 cursor-pointer
          ${trackClass}
          ${isDark
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-r from-sky-200 to-amber-100 border-slate-300/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]'}`}
      >
        {/* Track icons */}
        <span className={`absolute left-[9px] top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
        </span>
        <span className={`absolute right-[9px] top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        </span>

        {/* Sliding knob */}
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`relative block rounded-full bg-white shadow-md flex items-center justify-center ${knobClass}`}
          style={{ marginLeft: isDark ? 'auto' : 0 }}
        >
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: easeOut }}
          >
            {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          </motion.span>
        </motion.span>
      </button>

      <AnimatePresence>{bannerVisible && <ThemeModeBanner theme={theme} />}</AnimatePresence>
    </>
  );
}
