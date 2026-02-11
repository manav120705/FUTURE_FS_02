import { Lead } from '../App';

const STORAGE_KEY = 'crm_leads';

export const saveLeadsToStorage = (leads: Lead[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    console.error('Failed to save leads to localStorage:', error);
  }
};

export const loadLeadsFromStorage = (): Lead[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load leads from localStorage:', error);
  }
  return null;
};

export const exportLeadsToCSV = (leads: Lead[]) => {
  // CSV headers
  const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Created At', 'Notes Count'];
  
  // CSV rows
  const rows = leads.map(lead => [
    lead.name,
    lead.email,
    lead.phone || '',
    lead.source,
    lead.status,
    new Date(lead.createdAt).toLocaleDateString(),
    lead.notes.length.toString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `crm_leads_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
