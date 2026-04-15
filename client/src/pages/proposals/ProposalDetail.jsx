import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Printer, 
  Clock, 
  ChevronLeft, 
  Eye,
  Calendar,
  Users,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StatusTimeline from '../../components/ui/StatusTimeline';
import ReviewActionPanel from '../../components/reviewer/ReviewActionPanel';

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`/api/proposals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProposal(res.data);
    } catch (err) {
      console.error("Error fetching proposal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async ({ decision, comment }) => {
    setReviewLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.patch(`/api/proposals/${id}/review`, 
        { decision, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProposal(); // Refresh data
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`/api/proposals/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (!proposal) return <div className="p-20 text-center">Proposal not found.</div>;

  const isReviewer = role === 'fic' || role === 'ksac_core';
  const myDecision = proposal.approvals[user.uid]?.decision || 'pending';

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-6 gap-8">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Breadcrumbs & Actions */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-semibold"
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowPdf(!showPdf)}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Eye size={18} />
              {showPdf ? 'Hide Preview' : 'Preview PDF'}
            </button>
            <button 
              onClick={downloadPdf}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold">{proposal.formData.eventName}</h1>
                  <p className="text-text-secondary">{proposal.formData.clubName} • {proposal.proposalId}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-white/5 font-bold uppercase tracking-widest text-xs border border-white/10`}>
                  {proposal.status.replace('_', ' ')}
                </div>
              </div>

              <StatusTimeline approvals={proposal.approvals} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Duration</p>
                   <p className="text-sm font-semibold">{proposal.formData.eventDuration}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Footfall</p>
                   <p className="text-sm font-semibold">{proposal.formData.expectedFootfall}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Category</p>
                   <p className="text-sm font-semibold">{proposal.formData.eventCategory}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Date</p>
                   <p className="text-sm font-semibold">{proposal.formData.eventDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info size={20} />
                  <h3 className="font-bold">About & Vision</h3>
                </div>
                <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-text-muted mb-2">The Concept</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{proposal.formData.about}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-text-muted mb-2">The Vision</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{proposal.formData.vision}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Showcase */}
            {['budget', 'logistics', 'venue'].map((section) => (
              <div key={section} className="glass-card p-8 space-y-4">
                <h3 className="text-xl font-bold capitalize">{section} Requirements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white/5 text-text-muted uppercase text-[10px] tracking-widest">
                        {proposal.formData[section]?.[0] && Object.keys(proposal.formData[section][0]).map(key => (
                          <th key={key} className="px-4 py-3">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {proposal.formData[section]?.map((row, i) => (
                        <tr key={i} className="hover:bg-white/2">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-3 text-text-secondary">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-8">
            {/* Review Panel for Reviewers */}
            {(isReviewer && proposal.status === 'in_process') ? (
              <ReviewActionPanel 
                onReview={handleReview} 
                loading={reviewLoading} 
                currentDecision={myDecision}
              />
            ) : (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-bold italic">Process Status</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                  <Clock className="text-primary" />
                  <div>
                    <p className="text-xs font-bold text-text-muted">Last Activity</p>
                    <p className="text-sm font-semibold">{new Date(proposal.updatedAt?._seconds * 1000).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Sidebar Preview (Toggled) */}
            {showPdf && (
              <div className="glass-card overflow-hidden h-[600px] border-primary/30">
                <iframe 
                  src={`/api/proposals/${id}/pdf`} 
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
