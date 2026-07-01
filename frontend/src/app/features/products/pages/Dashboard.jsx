import React, { useEffect, useRef } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import { useSelector } from 'react-redux';
import { useTransitionNavigate } from '../../../components/TransitionLayout.jsx';
import gsap from 'gsap';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onClick }) => {
  const primaryImage = product.images?.[0]?.url || null;

  return (
    <div
      onClick={onClick}
      className="product-card bg-white rounded-xl border border-[#ffdc73]/50 shadow-[0_4px_20px_rgba(191,155,48,0.07)] overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(191,155,48,0.18)] hover:border-[#ffbf00]/40 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-surface-container aspect-4/3">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#ffdc73]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs text-[#bf9b30]/50 font-label font-semibold">No Image</span>
          </div>
        )}

        {/* Image count badge */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            +{product.images.length - 1} more
          </div>
        )}

        {/* Gold top edge accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#ffbf00]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-headline font-bold text-[#1C1917] text-base leading-snug mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-[#bf9b30]/70 text-xs leading-relaxed line-clamp-2 mb-4 font-body flex-1">
          {product.description}
        </p>

        {/* Price & Date row */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-[#ffdc73]/30">
          <div>
            <p className="text-[9px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60 mb-0.5">Price</p>
            <p className="text-[#bf9b30] font-headline font-black text-lg leading-none">
              {formatCurrency(product.price.amount, product.price.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60 mb-0.5">Added</p>
            <p className="text-[#1C1917] text-xs font-semibold">{formatDate(product.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, sub }) => (
  <div className="stat-card bg-white rounded-xl border border-[#ffdc73]/40 px-6 py-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(191,155,48,0.06)]">
    <div className="w-11 h-11 rounded-lg bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center text-[#ffbf00] shrink-0">
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/260">{label}</p>
      <p className="font-headline font-black text-2xl text-[#1C1917] leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-[#bf9b30]/50 font-label mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const transitionNavigate = useTransitionNavigate();

  const containerRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.dash-header',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 }
    )
    .fromTo('.stat-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.45 },
      '-=0.25'
    )
    .fromTo('.product-card',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.45 },
      '-=0.3'
    );
  }, [sellerProducts]);

  // Derived stats
  const totalProducts = sellerProducts?.length ?? 0;
  const totalRevenue = sellerProducts?.reduce((acc, p) => acc + (p.price?.amount ?? 0), 0) ?? 0;
  const avgPrice = totalProducts > 0 ? Math.round(totalRevenue / totalProducts) : 0;
  const currencies = [...new Set(sellerProducts?.map(p => p.price?.currency).filter(Boolean))];

  return (
    <div ref={containerRef} className="min-h-screen bg-background font-body text-[#1C1917]">

      {/* Ambient gold glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ffcf40]/15 rounded-full filter blur-[140px]" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#ffbf00]/10 rounded-full filter blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-10">

        {/* ── Header ── */}
        <div className="dash-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            {/* Brand */}
            <p className="text-[#ffbf00] font-headline font-black tracking-[0.2em] text-sm uppercase mb-1">SNITCH</p>
            <h1 className="font-headline font-black text-3xl md:text-4xl text-[#1C1917] tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-[#bf9b30]/205 text-sm mt-1 font-label">
              Manage your listings and track your store performance.
            </p>
          </div>

          <button
            onClick={() => transitionNavigate('/seller/create-product')}
            className="flex items-center gap-2 bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200 active:scale-[0.97] shadow-[0_4px_16px_rgba(191,155,48,0.25)] whitespace-nowrap self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </button>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-10 max-w-xs">
          <StatCard
            label="Total Listings"
            value={totalProducts}
            icon="inventory_2"
            sub={totalProducts === 1 ? '1 product listed' : `${totalProducts} products listed`}
          />
        </div>

        {/* ── Section title ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-[#ffbf00] rounded-full" />
            <h2 className="font-headline font-bold text-[#1C1917] text-lg tracking-tight">
              Your Products
            </h2>
            <span className="bg-[#ffdc73]/25 border border-[#ffcf40]/40 text-[#bf9b30] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {totalProducts}
            </span>
          </div>
        </div>
        
        {/* ── Product Grid ── */}
        {totalProducts === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[32px] text-[#ffbf00]">inventory_2</span>
            </div>
            <h3 className="font-headline font-bold text-[#1C1917] text-xl mb-2">No products yet</h3>
            <p className="text-[#bf9b30]/60 text-sm font-label max-w-xs mb-6">
              Start building your SNITCH store by adding your first product listing.
            </p>
            <button
              onClick={() => transitionNavigate('/seller/create-product')}
              className="flex items-center gap-2 bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200 active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sellerProducts.map((product, i) => (
              <ProductCard onClick={()=>transitionNavigate(`/seller/product/${product._id}`)} key={product._id} product={product} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
