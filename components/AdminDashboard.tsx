
import React from 'react';
import { Link } from 'react-router-dom';
import { getAllPdfs } from '../services/pdfService';
import { getAllUsers, getAuthUser } from '../services/authService';
import { FileText, Users, Clock, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const pdfs = getAllPdfs();
  const allUsers = getAllUsers();
  const users = allUsers.filter(u => u.role === 'user');
  const adminUser = getAuthUser();
  
  const stats = [
    { label: 'Total PDFs', value: pdfs.length, icon: <FileText size={26} className="text-indigo-600" />, sub: 'Stored in system', bg: 'bg-indigo-50' },
    { label: 'Users', value: users.length, icon: <Users size={26} className="text-blue-600" />, sub: 'Active accounts', bg: 'bg-blue-50' },
    { label: 'Recent', value: pdfs.filter(p => new Date(p.uploadedAt) > new Date(Date.now() - 24*60*60*1000)).length, icon: <Clock size={26} className="text-green-600" />, sub: 'Last 24 hours', bg: 'bg-green-50' },
    { label: 'Total Views', value: pdfs.reduce((acc, p) => acc + (p.viewCount || 0), 0), icon: <Activity size={26} className="text-purple-600" />, sub: 'Document engagement', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-[40px] font-black text-slate-900 dark:text-white tracking-tight leading-none">System Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 text-lg">Central control hub for DocuHub secure assets</p>
        </div>

        <div className="flex items-center bg-white dark:bg-[#1e293b] p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-w-[280px]">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={28} />
          </div>
          <div className="ml-5">
            <p className="text-[11px] text-indigo-500 font-bold mb-1.5 leading-none">Root access</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{adminUser?.id || 'Admin'}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white dark:bg-[#1e293b] p-8 rounded-[36px] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
            <div className={`w-16 h-16 rounded-[24px] ${stat.bg} dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-3">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                <div className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-5">{stat.sub}</p>
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#2d2a75] to-[#1e1b4b] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
           <h3 className="text-2xl font-black mb-4 relative z-10">Quick Actions</h3>
           <p className="text-indigo-200 mb-10 max-w-xs relative z-10">Navigate to document or user management to update the system repository.</p>
           <div className="flex gap-4 relative z-10">
              <Link to="/admin/upload-pdf" className="px-6 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl">Manage PDFs</Link>
              <Link to="/admin/upload-users" className="px-6 py-4 bg-indigo-500/30 border border-white/10 font-bold rounded-2xl hover:bg-indigo-500/50 transition-all">Manage Users</Link>
           </div>
           <FileText className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
           <h3 className="text-2xl font-black mb-4 dark:text-white">System Health</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-500">Storage usage</span>
                 <span className="text-xs font-black text-indigo-600">8% utilized</span>
              </div>
              <div className="w-full h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                 <div className="w-[8%] h-full bg-indigo-500 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Auto-syncing with local storage database. Next maintenance window in 24 hours.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
