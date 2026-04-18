import React, { useState, useEffect, useRef } from 'react';

const EVENTS = [
  { id: "01", name: "KIITMUN", image: "/photos/479697275_1190732002438388_627179603550390800_n.jpg" },
  { id: "02", name: "KIITFEST", image: "/photos/480321028_1194235982087990_7860108155487454201_n.jpg" },
  { id: "03", name: "TEDx KIIT", image: "/photos/480909620_1200939471417641_4037515895507698992_n.jpg" },
  { id: "04", name: "Convocation", image: "/photos/481230724_1201165661395022_2507318876534933120_n.jpg" },
  { id: "05", name: "Annual Meet", image: "/photos/481767622_1201133934731528_741848594955274261_n.jpg" },
  { id: "06", name: "Star Night", image: "/photos/482005919_1201079841403604_1359278385822114259_n.jpg" },
  { id: "07", name: "Cultural Night", image: "/photos/488773398_1228821671962754_121279698391982468_n.jpg" }
];

const PhotoCarousel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const AUTOPLAY_DURATION = 5000;

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [isPaused, activeTab]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % EVENTS.length);
      }, AUTOPLAY_DURATION);
    }
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
    startTimer();
  };

  const currentEvent = EVENTS[activeTab];

  return (
    <section 
      className="relative w-full min-h-[580px] flex items-center bg-[#0a0a0a] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        {EVENTS.map((event, idx) => (
          <img
            key={`bg-${event.id}`}
            src={event.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              idx === activeTab ? 'opacity-40' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-center">
          
          {/* Left: Navigation & Branding */}
          <div className="space-y-12">
            <div>
              <h2 className="text-5xl font-bold tracking-tight">
                Our <span className="text-primary italic">Events.</span>
              </h2>
            </div>

            {/* Numbers List - Desktop/Tablet */}
            <div className="hidden md:flex flex-col gap-6">
              {EVENTS.map((event, idx) => {
                const isActive = idx === activeTab;
                return (
                  <div 
                    key={event.id}
                    onClick={() => handleTabClick(idx)}
                    className="flex items-center cursor-pointer group/item"
                  >
                    <div className={`w-[72px] h-[72px] flex items-center justify-center border transition-all duration-300 ${
                      isActive 
                      ? 'border-primary bg-primary/5 scale-105 shadow-[0_0_20px_rgba(23,209,90,0.15)]' 
                      : 'border-white/5 hover:border-white/20'
                    }`}>
                      <span className={`text-2xl font-black ${
                        isActive ? 'text-white' : 'text-[#4b5563] group-hover/item:text-text-secondary'
                      }`}>
                        {event.id}
                      </span>
                    </div>
                    {isActive && (
                      <div className="ml-6 animate-slide-right">
                        <p className="text-2xl font-bold text-white tracking-tight">{event.name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden space-y-6">
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {EVENTS.map((event, idx) => {
                  const isActive = idx === activeTab;
                  return (
                    <button 
                      key={event.id}
                      onClick={() => handleTabClick(idx)}
                      className={`flex-shrink-0 w-14 h-14 flex items-center justify-center border text-lg font-black transition-all ${
                        isActive ? 'border-primary text-white bg-primary/10' : 'border-white/5 text-[#4b5563]'
                      }`}
                    >
                      {event.id}
                    </button>
                  );
                })}
              </div>
              <div key={activeTab} className="animate-slide-up">
                <p className="text-2xl font-bold text-white italic">{currentEvent.name}</p>
              </div>
            </div>
          </div>

          {/* Right: Floating Focal Card */}
          <div className="relative">
            <div className="relative aspect-[4/3] lg:w-[520px] lg:h-[380px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-primary/20 transition-colors">
               {EVENTS.map((event, idx) => (
                 <img
                   key={`card-${event.id}`}
                   src={event.image}
                   alt={event.name}
                   className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                     idx === activeTab ? 'opacity-100 scale-100' : 'opacity-0 scale-110 rotate-1'
                   }`}
                 />
               ))}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 blur-3xl -z-10 rounded-full"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 blur-3xl -z-10 rounded-full"></div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.4s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
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

export default PhotoCarousel;
