import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import gsap from 'gsap';
import Lenis from 'lenis';
import { useSnapTransition } from '../hooks/useSnapTransition';

const TransitionContext = createContext(null);

export const useTransitionNavigate = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransitionNavigate must be used within a TransitionProvider');
  }
  return context.transitionTo;
};

export const TransitionLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, setIsPending] = useState(false);

  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);
  const lenisRef = useRef(null);
  const shouldReassemble = useRef(false);

  const { disintegrate, reassemble, killAll } = useSnapTransition();

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ticker
    function update(time) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  // Entrance animation (reveal page) on route mount or change
  useEffect(() => {
    // Scroll to top instantly on new page
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }

    if (!shouldReassemble.current) {
      // First load or no animation trigger: make sure live page is visible
      if (pageContainerRef.current) {
        pageContainerRef.current.style.opacity = '1';
      }
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
      return;
    }

    shouldReassemble.current = false;

    // Trigger incoming reassembly animation on the new page layout
    reassemble(pageContainerRef.current, canvasRef.current, lenisRef.current, () => {
      setIsPending(false);
    });
  }, [location.pathname, reassemble]);

  // Clean up all timeline updates on unmount
  useEffect(() => {
    return () => {
      killAll();
    };
  }, [killAll]);

  const transitionTo = (to) => {
    if (isPending || location.pathname === to) return;
    setIsPending(true);

    // Disintegrate current page layout, then navigate
    disintegrate(pageContainerRef.current, canvasRef.current, lenisRef.current, () => {
      shouldReassemble.current = true;
      navigate(to);
    });
  };

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      <div className="relative min-h-screen bg-background text-on-background">
        {/* Page contents container wrapper */}
        <div
          ref={pageContainerRef}
          id="page-transition-container"
          style={{ willChange: 'opacity' }}
        >
          <Outlet />
        </div>

        {/* Cinematic Canvas Overlay Stage */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'none',
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />
      </div>
    </TransitionContext.Provider>
  );
};
