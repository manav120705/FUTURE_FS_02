import { useState } from 'react';
import { Lead } from '../App';
import { Mail, Phone, Calendar, Trash2, Plus, Edit2 } from 'lucide-react';

interface LeadDetailsProps {
  lead: Lead;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddNote: (leadId: string, content: string, followUpDate?: string) => void;
  onDeleteNote: (leadId: string, noteId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onEdit: () => void;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  converted: 'bg-green-100 text-green-700 border-green-200'
};

export function LeadDetails({
  lead,
  onUpdateStatus,
  onAddNote,
  onDeleteNote,
  onDeleteLead,
  onEdit
}: LeadDetailsProps) {
  const [noteContent, setNoteContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteContent.trim()) {
      onAddNote(lead.id, noteContent, followUpDate || undefined);
      setNoteContent('');
      setFollowUpDate('');
    }
  };

  const handleDeleteLead = () => {
    onDeleteLead(lead.id);
    setShowDeleteConfirm(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Added {formatDate(lead.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit lead"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete lead"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800 mb-3">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteLead}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                  {lead.phone}
                </a>
              </div>
            )}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Source:</span> {lead.source}
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
          <div className="flex gap-2">
            {(['new', 'contacted', 'converted'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(lead.id, status)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                  lead.status === status
                    ? statusColors[status]
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Notes & Follow-ups */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notes & Follow-ups</h3>
          
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!noteContent.trim()}
                className="self-end inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {lead.notes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No notes yet</p>
            ) : (
              lead.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-800">{note.content}</p>
                      {note.followUpDate && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1 inline-flex">
                          <Calendar className="w-3 h-3" />
                          <span>Follow up: {formatDate(note.followUpDate)}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDateTime(note.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteNote(lead.id, note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}