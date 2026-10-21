import { EcosystemCategoryId, PortalFolderConfig, AppOrbitPosition } from '@/types';

export const PORTAL_FOLDERS: Record<EcosystemCategoryId, PortalFolderConfig> = {
  pemerintahan: {
    id: 'pemerintahan',
    title: 'Ekosistem Pemerintahan',
    subtitle: 'Solusi Digital Sektor Publik & Tata Kelola Daerah',
    color: '#16382c',
    tabColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  swasta: {
    id: 'swasta',
    title: 'Ekosistem Swasta & Bisnis',
    subtitle: 'Solusi Terintegrasi Ritel, Operasional & Manajemen Usaha',
    color: '#064e3b',
    tabColor: '#0d9488',
    glowColor: 'rgba(13, 148, 136, 0.35)',
  },
};

export const MAX_ORBITS = 3;
export const ORBIT_RING_CAPACITIES: number[] = [9, 12, 13];

export const ORBIT_RADII_BY_COUNT: Record<number, number[]> = {
  1: [232],
  2: [196, 268],
  3: [174, 228, 280],
};

export const getActiveOrbitCount = (total: number): number => {
  if (total <= 9) return 1;
  if (total <= 21) return 2;
  return 3;
};

export const distributeNodesAcrossOrbits = (total: number, orbitCount: number): number[] => {
  if (total <= 0) return [0];
  if (orbitCount === 1) return [total];

  const counts: number[] = new Array(orbitCount).fill(0);
  let remaining = total;

  for (let r = 0; r < orbitCount; r++) {
    if (r === orbitCount - 1) {
      counts[r] = remaining;
    } else {
      const cap = ORBIT_RING_CAPACITIES[r] || 9;
      const assigned = Math.min(cap, remaining);
      counts[r] = assigned;
      remaining -= assigned;
    }
  }
  return counts;
};

export interface OrbitNodeGeometry {
  ringIndex: number;
  angleRad: number;
  angleDeg: number;
  svgRadius: number;
  pctRadius: number;
  cx: string;
  cy: string;
  targetLeft: string;
  targetTop: string;
}

export const getOrbitNodeGeometry = (
  index: number,
  totalCount: number
): OrbitNodeGeometry => {
  const activeOrbitCount = getActiveOrbitCount(totalCount);
  const isMultiOrbit = activeOrbitCount > 1;
  const nodesPerRing = distributeNodesAcrossOrbits(totalCount, activeOrbitCount);
  const activeRadii = ORBIT_RADII_BY_COUNT[activeOrbitCount] || ORBIT_RADII_BY_COUNT[1];

  let ringIdx = 0;
  let indexInRing = index;

  for (let r = 0; r < nodesPerRing.length; r++) {
    if (indexInRing < nodesPerRing[r]) {
      ringIdx = r;
      break;
    }
    indexInRing -= nodesPerRing[r];
  }

  const countInThisRing = Math.max(1, nodesPerRing[ringIdx]);
  const svgRadius = activeRadii[ringIdx] || 232;
  const svgViewBoxSize = 600;
  const svgCenter = 300;
  const pctRadius = (svgRadius / svgViewBoxSize) * 100;

  const angleOffset =
    ringIdx % 2 === 0 && isMultiOrbit
      ? 180 / countInThisRing
      : ringIdx > 0
      ? 90 / countInThisRing
      : 0;
  const angleDeg = -90 + angleOffset + indexInRing * (360 / countInThisRing);
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    ringIndex: ringIdx + 1,
    angleRad,
    angleDeg,
    svgRadius,
    pctRadius,
    cx: (svgCenter + svgRadius * Math.cos(angleRad)).toFixed(2),
    cy: (svgCenter + svgRadius * Math.sin(angleRad)).toFixed(2),
    targetLeft: (50 + pctRadius * Math.cos(angleRad)).toFixed(3) + '%',
    targetTop: (50 + pctRadius * Math.sin(angleRad)).toFixed(3) + '%',
  };
};

export const getAppPositions = (count: number): AppOrbitPosition[] => {
  const positions: AppOrbitPosition[] = [];
  for (let i = 0; i < count; i++) {
    const geo = getOrbitNodeGeometry(i, count);
    positions.push({
      x: parseFloat(geo.cx),
      y: parseFloat(geo.cy),
    });
  }
  return positions;
};
