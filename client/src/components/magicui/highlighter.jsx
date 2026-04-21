import React from 'react';

export const Highlighter = ({ 
  children, 
  action = "highlight", 
  color = "#22c55e", 
  className = "" 
}) => {
  if (action === "underline") {
    return (
      <span className={`relative inline-block ${className}`}>
        {children}
        <span 
          className="absolute -bottom-1 left-0 w-full h-[4px] rounded-full opacity-80"
          style={{ backgroundColor: color }}
        />
      </span>
    );
  }

  return (
    <span 
      className={`px-2 py-0.5 rounded-sm font-bold text-black mx-1 inline-block transform -rotate-1 shadow-lg ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
};

export default Highlighter;
