import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Clock, 
  ChevronLeft, 
  Eye,
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
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  useEffect(() => {
    if (showPdf && !pdfUrl) {
      const fetchPdf = async () => {
        try {
          const token = await user.getIdToken();
          const response = await axios.get(`/api/proposals/${id}/pdf`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          });
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          setPdfUrl(url);
        } catch (err) {
          console.error("PDF preview failed:", err);
        }
      };
      fetchPdf();
    }
  }, [showPdf, id, user, pdfUrl]);

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

  if (!proposal) return <div className="p-20 text-center text-text-muted">Proposal not found.</div>;

  const isReviewer = role === 'fic' || role === 'ksac_core';
  const myDecision = proposal.approvals?.[user?.uid]?.decision || 'pending';
  const canEdit = role === 'student' && (proposal.status === 'draft' || proposal.status === 'review_requested');

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-6 gap-8 bg-[radial-gradient(circle_at_top_right,rgba(23,209,90,0.02)_0%,transparent_50%)]">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Breadcrumbs & Actions */}
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-semibold ml-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          
          <div className="flex gap-3">
            {canEdit && (
              <button 
                onClick={() => navigate(`/proposals/edit/${id}`)}
                className="btn-primary py-2 px-5 text-sm flex items-center gap-2 !bg-blue-500 hover:!bg-blue-600 border-none"
              >
                <FileText size={18} />
                Edit Submission
              </button>
            )}
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
                  <h1 className="text-3xl font-bold tracking-tight">{proposal.formData.eventName}</h1>
                  <p className="text-text-secondary text-base font-medium">{proposal.formData.clubName} • {proposal.proposalId}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-white/5 font-black uppercase tracking-widest text-[10px] border border-white/10 ${
                  proposal.status === 'draft' ? 'text-text-muted' : 
                  proposal.status === 'accepted' ? 'text-primary' : 
                  proposal.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {proposal.status.replace('_', ' ')}
                </div>
              </div>

              <StatusTimeline approvals={proposal.approvals} />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Duration', value: proposal.formData.eventDuration },
                  { label: 'Footfall', value: proposal.formData.expectedFootfall },
                  { label: 'Category', value: proposal.formData.eventCategory },
                  { label: 'Date', value: proposal.formData.eventDate }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5 hover:border-primary/20 transition-all">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{item.label}</p>
                    <p className="text-sm font-bold text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info size={20} />
                  <h3 className="font-bold">About & Vision</h3>
                </div>
                <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase text-text-muted mb-2 tracking-widest">The Concept</h4>
                    <p className="text-sm leading-relaxed text-text-secondary font-medium">{proposal.formData.about}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-text-muted mb-2 tracking-widest">The Vision</h4>
                    <p className="text-sm leading-relaxed text-text-secondary font-medium">{proposal.formData.vision}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Showcase */}
            {['budget', 'logistics', 'venue'].map((section) => (
              <div key={section} className="glass-card p-8 space-y-4">
                <h3 className="text-xl font-bold capitalize tracking-tight">{section} Requirements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white/5 text-text-muted uppercase text-[10px] font-black tracking-[0.2em]">
                        {proposal.formData[section]?.[0] && Object.keys(proposal.formData[section][0]).map(key => (
                          <th key={key} className="px-4 py-4">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {proposal.formData[section]?.map((row, i) => (
                        <tr key={i} className="hover:bg-white/2 transition-colors">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-4 text-text-secondary font-medium">{val}</td>
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
          <div className="space-y-8 lg:sticky lg:top-10">
            {/* Review Panel for Reviewers */}
            {(isReviewer && proposal.status === 'in_process') ? (
              <ReviewActionPanel 
                onReview={handleReview} 
                loading={reviewLoading} 
                currentDecision={myDecision}
              />
            ) : (
              <div className="glass-card p-6 space-y-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 blur-3xl"></div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-bold italic tracking-tight">Process Status</h3>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Last Activity</p>
                    <p className="text-sm font-bold">{new Date(proposal.updatedAt?._seconds * 1000).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Sidebar Preview (Toggled) */}
            {showPdf && pdfUrl && (
              <div className="glass-card overflow-hidden h-[700px] border-primary/40 shadow-2xl relative">
                <div className="absolute inset-0 bg-white shadow-inner">
                  <iframe 
                    src={`${pdfUrl}#toolbar=0`} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
