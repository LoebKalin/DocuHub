
import React, { useState, useRef } from 'react';
import { savePdfs, parsePdfFilename } from '../services/pdfService';
import { PDFDocument } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';

const PdfUpload: React.FC = () => {
  const [files, setFiles] = useState<{ file: File; status: 'pending' | 'error' | 'success'; error?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files).map((file: File) => {
      const metadata = parsePdfFilename(file.name);
      if (!metadata) {
        return { file, status: 'error' as const, error: 'Invalid filename format (ID_Category_Month.pdf required)' };
      }
      return { file, status: 'pending' as const };
    });

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);
    const results: PDFDocument[] = [];

    for (const f of validFiles) {
      const metadata = parsePdfFilename(f.file.name);
      if (metadata) {
        try {
          const base64 = await fileToBase64(f.file);
          results.push({
            id: Math.random().toString(36).substring(7),
            userId: metadata.userId,
            category: metadata.category,
            month: metadata.month,
            fileName: f.file.name,
            fileData: base64,
            uploadedAt: new Date().toISOString(),
            viewCount: 0
          });
          setSuccessCount(prev => prev + 1);
        } catch (err) {
          console.error("Failed to read file", f.file.name);
        }
      }
    }

    savePdfs(results);
    setFiles([]); // Clear list after successful batch
    setIsUploading(false);
    setTimeout(() => setSuccessCount(0), 3000);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-500 mt-1">
          PDF filenames must follow the format: <code className="bg-gray-100 px-2 py-0.5 rounded text-indigo-600 font-mono">ID_Category_Month.pdf</code>
        </p>
      </header>

      {successCount > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <CheckCircle className="mr-3" size={20} /> Successfully uploaded {successCount} documents!
        </div>
      )}

      {/* Upload Box */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
      >
        <div className="w-16 h-16 bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-full flex items-center justify-center mb-4 transition-colors">
          <Upload size={32} />
        </div>
        <p className="text-xl font-semibold text-gray-700">Click to upload PDFs</p>
        <p className="text-gray-500 mt-2">or drag and drop files here</p>
        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>

      {/* Pending List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Upload Queue ({files.length})</h3>
            <button 
              onClick={() => setFiles([])}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center"
            >
              <Trash2 size={16} className="mr-1" /> Clear All
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {files.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center">
                <FileText className={`${item.status === 'error' ? 'text-red-400' : 'text-indigo-400'} mr-4`} size={24} />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</p>
                  {item.status === 'error' && <p className="text-xs text-red-500 mt-1 font-semibold">{item.error}</p>}
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={processUpload}
              disabled={isUploading || files.every(f => f.status === 'error')}
              className={`w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center ${
                (isUploading || files.every(f => f.status === 'error')) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Processing...' : `Confirm Upload (${files.filter(f => f.status === 'pending').length} valid files)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
