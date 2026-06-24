import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hook/useAuth.js';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    // Local validation
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      await handleLogin({
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessMsg('Login successful!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      
      {/* Left Column: Visual Showcase (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-between p-12 md:p-16 relative overflow-hidden bg-surface-container-lowest">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: "url('/streetwear_showcase.png')" }}></div>
        <div className="absolute inset-0 bg-linear-to-b from-[#131315]/60 via-[#131315]/30 to-[#131315]/90 pointer-events-none"></div>

        {/* Branding overlapping the image */}
        <div className="relative z-20 text-3xl md:text-4xl font-headline font-black text-primary-container tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          SNITCH
        </div>

        {/* Tagline & copy */}
        <div className="relative z-10 mt-auto pt-24">
          <span className="inline-block bg-primary-container/20 border border-primary-container/30 backdrop-blur-md text-primary-container px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4">
            Welcome Back
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight tracking-tight mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Elevate Your <br/>
            Daily Style.
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Explore premium streetwear collections and enjoy customized shopping recommendations tailored to your fashion sense.
          </p>
        </div>
      </div>

      {/* Right Column: Login Form (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-background relative">
        {/* Subtle blur background bubbles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">
              Sign In
            </h1>
            <p className="font-label text-on-surface-variant text-sm">
              Log in to access your personal vault.
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">error</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-label text-xs font-medium text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
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

            {/* Password */}
            <div>
              <label className="block font-label text-xs font-medium text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
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
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-on-primary-container bg-primary-container hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container focus:ring-offset-surface-container-low transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-on-primary-container" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="font-label text-xs text-on-surface-variant">
              or
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <ContinueWithGoogle text="Login with Google" />

          <div className="mt-8 text-center font-label text-xs text-on-surface-variant">
            Don't have an account?
            <Link className="font-medium text-primary-container hover:text-primary transition-colors hover:underline underline-offset-4" to="/register">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;