
import React, { useState, useMemo } from 'react';
import { User, PDFDocument } from '../types';
import { getPdfsForUser, incrementViewCount } from '../services/pdfService';
import { Search, FileText, Download, Calendar, Tag, Eye, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Check, Square } from 'lucide-react';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal & Viewer State
  const [viewingPdf, setViewingPdf] = useState<PDFDocument | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const pdfs = useMemo(() => getPdfsForUser(user.id), [user.id]);
  
  const categories = useMemo(() => ['All', ...new Set(pdfs.map(p => p.category))], [pdfs]);
  const months = useMemo(() => ['All', ...new Set(pdfs.map(p => p.month))], [pdfs]);

  const filteredPdfs = useMemo(() => {
    return pdfs.filter(pdf => {
      const matchesSearch = pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || pdf.month === selectedMonth;
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [pdfs, searchTerm, selectedCategory, selectedMonth]);

  const handleDownload = (pdf: PDFDocument) => {
    const link = document.createElement('a');
    link.href = pdf.fileData;
    link.download = pdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = () => {
    const toDownload = filteredPdfs.filter(pdf => selectedIds.has(pdf.id));
    if (toDownload.length === 0) return;

    toDownload.forEach((pdf, index) => {
      setTimeout(() => {
        handleDownload(pdf);
      }, index * 300);
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPdfs.length && filteredPdfs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPdfs.map(p => p.id)));
    }
  };

  const openViewer = (pdf: PDFDocument) => {
    setPage(1);
    setZoom(100);
    setViewingPdf(pdf);
    incrementViewCount(pdf.id);
  };

  const isAllSelected = filteredPdfs.length > 0 && selectedIds.size === filteredPdfs.length;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#1a1a1a] tracking-tight">My Documents</h1>
          <p className="text-[#64748b] font-medium mt-1">Access and manage your personal files</p>
        </div>
        
        {/* User Info Cards - Professional Blue Style */}
        <div className="flex bg-[#ebf2ff] p-4 rounded-2xl border border-blue-100 shadow-sm min-w-[320px]">
          <div className="flex-1 pr-6 border-r border-blue-200/60">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.15em] mb-1.5">Employee ID</p>
            <p className="text-xl font-black text-blue-900 leading-none">{user.id}</p>
          </div>
          <div className="flex-1 pl-6">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.15em] mb-1.5">Department</p>
            <p className="text-xl font-black text-blue-900 leading-none truncate max-w-[120px]" title={user.department}>
              {user.department}
            </p>
          </div>
        </div>
      </header>

      {/* Filter Section - Refined White Card */}
      <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <Tag size={18} className="text-slate-400 mr-3" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <Calendar size={18} className="text-slate-400 mr-3" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk Actions Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
          <label className="flex items-center cursor-pointer group select-none">
            <div 
              onClick={toggleSelectAll}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                isAllSelected 
                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' 
                  : 'bg-white border-slate-200 group-hover:border-indigo-400'
              }`}
            >
              {isAllSelected && <Check size={16} className="text-white font-bold" />}
            </div>
            <span className="ml-3 text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Select All</span>
          </label>

          <button
            onClick={handleDownloadSelected}
            disabled={selectedIds.size === 0}
            className={`flex items-center px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
              selectedIds.size > 0 
                ? 'bg-[#ebf2ff] text-indigo-600 hover:bg-indigo-600 hover:text-white active:scale-95' 
                : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
            }`}
          >
            <Download size={18} className="mr-3" />
            Download Selected ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* PDF Document Grid */}
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPdfs.map((pdf) => (
            <div key={pdf.id} className="relative group">
              {/* Checkbox Overlay */}
              <button 
                onClick={() => toggleSelect(pdf.id)}
                className={`absolute top-4 left-4 z-20 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all backdrop-blur-md ${
                  selectedIds.has(pdf.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-110' 
                    : 'bg-white/40 border-white/60 text-white opacity-0 group-hover:opacity-100 hover:bg-white/60'
                }`}
              >
                {selectedIds.has(pdf.id) ? <Check size={18} /> : <div className="w-4 h-4 rounded-sm border-2 border-white/80" />}
              </button>

              <div className="bg-[#f1f5f9] rounded-[32px] overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col h-full">
                {/* Visual Thumbnail Area */}
                <div 
                  onClick={() => openViewer(pdf)}
                  className="aspect-[4/4.5] p-8 flex flex-col items-center justify-center relative cursor-pointer group/thumb"
                >
                  <div className="absolute top-4 right-4 bg-[#ef4444] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg z-10 tracking-widest">PDF</div>
                  
                  {/* Mock Page Visual */}
                  <div className="w-full h-full bg-white rounded-lg shadow-2xl flex flex-col p-5 relative overflow-hidden ring-1 ring-slate-200 transition-transform duration-500 group-hover/thumb:scale-105">
                     <div className="w-full h-1 bg-red-500 mb-6 shrink-0 rounded-full"></div>
                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <p className="text-[14px] font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">{pdf.month}.PDF</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{pdf.category}</p>
                     </div>
                     <div className="w-1/2 h-1 bg-slate-100 mt-6 self-end rounded-full"></div>
                     
                     <div className="absolute inset-0 bg-indigo-600/0 group-hover/thumb:bg-indigo-600/5 transition-colors duration-300"></div>
                  </div>
                </div>

                {/* Metadata & Quick Actions */}
                <div className="p-6 pt-0 mt-auto">
                   <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-white text-slate-500 text-[10px] font-black uppercase rounded-lg shadow-sm border border-slate-100">
                        {pdf.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(pdf.uploadedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                   </div>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={() => openViewer(pdf)}
                        className="flex-1 py-3 bg-white text-indigo-600 font-black text-[12px] rounded-2xl shadow-sm border border-indigo-50 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                      >
                        VIEW
                      </button>
                      <button 
                        onClick={() => handleDownload(pdf)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-200/50 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-32 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 text-slate-200">
            <Search size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No matching files</h2>
          <p className="text-slate-400 mt-3 font-medium max-w-xs">We couldn't find any documents that match your current search or filter criteria.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedMonth('All'); }} className="mt-8 text-indigo-600 font-black text-sm hover:underline tracking-widest uppercase">Clear all filters</button>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
            
            {/* Professional Modal Header */}
            <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
              <div className="flex items-center space-x-5 truncate">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border border-red-100">
                  <FileText size={22} />
                </div>
                <div className="truncate">
                    <h2 className="font-black truncate text-xl text-slate-900 leading-tight">{viewingPdf.fileName}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest">ID {user.id}</span>
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{viewingPdf.month} • {viewingPdf.category}</span>
                    </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleDownload(viewingPdf)}
                  className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-[18px] transition-all shadow-sm border border-slate-100"
                  title="Download"
                >
                  <Download size={22} />
                </button>
                <button 
                  onClick={() => setViewingPdf(null)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[18px] transition-all shadow-sm border border-slate-100 ml-2"
                >
                  <X size={26} />
                </button>
              </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden group/viewer">
              <iframe 
                key={`${page}-${zoom}`}
                src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=1`} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />

              {/* Sophisticated Controls Overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6 px-10 py-5 bg-[#1a1c23]/95 backdrop-blur-2xl rounded-[30px] shadow-2xl border border-white/10 text-white transition-all translate-y-4 group-hover/viewer:translate-y-0 duration-500">
                {/* Page Navigation */}
                <div className="flex items-center space-x-4 pr-8 border-r border-white/10">
                    <button 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-[14px] transition-all disabled:opacity-20"
                        disabled={page === 1}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-[12px] font-black w-20 text-center select-none uppercase tracking-[0.2em]">
                        PAGE {page}
                    </div>
                    <button 
                        onClick={() => setPage(prev => prev + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-[14px] transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-[12px] transition-all disabled:opacity-20"
                        disabled={zoom <= 25}
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button 
                        onClick={() => setZoom(100)}
                        className="text-[12px] font-black w-14 text-center hover:text-indigo-400 transition-colors tracking-tighter"
                    >
                        {zoom}%
                    </button>
                    <button 
                        onClick={() => setZoom(prev => Math.min(400, prev + 25))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-[12px] transition-all disabled:opacity-20"
                        disabled={zoom >= 400}
                    >
                        <ZoomIn size={20} />
                    </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200"></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Secure Portal Verified</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
