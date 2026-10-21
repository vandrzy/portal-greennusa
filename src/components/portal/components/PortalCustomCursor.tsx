import React from 'react';

export interface PortalCustomCursorProps {
  outerRef: React.RefObject<HTMLDivElement>;
  dotRef: React.RefObject<HTMLDivElement>;
}

export const PortalCustomCursor: React.FC<PortalCustomCursorProps> = ({ outerRef, dotRef }) => {
  return (
    <div id="custom-cursor-wrapper" className="hidden md:block">
      <div id="cursor-outer-circle" ref={outerRef}></div>
      <div id="cursor-center-dot" ref={dotRef}></div>
    </div>
  );
};
