import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { FileText, Upload, Send, Loader2, Sparkles, Check, Copy, Mail, AlertCircle, Edit2, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Generation State
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [tone, setTone] = useState('Professional');
  const [activeTab, setActiveTab] = useState<'email' | 'resume'>('email');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [emails, setEmails] = useState<any[]>([]);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
  const [editEmailName, setEditEmailName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, docRes, emailRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/documents/project/${id}`),
        api.get(`/api/emails/project/${id}`)
      ]);
      setProject(projRes.data);
      setDocuments(docRes.data);
      setEmails(emailRes.data);
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id as string);
    formData.append('doc_type', 'knowledge_base');

    try {
      await api.post('/api/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess('Document successfully indexed to knowledge base!');
      setFile(null);
      fetchProjectData();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      alert("Please upload at least one knowledge document first so the AI has context.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/api/emails/generate', {
        project_id: parseInt(id as string),
        recipient_name: recipientName,
        company_name: companyName,
        industry,
        job_description: jobDescription,
        pain_points: painPoints,
        tone
      });
      setGeneratedEmail(res.data);
      setActiveTab('email');
      fetchProjectData();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await api.delete(`/api/documents/${docId}`);
      fetchProjectData();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to delete document');
    }
  };

  const handleUpdateDocument = async (docId: number) => {
    if (!editDocName.trim()) return;
    try {
      await api.put(`/api/documents/${docId}`, { filename: editDocName });
      fetchProjectData();
      setEditingDocId(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to update document name');
    }
  };

  const handleDeleteEmail = async (emailId: number) => {
    if (!window.confirm("Are you sure you want to delete this email?")) return;
    try {
      await api.delete(`/api/emails/${emailId}`);
      fetchProjectData();
      if (generatedEmail?.id === emailId) setGeneratedEmail(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to delete email');
    }
  };

  const handleUpdateEmail = async (emailId: number) => {
    if (!editEmailName.trim()) return;
    try {
      await api.put(`/api/emails/${emailId}`, { subject: editEmailName });
      fetchProjectData();
      setEditingEmailId(null);
      if (generatedEmail?.id === emailId) {
        setGeneratedEmail({ ...generatedEmail, subject: editEmailName });
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Failed to update email subject');
    }
  };

  const copyToClipboard = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <p className="text-lg font-semibold text-foreground mb-1">Failed to load project</p>
        <p className="text-sm text-muted-foreground mb-6">{errorMessage || 'Project not found or access denied'}</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <section aria-labelledby="project-title" className="max-w-6xl mx-auto space-y-6 font-sans">
      <div className="border-b border-border pb-6 mb-6">
        <h1 id="project-title" className="text-3xl font-bold tracking-tight text-foreground mb-2">{project?.name}</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-destructive/60 hover:text-destructive">&times;</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Knowledge Base */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Knowledge Base
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Upload PDFs, DOCX, or TXT files to give the AI context about your company and offering.</p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-muted/10">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.txt,.csv"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-70" />
                  <span className="text-sm text-primary hover:text-primary/80 font-medium">Click to select file</span>
                </label>
                {file && <p className="mt-2 text-sm text-foreground font-medium">{file.name}</p>}
              </div>

              {uploadSuccess && <p className="text-primary text-sm flex items-center font-medium"><Check className="w-4 h-4 mr-1" /> {uploadSuccess}</p>}

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 rounded-md disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : <Upload className="w-4 h-4 mr-2" aria-hidden="true" />}
                {isUploading ? 'Indexing...' : 'Upload & Index'}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Indexed Documents</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground/70 italic">No documents uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc: any) => (
                    <li key={doc.id} className="flex flex-col text-sm text-foreground bg-muted/30 p-2.5 rounded-md border border-border shadow-sm group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center overflow-hidden mr-2 flex-1">
                          <FileText className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                          {editingDocId === doc.id ? (
                            <input
                              type="text"
                              className="flex-1 px-2 py-1 text-sm bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              value={editDocName}
                              onChange={(e) => setEditDocName(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateDocument(doc.id); if (e.key === 'Escape') setEditingDocId(null); }}
                            />
                          ) : (
                            <span className="truncate font-medium text-foreground" title={doc.filename}>{doc.filename}</span>
                          )}
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingDocId === doc.id ? (
                              <>
                                <button onClick={() => handleUpdateDocument(doc.id)} className="p-1 text-primary hover:bg-primary/10 rounded mr-1"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingDocId(null)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingDocId(doc.id); setEditDocName(doc.filename); }} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 mr-1"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Generated Emails History</h3>
              {emails.length === 0 ? (
                <p className="text-sm text-muted-foreground/70 italic">No emails generated yet.</p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {emails.map((email: any) => (
                    <li key={email.id} className={`flex flex-col text-sm bg-muted/30 p-2.5 rounded-md border border-border shadow-sm group ${generatedEmail?.id === email.id ? 'ring-2 ring-primary border-transparent' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center overflow-hidden mr-2 flex-1 cursor-pointer" onClick={() => setGeneratedEmail(email)}>
                          <Mail className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                          {editingEmailId === email.id ? (
                            <input
                              type="text"
                              className="flex-1 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                              value={editEmailName}
                              onChange={(e) => setEditEmailName(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateEmail(email.id); if (e.key === 'Escape') setEditingEmailId(null); }}
                            />
                          ) : (
                            <span className="truncate font-medium text-foreground hover:text-primary transition-colors" title={email.subject || 'No Subject'}>{email.subject || 'No Subject'}</span>
                          )}
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingEmailId === email.id ? (
                            <>
                              <button onClick={() => handleUpdateEmail(email.id)} className="p-1 text-primary hover:bg-primary/10 rounded mr-1"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingEmailId(null)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setEditingEmailId(email.id); setEditEmailName(email.subject || 'No Subject'); }} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 mr-1"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEmail(email.id); }} className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Generation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Generate Cold Email
            </h2>

            {documents.length === 0 && (
              <div role="alert" className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex shadow-sm">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You haven't uploaded any knowledge documents yet. The AI needs context to generate highly personalized emails. Please upload a document first.
                </p>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-foreground mb-1">Recipient Name</label>
                  <input
                    id="recipientName"
                    type="text" required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors shadow-sm"
                    value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1">Target Company</label>
                  <input
                    id="companyName"
                    type="text" required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors shadow-sm"
                    value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1">Industry</label>
                  <input
                    id="industry"
                    type="text" required
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors shadow-sm"
                    value={industry} onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-foreground mb-1">Tone</label>
                  <select
                    id="tone"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors shadow-sm"
                    value={tone} onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly & Approachable</option>
                    <option value="Direct">Direct & Concise</option>
                    <option value="Persuasive">Persuasive & Sales-oriented</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-foreground mb-1">Job Description</label>
                <textarea
                  id="jobDescription"
                  required
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent h-24 resize-none transition-colors shadow-sm placeholder:text-muted-foreground"
                  placeholder="Paste the full job description here..."
                  value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="painPoints" className="block text-sm font-medium text-foreground mb-1">Target Pain Points</label>
                <textarea
                  id="painPoints"
                  required
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:border-transparent h-24 resize-none transition-colors shadow-sm placeholder:text-muted-foreground"
                  placeholder="What problems does this company have that you can solve?"
                  value={painPoints} onChange={(e) => setPainPoints(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || documents.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-md flex items-center justify-center transition-all disabled:opacity-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" /> : <Send className="w-5 h-5 mr-2" aria-hidden="true" />}
                {isGenerating ? 'AI is composing...' : 'Generate Email'}
              </button>
            </form>
          </div>

          {/* Generated Result */}
          {generatedEmail && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="flex border-b border-border bg-muted/30">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'email' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  Cold Email
                </button>
                {generatedEmail.generated_resume && (
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'resume' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    ATS Resume
                  </button>
                )}
              </div>

              {activeTab === 'email' ? (
                <>
                  <div className="bg-background px-6 py-4 border-b border-border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Subject</p>
                      <p className="text-foreground font-medium">{generatedEmail.subject}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <a
                        href={`mailto:?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        aria-label="Send Email"
                        title="Send via Email Client"
                      >
                        <Mail className="w-5 h-5" aria-hidden="true" />
                      </a>
                      <button 
                        onClick={copyToClipboard}
                        className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        aria-label="Copy to clipboard"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-5 h-5 text-accent" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-background">
                    <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
                      {generatedEmail.body}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-background">
                  <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    {generatedEmail.generated_resume}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
