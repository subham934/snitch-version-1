import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTransitionNavigate } from '../../../components/TransitionLayout.jsx';
import { useAuth } from '../hook/useAuth.js';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';
import gsap from 'gsap';

const Register = () => {
  const transitionNavigate = useTransitionNavigate();
  const { handleRegister } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  });

  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Refs for animations
  const containerRef = useRef(null);
  const bgImageRef = useRef(null);
  const formContainerRef = useRef(null);
  
  // Card drawing borders
  const topLine = useRef(null);
  const rightLine = useRef(null);
  const bottomLine = useRef(null);
  const leftLine = useRef(null);

  // Showcase drawing borders
  const showcaseTop = useRef(null);
  const showcaseRight = useRef(null);
  const showcaseBottom = useRef(null);
  const showcaseLeft = useRef(null);

  // Entrance animations on mount
  useEffect(() => {
    const mountTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Set initial border sizes
    gsap.set([topLine.current, bottomLine.current, showcaseTop.current, showcaseBottom.current], { width: '0%' });
    gsap.set([rightLine.current, leftLine.current, showcaseRight.current, showcaseLeft.current], { height: '0%' });

    // 1. Fast presentation of visual showcase image
    mountTl.fromTo(bgImageRef.current,
      { scale: 1.1, filter: 'blur(3px)', opacity: 0 },
      { scale: 1.0, filter: 'blur(0px)', opacity: 1, duration: 0.8, ease: 'power1.out' }
    );

    // 2. Draw showcase gold borders
    mountTl.to(showcaseTop.current, { width: '100%', duration: 0.3 }, '-=0.6')
           .to(showcaseRight.current, { height: '100%', duration: 0.3 }, '-=0.45')
           .to(showcaseBottom.current, { width: '100%', duration: 0.3 }, '-=0.3')
           .to(showcaseLeft.current, { height: '100%', duration: 0.3 }, '-=0.15');

    // 3. Draw card gold borders
    mountTl.to(topLine.current, { width: '100%', duration: 0.3 }, '-=0.4')
           .to(rightLine.current, { height: '100%', duration: 0.3 }, '-=0.25')
           .to(bottomLine.current, { width: '100%', duration: 0.3 }, '-=0.1')
           .to(leftLine.current, { height: '100%', duration: 0.3 });

    // 4. Stagger animate text content on the left
    const leftTextElements = containerRef.current.querySelectorAll('.animate-left-item');
    mountTl.fromTo(leftTextElements,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.5 },
      '-=0.8'
    );

    // 5. Stagger animate form elements on the right
    const formElements = formContainerRef.current.querySelectorAll('.animate-form-item');
    mountTl.fromTo(formElements,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.5 },
      '-=0.7'
    );

    return () => {
      mountTl.kill();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    // Local validation
    if (!formData.fullname.trim() || formData.fullname.length < 3) {
      setLocalError('Full name must be at least 3 characters long');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      setLocalError('Contact must be a 10-digit number');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      await handleRegister({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password,
        isSeller: formData.isSeller,
      });
      setSuccessMsg('Registration successful!');
      
      // Slow transformation exit to other page
      setTimeout(() => {
        transitionNavigate('/');
      }, 1500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div ref={containerRef} className="bg-background text-on-background font-body min-h-screen flex flex-col md:flex-row selection:bg-primary/20 selection:text-[#bf9b30] overflow-x-hidden">
      {/* Left Column: Visual Showcase (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col items-start justify-start p-12 md:p-16 relative overflow-hidden bg-[#FDFCF9]">
        {/* Background Image with Elegant Gold/Light Wash Overlay */}
        <div ref={bgImageRef} className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: "url('/streetwear_showcase.png')" }}></div>
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-[#ffcf40]/25 to-[#FAF9F5]/90 pointer-events-none"></div>

        {/* Inset golden frame */}
        <div className="absolute inset-4 border border-[#ffcf40]/25 pointer-events-none rounded-sm">
          <div ref={showcaseTop} className="gold-draw-line top-0 left-0" />
          <div ref={showcaseRight} className="gold-draw-line-v top-0 right-0" />
          <div ref={showcaseBottom} className="gold-draw-line bottom-0 right-0" />
          <div ref={showcaseLeft} className="gold-draw-line-v bottom-0 left-0" />
        </div>

        {/* Brand Logo placed on top center */}
        <div className="relative z-20 text-[#ffbf00] text-3xl md:text-4xl font-headline font-black tracking-[0.3em] uppercase drop-shadow-[0_2px_12px_rgba(255,191,0,0.3)] animate-left-item mt-2 md:mt-4">
          SNITCH
        </div>
      </div>

      {/* Right Column: Registration Form (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-background relative">
        {/* Subtle blur background bubbles for a premium warm feel */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#ffcf40]/15 rounded-full filter blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#ffbf00]/10 rounded-full filter blur-[120px]"></div>
        </div>

        <div ref={formContainerRef} className="w-full max-w-md relative z-10 bg-white p-8 md:p-10 shadow-[0_12px_40px_rgba(191,155,48,0.08)] rounded-2xl border border-[#ffdc73]/30">
          
          {/* Card drawing gold borders */}
          <div className="absolute inset-0 rounded-2xl border border-transparent pointer-events-none overflow-hidden">
            <div ref={topLine} className="gold-draw-line top-0 left-0" />
            <div ref={rightLine} className="gold-draw-line-v top-0 right-0" />
            <div ref={bottomLine} className="gold-draw-line bottom-0 right-0" />
            <div ref={leftLine} className="gold-draw-line-v bottom-0 left-0" />
          </div>

          <div className="mb-8 animate-form-item">
            <h1 className="font-headline text-3xl font-bold text-[#1C1917] mb-2 tracking-tight">
              Create an Account
            </h1>
            <p className="font-label text-[#bf9b30] text-sm">
              Join the ultimate fashion platform.
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2 animate-form-item">
              <span className="material-symbols-outlined text-red-500">
                error
              </span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2 animate-form-item">
              <span className="material-symbols-outlined text-emerald-500">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="animate-form-item">
              <label
                className="block font-label text-xs font-semibold text-[#bf9b30] mb-2"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bf9b30]/60">
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-[#ffdc73] rounded-lg text-[#1C1917] text-sm focus:ring-1 focus:ring-[#ffbf00] focus:border-[#ffbf00] transition-all shadow-xs placeholder:text-[#bf9b30]/40 font-body outline-none"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  type="text"
                />
              </div>
            </div>

            {/* Email */}
            <div className="animate-form-item">
              <label
                className="block font-label text-xs font-semibold text-[#bf9b30] mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bf9b30]/60">
                  <span className="material-symbols-outlined text-[18px]">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-[#ffdc73] rounded-lg text-[#1C1917] text-sm focus:ring-1 focus:ring-[#ffbf00] focus:border-[#ffbf00] transition-all shadow-xs placeholder:text-[#bf9b30]/40 font-body outline-none"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="animate-form-item">
              <label
                className="block font-label text-xs font-semibold text-[#bf9b30] mb-2"
                htmlFor="contact"
              >
                Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bf9b30]/60">
                  <span className="material-symbols-outlined text-[18px]">
                    phone
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-[#ffdc73] rounded-lg text-[#1C1917] text-sm focus:ring-1 focus:ring-[#ffbf00] focus:border-[#ffbf00] transition-all shadow-xs placeholder:text-[#bf9b30]/40 font-body outline-none"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                  type="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-form-item">
              <label
                className="block font-label text-xs font-semibold text-[#bf9b30] mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#bf9b30]/60">
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-[#ffdc73] rounded-lg text-[#1C1917] text-sm focus:ring-1 focus:ring-[#ffbf00] focus:border-[#ffbf00] transition-all shadow-xs placeholder:text-[#bf9b30]/40 font-body outline-none"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  type="password"
                  minLength={6}
                />
              </div>
              <p className="mt-1.5 font-label text-[9px] text-[#bf9b30]/75">
                Must be at least 6 characters.
              </p>
            </div>

            {/* Seller Checkbox */}
            <div className="flex items-center pt-1 animate-form-item">
              <input
                className="h-4.5 w-4.5 rounded bg-white border border-[#ffdc73] text-[#ffbf00] focus:ring-[#ffbf00] focus:ring-offset-white transition-colors cursor-pointer"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                type="checkbox"
              />
              <label
                className="ml-2.5 block font-label text-xs text-[#1C1917] cursor-pointer select-none font-medium"
                htmlFor="isSeller"
              >
                Are you a seller?
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 animate-form-item">
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#ffbf00] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="my-5 flex items-center gap-4 animate-form-item">
            <div className="h-px flex-1 bg-[#ffdc73]/60" />
            <span className="font-label text-xs text-[#bf9b30]/60">
              or
            </span>
            <div className="h-px flex-1 bg-[#ffdc73]/60" />
          </div>

          <div className="animate-form-item">
            <ContinueWithGoogle text="Register with Google" />
          </div>

          <div className="mt-8 text-center font-label text-xs text-[#bf9b30] animate-form-item">
            Already have an account?
            <button
              onClick={() => transitionNavigate('/login')}
              className="font-bold text-[#bf9b30] hover:text-[#ffbf00] transition-colors hover:underline underline-offset-4 cursor-pointer ml-1 outline-none"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
