import { useRef, useEffect } from 'react';
import { motion, animate, type Variants, useInView } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Briefcase, Mail, Target } from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stats = [
  { label: 'Applications', value: '24', change: '+12%', icon: Briefcase, color: 'text-primary' },
  { label: 'Interviews', value: '8', change: '+5%', icon: Users, color: 'text-success' },
  { label: 'Offers', value: '3', change: '+2%', icon: Target, color: 'text-primary' },
  { label: 'Rejections', value: '7', change: '-3%', icon: BarChart3, color: 'text-destructive' },
  { label: 'Response Rate', value: '45%', change: '+8%', icon: TrendingUp, color: 'text-success' },
  { label: 'Emails Sent', value: '156', change: '+23%', icon: Mail, color: 'text-primary' },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;

    const isPercent = value.endsWith('%');
    const target = parseInt(value);
    if (!target) return;

    const controls = animate(0, target, {
      duration: 1.4,
      ease: easeOut,
      onUpdate: (v) => { if (el) el.textContent = Math.round(v).toString() + (isPercent ? '%' : ''); },
    });
    return controls.stop;
  }, [inView, value]);

  return <span ref={ref}>{value}</span>;
}

export default function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your application performance and metrics.</p>
      </div>

      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={cardVariants} className="rounded-xl border border-border bg-card p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className={`text-xs font-medium ${s.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{s.change}</span>
            </div>
            <p className="text-2xl font-bold"><StatValue value={s.value} /></p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
