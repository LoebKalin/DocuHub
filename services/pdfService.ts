
import { PDFDocument } from '../types';

const PDF_DB_KEY = 'docuhub_pdfs_db';

export const savePdfs = (pdfs: PDFDocument[]) => {
  const existing: PDFDocument[] = JSON.parse(localStorage.getItem(PDF_DB_KEY) || '[]');
  localStorage.setItem(PDF_DB_KEY, JSON.stringify([...existing, ...pdfs]));
};

export const getAllPdfs = (): PDFDocument[] => {
  const data = localStorage.getItem(PDF_DB_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data);
  // Ensure backward compatibility by defaulting viewCount to 0 if missing
  return parsed.map((pdf: any) => ({
    ...pdf,
    viewCount: pdf.viewCount || 0
  }));
};

export const getPdfsForUser = (userId: string): PDFDocument[] => {
  return getAllPdfs().filter(pdf => pdf.userId === userId);
};

export const deletePdf = (id: string) => {
  const existing: PDFDocument[] = getAllPdfs();
  const filtered = existing.filter(pdf => pdf.id !== id);
  localStorage.setItem(PDF_DB_KEY, JSON.stringify(filtered));
};

export const incrementViewCount = (id: string) => {
  const existing = getAllPdfs();
  const updated = existing.map(pdf => {
    if (pdf.id === id) {
      return { ...pdf, viewCount: (pdf.viewCount || 0) + 1 };
    }
    return pdf;
  });
  localStorage.setItem(PDF_DB_KEY, JSON.stringify(updated));
};

export const parsePdfFilename = (filename: string): { userId: string, category: string, month: string } | null => {
  // Pattern: ID_Category_Month.pdf
  const regex = /^(\d+)_([^_]+)_([^_]+)\.pdf$/i;
  const match = filename.match(regex);
  if (match) {
    return {
      userId: match[1],
      category: match[2],
      month: match[3]
    };
  }
  return null;
};
