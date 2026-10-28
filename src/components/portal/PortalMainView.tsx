'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePortalEcosystem } from '@/hooks/usePortalEcosystem';
import { WhatsAppFloatingButton } from '@/components/common/WhatsAppFloatingButton';

import { CUSTOM_SVG_ICONS } from './constants/portalSvgIcons';
import {
  CategoryKey,
  OrbitalAppItem,
  SERVICE_INFO,
  DEFAULT_COLOR_GRADS,
  DEFAULT_SPHERE_COLORS,
} from './constants/portalServices';

import { PerspectiveGridBackground } from './components/PerspectiveGridBackground';
import { PortalCustomCursor } from './components/PortalCustomCursor';
import { PortalHoverBeam } from './components/PortalHoverBeam';
import { PortalIntroOverlay } from './components/PortalIntroOverlay';
import { PortalFoldersHub } from './components/PortalFoldersHub';
import { PortalOrbitNodes } from './components/PortalOrbitNodes';
import { PortalThreeSphereStage } from './components/PortalThreeSphereStage';
import { PortalGlassCard } from './components/PortalGlassCard';
import { UnifiedEcosystemModal } from '@/components/modal/UnifiedEcosystemModal';
import { PortalToast } from './components/PortalToast';
import { CategoryType } from '@/types';

// Global Three.js / GSAP / Anime.js window typing
declare global {
  interface Window {
    THREE: any;
    gsap: any;
    anime: any;
  }
}

