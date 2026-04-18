import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StatusTimeline from '../../components/ui/StatusTimeline';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = await user.getIdToken();
        const response = await axios.get('/api/proposals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProposals(response.data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
        setError(err.response?.data?.message || err.message || "Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return { color: 'text-green-500', icon: CheckCircle2, label: 'Approved' };
      case 'rejected':
        return { color: 'text-red-500', icon: XCircle, label: 'Rejected' };
      case 'review_requested':
        return { color: 'text-yellow-500', icon: AlertCircle, label: 'Revision Needed' };
      case 'in_process':
        return { color: 'text-blue-500', icon: Clock, label: 'In Review' };
      default:
        return { color: 'text-text-muted', icon: FileText, label: 'Draft' };
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold">Welcome, {profile?.name || 'Student'}!</h1>
          <p className="text-text-secondary mt-2">Track and manage your event submissions</p>
        </div>
        <Link to="/proposals/new" className="btn-primary flex items-center gap-2 px-6">
          <Plus size={20} />
          Create New Proposal
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-text-muted">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold">No proposals yet</h2>
          <p className="text-text-muted max-w-sm mx-auto">
            Ready to create your first event? Start by clicking the "Create New Proposal" button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {proposals.map((proposal) => {
            const status = getStatusStyle(proposal.status);
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={proposal.id} 
                className="glass-card hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/proposals/${proposal.id}`)}
              >
                <div className="p-6 space-y-6">
                  {/* Card Top */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {proposal.formData?.eventName || 'Untitled Event'}
                      </h3>
                      <p className="text-sm text-text-muted font-medium">
                        {proposal.formData?.clubName || 'Unknown Club'} • {proposal.proposalId}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ${status.color}`}>
                      <StatusIcon size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">{status.label}</span>
                    </div>
                  </div>

                  {/* Status Timeline Component */}
                  <StatusTimeline approvals={proposal.approvals} />

                  {/* Card Footer */}
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-text-muted">
                      Updated {new Date(proposal.updatedAt?._seconds * 1000).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      {(proposal.status === 'draft' || proposal.status === 'review_requested') && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/proposals/edit/${proposal.id}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition-all border border-blue-500/20"
                        >
                          Edit
                        </button>
                      )}
                      <div className="flex items-center gap-1 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Details
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
