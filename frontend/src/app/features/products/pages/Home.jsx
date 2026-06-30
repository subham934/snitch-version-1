import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hook/useAuth';
import { useTransitionNavigate } from '../../../components/TransitionLayout.jsx';
import gsap from 'gsap';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const Home = () => {
  const products = useSelector((state) => state.product.products);
  const user = useSelector((state) => state.auth.user);
  const { handleGetAllProducts } = useProduct();
  const { handleLogout } = useAuth();
  const transitionNavigate = useTransitionNavigate();

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // GSAP Animations on mount / products load
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.navbar-anim',
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 }
    )
    .fromTo('.hero-anim',
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8 },
      '-=0.3'
    )
    .fromTo('.heading-anim',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      '-=0.4'
    );

    if (products && products.length > 0) {
      tl.fromTo('.product-card-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
        '-=0.3'
      );
    }
  }, [products]);

  const scrollToProducts = () => {
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background font-body text-[#1C1917] selection:bg-[#ffcf40]/20 selection:text-[#bf9b30] overflow-x-hidden">
      
      {/* Ambient background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ffcf40]/15 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ffbf00]/10 rounded-full filter blur-[150px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="navbar-anim relative z-50 border-b border-[#ffdc73]/30 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => transitionNavigate('/')}
            className="text-[#ffbf00] text-2xl font-headline font-black tracking-[0.3em] uppercase drop-shadow-[0_2px_8px_rgba(255,191,0,0.2)] cursor-pointer select-none"
          >
            SNITCH
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="font-label text-xs font-bold uppercase tracking-widest text-[#1C1917] hover:text-[#ffbf00] transition-colors">Shop</a>
            <a href="#" className="font-label text-xs font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#ffbf00] transition-colors">New Drops</a>
            <a href="#" className="font-label text-xs font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#ffbf00] transition-colors">Collections</a>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline font-label text-xs font-semibold text-[#bf9b30]">
                  Welcome, <span className="text-[#1C1917] font-bold">{user.fullname}</span>
                </span>
                
                {user.role === 'seller' && (
                  <button
                    onClick={() => transitionNavigate('/seller/dashboard')}
                    className="flex items-center gap-1.5 bg-[#bf9b30]/10 hover:bg-[#bf9b30] border border-[#bf9b30] text-[#bf9b30] hover:text-white font-bold text-xs px-4 py-2 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-[#1C1917] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => transitionNavigate('/login')}
                  className="font-label text-xs font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#1C1917] transition-all px-4 py-2 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => transitionNavigate('/register')}
                  className="bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-8">
        
        {/* ── Hero Banner ── */}
        <section ref={heroRef} className="hero-anim mb-16 relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-surface-container shadow-[0_12px_40px_rgba(191,155,48,0.08)] border border-[#ffdc73]/30 flex items-center p-8 md:p-16">
          {/* Background Visual and Overlays */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[12s] hover:scale-105" style={{ backgroundImage: "url('/streetwear_showcase.png')" }}></div>
          <div className="absolute inset-0 bg-linear-to-r from-[#FAF9F5] via-[#FAF9F5]/70 to-transparent pointer-events-none"></div>
          
          {/* Content inside Hero */}
          <div className="relative z-20 max-w-lg space-y-6">
            <span className="bg-[#ffdc73]/30 border border-[#ffcf40]/50 text-[#bf9b30] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Season Drop 2026
            </span>
            <h2 className="text-4xl md:text-6xl font-headline font-black text-[#1C1917] tracking-tight leading-tight">
              STREETWEAR <br />
              <span className="text-[#bf9b30] font-light">REMASTERED.</span>
            </h2>
            <p className="text-[#bf9b30]/80 text-sm md:text-base leading-relaxed">
              Explore custom-tailored urban aesthetics meticulously designed for premium statements.
            </p>
            <div className="pt-2">
              <button 
                onClick={scrollToProducts}
                className="flex items-center gap-2 bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-bold text-sm px-6 py-3.5 rounded-lg transition-all duration-200 active:scale-[0.97] shadow-lg shadow-[#bf9b30]/20 cursor-pointer group"
              >
                Explore Collection
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-y-0.5">arrow_downward</span>
              </button>
            </div>
          </div>

          {/* Golden borders for Hero Accent */}
          <div className="absolute inset-4 border border-[#ffcf40]/25 pointer-events-none rounded-2xl" />
        </section>

        {/* ── Products Section ── */}
        <section id="products-section" className="scroll-mt-24 mb-16">
          <div className="heading-anim flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#ffbf00] rounded-full" />
              <h3 className="font-headline font-black text-2xl md:text-3xl text-[#1C1917] tracking-tight">
                Featured Drops
              </h3>
            </div>
            <span className="text-xs text-[#bf9b30]/60 uppercase tracking-widest font-bold">
              Showing {products?.length || 0} items
            </span>
          </div>

          {/* Products Grid */}
          {!products || products.length === 0 ? (
            /* Loading / Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px] text-[#ffbf00] animate-spin">sync</span>
              </div>
              <h4 className="font-headline font-bold text-[#1C1917] text-lg">No Products Found</h4>
              <p className="text-[#bf9b30]/60 text-xs mt-1">Check back later for new releases.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const primaryImage = product.images?.[0]?.url || null;
                return (
                  <div
                    key={product._id}
                    className="product-card-anim bg-white rounded-2xl border border-[#ffdc73]/40 shadow-[0_4px_24px_rgba(191,155,48,0.06)] overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(191,155,48,0.15)] hover:border-[#ffbf00]/40 transition-all duration-300 relative"
                  >
                    {/* Visual aspect */}
                    <div className="relative overflow-hidden bg-surface-container aspect-4/3">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#ffdc73]">
                          <span className="material-symbols-outlined text-[36px]">image</span>
                          <span className="text-xs text-[#bf9b30]/50 font-label font-semibold">No Image</span>
                        </div>
                      )}

                      {/* Image count badge */}
                      {product.images?.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          +{product.images.length - 1} photos
                        </div>
                      )}

                      {/* Premium gold hover border */}
                      <div className="absolute inset-0 border border-transparent group-hover:border-[#ffbf00]/30 rounded-t-2xl transition-all duration-300 pointer-events-none" />
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-1">
                      <h4 className="font-headline font-bold text-[#1C1917] text-base leading-snug mb-1 line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-[#bf9b30]/70 text-xs leading-relaxed line-clamp-2 mb-4 font-body flex-1">
                        {product.description}
                      </p>

                      {/* Price & Action button */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#ffdc73]/30">
                        <div>
                          <p className="text-[9px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60 mb-0.5">Price</p>
                          <p className="text-[#bf9b30] font-headline font-black text-lg leading-none">
                            {formatCurrency(product.price.amount, product.price.currency)}
                          </p>
                        </div>
                        <button
                          className="bg-[#1C1917] text-white hover:bg-[#ffbf00] hover:text-[#1C1917] text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          View Drop
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ffdc73]/30 bg-surface-container py-8 text-center relative z-10">
        <p className="text-[10px] uppercase tracking-widest font-label text-[#bf9b30]">
          &copy; {new Date().getFullYear()} SNITCH Premium Wear. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;