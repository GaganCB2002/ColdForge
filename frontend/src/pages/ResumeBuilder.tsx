import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import {
  FileText, UploadCloud, Loader2, Check, CheckCircle2, ChevronRight,
  Briefcase, GraduationCap, MapPin, Mail, User as UserIcon, Sparkles, Printer, Copy
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ResumeBuilder() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Step 1: Raw Resume
  const [rawResume, setRawResume] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Step 2: Parsed Info
  const [parsedInfo, setParsedInfo] = useState({
    name: '',
    contact: '',
    location: '',
    education: '',
    skills: [] as string[],
  });
  const [skillsText, setSkillsText] = useState('');

  // Step 3: Job Description
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Step 4: Final ATS Resume
  const [atsResume, setAtsResume] = useState('');
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleParse = async () => {
    if (!rawResume.trim()) return;
    setIsParsing(true);
    setParseError('');
    try {
      const res = await api.post('/api/resumes/parse', { resume_text: rawResume });
      setParsedInfo(res.data);
      setSkillsText(res.data.skills.join(', '));
      setStep(2);
    } catch (err: any) {
      setParseError(err.response?.data?.detail || 'Failed to parse resume.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setParseError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/resumes/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRawResume(res.data.text);
      // Wait for state to update, then parse
      setTimeout(() => {
         // Auto-parse after extraction
         const button = document.getElementById('parse-btn');
         if (button) button.click();
      }, 100);
    } catch (err: any) {
      setParseError(err.response?.data?.detail || 'Failed to extract text from file.');
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    setGenerateError('');
    try {
      const infoToGenerate = {
        ...parsedInfo,
        skills: skillsText.split(',').map(s => s.trim()).filter(s => s)
      };
      const res = await api.post('/api/resumes/build', {
        parsed_info: JSON.stringify(infoToGenerate),
        job_description: jobDescription
      });
      setAtsResume(res.data.resume_markdown);
      setStep(4);
    } catch (err: any) {
      setGenerateError(err.response?.data?.detail || 'Failed to generate ATS resume.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(atsResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resumeRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    if (!resumeRef.current) return;
    const opt = {
      margin: 10,
      filename: `${parsedInfo.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().from(resumeRef.current).set(opt).save();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <FileText className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Resume Builder</h1>
            <p className="text-sm text-muted-foreground">
              Extract details from your existing resume, tailor it to a JD, and get a 100% ATS-optimized resume.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3, 4].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${step >= s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {i < 3 && (
              <div className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-emerald-500' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl" />
        
        <div className="relative p-6 lg:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD/PASTE RESUME */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UploadCloud className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold">Step 1: Paste or Upload your current resume</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Upload your PDF/DOCX or paste the text of your current resume. Our AI will extract your contact info, education, and skills.</p>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-500/30 rounded-xl cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                        ) : (
                          <UploadCloud className="w-8 h-8 text-emerald-500 mb-2" />
                        )}
                        <p className="mb-2 text-sm text-emerald-600 font-semibold">{isUploading ? 'Extracting text...' : 'Click to upload PDF or DOCX'}</p>
                      </div>
                      <input id="dropzone-file" type="file" accept=".pdf,.doc,.docx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading || isParsing} />
                    </label>
                  </div>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-semibold text-muted-foreground uppercase">Or paste text</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <textarea
                    value={rawResume}
                    onChange={(e) => setRawResume(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                  />
                </div>
                
                {parseError && <p className="text-sm text-destructive mt-2">{parseError}</p>}
                
                <div className="flex justify-end mt-4">
                  <button
                    id="parse-btn"
                    onClick={handleParse}
                    disabled={isParsing || isUploading || !rawResume.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {isParsing ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : 'Extract Details'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: REVIEW PARSED INFO */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold">Step 2: Review Extracted Details</h3>
                </div>
                <p className="text-sm text-muted-foreground">We found the following information. You can edit it before we generate your tailored resume.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5"/> Full Name</label>
                    <input type="text" value={parsedInfo.name} onChange={e => setParsedInfo({...parsedInfo, name: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Contact</label>
                    <input type="text" value={parsedInfo.contact} onChange={e => setParsedInfo({...parsedInfo, contact: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Location</label>
                    <input type="text" value={parsedInfo.location} onChange={e => setParsedInfo({...parsedInfo, location: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5"/> Education</label>
                    <input type="text" value={parsedInfo.education} onChange={e => setParsedInfo({...parsedInfo, education: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> Skills (comma separated)</label>
                    <textarea value={skillsText} onChange={e => setSkillsText(e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm h-24" />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: JOB DESCRIPTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold">Step 3: Paste the Job Description</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Paste the JD for the role you're applying to. The AI will weave its keywords directly into your experience.</p>
                
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste Job Description here..."
                  className="w-full px-4 py-4 bg-background border border-input rounded-xl text-sm min-h-[250px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
                />
                
                {generateError && <p className="text-sm text-destructive mt-2">{generateError}</p>}
                
                <div className="flex justify-between mt-4">
                  <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Back</button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobDescription.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating ATS Resume...</> : <><Sparkles className="w-4 h-4" /> Generate Resume</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINAL RESUME */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 print-area"
              >
                <div className="flex items-center justify-between border-b border-border pb-4 print-hide">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-lg font-bold">100% ATS Optimized Resume</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyToClipboard} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5" />} Copy
                    </button>
                    <button onClick={downloadPDF} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background hover:bg-foreground/90">
                      <Printer className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none bg-background p-6 lg:p-10 border border-border rounded-xl shadow-sm" ref={resumeRef}>
                  <ReactMarkdown>{atsResume}</ReactMarkdown>
                </div>

                <div className="flex justify-center mt-6 print-hide">
                  <button onClick={() => setStep(1)} className="text-sm font-medium text-emerald-500 hover:text-emerald-600">
                    Build Another Resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
