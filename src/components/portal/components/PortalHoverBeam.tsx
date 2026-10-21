import React from 'react';

export interface PortalHoverBeamProps {
  pathRef: React.RefObject<SVGPathElement>;
}

export const PortalHoverBeam: React.FC<PortalHoverBeamProps> = ({ pathRef }) => {
  return (
    <svg
      id="hover-connection-svg"
      className="fixed inset-0 w-full h-full pointer-events-none z-10 hidden lg:block overflow-visible"
    >
      <defs>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#16382c" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        id="hover-beam-path"
        ref={pathRef}
        d=""
        fill="none"
        stroke="url(#beamGrad)"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="opacity-0 transition-opacity duration-200"
      />
    </svg>
  );
};
