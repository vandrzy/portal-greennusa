import React from 'react';

export interface PortalThreeSphereStageProps {
  stageRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  children?: React.ReactNode;
}

export const PortalThreeSphereStage: React.FC<PortalThreeSphereStageProps> = ({
  stageRef,
  canvasRef,
  children,
}) => {
  return (
    <div
      id="right-sphere-stage"
      ref={stageRef}
      className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center overflow-visible"
    >
      {/* SVG CLEAN ROTATING RINGS */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 440 440"
        fill="none"
      >
        <circle
          cx="220"
          cy="220"
          r="172"
          stroke="#10b981"
          strokeOpacity="0.18"
          strokeWidth="1.2"
          strokeDasharray="6 6"
          className="svg-clean-ring"
        />
        <circle cx="220" cy="220" r="196" stroke="#059669" strokeOpacity="0.10" strokeWidth="1" />
      </svg>

      {/* THREE.JS CANVAS */}
      <div className="absolute -inset-12 sm:-inset-16 pointer-events-none z-10 overflow-visible flex items-center justify-center">
        <canvas id="three-wireframe-canvas" ref={canvasRef} className="w-full h-full block"></canvas>
      </div>

      {children}
    </div>
  );
};
