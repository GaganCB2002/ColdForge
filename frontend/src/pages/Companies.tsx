import { motion, type Variants } from 'framer-motion';
import { Building2, Plus, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const companies = [
  { name: 'Google', industry: 'Technology', status: 'Active', emails: 12 },
  { name: 'Microsoft', industry: 'Technology', status: 'Active', emails: 8 },
  { name: 'Amazon', industry: 'E-commerce', status: 'Pending', emails: 5 },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

export default function Companies() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
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

      <motion.div
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {companies.map((c) => (
          <motion.div key={c.name} variants={cardVariants} className="group relative rounded-xl border border-border bg-card p-5 card-hover overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">{c.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{c.industry}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                {c.emails} emails
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{c.status}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
