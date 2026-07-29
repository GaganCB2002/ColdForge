import { useEffect, useState } from 'react';
import {
  FileText, Plus, Building2, Target, Download, Trash2,
  RefreshCw, Sparkles, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, Lightbulb, Award, Loader2, Eye, BarChart3, FileSpreadsheet, Copy, Check
} from 'lucide-react';
import api from '../lib/api';
import { resumeTemplates, ResumeTemplate } from '../data/resumeTemplates';

interface Resume {
  id: number;
  company_name: string;
  job_title: string | null;
  job_description: string | null;
  resume_content: string;
  ats_score: number | null;
  missing_skills: string | null;
  match_percentage: number | null;
  project_id: number | null;
  created_at: string;
}

interface ATSResult {
  ats_score: number;
  missing_skills: string[];
  match_percentage: number;
  recommendations: string[];
  strengths: string[];
}

interface GroupedResumes {
  [company: string]: Resume[];
}

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [genForm, setGenForm] = useState({ company_name: '', job_title: '', job_description: '' });

  const [activeTab, setActiveTab] = useState<'my-resumes' | 'templates'>('my-resumes');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTemplate = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/resumes/');
      setResumes(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const grouped: GroupedResumes = {};
  resumes.forEach((r) => {
    if (!grouped[r.company_name]) grouped[r.company_name] = [];
    grouped[r.company_name].push(r);
  });

  const handleGenerate = async () => {
    if (!genForm.company_name || !genForm.job_description) return;
    try {
      setGenerating(true);
      await api.post('/api/resumes/generate', genForm);
      setShowGenerate(false);
      setGenForm({ company_name: '', job_title: '', job_description: '' });
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/resumes/${id}`);
      if (selectedResume?.id === id) setSelectedResume(null);
      await fetchResumes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete resume');
    }
  };

  const handleATSAnalysis = async (resume: Resume) => {
    if (!resume.job_description) return;
    try {
      setAtsLoading(true);
      setSelectedResume(resume);
      const res = await api.post(`/api/resumes/${resume.id}/ats-score`);
      setAtsResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'ATS analysis failed');
    } finally {
      setAtsLoading(false);
    }
  };

  const handleViewDetails = (resume: Resume) => {
    setSelectedResume(resume);
    setAtsResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, manage, and ATS-optimize resumes for each company.
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Generate Resume
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-destructive/70 hover:text-destructive">&times;</button>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowGenerate(false)}>
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generate New Resume</h2>
              <button onClick={() => setShowGenerate(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={genForm.company_name}
                  onChange={(e) => setGenForm({ ...genForm, company_name: e.target.value })}
                  placeholder="e.g. Google, Microsoft"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={genForm.job_title}
                  onChange={(e) => setGenForm({ ...genForm, job_title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea
                  value={genForm.job_description}
                  onChange={(e) => setGenForm({ ...genForm, job_description: e.target.value })}
                  placeholder="Paste the full job description here..."
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !genForm.company_name || !genForm.job_description}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate AI Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('my-resumes')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my-resumes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          My Resumes
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          ATS Templates
        </button>
      </div>

      {activeTab === 'templates' ? (
        <div className="flex gap-6">
          {/* Templates List */}
          <div className="flex-1 min-w-0 grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-max">
            {resumeTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`rounded-xl border border-border bg-card p-5 cursor-pointer transition-colors ${selectedTemplate?.id === t.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{t.role}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-medium bg-success/10 text-success px-2 py-0.5 rounded">ATS Optimized</span>
                </div>
              </div>
            ))}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="w-[480px] shrink-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-6">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{selectedTemplate.role} Template</h3>
                  <button onClick={() => setSelectedTemplate(null)} className="text-muted-foreground hover:text-foreground">&times;</button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => handleCopyTemplate(selectedTemplate.id, selectedTemplate.content)}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      {copiedId === selectedTemplate.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === selectedTemplate.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedTemplate.content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedTemplate.role.replace(/\s+/g, '_')}_Template.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download .md
                    </button>
                  </div>
                  <div className="rounded-lg bg-muted/20 border border-border p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedTemplate.content}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="flex gap-6">
        {/* Resume List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No resumes yet. Generate one for a company to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([company, companyResumes]) => (
                <div key={company} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{company}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{companyResumes.length}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {companyResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer ${selectedResume?.id === resume.id ? 'bg-primary/5' : ''}`}
                        onClick={() => handleViewDetails(resume)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{resume.job_title || 'Untitled Role'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(resume.created_at).toLocaleDateString()}
                            {resume.ats_score !== null && (
                              <span className={`ml-2 font-medium ${getScoreColor(resume.ats_score)}`}>
                                ATS: {resume.ats_score}%
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {resume.job_description && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleATSAnalysis(resume); }}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Run ATS Analysis"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedResume && (
          <div className="w-[420px] shrink-0">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-6">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Resume Details</h3>
                <button onClick={() => { setSelectedResume(null); setAtsResult(null); }} className="text-muted-foreground hover:text-foreground">&times;</button>
              </div>

              <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Company</p>
                  <p className="text-sm font-medium mt-0.5">{selectedResume.company_name}</p>
                </div>
                {selectedResume.job_title && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Job Title</p>
                    <p className="text-sm font-medium mt-0.5">{selectedResume.job_title}</p>
                  </div>
                )}

                {/* ATS Analysis */}
                {atsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : atsResult ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ATS Score</span>
                        <Award className={`w-4 h-4 ${getScoreColor(atsResult.ats_score)}`} />
                      </div>
                      <div className="flex items-end gap-3">
                        <span className={`text-3xl font-bold ${getScoreColor(atsResult.ats_score)}`}>
                          {Math.round(atsResult.ats_score)}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                      </div>
                      <div className="mt-3 w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${atsResult.ats_score >= 80 ? 'bg-success' : atsResult.ats_score >= 60 ? 'bg-warning' : 'bg-destructive'}`}
                          style={{ width: `${atsResult.ats_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Match Percentage</span>
                      </div>
                      <p className={`text-2xl font-bold ${getScoreColor(atsResult.match_percentage)}`}>
                        {Math.round(atsResult.match_percentage)}%
                      </p>
                    </div>

                    {atsResult.strengths.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strengths</span>
                        </div>
                        <div className="space-y-1">
                          {atsResult.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-success mt-0.5">&#x2022;</span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsResult.missing_skills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Missing Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.missing_skills.map((skill, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warning/10 text-warning text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsResult.recommendations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</span>
                        </div>
                        <div className="space-y-1">
                          {atsResult.recommendations.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">&#x2022;</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click the chart icon to run ATS analysis</p>
                  </div>
                )}

                {/* Resume Content Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume Content</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedResume.resume_content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedResume.company_name}_${selectedResume.job_title || 'Resume'}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                  <div className="rounded-lg bg-muted/20 border border-border p-3 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedResume.resume_content}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
