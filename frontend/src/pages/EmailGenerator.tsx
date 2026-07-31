import { motion } from 'framer-motion';
import ColdEmailGenerator from '../components/ColdEmailGenerator';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function EmailGenerator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Email Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a Job Description and get a crisp, personalized cold email — powered by Gemma running locally on your machine.
        </p>
      </div>

      <ColdEmailGenerator />

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">How it works:</span> Upload or paste a Job Description (JD).
          ColdForge extracts the role, key skills, and requirements, then uses the local <span className="font-medium text-foreground">Gemma model via Ollama</span> to write a crisp cold email.
          Click the Gmail icon to open a pre-filled compose window, or copy the email to your clipboard.
        </p>
      </div>
    </motion.div>
  );
}
