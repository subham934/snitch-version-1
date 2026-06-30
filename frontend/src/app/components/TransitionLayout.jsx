import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import gsap from 'gsap';
import Lenis from 'lenis';

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

  const curtainLayer1 = useRef(null);
  const curtainLayer2 = useRef(null);
  const brandText = useRef(null);
  const lenisRef = useRef(null);

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

    const tl = gsap.timeline({
      defaults: { duration: 0.55, ease: 'power2.out' }
    });

    // Fast premium reveal: fade out brand text and slide curtain layers away
    tl.to(brandText.current, { opacity: 0, y: -15, duration: 0.25 })
      .to([curtainLayer2.current, curtainLayer1.current], {
        y: '-100%',
        stagger: 0.08,
      }, '-=0.18');

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  const transitionTo = (to) => {
    if (isPending || location.pathname === to) return;
    setIsPending(true);

    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power3.inOut' },
      onComplete: () => {
        setIsPending(false);
        navigate(to);
      }
    });

    // Reset curtains to bottom before sliding up
    gsap.set([curtainLayer1.current, curtainLayer2.current], { y: '100%' });
    gsap.set(brandText.current, { opacity: 0, y: 20 });

    tl.to([curtainLayer1.current, curtainLayer2.current], {
      y: '0%',
      stagger: 0.2,
    })
    .to(brandText.current, {
      opacity: 1,
      y: 0,
      duration: 0.25
    }, '-=0.25');
  };

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      <div className="relative min-h-screen bg-background text-on-background">
        {/* Page contents */}
        <Outlet />

        {/* Dual-layered Golden Curtain Overlay */}
        {/* Layer 1: Accent Gold */}
        <div
          ref={curtainLayer1}
          className="fixed inset-0 bg-[#bf9b30] pointer-events-none"
          style={{ zIndex: 9990, willChange: 'transform' }}
        />
        {/* Layer 2: Main Champagne Gold */}
        <div
          ref={curtainLayer2}
          className="fixed inset-0 bg-[#FAF9F5] border-t-2 border-b-2 border-[#ffcf40] pointer-events-none flex flex-col items-center justify-center"
          style={{ zIndex: 9999, willChange: 'transform' }}
        >
          <div className="text-center relative">
            <div 
              className="absolute -inset-10 border border-[#ffbf00]/20 rounded-full scale-110" 
              style={{ animation: 'pulse 3s infinite' }}
            />
            <h1
              ref={brandText}
              className="text-4xl md:text-5xl font-headline font-bold text-[#bf9b30] tracking-[0.25em] uppercase select-none"
            >
              SNITCH
            </h1>
            <p className="text-[#ffbf00] text-[9px] tracking-[0.35em] uppercase mt-2.5 font-label select-none">
              Premium Wear
            </p>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
};
