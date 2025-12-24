
import React, { useState, useMemo } from 'react';
import { getAllPdfs, deletePdf } from '../services/pdfService';
import { getAllUsers, getAuthUser } from '../services/authService';
import { FileText, Users, Clock, Trash2, Search, Filter, X, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, User as UserIcon } from 'lucide-react';
import { PDFDocument } from '../types';

const AdminDashboard: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFDocument[]>(getAllPdfs());
  const allUsers = getAllUsers();
  const users = allUsers.filter(u => u.role === 'user');
  const adminUser = getAuthUser();
  
  // Viewer State
  const [viewingPdf, setViewingPdf] = useState<PDFDocument | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const stats = [
    { label: 'TOTAL PDFS', value: pdfs.length, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'REGISTERED USERS', value: users.length, icon: <Users size={24} className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: 'RECENT UPLOADS', value: pdfs.filter(p => new Date(p.uploadedAt) > new Date(Date.now() - 24*60*60*1000)).length, icon: <Clock size={24} className="text-green-500" />, bg: 'bg-green-50' },
  ];

  // Derive unique filter options from all PDFs
  const userIds = useMemo(() => ['All', ...new Set(pdfs.map(p => p.userId))], [pdfs]);
  const categories = useMemo(() => ['All', ...new Set(pdfs.map(p => p.category))], [pdfs]);
  const months = useMemo(() => ['All', ...new Set(pdfs.map(p => p.month))], [pdfs]);

  // Apply Filtering
  const filteredPdfs = useMemo(() => {
    return pdfs.filter(pdf => {
      const matchesSearch = pdf.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pdf.userId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = selectedUser === 'All' || pdf.userId === selectedUser;
      const matchesCategory = selectedCategory === 'All' || pdf.category === selectedCategory;
      const matchesMonth = selectedMonth === 'All' || pdf.month === selectedMonth;
      return matchesSearch && matchesUser && matchesCategory && matchesMonth;
    });
  }, [pdfs, searchTerm, selectedUser, selectedCategory, selectedMonth]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deletePdf(id);
      setPdfs(getAllPdfs());
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedUser('All');
    setSelectedCategory('All');
    setSelectedMonth('All');
  };

  const handleDownload = (pdf: PDFDocument) => {
    const link = document.createElement('a');
    link.href = pdf.fileData;
    link.download = pdf.fileName;
    link.click();
  };

  const openViewer = (pdf: PDFDocument) => {
    setPage(1);
    setZoom(100);
    setViewingPdf(pdf);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold text-[#1a1a1a] tracking-tight">Admin Overview</h1>
          <p className="text-[#64748b] font-medium">System statistics and global document preview</p>
        </div>

        {/* Profile Card Addition */}
        <div className="flex items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg">
            <UserIcon size={24} />
          </div>
          <div className="ml-4">
            <p className="text-[11px] text-indigo-500 font-extrabold uppercase tracking-[0.1em] leading-none mb-1.5">Active Session</p>
            <div className="flex items-center space-x-2">
              <p className="text-base font-bold text-slate-900 leading-none">{adminUser?.id || 'admin'}</p>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[24px] shadow-sm border border-slate-100 flex items-center space-x-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className={`p-5 rounded-2xl ${stat.bg} shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Preview Section - Document Explorer */}
      <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                <Filter className="text-indigo-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Document Explorer</h2>
            </div>
            {(searchTerm || selectedUser !== 'All' || selectedCategory !== 'All' || selectedMonth !== 'All') && (
              <button 
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl transition-all flex items-center shadow-sm"
              >
                <X size={16} className="mr-2" /> Reset Filters
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search file or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
            >
              {userIds.map(id => <option key={id} value={id}>{id === 'All' ? 'All Users' : `User: ${id}`}</option>)}
            </select>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
            >
              {months.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfdfe] text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5 font-black border-b border-slate-50">Filename</th>
                <th className="px-6 py-5 font-black border-b border-slate-50">Assigned ID</th>
                <th className="px-6 py-5 font-black border-b border-slate-50">Category</th>
                <th className="px-6 py-5 font-black border-b border-slate-50 text-center">Period</th>
                <th className="px-6 py-5 font-black border-b border-slate-50 text-center">Views</th>
                <th className="px-6 py-5 font-black border-b border-slate-50">Uploaded At</th>
                <th className="px-8 py-5 font-black border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPdfs.length > 0 ? (
                filteredPdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-slate-50/80 transition-all group duration-200">
                    <td className="px-8 py-5 font-bold text-slate-800 max-w-xs truncate text-[14px]">
                      {pdf.fileName}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[12px] font-bold shadow-sm ring-1 ring-indigo-500/10">
                        {pdf.userId}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-600 text-sm font-medium">{pdf.category}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-lg shadow-sm">
                        {pdf.month}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-indigo-500 bg-indigo-50 w-8 h-8 inline-flex items-center justify-center rounded-full">
                        {pdf.viewCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                      {new Date(pdf.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                         <button 
                          onClick={() => openViewer(pdf)}
                          className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm bg-white ring-1 ring-indigo-100"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                         <button 
                          onClick={() => handleDownload(pdf)}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-600 hover:text-white rounded-xl transition-all shadow-sm bg-white ring-1 ring-slate-100"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pdf.id)}
                          className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm bg-white ring-1 ring-red-100"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                        <FileText size={48} />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">No documents matched your criteria</p>
                      <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-5 bg-[#fcfdfe] border-t border-slate-50 flex justify-between items-center text-[12px] font-bold text-slate-400">
          <p>Showing <span className="text-slate-900">{filteredPdfs.length}</span> of <span className="text-slate-900">{pdfs.length}</span> total documents</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <p>Admin Preview Enabled</p>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl h-[92vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
              <div className="flex items-center space-x-4 truncate">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="truncate">
                    <h2 className="font-extrabold truncate text-lg text-slate-900 leading-tight">{viewingPdf.fileName}</h2>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-wider">USER {viewingPdf.userId}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{viewingPdf.month} • {viewingPdf.category}</span>
                    </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleDownload(viewingPdf)}
                  className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                  title="Download"
                >
                  <Download size={22} />
                </button>
                <button 
                  onClick={() => setViewingPdf(null)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <X size={26} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative overflow-hidden group/viewer">
              <iframe 
                key={`${page}-${zoom}`}
                src={`${viewingPdf.fileData}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />

              {/* Floating Toolbar Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-6 px-8 py-4 bg-[#1a1c23]/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/10 text-white transition-transform translate-y-4 group-hover/viewer:translate-y-0 duration-300">
                {/* Page Navigation */}
                <div className="flex items-center space-x-3 pr-6 border-r border-white/10">
                    <button 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
                        disabled={page === 1}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-xs font-black w-14 text-center select-none uppercase tracking-widest">
                        PAGE {page}
                    </div>
                    <button 
                        onClick={() => setPage(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
                        disabled={zoom <= 25}
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button 
                        onClick={() => setZoom(100)}
                        className="text-[12px] font-black w-14 text-center hover:text-indigo-400 transition-colors tracking-tighter"
                    >
                        {zoom}%
                    </button>
                    <button 
                        onClick={() => setZoom(prev => Math.min(400, prev + 25))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
                        disabled={zoom >= 400}
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Secure Admin Access Portal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
