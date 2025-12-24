
import React, { useState, useMemo } from 'react';
import { User, PDFDocument } from '../types';
import { getPdfsForUser, incrementViewCount } from '../services/pdfService';
import { updatePassword } from '../services/authService';
import { Search, FileText, Download, Calendar, Tag, Eye, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Check, Settings, Key, ShieldCheck } from 'lucide-react';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("Passwords don't match");
      return;
    }
    if (newPass.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }
    const success = updatePassword(user.id, newPass);
    if (success) {
      setIsSettingsOpen(false);
      setNewPass('');
      setConfirmPass('');
      alert("Password updated successfully!");
    } else {
      alert("Failed to update password. Please try again.");
    }
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
          <h1 className="text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">My Documents</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Access and manage your personal files</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
           >
              <Settings size={22} />
           </button>

           <div className="flex bg-[#f1f5ff] dark:bg-indigo-900/20 p-4 rounded-2xl border border-blue-100 dark:border-indigo-900/40 shadow-sm min-w-[300px]">
             <div className="flex-1 pr-4 border-r border-blue-200/50 dark:border-indigo-900/50">
               <p className="text-[10px] text-blue-500 dark:text-indigo-400 font-bold mb-1.5">Employee ID</p>
               <p className="text-lg font-black text-blue-900 dark:text-white leading-none">{user.id}</p>
             </div>
             <div className="flex-1 pl-4">
               <p className="text-[10px] text-blue-500 dark:text-indigo-400 font-bold mb-1.5">Department</p>
               <p className="text-lg font-black text-blue-900 dark:text-white leading-none truncate max-w-[110px]" title={user.department}>
                 {user.department}
               </p>
             </div>
           </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
            </select>
          </div>

          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
            >
              {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All months' : m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center group select-none"
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
              {isAllSelected && <Check size={14} className="text-white" />}
            </div>
            <span className="ml-3 text-sm font-bold text-slate-500 dark:text-slate-400">Select all</span>
          </button>

          <button
            onClick={handleDownloadSelected}
            disabled={selectedIds.size === 0}
            className={`flex items-center px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              selectedIds.size > 0 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <Download size={18} className="mr-3" />
            Download selected ({selectedIds.size})
          </button>
        </div>
      </div>

      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPdfs.map((pdf) => (
            <div key={pdf.id} className="relative group">
              <button 
                onClick={() => toggleSelect(pdf.id)}
                className={`absolute top-4 left-4 z-20 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedIds.has(pdf.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white/20 border-white/40 text-white opacity-0 group-hover:opacity-100'
                }`}
              >
                {selectedIds.has(pdf.id) && <Check size={14} />}
              </button>

              <div className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div onClick={() => openViewer(pdf)} className="aspect-[4/5] p-6 flex items-center justify-center relative cursor-pointer bg-slate-100/50 dark:bg-slate-900/30">
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">Pdf</div>
                  <div className="w-full h-full bg-white dark:bg-slate-800 rounded shadow-md flex flex-col p-4 relative overflow-hidden transition-transform group-hover:scale-[1.02]">
                     <div className="w-full h-1 bg-red-500 mb-6 rounded-full"></div>
                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <FileText size={48} className="text-slate-100 dark:text-slate-700 mb-4" />
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">{pdf.month}.pdf</p>
                        <p className="text-[8px] text-slate-400 font-bold mt-1">{pdf.category}</p>
                     </div>
                  </div>
                </div>

                <div className="p-5 mt-auto bg-white dark:bg-slate-800 border-t border-slate-50 dark:border-slate-700">
                   <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[9px] font-bold rounded">
                        {pdf.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(pdf.uploadedAt).toLocaleDateString()}
                      </span>
                   </div>
                   
                   <div className="flex gap-2">
                      <button onClick={() => openViewer(pdf)} className="flex-1 py-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] rounded-xl border border-indigo-50 dark:border-indigo-900/30 hover:bg-indigo-600 hover:text-white transition-all">View</button>
                      <button onClick={() => handleDownload(pdf)} className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"><Download size={18} /></button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-24 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[24px] flex items-center justify-center mb-6 text-slate-200"><Search size={40} /></div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">No results found</h2>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedMonth('All'); }} className="mt-6 text-indigo-600 font-bold text-xs hover:underline">Reset filters</button>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-white/10">
             <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><Settings size={20} /></div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
             </div>
             
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Security Settings</h2>

             <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">New password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="password" 
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Confirm password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="password" 
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Update Credentials
                </button>
             </form>
          </div>
        </div>
      )}

      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[95vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/10">
            <div className="p-5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center z-10">
              <div className="flex items-center space-x-4 truncate">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm"><FileText size={20} /></div>
                <div className="truncate">
                    <h2 className="font-black truncate text-base text-slate-900 dark:text-white leading-tight">{viewingPdf.fileName}</h2>
                    <p className="text-slate-400 text-[10px] font-bold mt-0.5">{viewingPdf.month} • {viewingPdf.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleDownload(viewingPdf)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-xl transition-all"><Download size={22} /></button>
                <button onClick={() => setViewingPdf(null)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-xl transition-all"><X size={26} /></button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group/viewer">
              <iframe src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`} className="w-full h-full border-none" title="PDF Viewer" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6 px-10 py-5 bg-[#1a1c23]/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/10 text-white transition-all translate-y-4 group-hover/viewer:translate-y-0 duration-500">
                <div className="flex items-center space-x-4 pr-8 border-r border-white/10">
                    <button onClick={() => setPage(prev => Math.max(1, prev - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all" disabled={page === 1}><ChevronLeft size={24} /></button>
                    <div className="text-[12px] font-bold w-20 text-center select-none">Page {page}</div>
                    <button onClick={() => setPage(prev => prev + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"><ChevronRight size={24} /></button>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setZoom(prev => Math.max(25, prev - 25))} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all" disabled={zoom <= 25}><ZoomOut size={20} /></button>
                    <button onClick={() => setZoom(100)} className="text-[12px] font-bold w-14 text-center hover:text-indigo-400 transition-colors">{zoom}%</button>
                    <button onClick={() => setZoom(prev => Math.min(400, prev + 25))} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all" disabled={zoom >= 400}><ZoomIn size={20} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
