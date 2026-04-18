import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Calendar, 
  Target, 
  DollarSign, 
  Truck, 
  MapPin, 
  Layers,
  Award
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DynamicTable from '../../components/ui/DynamicTable';

const STEPS = [
  { id: 1, title: 'Details', icon: Calendar },
  { id: 2, title: 'Concept', icon: Target },
  { id: 3, title: 'Sponsors', icon: Award },
  { id: 4, title: 'Budget', icon: DollarSign },
  { id: 5, title: 'Logistics', icon: Truck },
  { id: 6, title: 'Venue', icon: MapPin },
  { id: 7, title: 'Review', icon: Layers },
];

const NewProposal = ({ isEdit = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [proposalId, setProposalId] = useState(editId || null);

  // Load existing data if editing
  useEffect(() => {
    if (editId) {
      const fetchEditData = async () => {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(`/api/proposals/${editId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { formData: loadedData } = res.data;
          if (loadedData) {
             setFormData(prev => ({ ...prev, ...loadedData }));
          }
        } catch (err) {
          console.error("Error loading proposal for edit:", err);
          alert("Failed to load proposal data");
        }
      };
      fetchEditData();
    }
  }, [editId, user]);

  // Form State
  const [formData, setFormData] = useState({
    eventName: '',
    clubName: '',
    eventEdition: '',
    eventDate: '',
    eventDuration: '',
    expectedFootfall: 0,
    eventCategory: 'Technical',
    ficId: '',
    ksacCoreIds: [],
    about: '',
    details: '',
    vision: '',
    pastSponsors: [],
    budget: [],
    logistics: [],
    venue: []
  });

  const [availableFICs, setAvailableFICs] = useState([]);
  const [availableCore, setAvailableCore] = useState([]);

  // Fetch Reviewers on Load
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const token = await user.getIdToken();
        const fics = await axios.get('/api/auth/role/fic', { headers: { Authorization: `Bearer ${token}` } });
        const core = await axios.get('/api/auth/role/ksac_core', { headers: { Authorization: `Bearer ${token}` } });
        setAvailableFICs(fics.data);
        setAvailableCore(core.data);
      } catch (err) {
        console.error("Error fetching reviewers:", err);
      }
    };
    fetchReviewers();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      if (proposalId) {
        await axios.put(`/api/proposals/${proposalId}`, { formData, isDraft: true }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const res = await axios.post('/api/proposals', { 
          ficId: formData.ficId, 
          ksacCoreIds: formData.ksacCoreIds, 
          formData, 
          isDraft: true 
        }, { headers: { Authorization: `Bearer ${token}` } });
        setProposalId(res.data.proposalId);
      }
    } catch (err) {
      console.error("Draft save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Validation for Step 1
    if (currentStep === 1) {
      if (!formData.ficId) {
        alert("Please select a Faculty In-Charge (FIC)");
        return;
      }
      if (formData.ksacCoreIds.length !== 3) {
        alert("Please select exactly 3 KSAC Core members");
        return;
      }
    }

    await saveAsDraft();
    if (currentStep < 7) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      // Final submission (not draft)
      if (proposalId) {
        await axios.put(`/api/proposals/${proposalId}`, { formData, isDraft: false }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/proposals', { 
          ficId: formData.ficId, 
          ksacCoreIds: formData.ksacCoreIds, 
          formData, 
          isDraft: false 
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      navigate('/dashboard/student');
    } catch (err) {
      console.error("Submission failed:", err);
      const msg = err.response?.data?.message || "Failed to submit. Please check your data.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-6 bg-[radial-gradient(circle_at_top_right,rgba(23,209,90,0.03)_0%,transparent_50%)]">
      <div className="w-full max-w-5xl">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-12 relative px-4">
          <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-white/5 -translate-y-1/2 -z-10"></div>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted ? 'bg-primary border-primary text-white' : 
                  isActive ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(23,209,90,0.3)]' : 
                  'bg-background border-white/10 text-text-muted'
                }`}>
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="glass-card min-h-[500px] p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Step Renderings */}
              {currentStep === 1 && (
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold">Event Basics</h2>
                    <p className="text-text-secondary text-sm">Let's start with the fundamental details of your event.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Event Name</label>
                    <input className="glass-input w-full" value={formData.eventName} onChange={(e) => handleInputChange('eventName', e.target.value)} placeholder="e.g. InnovateX 2024" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Club/Society Name</label>
                    <input className="glass-input w-full" value={formData.clubName} onChange={(e) => handleInputChange('clubName', e.target.value)} placeholder="e.g. KSAC Robotics Club" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">FIC (Faculty In-Charge)</label>
                    <select className="glass-input w-full bg-surface" value={formData.ficId} onChange={(e) => handleInputChange('ficId', e.target.value)}>
                      <option value="">Select FIC</option>
                      {availableFICs.map(f => <option key={f.uid} value={f.uid}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">KSAC Core (Pick 3 of 4)</label>
                    <div className="flex gap-2 flex-wrap">
                      {availableCore.map(c => (
                        <button 
                          key={c.uid}
                          type="button"
                          onClick={() => {
                            const current = formData.ksacCoreIds;
                            if (current.includes(c.uid)) {
                              handleInputChange('ksacCoreIds', current.filter(id => id !== c.uid));
                            } else if (current.length < 3) {
                              handleInputChange('ksacCoreIds', [...current, c.uid]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            formData.ksacCoreIds.includes(c.uid) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Concept & Vision</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">About the Event</label>
                    <textarea className="glass-input w-full min-h-[120px]" value={formData.about} onChange={(e) => handleInputChange('about', e.target.value)} placeholder="Provide a brief overview..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Vision and Goals</label>
                    <textarea className="glass-input w-full min-h-[120px]" value={formData.vision} onChange={(e) => handleInputChange('vision', e.target.value)} placeholder="What are the key objectives?" />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Past Sponsors</h2>
                  <p className="text-text-secondary text-sm">List previous sponsors to show established industry relations.</p>
                  <DynamicTable 
                    columns={['Sponsor Name', 'Amount (₹)', 'Year', 'Type']}
                    rows={formData.pastSponsors}
                    onChange={(rows) => handleInputChange('pastSponsors', rows)}
                    schema={{ sponsorName: '', amount: '', year: '', type: 'Gold' }}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Tentative Budget</h2>
                  <DynamicTable 
                    columns={['Item', 'Qty', 'Unit Cost', 'Total', 'Notes']}
                    rows={formData.budget}
                    onChange={(rows) => handleInputChange('budget', rows)}
                    schema={{ item: '', quantity: 0, unitCost: 0, totalCost: 0, notes: '' }}
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Logistics Requirements</h2>
                  <DynamicTable 
                    columns={['Item', 'Qty', 'Purpose', 'Provider']}
                    rows={formData.logistics}
                    onChange={(rows) => handleInputChange('logistics', rows)}
                    schema={{ item: '', quantity: 0, purpose: '', providedBy: 'College' }}
                  />
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Venue Requirements</h2>
                  <DynamicTable 
                    columns={['Requirement', 'Specification', 'Duration', 'Remarks']}
                    rows={formData.venue}
                    onChange={(rows) => handleInputChange('venue', rows)}
                    schema={{ requirement: '', specification: '', duration: '', remarks: '' }}
                  />
                </div>
              )}

              {/* ... other steps ... */}
              {currentStep === 7 && (
                <div className="space-y-8 text-center py-12">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                      <Save size={32} />
                   </div>
                   <h2 className="text-3xl font-bold">Ready to Submit?</h2>
                   <p className="text-text-secondary max-w-md mx-auto">
                     Review your data carefully. Once submitted, the proposal will go to the FIC and KSAC Core for review.
                   </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-text-muted italic">
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  Saving draft...
                </>
              ) : (
                <>
                  <Check size={14} className="text-green-500" />
                  All progress saved
                </>
              )}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/5 text-text-secondary'
                }`}
              >
                <ChevronLeft size={18} />
                Back
              </button>
              
              {currentStep === 7 ? (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary min-w-[140px]"
                >
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2 px-8 py-2.5"
                >
                  Next Step
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProposal;
