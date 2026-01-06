import { PDFDocument } from '../types';

const PDF_DB_KEY = 'docuhub_pdfs_db';

export const savePdfs = (pdfs: PDFDocument[]) => {
  const existing: PDFDocument[] = JSON.parse(localStorage.getItem(PDF_DB_KEY) || '[]');
  // Avoid duplicate internal IDs
  const filteredNew = pdfs.filter(np => !existing.some(ep => ep.fileName === np.fileName && ep.userId === np.userId));
  localStorage.setItem(PDF_DB_KEY, JSON.stringify([...existing, ...filteredNew]));
};

export const getAllPdfs = (): PDFDocument[] => {
  const data = localStorage.getItem(PDF_DB_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data);
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

/**
 * Parses PDF filenames with format: ID_Category_Month.pdf
 * Handles cases with extra spaces or underscores in category/month.
 */
export const parsePdfFilename = (filename: string): { userId: string, category: string, month: string } | null => {
  // Clean filename: remove extension and trim
  const cleanName = filename.replace(/\.pdf$/i, '').trim();
  
  // Pattern: ID_Category_Month
  const parts = cleanName.split('_');
  
  if (parts.length >= 3) {
    const userId = parts[0].trim();
    // In case category or month contains underscores, we take the first part as ID and the last as Month
    const month = parts[parts.length - 1].trim();
    const category = parts.slice(1, parts.length - 1).join('_').trim();

    // Basic validation: ID should be numeric or alphanumeric and not empty
    if (userId && category && month) {
      return { userId, category, month };
    }
  }
  return null;
};