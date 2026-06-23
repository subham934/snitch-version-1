import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hook/useAuth.js';

const Register = () => {
  const navigate = useNavigate();
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
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('/streetwear_showcase.png')" }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-b from-[#131315]/60 via-[#131315]/30 to-[#131315]/90 pointer-events-none"></div>

        {/* Branding overlapping the image */}
        <div className="relative z-20 text-3xl md:text-4xl font-headline font-black text-primary-container tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          SNITCH
        </div>
        
        {/* Tagline & copy */}
        <div className="relative z-10 mt-auto pt-24">
          <span className="inline-block bg-primary-container/20 border border-primary-container/30 backdrop-blur-md text-primary-container px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4">
            New Season Drop
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight tracking-tight mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Redefining <br />
            Modern Style.
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Explore curated streetwear collections designed for those who
            express themselves through their wardrobe. Clean cuts, premium
            fabrics.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form (50% split on md+) */}
      <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-background relative">
        {/* Subtle blur background bubbles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-container rounded-full mix-blend-screen filter blur-[128px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">
              Create an Account
            </h1>
            <p className="font-label text-on-surface-variant text-sm">
              Join the ultimate fashion platform.
            </p>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">
                error
              </span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
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
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    mail
                  </span>
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

            {/* Contact Number */}
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="contact"
              >
                Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    phone
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3.5 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all shadow-sm placeholder:text-on-surface-variant/40 font-body outline-none"
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
            <div>
              <label
                className="block font-label text-xs font-medium text-on-surface mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
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
              <p className="mt-2 font-label text-[10px] text-on-surface-variant">
                Must be at least 6 characters.
              </p>
            </div>

            {/* Seller Checkbox */}
            <div className="flex items-center pt-1">
              <input
                className="h-4.5 w-4.5 rounded bg-surface-container border border-outline-variant/30 text-primary-container focus:ring-primary-container focus:ring-offset-surface-container-low transition-colors cursor-pointer"
                id="isSeller"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
                type="checkbox"
              />
              <label
                className="ml-3 block font-label text-xs text-on-surface cursor-pointer select-none"
                htmlFor="isSeller"
              >
                Are you a seller?
              </label>
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
                    <svg
                      className="animate-spin h-5 w-5 text-on-primary-container"
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

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="font-label text-xs text-on-surface-variant">
              or
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <a
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container px-4 py-3.5 font-label text-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-surface-container-low active:scale-[0.98]"
            href="/api/auth/google"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
              />
            </svg>
            Register with Google
          </a>

          <div className="mt-8 text-center font-label text-xs text-on-surface-variant">
            Already have an account?{' '}
            <Link
              className="font-medium text-primary-container hover:text-primary transition-colors hover:underline underline-offset-4"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
