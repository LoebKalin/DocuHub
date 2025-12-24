
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { savePdfs, parsePdfFilename, getAllPdfs, deletePdf } from '../services/pdfService';
import { getTranslation } from '../services/i18nService';
import { PDFDocument } from '../types';
import { Upload, FileText, CheckCircle, Trash2, X, Search, Filter, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Clock, Check, RefreshCw, Layers, FileUp, Calendar, Tag as TagIcon } from 'lucide-react';

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
                           pdf.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pdf.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || pdf.month === selectedMonth;
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [pdfs, searchTerm, selectedCategory, selectedMonth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file: File) => {
      const metadata = parsePdfFilename(file.name);
      if (!metadata) return { file, status: 'error' as const, error: 'File name format invalid' };
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
          currentFiles[idx] = { ...item, status: 'error', error: 'Upload failed' };
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[34px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">{getTranslation('pdf_mgmt_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{getTranslation('pdf_mgmt_subtitle')}</p>
        </div>

        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[22px] backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-8 py-2.5 text-sm font-bold rounded-[18px] transition-all flex items-center ${activeTab === 'manage' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Layers size={18} className="mr-2" />
            {getTranslation('upload_manage')}
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-8 py-2.5 text-sm font-bold rounded-[18px] transition-all flex items-center ${activeTab === 'upload' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileUp size={18} className="mr-2" />
            {getTranslation('upload_bulk')}
          </button>
        </div>
      </header>

      {activeTab === 'manage' ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-6 bg-white/50 dark:bg-[#1e293b]">
             <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-48">
                        <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-8 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                    <div className="relative flex-1 lg:w-48">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full pl-10 pr-8 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer"
                        >
                            {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
                        </select>
                    </div>
                </div>
             </div>
             <p className="text-[11px] font-bold text-slate-400 text-right uppercase tracking-wider">{filteredPdfs.length} documents indexed</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] text-slate-400 text-[11px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-6 uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-6 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-6 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-6 text-center uppercase tracking-wider">Month</th>
                  <th className="px-8 py-6 text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredPdfs.length > 0 ? filteredPdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group">
                    <td className="px-8 py-6 font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">{pdf.fileName}</td>
                    <td className="px-6 py-6 font-black text-indigo-600 dark:text-indigo-400">{pdf.userId}</td>
                    <td className="px-6 py-6 text-slate-500 dark:text-slate-400 text-sm font-bold">{pdf.category}</td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-600">
                        {pdf.month}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => { setViewingPdf(pdf); setPage(1); setZoom(100); }} className="p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button>
                        <button onClick={() => handleDelete(pdf.id)} className="p-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-40 text-center">
                      <div className="flex flex-col items-center opacity-50">
                        <FileText size={48} className="mb-4 text-slate-300" />
                        <p className="text-slate-400 font-bold text-xs">{getTranslation('no_docs')}</p>
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
              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-[32px] mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/10">
                <Upload size={54} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{getTranslation('upload_drop')}</h2>
              <p className="text-slate-400 font-medium mt-4 text-center max-w-sm">Format: <span className="text-indigo-600 dark:text-indigo-400 font-black">ID_Category_Month.pdf</span></p>
              <input type="file" ref={fileInputRef} multiple accept=".pdf" className="hidden" onChange={handleFileChange} />
            </div>

            {files.length > 0 && (
              <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-6">
                <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[36px] flex flex-col md:flex-row gap-6 justify-between items-center border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50">
                      {isUploading ? <RefreshCw size={26} className="animate-spin" /> : <FileUp size={26} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1.5">{getTranslation('action_required')}</p>
                      <p className="text-xs text-slate-400 font-bold">Process {validCount} valid documents.</p>
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="mr-3" />
                        {getTranslation('begin_import')} ({validCount})
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4">
                  <h3 className="font-bold text-slate-800 dark:text-white">{getTranslation('upload_queue')}</h3>
                  <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">{getTranslation('btn_discard_all')}</button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {files.map((item, idx) => {
                    const metadata = parsePdfFilename(item.file.name);
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl">
                         <div className="flex items-center">
                            <div className={`p-3 rounded-xl mr-4 ${item.status === 'error' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                               <FileText size={20} />
                            </div>
                            <div className="max-w-md">
                               <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.file.name}</p>
                               {metadata && <p className="text-[10px] text-slate-400 font-medium">{getTranslation('owner')}: {metadata.userId} • {metadata.category}</p>}
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                              item.status === 'success' ? 'bg-green-100 text-green-600' : 
                              item.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status === 'success' ? getTranslation('status_complete') : 
                               item.status === 'error' ? getTranslation('status_error') : getTranslation('status_ready')}
                            </span>
                            <button onClick={() => removeFileFromQueue(idx)} className="text-slate-300 hover:text-red-500"><X size={16}/></button>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}

      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1e293b]">
              <h2 className="font-black text-lg text-slate-900 dark:text-white truncate max-w-md">{viewingPdf.fileName}</h2>
              <button onClick={() => setViewingPdf(null)} className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"><X size={28}/></button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-black relative">
              <iframe src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`} className="w-full h-full border-none" title="viewer" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6 px-10 py-5 bg-black/90 backdrop-blur-xl rounded-full text-white shadow-2xl border border-white/10">
                <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={24}/></button>
                <span className="text-xs font-bold w-20 text-center">Page {page}</span>
                <button onClick={() => setPage(p => p+1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={24}/></button>
                <div className="w-px h-6 bg-white/20 mx-4"></div>
                <button onClick={() => setZoom(z => Math.max(25, z-25))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={20}/></button>
                <span className="text-xs font-bold w-14 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(400, z+25))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={20}/></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
