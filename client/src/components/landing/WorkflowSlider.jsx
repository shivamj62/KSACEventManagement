import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  {
    id: 0,
    label: "Submit a Proposal",
    tag: "FOR STUDENTS",
    heading: "Submit your event proposal in minutes.",
    body: "Fill out a guided 7-step form — event details, budget, logistics, and venue. Auto-saved at every step so you never lose progress.",
    image: "/images/submit_proposal.png"
  },
  {
    id: 1,
    label: "Track Approval",
    tag: "FOR STUDENTS",
    heading: "Know exactly where your proposal stands.",
    body: "A live 5-stage pipeline shows your proposal moving from Submitted to In Review to Accepted — with reviewer comments delivered by email at every transition.",
    image: "/images/track_approval.png"
  },
  {
    id: 2,
    label: "Review & Approve",
    tag: "FOR REVIEWERS",
    heading: "Review proposals without leaving the page.",
    body: "Open any assigned proposal, read the full PDF inline, then Approve, Request Changes, or Reject — all from a single dashboard.",
    image: "/images/review_approve.png"
  },
  {
    id: 3,
    label: "Auto-generated PDF",
    tag: "FOR EVERYONE",
    heading: "Every proposal becomes a professional PDF instantly.",
    body: "Submitted data is formatted into a branded KSAC proposal document automatically — no manual formatting required. Download anytime.",
    image: "/images/auto_pdf.png"
  }
];

const WorkflowSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const sectionRef = useRef(null);
  const AUTOPLAY_DURATION = 4000;

  // HARD FIX 1: MutationObserver to guard against any sneaky scroll jumps during DOM changes
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      const scrollY = window.scrollY;
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - scrollY) > 1) {
          window.scrollTo({ top: scrollY, behavior: "instant" });
        }
      });
    });

    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        // HARD FIX 2: Manual scroll lock during auto-advance
        const scrollY = window.scrollY;
        setActiveIndex((prev) => (prev + 1) % TABS.length);
        
        // Immediate restore before browser paint
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - scrollY) > 1) {
            window.scrollTo({ top: scrollY, behavior: "instant" });
          }
        });
      }, AUTOPLAY_DURATION);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % TABS.length);
      }, AUTOPLAY_DURATION);
    }
  };

  const currentTab = TABS[activeIndex];

  return (
    <section 
      ref={sectionRef}
      onFocus={(e) => e.preventDefault()}
      className="w-full max-w-6xl mx-auto py-20 px-6 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hidden Preload Cache */}
      <div className="hidden" aria-hidden="true">
        {TABS.map(tab => (
          <img key={`preload-${tab.id}`} src={tab.image} alt="" />
        ))}
      </div>

      {/* Horizontal Tabs */}
      <div className="flex gap-4 md:gap-8 mb-12 border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth pb-1">
        {TABS.map((tab, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(idx)}
              className={`relative pb-4 flex-shrink-0 transition-all duration-300 min-w-[120px] text-left`}
            >
              <span className={`text-xs font-black tracking-widest uppercase block mb-1 ${isActive ? 'text-primary' : 'text-text-muted/60'}`}>
                {`0${idx + 1}`}
              </span>
              <span className={`text-sm font-bold block ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                {tab.label}
              </span>
              
              {/* Animated Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden">
                 {isActive && (
                   <div 
                     key={idx} 
                     tabIndex={-1}
                     aria-hidden="true"
                     style={{ outline: "none", animationDuration: `${AUTOPLAY_DURATION}ms` }}
                     className="h-full bg-primary origin-left animate-progress-expand"
                   />
                 )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Slider Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Mobile: Image appears between Tabs and Text */}
        <div className="lg:hidden block">
            <div className={`relative h-[240px] w-full rounded-2xl overflow-hidden glass-card border-white/10`}>
               {TABS.map((tab, idx) => (
                 <img 
                   key={tab.id}
                   src={tab.image} 
                   alt={tab.label}
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                 />
               ))}
            </div>
        </div>

        {/* Left Column: Text Content - HARD FIX 3: Visibility-Toggle Pattern */}
        <div className="space-y-6 lg:text-left text-center relative min-h-[320px]">
          {TABS.map((tab, idx) => (
            <div 
              key={tab.id}
              aria-hidden={idx !== activeIndex}
              tabIndex={-1}
              style={{
                opacity: idx === activeIndex ? 1 : 0,
                pointerEvents: idx === activeIndex ? "auto" : "none",
                position: idx === activeIndex ? "relative" : "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transition: "opacity 0.4s ease-in-out, transform 0.4s ease-out",
                transform: idx === activeIndex ? "translateY(0)" : "translateY(10px)"
              }}
              className="space-y-4"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase border border-primary/20">
                {tab.tag}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.1]">
                {tab.heading}
              </h2>
              <p className="text-lg text-text-muted max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
                {tab.body}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Desktop Image */}
        <div className="hidden lg:block relative h-[400px] w-full rounded-2xl overflow-hidden glass-card border-white/10 shadow-2xl">
            {TABS.map((tab, idx) => (
              <img 
                key={tab.id}
                src={tab.image} 
                alt={tab.label}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${idx === activeIndex ? 'opacity-100 scale-100 grayscale-0' : 'opacity-0 scale-110 grayscale-[0.5]'}`}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-progress-expand {
          animation-name: progress-expand;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .animate-slide-up {
          animation-name: slide-up;
          animation-duration: 0.5s;
          animation-fill-mode: both;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default WorkflowSlider;
