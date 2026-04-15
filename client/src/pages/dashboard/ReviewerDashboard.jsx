import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ReviewerDashboard = () => {
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return { color: 'text-green-500', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { color: 'text-red-500', icon: XCircle, label: 'Rejected' };
      case 'review_requested': return { color: 'text-yellow-500', icon: AlertCircle, label: 'Changes Requested' };
      default: return { color: 'text-blue-500', icon: Clock, label: 'Pending Review' };
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
             Welcome, {profile?.name || 'Reviewer'}!
             <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold ml-2">
               {role === 'fic' ? 'Faculty' : 'Core'}
             </span>
          </h1>
          <p className="text-text-secondary mt-2">Manage incoming event proposals and provide feedback</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="glass-card h-48 animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-text-muted">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold">Clean Slate!</h2>
          <p className="text-text-muted max-w-sm mx-auto">
            You don't have any pending proposals to review at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map((proposal) => {
            const status = getStatusStyle(proposal.status);
            const StatusIcon = status.icon;
            const myDecision = proposal.approvals[user.uid]?.decision || 'pending';
            
            return (
              <div 
                key={proposal.id} 
                className="glass-card hover:border-primary/20 transition-all duration-300 group cursor-pointer overflow-hidden flex"
                onClick={() => navigate(`/proposals/${proposal.id}`)}
              >
                {/* Decision Indicator Bar */}
                <div className={`w-2 ${myDecision === 'approved' ? 'bg-green-500' : myDecision === 'pending' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                
                <div className="flex-1 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {proposal.formData?.eventName || 'Untitled Event'}
                      </h3>
                      <p className="text-sm text-text-muted">
                        Submitted by <span className="text-text-secondary font-semibold">{proposal.studentName}</span> • {proposal.proposalId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Your Decision</p>
                       <p className={`text-sm font-bold capitalize ${myDecision === 'pending' ? 'text-text-secondary italic' : status.color}`}>
                         {myDecision}
                       </p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 group-hover:bg-primary group-hover:text-white transition-all font-bold text-sm">
                      Review Proposal
                      <ChevronRight size={18} />
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

export default ReviewerDashboard;