export const PortalMainView: React.FC = () => {
  const { apps, portalContent } = usePortalEcosystem();

  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [renderedCategory, setRenderedCategory] = useState<CategoryKey | null>(null);
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);
  const [isGlassCardVisible, setIsGlassCardVisible] = useState<boolean>(false);
  const [isPointing, setIsPointing] = useState<boolean>(false);
  const [showIntroOverlay, setShowIntroOverlay] = useState<boolean>(true);
  const [isDirModalOpen, setIsDirModalOpen] = useState<boolean>(false);
  const [catalogCategory, setCatalogCategory] = useState<CategoryType>('pemerintahan');
  const [toastMessage, setToastMessage] = useState<string>('Akun demo disalin');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [scriptsReady, setScriptsReady] = useState<boolean>(false);

  // Animation & DOM refs
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const gridBgRef = useRef<HTMLDivElement>(null);
  const orbitalRingsSvgRef = useRef<SVGSVGElement>(null);
  const foldersHubRef = useRef<HTMLDivElement>(null);
  const nodesContainerRef = useRef<HTMLDivElement>(null);
  const rightSphereStageRef = useRef<HTMLDivElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  const topStickerRef = useRef<HTMLDivElement>(null);
  const hoverBeamPathRef = useRef<SVGPathElement>(null);

  // Intro refs
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const introProgressBarRef = useRef<HTMLDivElement>(null);
  const introCoreBadgeRef = useRef<HTMLDivElement>(null);
  const introRing1Ref = useRef<SVGCircleElement>(null);
  const introRing2Ref = useRef<SVGCircleElement>(null);
  const folderGovRef = useRef<HTMLButtonElement>(null);
  const folderBizRef = useRef<HTMLButtonElement>(null);

  // Three.js mutable state & timers
  const wireframeSphereMeshRef = useRef<any>(null);
  const targetRotSpeedRef = useRef<number>(0.0035);
  const currentRotSpeedRef = useRef<number>(0.0035);
  const sphereSlowdownTimerRef = useRef<number | null>(null);
  const hideCardTimeoutRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const introTimelineRef = useRef<any>(null);
  const orbitNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Merge database apps with visual metadata
  const { govApps, bizApps, allAppsMap } = useMemo(() => {
    const gov: OrbitalAppItem[] = [];
    const biz: OrbitalAppItem[] = [];
    const map: Record<string, OrbitalAppItem> = {};

    apps.forEach((app, idx) => {
      const slug = app.id || `app-${app.dbId || idx}`;
      const isGov = app.category === 'pemerintahan';
      const colorGrad = DEFAULT_COLOR_GRADS[idx % DEFAULT_COLOR_GRADS.length];
      const sphereColor = DEFAULT_SPHERE_COLORS[idx % DEFAULT_SPHERE_COLORS.length];

      const item: OrbitalAppItem = {
        id: slug,
        dbId: app.dbId,
        shortName: app.name || app.title || 'Aplikasi',
        title: app.title || app.name || 'Aplikasi GreenNusa',
        badge: app.appType || (isGov ? 'Pemerintahan' : 'Swasta'),
        status: app.tagline || 'Aktif',
        colorGrad,
        sphereColor,
        svgKey: CUSTOM_SVG_ICONS[slug] ? slug : undefined,
        desc: app.description || 'Solusi digital terintegrasi dari GreenNusa Computindo.',
        features:
          Array.isArray(app.features) && app.features.length > 0
            ? app.features.slice(0, 4)
            : ['Integrasi cloud real-time', 'Keamanan data terjamin', 'Dukungan teknis berkala'],
        url: app.url || 'https://green-nusa.net',
        iconUrl: app.icon || app.iconPath || null,
      };

      if (isGov) {
        gov.push(item);
      } else {
        biz.push(item);
      }
      map[slug] = item;
    });

    Object.keys(SERVICE_INFO).forEach((k) => {
      map[k] = SERVICE_INFO[k];
    });

    return { govApps: gov, bizApps: biz, allAppsMap: map };
  }, [apps]);

  // Load external scripts (Three.js, GSAP, Anime.js, fonts, fontawesome)
  useEffect(() => {
    const ensureStylesheet = (id: string, href: string) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    ensureStylesheet(
      'gn-google-fonts',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap'
    );
    ensureStylesheet(
      'gn-fontawesome',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    );

    const loadScript = (src: string, globalKey: keyof Window): Promise<void> => {
      return new Promise((resolve) => {
        if (window[globalKey]) {
          resolve();
          return;
        }
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener('load', () => resolve());
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    };

    let isMounted = true;
    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js', 'anime')
    ]).then(() => {
      if (isMounted) {
        setScriptsReady(true);
      }
    });

    document.body.classList.add('has-custom-cursor');

    return () => {
      isMounted = false;
      document.body.classList.remove('has-custom-cursor');
      document.body.classList.remove('is-pointing');
    };
  }, []);

  // Sync cursor is-pointing
  useEffect(() => {
    if (isPointing) {
      document.body.classList.add('is-pointing');
    } else {
      document.body.classList.remove('is-pointing');
    }
  }, [isPointing]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  }, []);

  // Dynamic curved laser beam
  const drawHoverConnectionBeam = useCallback(
    (fromEl: HTMLElement | null, toEl: HTMLElement | null) => {
      const pathEl = hoverBeamPathRef.current;
      if (!pathEl || !fromEl || !toEl || window.innerWidth < 1024) return;

      const r1 = fromEl.getBoundingClientRect();
      const r2 = toEl.getBoundingClientRect();

      const x1 = r1.left + r1.width / 2;
      const y1 = r1.top + r1.height / 2;
      const x2 = r2.left + 26;
      const y2 = r2.top + r2.height / 2;

      const cx = (x1 + x2) / 2;
      const cy = Math.min(y1, y2) - 42;

      pathEl.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
      pathEl.classList.remove('opacity-0');
      pathEl.classList.add('opacity-100');
    },
    []
  );

  const hideGlassCard = useCallback(() => {
    setIsGlassCardVisible(false);
    const pathEl = hoverBeamPathRef.current;
    if (pathEl) {
      pathEl.classList.remove('opacity-100');
      pathEl.classList.add('opacity-0');
    }
    if (wireframeSphereMeshRef.current && window.THREE) {
      wireframeSphereMeshRef.current.material.color.setHex(0x10b981);
      targetRotSpeedRef.current = 0.0035;
    }
  }, []);

  const scheduleHideGlassCard = useCallback(() => {
    if (hideCardTimeoutRef.current) {
      window.clearTimeout(hideCardTimeoutRef.current);
    }
    hideCardTimeoutRef.current = window.setTimeout(() => {
      hideGlassCard();
    }, 95);
  }, [hideGlassCard]);

  const updateGlassCardOnHover = useCallback(
    (appId: string, triggerElement: HTMLElement | null) => {
      const app = allAppsMap[appId];
      if (!app) return;

      if (hideCardTimeoutRef.current) {
        window.clearTimeout(hideCardTimeoutRef.current);
      }

      setHoveredAppId(appId);
      setIsGlassCardVisible(true);

      if (window.gsap && topStickerRef.current) {
        window.gsap.fromTo(
          topStickerRef.current,
          { scale: 0.75, rotation: -12 },
          { scale: 1, rotation: 6, duration: 0.36, ease: 'back.out(1.6)' }
        );
      }

      if (wireframeSphereMeshRef.current && window.THREE) {
        wireframeSphereMeshRef.current.material.color.setHex(app.sphereColor || 0x10b981);
        targetRotSpeedRef.current = 0.018;
        if (sphereSlowdownTimerRef.current) {
          window.clearTimeout(sphereSlowdownTimerRef.current);
        }
        sphereSlowdownTimerRef.current = window.setTimeout(() => {
          targetRotSpeedRef.current = 0.0035;
        }, 480);
      }

      if (triggerElement && glassCardRef.current) {
        drawHoverConnectionBeam(triggerElement, glassCardRef.current);
      }
    },
    [allAppsMap, drawHoverConnectionBeam]
  );

  const playPortalEntryAnimation = useCallback(() => {
    setShowIntroOverlay(true);

    requestAnimationFrame(() => {
      const overlay = introOverlayRef.current;
      const progressBar = introProgressBarRef.current;
      const coreBadge = introCoreBadgeRef.current;
      if (!overlay || !window.gsap) return;

      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      if (progressBar) progressBar.style.width = '0%';

      if (window.anime) {
        if (introRing1Ref.current) {
          window.anime({
            targets: introRing1Ref.current,
            rotate: '1turn',
            duration: 9000,
            loop: true,
            easing: 'linear'
          });
        }
        if (introRing2Ref.current) {
          window.anime({
            targets: introRing2Ref.current,
            rotate: '-1turn',
            duration: 6000,
            loop: true,
            easing: 'linear'
          });
        }
      }

      const tl = window.gsap.timeline({
        onComplete: () => {
          setShowIntroOverlay(false);
        }
      });

      tl.fromTo(
        coreBadge,
        { scale: 0.65, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(1.6)' }
      )
        .to(progressBar, { width: '100%', duration: 0.85, ease: 'power2.inOut' }, '-=0.15')
        .to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            const folderEls = [folderGovRef.current, folderBizRef.current].filter(Boolean);
            if (folderEls.length) {
              window.gsap.fromTo(
                folderEls,
                { y: 24, scale: 0.8, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
              );
            }
          }
        });

      introTimelineRef.current = tl;
    });
  }, []);

  const closeFolderOrbit = useCallback(() => {
    setActiveCategory(null);
    hideGlassCard();

    const container = nodesContainerRef.current;
    if (!container) {
      setRenderedCategory(null);
      return;
    }

    const nodes = container.querySelectorAll('.orbit-app-node');
    if (nodes.length && window.gsap) {
      window.gsap.killTweensOf(nodes);
      window.gsap.to(nodes, {
        left: '50%',
        top: '50%',
        scale: 0.15,
        opacity: 0,
        duration: 0.38,
        stagger: 0.015,
        ease: 'power2.in',
        onComplete: () => {
          setRenderedCategory(null);
        }
      });
    } else {
      setRenderedCategory(null);
    }
  }, [hideGlassCard]);

  const toggleFolderCategory = useCallback(
    (categoryKey: CategoryKey) => {
      if (activeCategory === categoryKey) {
        closeFolderOrbit();
        return;
      }

      setActiveCategory(categoryKey);
      setRenderedCategory(categoryKey);
      hideGlassCard();

      targetRotSpeedRef.current = 0.016;
      if (sphereSlowdownTimerRef.current) {
        window.clearTimeout(sphereSlowdownTimerRef.current);
      }
      sphereSlowdownTimerRef.current = window.setTimeout(() => {
        targetRotSpeedRef.current = 0.0035;
      }, 500);
    },
    [activeCategory, closeFolderOrbit, hideGlassCard]
  );

  // GSAP bloom when activeCategory changes
  useEffect(() => {
    if (!renderedCategory || !activeCategory || !scriptsReady || !window.gsap) return;
    const container = nodesContainerRef.current;
    if (!container) return;

    const nodes = container.querySelectorAll('.orbit-app-node');
    if (nodes.length) {
      window.gsap.killTweensOf(nodes);
      window.gsap.fromTo(
        nodes,
        {
          left: '50%',
          top: '50%',
          scale: 0.2,
          opacity: 0
        },
        {
          left: (_i: number, el: HTMLElement) => el.getAttribute('data-target-left'),
          top: (_i: number, el: HTMLElement) => el.getAttribute('data-target-top'),
          scale: 1,
          opacity: 1,
          duration: 0.65,
          stagger: 0.026,
          ease: 'back.out(1.28)'
        }
      );
    }
  }, [renderedCategory, activeCategory, scriptsReady]);

  // Cursor, Parallax, and Three.js initialization
  useEffect(() => {
    if (!scriptsReady) return;

    playPortalEntryAnimation();

    if (window.anime) {
      window.anime({
        targets: '.svg-clean-ring',
        rotate: '1turn',
        duration: 36000,
        loop: true,
        easing: 'linear'
      });
    }

    const gsap = window.gsap;
    const outerCircle = cursorOuterRef.current;
    const centerDot = cursorDotRef.current;

    const xDot = outerCircle && centerDot && gsap ? gsap.quickTo(centerDot, 'x', { duration: 0.03, ease: 'none' }) : null;
    const yDot = outerCircle && centerDot && gsap ? gsap.quickTo(centerDot, 'y', { duration: 0.03, ease: 'none' }) : null;
    const xOuter = outerCircle && centerDot && gsap ? gsap.quickTo(outerCircle, 'x', { duration: 0.15, ease: 'power3.out' }) : null;
    const yOuter = outerCircle && centerDot && gsap ? gsap.quickTo(outerCircle, 'y', { duration: 0.15, ease: 'power3.out' }) : null;

    const gridBg = gridBgRef.current;
    const orbitalRings = orbitalRingsSvgRef.current;
    const foldersHub = foldersHubRef.current;
    const nodesContainer = nodesContainerRef.current;
    const rightSphereStage = rightSphereStageRef.current;

    const gridX = gridBg && gsap ? gsap.quickTo(gridBg, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
    const gridY = gridBg && gsap ? gsap.quickTo(gridBg, 'y', { duration: 0.6, ease: 'power3.out' }) : null;
    const ringsX = orbitalRings && gsap ? gsap.quickTo(orbitalRings, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
    const ringsY = orbitalRings && gsap ? gsap.quickTo(orbitalRings, 'y', { duration: 0.5, ease: 'power3.out' }) : null;
    const hubX = foldersHub && gsap ? gsap.quickTo(foldersHub, 'x', { duration: 0.4, ease: 'power3.out' }) : null;
    const hubY = foldersHub && gsap ? gsap.quickTo(foldersHub, 'y', { duration: 0.4, ease: 'power3.out' }) : null;
    const nodesX = nodesContainer && gsap ? gsap.quickTo(nodesContainer, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
    const nodesY = nodesContainer && gsap ? gsap.quickTo(nodesContainer, 'y', { duration: 0.45, ease: 'power3.out' }) : null;
    const sphereX = rightSphereStage && gsap ? gsap.quickTo(rightSphereStage, 'x', { duration: 0.55, ease: 'power3.out' }) : null;
    const sphereY = rightSphereStage && gsap ? gsap.quickTo(rightSphereStage, 'y', { duration: 0.55, ease: 'power3.out' }) : null;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (xDot && yDot && xOuter && yOuter) {
        xDot(e.clientX);
        yDot(e.clientY);
        xOuter(e.clientX);
        yOuter(e.clientY);
      }

      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;

      if (gridX && gridY) {
        gridX(-nx * 55);
        gridY(-ny * 22);
      }
      if (ringsX && ringsY) {
        ringsX(nx * 14);
        ringsY(ny * 14);
      }
      if (hubX && hubY) {
        hubX(nx * 22);
        hubY(ny * 22);
      }
      if (nodesX && nodesY) {
        nodesX(nx * 18);
        nodesY(ny * 18);
      }
      if (sphereX && sphereY) {
        sphereX(nx * 20);
        sphereY(ny * 20);
      }

      mouseX = nx * 0.45;
      mouseY = ny * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Three.js Wireframe Canvas
    let animFrameId: number;
    const canvas = threeCanvasRef.current;
    const THREE = window.THREE;
    let handleResize: (() => void) | null = null;

    if (canvas && THREE) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
      camera.position.z = 6.2;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setClearColor(0x000000, 0);

      handleResize = () => {
        const parent = canvas.parentElement;
        const w = parent?.clientWidth || 520;
        const h = parent?.clientHeight || 520;
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      const sphereGroup = new THREE.Group();
      sphereGroup.rotation.z = 0.22;
      scene.add(sphereGroup);

      const geoSphere = new THREE.SphereGeometry(1.75, 14, 10);
      const matSphere = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const wireframeSphereMesh = new THREE.Mesh(geoSphere, matSphere);
      wireframeSphereMeshRef.current = wireframeSphereMesh;
      sphereGroup.add(wireframeSphereMesh);

      const pointsMat = new THREE.PointsMaterial({
        color: 0x059669,
        size: 0.05,
        transparent: true,
        opacity: 0.65
      });
      const spherePoints = new THREE.Points(geoSphere, pointsMat);
      sphereGroup.add(spherePoints);

      const ringGeo = new THREE.TorusGeometry(2.18, 0.009, 12, 90);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0d9488,
        transparent: true,
        opacity: 0.28
      });
      const equatorRingMesh = new THREE.Mesh(ringGeo, ringMat);
      equatorRingMesh.rotation.x = Math.PI / 2.25;
      sphereGroup.add(equatorRingMesh);

      const animateThree = () => {
        animFrameId = requestAnimationFrame(animateThree);
        currentRotSpeedRef.current += (targetRotSpeedRef.current - currentRotSpeedRef.current) * 0.08;

        wireframeSphereMesh.rotation.y += currentRotSpeedRef.current;
        spherePoints.rotation.y = wireframeSphereMesh.rotation.y;
        equatorRingMesh.rotation.z -= currentRotSpeedRef.current * 0.6;

        sphereGroup.rotation.y += (mouseX - sphereGroup.rotation.y) * 0.05;
        sphereGroup.rotation.x += (mouseY - sphereGroup.rotation.x) * 0.05;

        renderer.render(scene, camera);
      };
      animateThree();
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [scriptsReady, playPortalEntryAnimation]);

  const handleSkipIntro = () => {
    if (introTimelineRef.current) {
      introTimelineRef.current.progress(1);
    }
    setShowIntroOverlay(false);
  };

  const handleReplayIntro = () => {
    closeFolderOrbit();
    playPortalEntryAnimation();
  };

  const handleCopyDemo = () => {
    const demoText = 'User: demo@green-nusa.net | Pass: demo123';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(demoText).catch(() => {});
    }
    showToast('Akun Demo (demo@green-nusa.net) berhasil disalin!');
  };

  const handleSelectDirectoryApp = (appId: string, catKey: CategoryKey) => {
    setIsDirModalOpen(false);
    if (catKey !== activeCategory) {
      setActiveCategory(catKey);
      setRenderedCategory(catKey);
    }
    window.setTimeout(() => {
      const targetNode = orbitNodeRefs.current[appId] || null;
      updateGlassCardOnHover(appId, targetNode);
    }, 300);
  };

  const handleOpenCatalogModal = useCallback(
    (cat?: CategoryType) => {
      if (cat) {
        setCatalogCategory(cat);
      } else if (activeCategory === 'biz') {
        setCatalogCategory('swasta');
      } else {
        setCatalogCategory('pemerintahan');
      }
      setIsDirModalOpen(true);
    },
    [activeCategory]
  );

  const requestDemoWaUrl = useMemo(() => {
    const rawWa = portalContent?.whatsappLink || 'https://wa.me/6281348039947';
    if (rawWa.includes('text=')) return rawWa;
    const msg = encodeURIComponent(
      'Halo GreenNusa Computindo, saya ingin meminta request demo dan informasi langganan ekosistem aplikasi.'
    );
    return `${rawWa}${rawWa.includes('?') ? '&' : '?'}text=${msg}`;
  }, [portalContent?.whatsappLink]);

  // Glass card content
  const defaultAppKey = govApps[0]?.id || 'dalev-induk';
  const currentGlassApp = hoveredAppId ? allAppsMap[hoveredAppId] || allAppsMap[defaultAppKey] : allAppsMap[defaultAppKey];
  const currentStickerSvgKey = currentGlassApp?.svgKey || currentGlassApp?.id || 'service-generic';
  const rawStickerSvg = CUSTOM_SVG_ICONS[currentStickerSvgKey] || CUSTOM_SVG_ICONS['service-generic'];
  const styledStickerSvg = rawStickerSvg ? rawStickerSvg.replace('class="w-6 h-6"', 'class="w-8 h-8 text-emerald-700"') : '';

  // Orbit calculations
  const orbitList = renderedCategory === 'gov' ? govApps : renderedCategory === 'biz' ? bizApps : [];
  const totalOrbitNodes = orbitList.length;

  const MAX_ORBITS = 3;
  const ORBIT_RING_CAPACITIES: number[] = [8, 14, 18];
  const ORBIT_CUMULATIVE_MAX: number[] = [8, 22, 40];

  const getActiveOrbitCount = (total: number): number => {
    if (total <= 0) return 1;
    for (let i = 0; i < MAX_ORBITS; i++) {
      if (total <= ORBIT_CUMULATIVE_MAX[i]) {
        return i + 1;
      }
    }
    return MAX_ORBITS;
  };

  const activeOrbitCount = getActiveOrbitCount(totalOrbitNodes);
  const isMultiOrbit = activeOrbitCount > 1;

  const svgCenter = 360;
  const svgViewBoxSize = 720;

  const ORBIT_RADII_BY_COUNT: Record<number, number[]> = {
    1: [290],
    2: [255, 325],
    3: [240, 290, 340]
  };

  const activeOrbitRadiiSvg = ORBIT_RADII_BY_COUNT[activeOrbitCount] || ORBIT_RADII_BY_COUNT[1];
  const safeZoneRadiusSvg =
    activeOrbitCount === 1 ? 185 : activeOrbitCount === 2 ? 175 : 160;

  const distributeNodesAcrossOrbits = (total: number, orbitCount: number): number[] => {
    if (total <= 0) return [0];
    if (orbitCount === 1) return [total];

    const counts: number[] = new Array(orbitCount).fill(0);
    let remaining = total;

    for (let r = 0; r < orbitCount; r++) {
      if (r === orbitCount - 1) {
        counts[r] = remaining;
      } else {
        const cap = ORBIT_RING_CAPACITIES[r];
        const assigned = Math.min(cap, remaining);
        counts[r] = assigned;
        remaining -= assigned;
      }
    }
    return counts;
  };

  const nodesPerOrbitRing = distributeNodesAcrossOrbits(totalOrbitNodes, activeOrbitCount);

  const getOrbitNodeGeometry = (index: number) => {
    let ringIdx = 0;
    let indexInRing = index;

    for (let r = 0; r < nodesPerOrbitRing.length; r++) {
      if (indexInRing < nodesPerOrbitRing[r]) {
        ringIdx = r;
        break;
      }
      indexInRing -= nodesPerOrbitRing[r];
    }

    const countInThisRing = Math.max(1, nodesPerOrbitRing[ringIdx]);
    const svgRadius = activeOrbitRadiiSvg[ringIdx] || 232;
    const pctRadius = (svgRadius / svgViewBoxSize) * 100;

    const angleOffset =
      ringIdx % 2 === 0 && isMultiOrbit ? 180 / countInThisRing : ringIdx > 0 ? 90 / countInThisRing : 0;
    const angleDeg = -90 + angleOffset + indexInRing * (360 / countInThisRing);
    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      ringIndex: ringIdx + 1,
      angleRad,
      svgRadius,
      pctRadius,
      cx: (svgCenter + svgRadius * Math.cos(angleRad)).toFixed(2),
      cy: (svgCenter + svgRadius * Math.sin(angleRad)).toFixed(2),
      targetLeft: (50 + pctRadius * Math.cos(angleRad)).toFixed(3) + '%',
      targetTop: (50 + pctRadius * Math.sin(angleRad)).toFixed(3) + '%'
    };
  };

  const folderHubOrbitClass = activeCategory
    ? activeOrbitCount === 3
      ? 'has-open-folder has-triple-orbit'
      : activeOrbitCount === 2
      ? 'has-open-folder has-dual-orbit'
      : 'has-open-folder'
    : '';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center selection:bg-emerald-500 selection:text-white py-6 px-4 sm:px-8 lg:px-10 overflow-x-hidden font-sans">
      {/* 3D PERSPECTIVE HORIZON GRID BACKGROUND */}
      <PerspectiveGridBackground ref={gridBgRef} />

      {/* CUSTOM CURSOR */}
      <PortalCustomCursor outerRef={cursorOuterRef} dotRef={cursorDotRef} />

      {/* INTRO GATE OVERLAY */}
      <PortalIntroOverlay
        show={showIntroOverlay}
        overlayRef={introOverlayRef}
        progressBarRef={introProgressBarRef}
        coreBadgeRef={introCoreBadgeRef}
        ring1Ref={introRing1Ref}
        ring2Ref={introRing2Ref}
        logoUrl={portalContent?.logoUrl}
        headerText={portalContent?.headerText}
        onSkip={handleSkipIntro}
        onMouseEnter={() => setIsPointing(true)}
        onMouseLeave={() => setIsPointing(false)}
      />

      {/* SVG HOVER BEAM CONNECTOR */}
      <PortalHoverBeam pathRef={hoverBeamPathRef} />

      {/* TOP CENTER LOGO FROM DATABASE */}
      <header
        className={`relative z-30 flex items-center justify-center pt-2 sm:pt-4 pointer-events-auto transition-all duration-500 ease-out ${
          activeCategory ? 'mb-4 sm:mb-8' : 'mb-2 sm:mb-4'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portalContent?.logoUrl || '/api/assets/logo/logo green.png'}
          alt="Logo GreenNusa Computindo"
          className="h-[90px] w-auto max-w-[280px] sm:max-w-none object-contain transition-transform duration-300 hover:scale-105 select-none"
        />
      </header>

      {/* 2-COLUMN WORKSPACE: LEFT ORBIT & RIGHT THREE.JS STAGE */}
      <main
        id="portal-main-workspace"
        className={`relative z-20 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center transition-all duration-500 ease-out ${
          activeCategory ? 'mt-8 sm:mt-14 lg:mt-16' : 'mt-0'
        }`}
      >
        {/* LEFT COLUMN: ORBIT STAGE */}
        <section className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <div
            id="orbital-stage"
            className="relative w-[360px] h-[360px] sm:w-[640px] sm:h-[640px] lg:w-[710px] lg:h-[710px] flex items-center justify-center select-none my-1"
          >
            {/* SVG CONCENTRIC RINGS */}
            <svg
              id="orbital-rings-svg"
              ref={orbitalRingsSvgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 720 720"
              fill="none"
            >
              <circle
                cx={svgCenter}
                cy={svgCenter}
                r={activeCategory && activeOrbitCount >= 3 ? '355' : activeCategory && isMultiOrbit ? '342' : '315'}
                stroke="#dfeee7"
                strokeWidth="1"
                className="transition-all duration-500"
              />

              {!activeCategory && (
                <>
                  <circle
                    id="main-orbit-track"
                    cx={svgCenter}
                    cy={svgCenter}
                    r={290}
                    stroke="#b9dece"
                    strokeWidth="1.6"
                    className="transition-all duration-500"
                  />
                  <circle
                    id="inner-orbit-track"
                    cx={svgCenter}
                    cy={svgCenter}
                    r={210}
                    stroke="#d2e9df"
                    strokeWidth="1.2"
                    strokeDasharray="5 5"
                    className="transition-all duration-500"
                  />
                </>
              )}

              {activeCategory &&
                activeOrbitRadiiSvg.map((radiusSvg, rIdx) => {
                  const isOuterMost = rIdx === activeOrbitRadiiSvg.length - 1;
                  const strokeColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                  const strokeColor = strokeColors[rIdx % strokeColors.length];
                  return (
                    <circle
                      key={`active-orbit-ring-${rIdx + 1}`}
                      id={isOuterMost ? 'main-orbit-track' : `orbit-track-${rIdx + 1}`}
                      cx={svgCenter}
                      cy={svgCenter}
                      r={radiusSvg}
                      stroke={strokeColor}
                      strokeWidth={isOuterMost ? '2' : '1.75'}
                      strokeDasharray={isOuterMost ? undefined : rIdx % 2 === 0 ? '6 4' : '3 3'}
                      className="transition-all duration-500"
                    />
                  );
                })}

              <circle
                cx={svgCenter}
                cy={svgCenter}
                r={safeZoneRadiusSvg}
                stroke="#d2e9df"
                strokeWidth="1"
                strokeDasharray="4 4"
                className={`transition-all duration-500 ${
                  activeCategory ? 'opacity-90' : 'opacity-0'
                }`}
              />

              <g id="orbit-svg-ticks">
                {activeCategory &&
                  orbitList.map((app, index) => {
                    const { cx, cy, ringIndex } = getOrbitNodeGeometry(index);
                    const tickColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                    return (
                      <circle
                        key={`tick-${app.id}`}
                        cx={cx}
                        cy={cy}
                        r={activeOrbitCount >= 3 ? '2.5' : ringIndex === 1 ? '2.8' : '3'}
                        fill={tickColors[(ringIndex - 1) % tickColors.length]}
                        fillOpacity="0.52"
                      />
                    );
                  })}
              </g>
            </svg>

            {/* CENTER FOLDERS HUB */}
            <PortalFoldersHub
              hubRef={foldersHubRef}
              folderGovRef={folderGovRef}
              folderBizRef={folderBizRef}
              activeCategory={activeCategory}
              folderHubOrbitClass={folderHubOrbitClass}
              folder1Title={portalContent?.folder1Title}
              folder2Title={portalContent?.folder2Title}
              govCount={govApps.length}
              bizCount={bizApps.length}
              onToggleCategory={toggleFolderCategory}
              onOpenCatalogModal={handleOpenCatalogModal}
              onMouseEnter={() => setIsPointing(true)}
              onMouseLeave={() => setIsPointing(false)}
            />

            {/* DYNAMIC ORBIT NODES */}
            <PortalOrbitNodes
              containerRef={nodesContainerRef}
              orbitList={orbitList}
              getOrbitNodeGeometry={getOrbitNodeGeometry}
              orbitNodeRefs={orbitNodeRefs}
              activeOrbitCount={activeOrbitCount}
              isMultiOrbit={isMultiOrbit}
              isGlassCardVisible={isGlassCardVisible}
              hoveredAppId={hoveredAppId}
              onHover={(appId, el) => {
                setIsPointing(true);
                updateGlassCardOnHover(appId, el);
              }}
              onLeave={() => {
                setIsPointing(false);
                scheduleHideGlassCard();
              }}
              onClick={(app, el) => {
                updateGlassCardOnHover(app.id, el);
                if (app.url) {
                  window.open(app.url, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          </div>

          {/* ACTION BUTTONS & SERVICE TRIGGERS BELOW ORBIT */}
          <div
            className={`flex flex-col items-center space-y-3.5 w-full max-w-lg transition-all duration-500 ease-out ${
              activeCategory ? 'mt-14 sm:mt-20 lg:mt-24' : 'mt-6 sm:mt-8'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2.5 w-full justify-center">
              <a
                id="btn-open-sub-modal"
                href={requestDemoWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-app-id="request-demo"
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('request-demo', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger glossy-black-pill py-3 px-6 rounded-full text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2.5 cursor-pointer no-underline"
              >
                <span>Request Demo &amp; Subscription</span>
                <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                  <i className="fa-solid fa-chevron-right text-[9px]"></i>
                </span>
              </a>

              <button
                id="btn-open-all-directory"
                type="button"
                onClick={() => handleOpenCatalogModal()}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target px-4 py-3 rounded-full bg-white border border-emerald-950/15 text-emerald-950 hover:bg-emerald-50 text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-folder-tree text-emerald-600"></i>
                <span>Semua Katalog</span>
              </button>

              <button
                id="btn-replay-intro"
                type="button"
                title="Putar Ulang Animasi Masuk Portal"
                onClick={handleReplayIntro}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target w-10 h-10 rounded-full bg-white border border-emerald-950/15 text-emerald-950 hover:bg-emerald-50 text-xs font-extrabold shadow-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fa-solid fa-rotate-right text-emerald-700"></i>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-semibold text-stone-800">
              <button
                type="button"
                data-app-id="buat-website"
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('buat-website', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-code text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  Jasa Buat Website
                </span>
              </button>

              <button
                type="button"
                data-app-id="buat-aplikasi"
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('buat-aplikasi', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-leaf text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  Buat Aplikasi Custom
                </span>
              </button>

              <a
                href="https://green-nusa.net"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  green-nusa.net
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: 3D WIREFRAME SPHERE & TILTED FROSTED GLASS CARD */}
        <section className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[450px] sm:min-h-[520px] overflow-visible">
          <PortalThreeSphereStage
            stageRef={rightSphereStageRef}
            canvasRef={threeCanvasRef}
          >
            <PortalGlassCard
              cardRef={glassCardRef}
              topStickerRef={topStickerRef}
              currentGlassApp={currentGlassApp}
              styledStickerSvg={styledStickerSvg}
              isVisible={isGlassCardVisible}
              onMouseEnter={() => {
                if (hideCardTimeoutRef.current) {
                  window.clearTimeout(hideCardTimeoutRef.current);
                }
              }}
              onMouseLeave={() => scheduleHideGlassCard()}
              onCopyDemo={handleCopyDemo}
              onHoverAction={() => setIsPointing(true)}
              onLeaveAction={() => setIsPointing(false)}
            />
          </PortalThreeSphereStage>


        </section>
      </main>

      {/* MODAL KATALOG EKOSISTEM (UNIFIED MODAL DARI BRANCH USE-NEXT-JS) */}
      <UnifiedEcosystemModal
        isOpen={isDirModalOpen}
        activeCategory={catalogCategory}
        apps={apps.length > 0 ? apps : undefined}
        onSwitchCategory={(cat) => setCatalogCategory(cat)}
        onClose={() => setIsDirModalOpen(false)}
      />


      {/* TOAST NOTIFICATION */}
      <PortalToast message={toastMessage} isVisible={isToastVisible} />

      {/* WHATSAPP FLOATING BUTTON */}
      <WhatsAppFloatingButton whatsappLink={portalContent?.whatsappLink} />
    </div>
  );
};

export default PortalMainView;
