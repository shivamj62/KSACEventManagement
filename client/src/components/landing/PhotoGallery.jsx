import React from 'react';
import Highlighter from '../magicui/highlighter';

const IMAGES = [
  "/images/479697275_1190732002438388_627179603550390800_n.jpg",
  "/images/480321028_1194235982087990_7860108155487454201_n.jpg",
  "/images/480909620_1200939471417641_4037515895507698992_n.jpg",
  "/images/481230724_1201165661395022_2507318876534933120_n.jpg",
  "/images/481767622_1201133934731528_741848594955274261_n.jpg",
  "/images/482005919_1201079841403604_1359278385822114259_n.jpg",
  "/images/488773398_1228821671962754_121279698391982468_n.jpg",
  "/images/WhatsApp Image 2026-04-19 at 03.48.22.jpeg"
];

const PhotoGallery = () => {
  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* SUB-SECTION A: Sticky heading + skewed scrolling images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative">
        {/* Left Column: Sticky Heading */}
        <div className="hidden lg:flex flex-col items-center justify-center sticky top-0 h-screen px-12 text-center">
          <div className="space-y-4 max-w-sm">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/80">OUR EVENTS</p>
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-[1.1]">
              Moments That<br />
              <span className="text-primary italic">Define Us.</span>
            </h2>
            <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-xs mx-auto">
              A glimpse into the events that bring KIIT together every year.
            </p>
          </div>
        </div>

        {/* Mobile Heading */}
        <div className="lg:hidden p-8 text-center space-y-4">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/80">OUR EVENTS</p>
          <h2 className="text-4xl font-semibold tracking-tighter">Moments That <span className="text-primary italic">Define Us.</span></h2>
        </div>

        {/* Right Column: Scrolling Images */}
        <div className="flex flex-col gap-2 py-10 px-8">
          {[0, 1, 2, 3].map((idx) => (
            <figure
              key={`section-a-${idx}`}
              className={`grid place-content-center py-6 transition-transform duration-1000 ${idx % 2 === 0 ? 'lg:-skew-x-12' : 'lg:skew-x-12'
                }`}
            >
              <img
                src={IMAGES[idx]}
                alt="Event moment"
                className="w-full lg:w-80 h-[450px] object-cover shadow-2xl"
              />
            </figure>
          ))}
        </div>
      </div>

      {/* SUB-SECTION B: Sticky scrolling images + sticky heading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 relative lg:px-8 border-t border-white/5">

        {/* Left Column: Sticky Stacking Images - CHANGED TO SCATTERED STACK */}
        <div className="relative">
          {[4, 5, 6, 7].map((idx, i) => {
            // Varied rotations and offsets for the "scattered" look
            const rotations = [2, -3, 4, -2];
            const xOffsets = [10, -15, 20, -10];
            const yOffsets = [-10, 20, -15, 10];

            return (
              <div
                key={`section-b-stack-${idx}`}
                style={{
                  position: "sticky",
                  top: 0,
                  height: "100vh",
                  zIndex: i + 1,
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none" // Allow clicking through to underlying images if needed
                }}
                className="px-4 lg:px-0"
              >
                <img
                  src={IMAGES[idx]}
                  alt="Stacked event"
                  style={{
                    width: "384px",
                    height: "384px",
                    objectFit: "cover",
                    borderRadius: "0.375rem",
                    transform: `scale(${1 - i * 0.02}) rotate(${rotations[i]}deg) translate(${xOffsets[i]}px, ${yOffsets[i]}px)`,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                    pointerEvents: "auto"
                  }}
                  className="border border-white/10"
                />
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Heading */}
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col items-center lg:items-end justify-center px-12 lg:text-right py-20 lg:py-0">
          <div className="max-w-md">
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tighter leading-[1.2] text-white">
              <Highlighter action="underline" color="#22c55e">
                Every event
              </Highlighter>
              {" "}tells<br />
              a story{" "}
              <Highlighter action="highlight" color="#22c55e">
                worth
              </Highlighter>
              {" "}
              <Highlighter action="highlight" color="#22c55e">
                remembering.
              </Highlighter>
            </h2>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PhotoGallery;
