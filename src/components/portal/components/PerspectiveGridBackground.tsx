import React, { forwardRef } from 'react';

export interface PerspectiveGridBackgroundProps {}

export const PerspectiveGridBackground = forwardRef<HTMLDivElement, PerspectiveGridBackgroundProps>(
  (_props, ref) => {
    return (
      <>
        <div id="perspective-grid-viewport">
          <div id="animated-grid-bg" ref={ref}>
            <div id="perspective-grid-plane"></div>
          </div>
        </div>
        <div id="animated-grid-vignette"></div>
      </>
    );
  }
);

PerspectiveGridBackground.displayName = 'PerspectiveGridBackground';
