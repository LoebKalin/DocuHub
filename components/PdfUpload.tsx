
import React, { useState, useRef, useMemo } from 'react';
import { savePdfs, parsePdfFilename, getAllPdfs, deletePdf } from '../services/pdfService';
import { PDFDocument } from '../types';
import { Upload, FileText, CheckCircle, Trash2, X, Search, Filter, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Clock, Check, RefreshCw, Layers, FileUp } from 'lucide-react';

const PdfUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
  const [files, setFiles] = useState<{ file: File; status: 'pending' | 'error' | 'success'; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfs, setPdfs] = useState<PDFDocument[]>(getAllPdfs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [viewingPdf, setViewingPdf] = useState<PDFDocument | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const categories = useMemo(() => ['All', ...new Set(pdfs.map(p => p.category))], [pdfs]);
  const months = useMemo(() => ['All', ...new Set(pdfs.map(p => p.month))], [pdfs]);

  const filteredPdfs = useMemo(() => {
    return pdfs.filter(pdf => {
      const matchesSearch = pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pdf.userId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || pdf.month === selectedMonth;
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [pdfs, searchTerm, selectedCategory, selectedMonth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file: File) => {
      const metadata = parsePdfFilename(file.name);
      if (!metadata) return { file, status: 'error' as const, error: 'File name does not match ID_Category_Month.pdf format' };
      return { file, status: 'pending' as const };
    });
    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFileFromQueue = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processUpload = async () => {
    const pendingIndices = files
      .map((f, i) => (f.status === 'pending' ? i : -1))
      .filter((i) => i !== -1);
    
    if (pendingIndices.length === 0) return;
    
    setIsUploading(true);
    let count = 0;
    const currentFiles = [...files];

    for (const idx of pendingIndices) {
      const item = currentFiles[idx];
      const metadata = parsePdfFilename(item.file.name);
      
      if (metadata) {
        try {
          await new Promise(resolve => setTimeout(resolve, 400));
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(item.file);
          });

          const newDoc: PDFDocument = {
            id: Math.random().toString(36).substring(7),
            userId: metadata.userId,
            category: metadata.category,
            month: metadata.month,
            fileName: item.file.name,
            fileData: base64,
            uploadedAt: new Date().toISOString(),
            viewCount: 0
          };

          savePdfs([newDoc]);
          currentFiles[idx] = { ...item, status: 'success' };
          count++;
          setFiles([...currentFiles]);
        } catch (err) {
          currentFiles[idx] = { ...item, status: 'error', error: 'System storage failure' };
          setFiles([...currentFiles]);
        }
      }
    }

    setPdfs(getAllPdfs());
    setSuccessCount(count);
    setIsUploading(false);
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'success'));
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this document?')) {
      deletePdf(id);
      setPdfs(getAllPdfs());
    }
  };

  const validCount = files.filter(f => f.status === 'pending').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const successCountInQueue = files.filter(f => f.status === 'success').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[34px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">PDF Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage existing files or perform bulk uploads</p>
        </div>

        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[22px] backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-8 py-2.5 text-sm font-bold rounded-[18px] transition-all flex items-center ${activeTab === 'manage' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Layers size={18} className="mr-2" />
            Manage Index
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-8 py-2.5 text-sm font-bold rounded-[18px] transition-all flex items-center ${activeTab === 'upload' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileUp size={18} className="mr-2" />
            Bulk Upload
          </button>
        </div>
      </header>

      {successCount > 0 && activeTab === 'manage' && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center text-emerald-700 dark:text-emerald-400 animate-in slide-in-from-top-4">
          <CheckCircle className="mr-3 shrink-0" size={24} /> 
          <span className="font-bold">Successfully imported {successCount} documents to the system.</span>
        </div>
      )}

      {activeTab === 'manage' ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-6 justify-between items-center bg-white/50 dark:bg-[#1e293b]">
             <div className="relative w-full max-w-xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by filename, ID, or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold dark:text-white"
                />
             </div>
             <p className="text-[11px] font-bold text-slate-400">{filteredPdfs.length} documents indexed</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] text-slate-400 text-[11px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-6">Filename</th>
                  <th className="px-6 py-6">User ID</th>
                  <th className="px-6 py-6">Category</th>
                  <th className="px-6 py-6 text-center">Month</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredPdfs.length > 0 ? filteredPdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
                    <td className="px-8 py-6 font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">{pdf.fileName}</td>
                    <td className="px-6 py-6 font-black text-indigo-600 dark:text-indigo-400">{pdf.userId}</td>
                    <td className="px-6 py-6 text-slate-500 dark:text-slate-400 text-sm font-bold">{pdf.category}</td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">
                        {pdf.month}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => { setViewingPdf(pdf); setPage(1); setZoom(100); }} className="p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Eye size={18}/></button>
                        <button onClick={() => handleDelete(pdf.id)} className="p-2.5 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-40 text-center">
                      <div className="flex flex-col items-center opacity-50">
                        <FileText size={48} className="mb-4 text-slate-300" />
                        <p className="text-slate-400 font-bold text-xs">No documents found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-10 flex flex-col items-center">
           <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-4xl border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] p-10 md:p-16 flex flex-col items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group mb-10"
            >
              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-[32px] mb-8 group-hover:scale-110 transition-transform">
                <Upload size={54} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Drop files here</h2>
              <p className="text-slate-400 font-medium mt-4 text-center max-w-sm">Use standard format: <span className="text-indigo-600 dark:text-indigo-400 font-bold">ID_Category_Month.pdf</span></p>
              <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
            </div>

            {files.length > 0 && (
              <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-6">
                
                {/* 1. Action Required Bar (SWAPPED TO TOP) */}
                <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[36px] flex flex-col md:flex-row gap-6 justify-between items-center border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50">
                      {isUploading ? <RefreshCw size={26} className="animate-spin" /> : <FileUp size={26} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1.5">Action Required</p>
                      <p className="text-xs text-slate-400 font-bold">Press the button below to process {validCount} valid documents.</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={processUpload} 
                    disabled={isUploading || validCount === 0} 
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center min-w-[240px]"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin mr-3" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="mr-3" />
                        Begin Import ({validCount})
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Upload Queue Header (SWAPPED TO MIDDLE) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 gap-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-5 shadow-lg shadow-indigo-600/20">
                      <RefreshCw size={24} className={isUploading ? 'animate-spin' : ''} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight">Upload Queue</h3>
                      <div className="flex gap-4 mt-0.5">
                        <span className="text-[11px] font-bold text-indigo-500">{validCount} Pending</span>
                        {errorCount > 0 && <span className="text-[11px] font-bold text-rose-500">{errorCount} Invalid</span>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFiles([])}
                    disabled={isUploading}
                    className="flex items-center px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all font-bold text-xs shadow-sm"
                  >
                    <Trash2 size={16} className="mr-2" /> Discard all items
                  </button>
                </div>

                {/* 3. Scrollable List Row */}
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pb-4">
                  {files.map((item, idx) => {
                    const metadata = parsePdfFilename(item.file.name);
                    const statusConfig = {
                      pending: {
                        bg: 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm',
                        iconBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500',
                        badge: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
                        text: 'Ready for upload',
                        icon: <Clock size={14} />
                      },
                      success: {
                        bg: 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-900/20',
                        iconBg: 'bg-emerald-500 text-white',
                        badge: 'bg-emerald-500 text-white',
                        text: 'Upload complete',
                        icon: <Check size={14} />
                      },
                      error: {
                        bg: 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-100 dark:border-rose-900/20',
                        iconBg: 'bg-rose-100 text-rose-600',
                        badge: 'bg-rose-600 text-white',
                        text: item.error || 'Formatting error',
                        icon: <AlertCircle size={14} />
                      }
                    }[item.status];

                    return (
                      <div key={idx} className={`flex items-center p-5 rounded-[28px] border ${statusConfig.bg} transition-all hover:shadow-md group/item`}>
                        <div className={`p-4 rounded-2xl mr-5 shrink-0 transition-all ${statusConfig.iconBg}`}>
                          {item.status === 'success' ? <CheckCircle size={22} /> : (item.status === 'error' ? <AlertCircle size={22} /> : <FileText size={22} />)}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-slate-800 dark:text-white truncate text-sm leading-none mb-2">{item.file.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {metadata ? (
                              <>
                                <span className="text-[10px] font-bold text-slate-400">Owner: <span className="text-indigo-600 dark:text-indigo-400 font-black tracking-tight">{metadata.userId}</span></span>
                                <span className="text-[10px] font-bold text-slate-400">Tag: <span className="text-slate-600 dark:text-slate-300 font-black">{metadata.category}</span></span>
                                <span className="text-[10px] font-bold text-slate-400">Date: <span className="text-slate-600 dark:text-slate-300 font-black">{metadata.month}</span></span>
                              </>
                            ) : (
                              <span className="text-[10px] font-black text-rose-500 flex items-center">
                                <AlertCircle size={10} className="mr-1" /> Requires format: ID_Category_Month.pdf
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className={`flex items-center px-3 py-1.5 rounded-xl shadow-sm ${statusConfig.badge} animate-in fade-in`}>
                            <span className="mr-1.5">{statusConfig.icon}</span>
                            <span className="text-[10px] font-black whitespace-nowrap">{statusConfig.text}</span>
                          </div>
                          <button onClick={() => removeFileFromQueue(idx)} disabled={isUploading} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all disabled:opacity-0"><X size={18} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
      {/* PDF Viewer section remains same */}
      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-6xl h-[92vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shadow-sm"><FileText size={24}/></div>
                <div>
                  <h2 className="font-black text-lg text-slate-900 dark:text-white leading-tight truncate max-w-md">{viewingPdf.fileName}</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">ID {viewingPdf.userId} • {viewingPdf.month}</p>
                </div>
              </div>
              <button onClick={() => setViewingPdf(null)} className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"><X size={26}/></button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-black relative group/viewer">
              <iframe src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`} className="w-full h-full border-none" title="viewer" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6 px-10 py-5 bg-[#1a1c23]/95 backdrop-blur-2xl rounded-[30px] shadow-2xl border border-white/10 text-white">
                <div className="flex items-center space-x-4 pr-8 border-r border-white/10">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft size={24}/></button>
                    <span className="text-xs font-bold w-20 text-center">Page {page}</span>
                    <button onClick={() => setPage(p => p+1)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight size={24}/></button>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setZoom(z => Math.max(25, z-25))} className="p-2 hover:bg-white/10 rounded-lg"><ZoomOut size={20}/></button>
                    <span className="text-xs font-bold w-14 text-center">{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(400, z+25))} className="p-2 hover:bg-white/10 rounded-lg"><ZoomIn size={20}/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
