import { Upload, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';

const docs = [
  { name: 'Company Profile.pdf', type: 'PDF', size: '2.4 MB', date: '2024-03-15', status: 'Indexed' },
  { name: 'Product Overview.docx', type: 'DOCX', size: '1.8 MB', date: '2024-03-14', status: 'Indexed' },
  { name: 'Case Studies.pdf', type: 'PDF', size: '3.1 MB', date: '2024-03-12', status: 'Indexed' },
];

export default function KnowledgeBase() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload documents to power AI email generation.</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center mb-8 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, TXT (max 10MB)</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-semibold">Indexed Documents ({docs.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {docs.map((doc) => (
            <div key={doc.name} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.size} &middot; {doc.date}</p>
              </div>
              <span className="text-xs text-success font-medium">{doc.status}</span>
              <button className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
