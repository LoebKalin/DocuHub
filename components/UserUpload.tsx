
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User, UserRole } from '../types';
import { bulkAddUsers } from '../services/authService';
import { Table, Upload, AlertTriangle, CheckCircle, Download } from 'lucide-react';

const UserUpload: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawJson = XLSX.utils.sheet_to_json(ws) as any[];

      // Validate columns: ID | Password | Department | Role
      const parsedUsers: User[] = [];
      const newErrors: string[] = [];

      rawJson.forEach((row, index) => {
        const id = row.ID || row.id;
        const password = row.Password || row.password;
        const department = row.Department || row.department;
        const role = (row.Role || row.role || 'user').toLowerCase();

        if (!id || !password || !department) {
          newErrors.push(`Row ${index + 1}: Missing required fields (ID, Password, or Department)`);
        } else if (role !== 'user' && role !== 'admin') {
          newErrors.push(`Row ${index + 1}: Invalid role "${role}" (must be "user" or "admin")`);
        } else {
          parsedUsers.push({
            id: String(id),
            password: String(password),
            department: String(department),
            role: role as UserRole
          });
        }
      });

      setData(parsedUsers);
      setErrors(newErrors);
      setSuccess(false);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      bulkAddUsers(data);
      setData([]);
      setSuccess(true);
      setIsProcessing(false);
    }, 1000);
  };

  const downloadSample = () => {
    const sample = [
      { ID: '1001', Password: 'pass123', Department: 'Finance', Role: 'user' },
      { ID: '1002', Password: 'pass456', Department: 'Marketing', Role: 'user' },
      { ID: 'admin2', Password: 'adminpass', Department: 'IT', Role: 'admin' },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "user_import_template.xlsx");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Bulk import users via Excel spreadsheet</p>
        </div>
        <button 
          onClick={downloadSample}
          className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg"
        >
          <Download size={16} className="mr-2" /> Download Template
        </button>
      </header>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
          <CheckCircle className="mr-3" /> User database updated successfully!
        </div>
      )}

      {!data.length ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-20 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Select User Excel File</h2>
          <p className="text-gray-500 mt-2">Required columns: ID, Password, Department, Role</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".xlsx, .xls" 
            className="hidden" 
            onChange={handleExcelUpload} 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Preview: {data.length} users found</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => setData([])}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isProcessing}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md disabled:opacity-50"
              >
                {isProcessing ? 'Saving...' : 'Confirm Import'}
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center text-amber-700 font-bold mb-2">
                <AlertTriangle size={18} className="mr-2" /> Warnings:
              </div>
              <ul className="text-sm text-amber-600 list-disc list-inside space-y-1">
                {errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Password</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((user, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono">••••••••</td>
                    <td className="px-6 py-4">{user.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserUpload;
