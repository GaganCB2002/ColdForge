import { Upload, FileText, Trash2, Loader2, Database, FolderOpen, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

interface Doc {
  id: number;
  filename: string;
  doc_type?: string;
  project_id: number;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

function extOf(name: string) {
  const ext = name.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
}

export default function KnowledgeBase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.get('/api/projects/');
      setProjects(res.data);
      if (res.data.length > 0) {
        setProjectId((prev) => {
          const pid = prev ?? res.data[0].id;
          return pid;
        });
      }
    } catch {
      setError('Failed to load projects.');
    }
  }, []);

  const loadDocs = useCallback(async (pid: number) => {
    try {
      const res = await api.get(`/api/documents/project/${pid}`);
      setDocs(res.data);
    } catch {
      setDocs([]);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projectId !== null) loadDocs(projectId);
  }, [projectId, loadDocs]);

  const handleProjectChange = (pid: number) => {
    setProjectId(pid);
    loadDocs(pid);
  };

  const uploadFile = async (file: File) => {
    if (!projectId) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const form = new FormData();
      form.append('project_id', String(projectId));
      form.append('doc_type', 'generic');
      form.append('file', file);
      await api.post('/api/documents/', form);
      setSuccess(`"${file.name}" uploaded & indexed into the vector database.`);
      setTimeout(() => setSuccess(''), 4000);
      loadDocs(projectId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Make sure the backend is running.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const deleteDoc = async (doc: Doc) => {
    setDeletingId(doc.id);
    setError('');
    try {
      await api.delete(`/api/documents/${doc.id}`);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload documents to power AI email generation via RAG.</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
        >
          {error}
          <button onClick={() => setError('')} className="ml-2 float-right text-destructive/60 hover:text-destructive">&times;</button>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="px-4 py-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </motion.div>
      )}

      {/* Project selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Target Project</p>
            <p className="text-xs text-muted-foreground">Documents are indexed per project</p>
          </div>
        </div>
        {projects.length > 0 ? (
          <select
            value={projectId ?? ''}
            onChange={(e) => handleProjectChange(Number(e.target.value))}
            className="sm:ml-auto px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        ) : (
          <p className="sm:ml-auto text-xs text-muted-foreground">
            No projects yet. <a href="/campaign/new" className="text-primary font-medium">Create one</a> to upload documents.
          </p>
        )}
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut, delay: 0.1 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          }}
        />
        <button
          disabled={!projectId || uploading}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`w-full border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 disabled:opacity-50 ${
            dragOver ? 'border-primary bg-primary/5 scale-[1.005]' : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <motion.div
            animate={uploading ? { scale: [1, 1.1, 1] } : { y: [0, -6, 0] }}
            transition={uploading ? { duration: 0.6, repeat: Infinity } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            {uploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-primary" />}
          </motion.div>
          <p className="text-sm font-semibold">
            {uploading ? 'Indexing into the vector database...' : dragOver ? 'Drop files here to index' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT (max 5 MB) &middot; auto-chunked &amp; embedded with BGE + FAISS</p>
        </button>
      </motion.div>

      {/* Documents list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Indexed Documents ({docs.length})</h3>
          </div>
          {projectId && (
            <button onClick={() => loadDocs(projectId)} className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">
              Refresh
            </button>
          )}
        </div>

        {docs.length > 0 ? (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {docs.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">{extOf(doc.filename)} &middot; {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <span className="text-xs text-success font-medium shrink-0">Indexed</span>
                  <button
                    onClick={() => deleteDoc(doc)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
                    aria-label="Delete document"
                  >
                    {deletingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No documents indexed yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your company docs, resume, or case studies to power RAG.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
