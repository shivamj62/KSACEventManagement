import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Send } from 'lucide-react';

/**
 * Action panel for reviewers to Approve, Reject, or Request Changes.
 * @param {Function} onReview - Callback with { decision, comment }
 */
const ReviewActionPanel = ({ onReview, loading, currentDecision }) => {
  const [decision, setDecision] = useState(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!decision) return;
    onReview({ decision, comment });
  };

  const DECISIONS = [
    { id: 'approved', label: 'Approve', color: 'green', icon: CheckCircle, description: 'Accept the proposal as is.' },
    { id: 'review_requested', label: 'Request Changes', color: 'yellow', icon: RotateCcw, description: 'Ask for specific modifications.' },
    { id: 'rejected', label: 'Reject', color: 'red', icon: XCircle, description: 'Decline the proposal entirely.' },
  ];

  return (
    <div className="glass-card p-6 border-primary/20 bg-primary/2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <h3 className="text-xl font-bold">Reviewer Action Panel</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DECISIONS.map((d) => {
            const Icon = d.icon;
            const isActive = decision === d.id;
            const colors = {
              green: 'border-green-500/30 text-green-500 bg-green-500/10',
              yellow: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10',
              red: 'border-red-500/30 text-red-500 bg-red-500/10'
            };

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDecision(d.id)}
                className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                  isActive ? colors[d.color] : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                <Icon size={24} className="mb-2" />
                <span className="text-sm font-bold">{d.label}</span>
                <span className="text-[10px] mt-1 opacity-70 leading-tight">{d.description}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">
            Reviewer Comments (Optional)
          </label>
          <textarea
            className="glass-input w-full min-h-[100px] text-sm"
            placeholder="Provide feedback to the student..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!decision || loading}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${
            (!decision || loading) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Submit Final Decision
              <Send size={18} />
            </>
          )}
        </button>
        
        {currentDecision && currentDecision !== 'pending' && (
          <p className="text-[10px] text-center text-text-muted italic">
            You already marked this proposal as <span className="text-primary font-bold">{currentDecision}</span>.
            Submitting again will update your decision.
          </p>
        )}
      </form>
    </div>
  );
};

export default ReviewActionPanel;
