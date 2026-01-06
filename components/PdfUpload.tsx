import React, { useState, useRef, useMemo, useEffect } from 'react';
import { savePdfs, parsePdfFilename, getAllPdfs, deletePdf } from '../services/pdfService';
import { getTranslation } from '../services/i18nService';
import { PDFDocument } from '../types';
import { Upload, FileText, CheckCircle, Trash2, X, Search, Filter, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Clock, Check, RefreshCw, Layers, FileUp, Calendar, Tag as TagIcon, BarChart } from 'lucide-react';

const PdfUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick(t => t + 1);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const [files, setFiles] = useState<{ file: File; status: 'pending' | 'error' | 'success'; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
                           pdf.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pdf.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || pdf.month === selectedMonth;
      return matchesSearch && matchesCategory && matchesMonth;
    }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [pdfs, searchTerm, selectedCategory, selectedMonth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file: File) => {
      const metadata = parsePdfFilename(file.name);
      if (!metadata) return { file, status: 'error' as const, error: 'Format invalid (Use: ID_Category_Month.pdf)' };
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
    setUploadProgress(0);
    const total = pendingIndices.length;
    let completedCount = 0;
    const currentFiles = [...files];

    // Process in batches of 5 to maintain UI responsiveness
    const batchSize = 5;
    for (let i = 0; i < pendingIndices.length; i += batchSize) {
      const batch = pendingIndices.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (idx) => {
        const item = currentFiles[idx];
        const metadata = parsePdfFilename(item.file.name);
        
        if (metadata) {
          try {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(item.file);
            });

            const newDoc: PDFDocument = {
              id: crypto.randomUUID(),
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
          } catch (err) {
            currentFiles[idx] = { ...item, status: 'error', error: 'System storage limit or read error' };
          }
        }
        completedCount++;
        setUploadProgress(Math.round((completedCount / total) * 100));
        setFiles([...currentFiles]);
      }));
      
      // Small pause between batches for smooth rendering
      await new Promise(r => setTimeout(r, 100));
    }

    setPdfs(getAllPdfs());
    setIsUploading(false);
    
    // Auto-clean successful uploads after 3 seconds
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'success'));
      setUploadProgress(0);
    }, 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this document? This action cannot be undone.')) {
      deletePdf(id);
      setPdfs(getAllPdfs());
    }
  };

  const validCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-black text-slate-900 dark:text-white tracking-tight leading-none">{getTranslation('pdf_mgmt_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 text-lg">{getTranslation('pdf_mgmt_subtitle')}</p>
        </div>

        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[24px] backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-8 py-3 text-sm font-bold rounded-[20px] transition-all flex items-center ${activeTab === 'manage' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Layers size={18} className="mr-2" />
            {getTranslation('upload_manage')}
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-8 py-3 text-sm font-bold rounded-[20px] transition-all flex items-center ${activeTab === 'upload' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileUp size={18} className="mr-2" />
            {getTranslation('upload_bulk')}
          </button>
        </div>
      </header>

      {activeTab === 'manage' ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-8 bg-white/50 dark:bg-[#1e293b]">
             <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="relative w-full max-w-2xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                    <input 
                      type="text" 
                      placeholder="Search by filename, ID, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-base font-bold dark:text-white placeholder:text-slate-300"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:min-w-[200px]">
                        <TagIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                    <div className="relative flex-1 lg:min-w-[200px]">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
                        </select>
                    </div>
                </div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                  <BarChart size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{filteredPdfs.length} documents indexed</span>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] text-slate-400 text-[11px] font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 uppercase tracking-widest">Filename</th>
                  <th className="px-6 py-6 uppercase tracking-widest">User ID</th>
                  <th className="px-6 py-6 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-6 text-center uppercase tracking-widest">Month</th>
                  <th className="px-10 py-6 text-right uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredPdfs.length > 0 ? filteredPdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group">
                    <td className="px-10 py-6 font-bold text-slate-800 dark:text-slate-100 max-w-sm truncate text-base">{pdf.fileName}</td>
                    <td className="px-6 py-6 font-black text-indigo-600 dark:text-indigo-400 text-base">{pdf.userId}</td>
                    <td className="px-6 py-6 text-slate-500 dark:text-slate-400 text-sm font-bold">{pdf.category}</td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-black rounded-xl border border-slate-200 dark:border-slate-600">
                        {pdf.month}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => { setViewingPdf(pdf); setPage(1); setZoom(100); }} className="p-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"><Eye size={20}/></button>
                        <button onClick={() => handleDelete(pdf.id)} className="p-3 text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-48 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[32px] flex items-center justify-center mb-6 text-slate-200 dark:text-slate-800">
                          <FileText size={48} />
                        </div>
                        <p className="text-slate-400 font-black text-lg">{getTranslation('no_docs')}</p>
                        <p className="text-slate-300 dark:text-slate-600 font-medium mt-1">Try changing your search or category filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 md:p-16 flex flex-col items-center">
           <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`w-full max-w-5xl border-4 border-dashed rounded-[48px] p-16 md:p-24 flex flex-col items-center justify-center transition-all cursor-pointer group mb-12 ${
                isUploading 
                  ? 'border-slate-100 dark:border-slate-800 cursor-wait' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10'
              }`}
            >
              <div className="p-10 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-[40px] mb-10 group-hover:scale-110 transition-transform shadow-2xl shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-800">
                <Upload size={64} />
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{getTranslation('upload_drop')}</h2>
              <p className="text-slate-400 font-bold mt-6 text-center max-w-md text-lg">
                Required Filename Format:<br/>
                <span className="text-indigo-600 dark:text-indigo-400 font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg inline-block mt-2">ID_Category_Month.pdf</span>
              </p>
              <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            </div>

            {files.length > 0 && (
              <div className="w-full max-w-5xl space-y-8 animate-in slide-in-from-bottom-10">
                <div className="bg-white dark:bg-[#1e293b] p-10 rounded-[40px] flex flex-col gap-8 border border-slate-100 dark:border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
                  {isUploading && (
                    <div className="absolute top-0 left-0 h-1.5 bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  )}
                  
                  <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl ${
                        isUploading ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                      }`}>
                        {isUploading ? <RefreshCw size={30} className="animate-spin" /> : <FileUp size={30} />}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 dark:text-white leading-none mb-2">{isUploading ? 'Importing Documents...' : getTranslation('action_required')}</p>
                        <p className="text-sm text-slate-400 font-bold">{isUploading ? `Processing ${uploadProgress}%` : `Reviewing ${validCount} valid files for import.`}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {!isUploading && (
                        <button 
                          onClick={() => setFiles([])}
                          className="px-8 py-5 text-slate-400 font-bold hover:text-rose-500 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={processUpload} 
                        disabled={isUploading || validCount === 0} 
                        className="flex-1 md:flex-none px-12 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center min-w-[280px] text-lg"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw size={24} className="animate-spin mr-3" />
                            {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="mr-3" />
                            Import {validCount} Files
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1e293b] rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                   <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg">{getTranslation('upload_queue')}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{files.length} items</span>
                      </div>
                   </div>

                   <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {files.map((item, idx) => {
                      const metadata = parsePdfFilename(item.file.name);
                      return (
                        <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group">
                           <div className="flex items-center min-w-0 pr-4">
                              <div className={`p-4 rounded-2xl mr-5 shrink-0 shadow-sm ${
                                item.status === 'error' ? 'bg-rose-50 text-rose-500' : 
                                item.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                                'bg-indigo-50 text-indigo-500'
                              }`}>
                                 {item.status === 'success' ? <CheckCircle size={24} /> : <FileText size={24} />}
                              </div>
                              <div className="truncate">
                                 <p className="font-bold text-slate-800 dark:text-white truncate text-base leading-tight mb-1">{item.file.name}</p>
                                 <div className="flex items-center space-x-3">
                                   {metadata ? (
                                     <>
                                       <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded uppercase">ID: {metadata.userId}</span>
                                       <span className="text-[10px] font-bold text-slate-400">{metadata.category} • {metadata.month}</span>
                                     </>
                                   ) : (
                                     <span className="text-[10px] font-bold text-rose-500">{item.error}</span>
                                   )}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6 shrink-0">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm ${
                                item.status === 'success' ? 'bg-emerald-500 text-white' : 
                                item.status === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {item.status === 'success' ? getTranslation('status_complete') : 
                                 item.status === 'error' ? 'Error' : 'Pending'}
                              </span>
                              {!isUploading && (
                                <button onClick={() => removeFileFromQueue(idx)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><X size={20}/></button>
                              )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-7xl h-[94vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1e293b]">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center"><FileText size={24}/></div>
                <div>
                  <h2 className="font-black text-xl text-slate-900 dark:text-white truncate max-w-2xl">{viewingPdf.fileName}</h2>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{viewingPdf.category} • {viewingPdf.month}</p>
                </div>
              </div>
              <button onClick={() => setViewingPdf(null)} className="p-4 text-slate-400 hover:text-rose-500 transition-all bg-slate-50 dark:bg-slate-800 rounded-2xl hover:scale-110 active:scale-90"><X size={32}/></button>
            </div>
            <div className="flex-1 bg-slate-200 dark:bg-black relative group/viewer">
              <iframe src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`} className="w-full h-full border-none" title="viewer" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-8 px-12 py-6 bg-slate-900/95 backdrop-blur-2xl rounded-full text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 transition-all translate-y-4 opacity-0 group-hover/viewer:translate-y-0 group-hover/viewer:opacity-100 duration-500">
                <div className="flex items-center space-x-4 border-r border-white/10 pr-8">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronLeft size={28}/></button>
                  <span className="text-sm font-black w-24 text-center select-none uppercase tracking-widest">Page {page}</span>
                  <button onClick={() => setPage(p => p+1)} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={28}/></button>
                </div>
                <div className="flex items-center space-x-6">
                  <button onClick={() => setZoom(z => Math.max(25, z-25))} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={24}/></button>
                  <span className="text-sm font-black w-16 text-center select-none">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(400, z+25))} className="p-3 hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={24}/></button>
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