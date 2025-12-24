
import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { User, UserRole } from '../types';
import { bulkAddUsers, getAllUsers, updatePassword, addUser, deleteUser, updateUser } from '../services/authService';
import { getTranslation } from '../services/i18nService';
import { exportToExcel } from '../utils/excel';
import { Upload, CheckCircle, Download, Key, Search, Trash2, Edit2, Check, X, UserPlus, RefreshCw, Layers, FileUp, Clock, AlertCircle, Building, ShieldCheck, Filter } from 'lucide-react';

interface UserQueueItem {
  user: User;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const UserUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'upload'>('manage');
  const [queue, setQueue] = useState<UserQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  
  // Individual CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<User>({
    id: '',
    department: '',
    role: UserRole.USER,
    password: ''
  });

  useEffect(() => {
    setUsersList(getAllUsers());
  }, []);

  const departments = useMemo(() => ['All', ...new Set(usersList.map(u => u.department))], [usersList]);
  const roles = ['All', UserRole.ADMIN, UserRole.USER];

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === 'All' || u.department === selectedDepartment;
      const matchesRole = selectedRole === 'All' || u.role === selectedRole;
      return matchesSearch && matchesDept && matchesRole;
    });
  }, [usersList, searchTerm, selectedDepartment, selectedRole]);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const rawJson = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];

      const newQueueItems: UserQueueItem[] = rawJson.map((row, index) => {
        const id = row.ID || row.id;
        const password = row.Password || row.password;
        const department = row.Department || row.department;
        const role = (row.Role || row.role || 'user').toLowerCase();

        if (!id || !password || !department) {
          return {
            user: { id: id || 'Unknown', department: department || '', role: UserRole.USER, password: '' },
            status: 'error',
            error: `Row ${index + 1}: Missing ID, Password or Department`
          };
        }

        return {
          user: {
            id: String(id),
            password: String(password),
            department: String(department),
            role: role === 'admin' ? UserRole.ADMIN : UserRole.USER
          },
          status: 'pending'
        };
      });

      setQueue(prev => [...prev, ...newQueueItems]);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processBatchImport = async () => {
    const pendingItems = queue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    let imported = 0;
    const currentQueue = [...queue];

    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 200));
        currentQueue[i] = { ...currentQueue[i], status: 'success' };
        imported++;
        setQueue([...currentQueue]);
      }
    }

    const usersToSave = currentQueue
      .filter(item => item.status === 'success')
      .map(item => item.user);

    bulkAddUsers(usersToSave);
    setUsersList(getAllUsers());
    setSuccessCount(imported);
    setIsProcessing(false);

    setTimeout(() => {
      setQueue(prev => prev.filter(item => item.status !== 'success'));
    }, 2000);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'admin') {
      alert("Cannot delete the root administrator.");
      return;
    }
    if (confirm(`Are you sure you want to delete user ${id}?`)) {
      deleteUser(id);
      setUsersList(getAllUsers());
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ id: '', department: '', role: UserRole.USER, password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      if (!formData.password) {
        alert("Password is required for new users.");
        return;
      }
      const success = addUser(formData);
      if (!success) {
        alert("User ID already exists.");
        return;
      }
    } else {
      const updates: Partial<User> = {
        department: formData.department,
        role: formData.role
      };
      if (formData.password) updates.password = formData.password;
      updateUser(formData.id, updates);
    }
    setUsersList(getAllUsers());
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const exportData = filteredUsers.map(({ id, department, role }) => ({
      ID: id,
      Department: department,
      Role: role
    }));
    exportToExcel(exportData, `DocuHub_Users_Filtered_${new Date().toISOString().split('T')[0]}`);
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const errorCount = queue.filter(q => q.status === 'error').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[34px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">{getTranslation('user_mgmt_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{getTranslation('user_mgmt_subtitle')}</p>
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

      {successCount > 0 && activeTab === 'manage' && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center text-emerald-700 dark:text-emerald-400 animate-in slide-in-from-top-4">
          <CheckCircle className="mr-3 shrink-0" size={24} /> 
          <span className="font-bold">Successfully imported {successCount} users to the system.</span>
        </div>
      )}

      {activeTab === 'manage' ? (
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-6 bg-white/50 dark:bg-[#1e293b]">
             <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-xl group">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search users..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold dark:text-white shadow-inner"
                   />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                   <div className="relative flex-1 lg:w-48">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select 
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full pl-10 pr-8 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                      >
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                      </select>
                   </div>
                   <div className="relative flex-1 lg:w-48">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full pl-10 pr-8 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-600 dark:text-slate-300 text-sm appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                      >
                        {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleOpenCreateModal}
                    className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl transition-all font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <UserPlus size={18} className="mr-2.5" /> {getTranslation('btn_add_user')}
                  </button>
                  <button 
                    onClick={handleExport}
                    className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3.5 bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all font-bold text-sm shadow-sm active:scale-95"
                  >
                    <Download size={18} className="mr-2.5" /> {getTranslation('btn_export')}
                  </button>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{filteredUsers.length} users found</p>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] dark:bg-[#0f172a] text-slate-400 text-[11px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-6 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-6 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-6 text-center uppercase tracking-wider">Role</th>
                  <th className="px-8 py-6 text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group">
                    <td className="px-8 py-6 font-black text-slate-800 dark:text-slate-100 text-base">{u.id}</td>
                    <td className="px-6 py-6 text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide">{u.department}</td>
                    <td className="px-6 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                         u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleOpenEditModal(u)} className="p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-40 text-center">
                      <div className="flex flex-col items-center opacity-50">
                        <Users size={48} className="mb-4 text-slate-300" />
                        <p className="text-slate-400 font-bold text-xs">No users match your filters</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setSelectedDepartment('All'); setSelectedRole('All'); }}
                          className="mt-4 text-indigo-600 text-xs font-bold hover:underline"
                        >
                          Clear all filters
                        </button>
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
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Import Users from Excel</h2>
              <p className="text-slate-400 font-medium mt-4 text-center max-w-sm text-lg">Click here or drag and drop your spreadsheet file (.xlsx)</p>
              <input type="file" ref={fileInputRef} accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
            </div>

            {queue.length > 0 && (
              <div className="w-full max-w-4xl space-y-6 animate-in slide-in-from-bottom-6">
                <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[36px] flex flex-col md:flex-row gap-6 justify-between items-center border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50">
                      {isProcessing ? <RefreshCw size={26} className="animate-spin" /> : <UserPlus size={26} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1.5">{getTranslation('action_required')}</p>
                      <p className="text-xs text-slate-400 font-bold">Process {pendingCount} user accounts for system registration.</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={processBatchImport} 
                    disabled={isProcessing || pendingCount === 0} 
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center min-w-[240px]"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin mr-3" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} className="mr-3" />
                        {getTranslation('begin_import')} ({pendingCount})
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 gap-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-5 shadow-lg shadow-indigo-600/20">
                      <RefreshCw size={24} className={isProcessing ? 'animate-spin' : ''} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight">{getTranslation('user_queue')}</h3>
                      <div className="flex gap-4 mt-0.5">
                        <span className="text-[11px] font-bold text-indigo-500">{pendingCount} Pending</span>
                        {errorCount > 0 && <span className="text-[11px] font-bold text-rose-500">{errorCount} Invalid</span>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setQueue([])}
                    disabled={isProcessing}
                    className="flex items-center px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all font-bold text-xs shadow-sm"
                  >
                    <Trash2 size={16} className="mr-2" /> {getTranslation('btn_discard_all')}
                  </button>
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 pb-4">
                  {queue.map((item, idx) => {
                    const statusConfig = {
                      pending: {
                        bg: 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-sm',
                        iconBg: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500',
                        badge: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
                        text: 'Ready for import',
                        icon: <Clock size={14} />
                      },
                      success: {
                        bg: 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-900/20',
                        iconBg: 'bg-emerald-500 text-white',
                        badge: 'bg-emerald-500 text-white',
                        text: 'User imported',
                        icon: <Check size={14} />
                      },
                      error: {
                        bg: 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-100 dark:border-rose-900/20',
                        iconBg: 'bg-rose-100 text-rose-600',
                        badge: 'bg-rose-600 text-white',
                        text: item.error || 'Row error',
                        icon: <AlertCircle size={14} />
                      }
                    }[item.status];

                    return (
                      <div key={idx} className={`flex items-center p-5 rounded-[28px] border ${statusConfig.bg} transition-all hover:shadow-md group/item`}>
                        <div className={`p-4 rounded-2xl mr-5 shrink-0 transition-all ${statusConfig.iconBg}`}>
                          {item.status === 'success' ? <CheckCircle size={22} /> : (item.status === 'error' ? <AlertCircle size={22} /> : <UserPlus size={22} />)}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-black text-slate-800 dark:text-white truncate text-base leading-none mb-2">{item.user.id}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span className="text-[10px] font-bold text-slate-400">Dept: <span className="text-indigo-600 dark:text-indigo-400 font-black">{item.user.department}</span></span>
                            <span className="text-[10px] font-bold text-slate-400">Role: <span className="text-slate-600 dark:text-slate-300 font-black">{item.user.role}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className={`flex items-center px-3 py-1.5 rounded-xl shadow-sm ${statusConfig.badge} animate-in fade-in`}>
                            <span className="mr-1.5">{statusConfig.icon}</span>
                            <span className="text-[10px] font-black whitespace-nowrap">{statusConfig.text}</span>
                          </div>
                          <button 
                            onClick={() => removeFromQueue(idx)}
                            disabled={isProcessing}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all disabled:opacity-0"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-[32px] shadow-2xl p-10 animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                {modalMode === 'create' ? <UserPlus size={24} /> : <Edit2 size={24} />}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={28} />
              </button>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              {modalMode === 'create' ? 'Add New Employee' : 'Edit Employee Details'}
            </h2>

            <form onSubmit={handleModalSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Employee ID</label>
                <input 
                  type="text" 
                  disabled={modalMode === 'edit'}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold disabled:opacity-50"
                  placeholder="e.g. 1023"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Department</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold"
                  placeholder="e.g. Finance"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">System Role</label>
                <div className="relative">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold appearance-none cursor-pointer"
                  >
                    <option value={UserRole.USER}>Standard User</option>
                    <option value={UserRole.ADMIN}>Administrator</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  {modalMode === 'edit' ? 'Update Password (leave blank to keep current)' : 'Initial Password'}
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold"
                    placeholder="••••••••"
                    required={modalMode === 'create'}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4"
              >
                {modalMode === 'create' ? 'Create Employee Account' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Users = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default UserUpload;
