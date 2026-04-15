import React from 'react';
import { Check, Clock, X, RotateCcw } from 'lucide-react';

/**
 * Visual timeline showing the status of the 4 reviewers.
 * @param {Object} approvals - The approvals object from the proposal.
 */
const StatusTimeline = ({ approvals }) => {
  if (!approvals) return null;

  const reviewers = Object.entries(approvals).map(([uid, data]) => ({
    uid,
    ...data
  }));

  // Sort: FIC first, then Core members
  const sortedReviewers = reviewers.sort((a, b) => (a.role === 'fic' ? -1 : 1));

  const getStatusConfig = (decision) => {
    switch (decision) {
      case 'approved':
        return { icon: Check, color: 'bg-green-500', text: 'Approved', border: 'border-green-500' };
      case 'rejected':
        return { icon: X, color: 'bg-red-500', text: 'Rejected', border: 'border-red-500' };
      case 'review_requested':
        return { icon: RotateCcw, color: 'bg-yellow-500', text: 'Changes Requested', border: 'border-yellow-500' };
      default:
        return { icon: Clock, color: 'bg-white/10', text: 'Pending', border: 'border-white/10' };
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Review Progress</p>
      <div className="flex gap-4">
        {sortedReviewers.map((rev) => {
          const config = getStatusConfig(rev.decision);
          const Icon = config.icon;
          
          return (
            <div key={rev.uid} className="flex-1 group relative">
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                rev.decision === 'pending' ? 'bg-white/2 border-white/5' : `${config.border} bg-white/2`
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${config.color}`}>
                    <Icon size={12} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                    {rev.role === 'fic' ? 'FIC' : 'CORE'}
                  </span>
                </div>
                <p className={`text-[11px] font-bold ${rev.decision === 'pending' ? 'text-text-secondary' : 'text-white'}`}>
                  {config.text}
                </p>
              </div>

              {/* Tooltip for comments if any */}
              {rev.comment && (
                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-surface border border-white/10 rounded-lg text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl pointer-events-none">
                  "{rev.comment}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
