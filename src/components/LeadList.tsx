import { Lead } from '../App';
import { Mail, Phone, Calendar } from 'lucide-react';

interface LeadListProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700'
};

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted'
};

export function LeadList({ leads, selectedLead, onSelectLead }: LeadListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-semibold text-gray-900">Leads ({leads.length})</h2>
      </div>

      <div className="divide-y divide-gray-200 max-h-[calc(100vh-280px)] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No leads yet. Add your first lead to get started.
          </div>
        ) : (
          leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
                selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{lead.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                  {statusLabels[lead.status]}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Source: {lead.source}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
