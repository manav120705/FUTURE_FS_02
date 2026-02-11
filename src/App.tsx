import { useState, useEffect, useMemo } from 'react';
import { LeadList } from './components/LeadList';
import { LeadDetails } from './components/LeadDetails';
import { AddLeadForm } from './components/AddLeadForm';
import { AuthGuard } from './components/AuthGuard';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SearchFilter } from './components/SearchFilter';
import { EditLeadModal } from './components/EditLeadModal';
import { UserPlus, LogOut } from 'lucide-react';
import { saveLeadsToStorage, loadLeadsFromStorage, exportLeadsToCSV } from './utils/storage';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'converted';
  createdAt: string;
  notes: Note[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  followUpDate?: string;
}

// Mock data for demonstration
const initialLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    source: 'Website Contact Form',
    status: 'new',
    createdAt: '2026-02-08T10:30:00Z',
    notes: [
      {
        id: 'n1',
        content: 'Interested in enterprise package',
        createdAt: '2026-02-08T10:35:00Z',
        followUpDate: '2026-02-10'
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 234-5678',
    source: 'Landing Page',
    status: 'contacted',
    createdAt: '2026-02-07T14:20:00Z',
    notes: [
      {
        id: 'n2',
        content: 'Called on 02/08. Requested pricing information.',
        createdAt: '2026-02-08T09:15:00Z'
      },
      {
        id: 'n3',
        content: 'Follow up scheduled for next week',
        createdAt: '2026-02-08T09:20:00Z',
        followUpDate: '2026-02-15'
      }
    ]
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.w@startup.io',
    source: 'Newsletter Signup',
    status: 'converted',
    createdAt: '2026-02-05T16:45:00Z',
    notes: [
      {
        id: 'n4',
        content: 'Signed contract for annual subscription',
        createdAt: '2026-02-08T11:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'David Martinez',
    email: 'david.m@email.com',
    phone: '+1 (555) 345-6789',
    source: 'Google Ads',
    status: 'new',
    createdAt: '2026-02-09T08:15:00Z',
    notes: []
  }
];

function App() {
  const [view, setView] = useState<'customer' | 'admin-login' | 'admin-dashboard'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Lead['status']>('all');

  // Load leads from localStorage on mount
  useEffect(() => {
    const storedLeads = loadLeadsFromStorage();
    if (storedLeads && storedLeads.length > 0) {
      setLeads(storedLeads);
    } else {
      // Use initial mock data only if no stored data exists
      setLeads(initialLeads);
    }
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    if (leads.length > 0) {
      saveLeadsToStorage(leads);
    }
  }, [leads]);

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('customer');
    setSelectedLead(null);
    setShowAddForm(false);
  };

  const handleCustomerSubmit = (customerData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) => {
    const newLead: Lead = {
      id: Date.now().toString(),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      source: 'Website Contact Form',
      status: 'new',
      createdAt: new Date().toISOString(),
      notes: customerData.message ? [{
        id: `${Date.now()}-note`,
        content: `Initial message: ${customerData.message}`,
        createdAt: new Date().toISOString()
      }] : []
    };
    setLeads([newLead, ...leads]);
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'notes'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      notes: []
    };
    setLeads([newLead, ...leads]);
    setShowAddForm(false);
    setSelectedLead(newLead);
  };

  const handleEditLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'notes'>) => {
    if (!editingLead) return;
    
    setLeads(leads.map(lead =>
      lead.id === editingLead.id
        ? { ...lead, ...leadData }
        : lead
    ));

    if (selectedLead?.id === editingLead.id) {
      setSelectedLead({ ...selectedLead, ...leadData });
    }

    setEditingLead(null);
  };

  const handleExport = () => {
    exportLeadsToCSV(filteredLeads);
  };

  const handleUpdateStatus = (leadId: string, status: Lead['status']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status } : lead
    ));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status });
    }
  };

  const handleAddNote = (leadId: string, content: string, followUpDate?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      followUpDate
    };

    setLeads(leads.map(lead =>
      lead.id === leadId
        ? { ...lead, notes: [...lead.notes, newNote] }
        : lead
    ));

    if (selectedLead?.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        notes: [...selectedLead.notes, newNote]
      });
    }
  };

  const handleDeleteNote = (leadId: string, noteId: string) => {
    setLeads(leads.map(lead =>
      lead.id === leadId
        ? { ...lead, notes: lead.notes.filter(note => note.id !== noteId) }
        : lead
    ));

    if (selectedLead?.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        notes: selectedLead.notes.filter(note => note.id !== noteId)
      });
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(leads.filter(lead => lead.id !== leadId));
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
    }
  };

  // Customer view
  if (view === 'customer') {
    return (
      <LandingPage
        onSubmitLead={handleCustomerSubmit}
        onSwitchToAdmin={() => setView('admin-login')}
      />
    );
  }

  // Admin login view
  if (view === 'admin-login') {
    return <AuthGuard onLogin={handleLogin} />;
  }

  // Admin dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">CRM Dashboard</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add Lead
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <Dashboard leads={leads} />

        {/* Search and Filter */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExport={handleExport}
        />

        {showAddForm && (
          <div className="mb-6">
            <AddLeadForm
              onAddLead={handleAddLead}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LeadList
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedLead ? (
              <LeadDetails
                lead={selectedLead}
                onUpdateStatus={handleUpdateStatus}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onDeleteLead={handleDeleteLead}
                onEdit={() => setEditingLead(selectedLead)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Select a lead to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Lead Modal */}
      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onSave={handleEditLead}
          onClose={() => setEditingLead(null)}
        />
      )}
    </div>
  );
}

export default App;