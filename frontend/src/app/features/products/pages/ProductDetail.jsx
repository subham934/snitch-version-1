import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hook/useAuth';
import { useTransitionNavigate } from '../../../components/TransitionLayout.jsx';

// Helper to format prices in INR
const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const ProductDetail = () => {
  const { productId } = useParams();
  const transitionNavigate = useTransitionNavigate();
  const { handleGetProductById } = useProduct();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [accordions, setAccordions] = useState({
    details: true,
    shipping: false,
  });

  async function fetchProductDetails() {
    try {
      setLoading(true);
      setError(null);
      const data = await handleGetProductById(productId);
      if (!data) {
        throw new Error('Product not found');
      }
      setProduct(data);
      setActiveImageIndex(0);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const toggleAccordion = (section) => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const images = product?.images || [];
  const activeImageUrl = images[activeImageIndex]?.url || null;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (images.length > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (images.length > 0) {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-[#1C1917] selection:bg-[#ffcf40]/20 selection:text-[#bf9b30] overflow-x-hidden relative">
      {/* Ambient background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-[#ffcf40]/15 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-[#ffbf00]/10 rounded-full filter blur-[150px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-50 border-b border-[#ffdc73]/30 bg-white/70 backdrop-blur-md">
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
            <button 
              onClick={() => transitionNavigate('/')}
              className="font-label text-xs font-bold uppercase tracking-widest text-[#1C1917] hover:text-[#ffbf00] transition-colors cursor-pointer bg-transparent border-none"
            >
              Shop
            </button>
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
                  className="font-label text-xs font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#1C1917] transition-all px-4 py-2 cursor-pointer bg-transparent border-none"
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
        
        {/* Loading State / Shimmer */}
        {loading && (
          <div>
            {/* Breadcrumb Skeleton */}
            <div className="w-48 h-4 bg-[#ffdc73]/20 animate-pulse rounded-md mb-6" />
            <div className="w-32 h-4 bg-[#ffdc73]/20 animate-pulse rounded-md mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Image Showcase Skeleton */}
              <div className="lg:col-span-7 space-y-4">
                <div className="aspect-16/15 w-full rounded-3xl bg-[#ffdc73]/10 border border-[#ffdc73]/20 animate-pulse" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-20 h-20 rounded-xl bg-[#ffdc73]/10 border border-[#ffdc73]/20 animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="lg:col-span-5 space-y-6">
                <div className="w-28 h-5 bg-[#ffdc73]/20 animate-pulse rounded-full" />
                <div className="w-3/4 h-10 bg-[#ffdc73]/20 animate-pulse rounded-md" />
                <div className="w-1/2 h-8 bg-[#ffdc73]/20 animate-pulse rounded-md" />
                <div className="w-full h-24 bg-[#ffdc73]/20 animate-pulse rounded-md" />
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-[#ffdc73]/20 animate-pulse rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="w-10 h-10 rounded-lg bg-[#ffdc73]/10 border border-[#ffdc73]/20 animate-pulse" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="flex-1 h-14 bg-[#ffdc73]/20 animate-pulse rounded-xl" />
                  <div className="flex-1 h-14 bg-[#ffdc73]/20 animate-pulse rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error / Empty State */}
        {!loading && (error || !product) && (
          <div className="flex flex-col items-center justify-center py-24 text-center min-h-[50vh]">
            <div className="w-16 h-16 rounded-2xl bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-[#ffbf00]">error_outline</span>
            </div>
            <h2 className="font-headline font-black text-2xl text-[#1C1917] tracking-tight mb-2">
              {error === 'Product not found' ? 'Product Not Found' : 'Something Went Wrong'}
            </h2>
            <p className="text-[#bf9b30]/80 text-sm max-w-md mb-8 leading-relaxed">
              We couldn't retrieve the details for this item. It might have been removed, or there's a connection issue.
            </p>
            <button
              onClick={() => transitionNavigate('/')}
              className="bg-[#1C1917] text-white hover:bg-[#ffbf00] hover:text-[#1C1917] font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg transition-all active:scale-[0.97] cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        )}

        {/* Product Details Section */}
        {!loading && !error && product && (
          <div>
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-label font-bold text-[#bf9b30]/60 uppercase tracking-widest mb-6">
              <button 
                onClick={() => transitionNavigate('/')} 
                className="hover:text-[#1C1917] transition-colors cursor-pointer bg-transparent border-none"
              >
                Home
              </button>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <button 
                onClick={() => transitionNavigate('/')} 
                className="hover:text-[#1C1917] transition-colors cursor-pointer bg-transparent border-none"
              >
                Shop
              </button>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-[#1C1917] font-bold truncate max-w-37.5 md:max-w-75">
                {product.title}
              </span>
            </nav>

            {/* Back Button */}
            <button 
              onClick={() => transitionNavigate('/')} 
              className="flex items-center gap-1.5 text-[10px] font-label font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#1C1917] transition-colors mb-8 cursor-pointer group bg-transparent border-none"
            >
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
              Back to Drops
            </button>

            {/* Main Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Image Showcase — self-start prevents stretching when accordion expands */}
              <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 self-start">
                
                {/* Thumbnails Column — all images shown stacked, no scroll/slider */}
                {images.length > 1 && (
                  <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 shrink-0 pb-2 md:pb-0">
                    {images.map((image, idx) => (
                      <button
                        key={image._id || idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border bg-white transition-all duration-200 cursor-pointer shrink-0 ${
                          idx === activeImageIndex 
                            ? 'border-[#ffbf00] ring-2 ring-[#ffcf40]/30 scale-[0.98]' 
                            : 'border-[#ffdc73]/30 hover:border-[#ffbf00]/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={image.url} 
                          alt={`${product.title} view ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image Frame */}
                <div className="relative aspect-16/15 w-full rounded-3xl overflow-hidden bg-surface-container border border-[#ffdc73]/30 shadow-[0_8px_32px_rgba(191,155,48,0.06)] group order-1 md:order-2 flex-1">
                  {activeImageUrl ? (
                    <img 
                      src={activeImageUrl} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#ffdc73]">
                      <span className="material-symbols-outlined text-[48px]">image</span>
                      <span className="text-sm text-[#bf9b30]/50 font-label font-bold uppercase tracking-wider">No Image Available</span>
                    </div>
                  )}

                  {/* Top Left Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-[#ffdc73]/50 text-[#bf9b30] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                    Premium Quality
                  </div>

                  {/* Swipe Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-[#1C1917] text-[#1C1917] hover:text-white border border-[#ffdc73]/40 flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer select-none z-10 group/btn"
                        aria-label="Previous image"
                      >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:-translate-x-0.5">chevron_left</span>
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-[#1C1917] text-[#1C1917] hover:text-white border border-[#ffdc73]/40 flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer select-none z-10 group/btn"
                        aria-label="Next image"
                      >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:translate-x-0.5">chevron_right</span>
                      </button>
                    </>
                  )}

                  {/* Bottom Right Image Counter */}
                  {images.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider shadow-md">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Product details */}
              <div className="lg:col-span-5 flex flex-col justify-start">
                
                {/* Brand / Tag */}
                <div className="mb-2">
                  <span className="bg-[#ffdc73]/20 border border-[#ffcf40]/30 text-[#bf9b30] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Exclusive Drop
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-headline font-black text-3xl md:text-4xl text-[#1C1917] tracking-tight uppercase mb-1 leading-tight">
                  {product.title}
                </h1>

                {/* Seller ID / Brand Name */}
                <p className="text-[10px] text-[#bf9b30]/70 font-label font-bold uppercase tracking-widest mb-5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Seller ID: {product.seller}
                </p>

                {/* Price */}
                <div className="mb-6 pb-5 border-b border-[#ffdc73]/20">
                  <p className="text-[9px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60 mb-1">Total Price</p>
                  <p className="text-[#bf9b30] font-headline font-black text-3xl leading-none">
                    {formatCurrency(product.price.amount, product.price.currency)}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60 mb-2">Description</p>
                  <p className="text-[#1C1917]/80 text-sm leading-relaxed font-body">
                    {product.description || "No description provided for this exclusive drop."}
                  </p>
                </div>

                {/* Sizes Selection (Interactive Static Element) */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/60">Select Size</span>
                    <button className="text-[9px] font-label font-bold uppercase tracking-widest text-[#bf9b30] hover:text-[#ffbf00] transition-colors cursor-pointer bg-transparent border-none">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                          selectedSize === size
                            ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-md scale-[0.98]'
                            : 'bg-white text-[#1C1917] border-[#ffdc73]/40 hover:border-[#ffbf00]/50 hover:bg-surface-container'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Two Action Buttons (Visual Only) */}
                <div className="flex flex-col sm:flex-row gap-3.5 mb-8 pt-4">
                  {/* Add To Cart */}
                  <button
                    className="flex-1 bg-white hover:bg-[#1C1917] text-[#1C1917] hover:text-white border-2 border-[#1C1917] font-label font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Add To Cart
                  </button>

                  {/* Buy Now */}
                  <button
                    className="flex-1 bg-[#bf9b30] hover:bg-[#ffbf00] hover:text-[#1C1917] text-white font-label font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#bf9b30]/15"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Buy Now
                  </button>
                </div>

                {/* Premium Details & Shipping Accordions */}
                <div className="border-t border-[#ffdc73]/20">
                  {/* Detail Accordion */}
                  <div className="border-b border-[#ffdc73]/20">
                    <button
                      onClick={() => toggleAccordion('details')}
                      className="w-full py-4 flex justify-between items-center text-left text-xs font-label font-bold uppercase tracking-widest text-[#1C1917] hover:text-[#bf9b30] transition-colors cursor-pointer bg-transparent border-none"
                    >
                      <span>Specifications & Details</span>
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-200">
                        {accordions.details ? 'remove' : 'add'}
                      </span>
                    </button>
                    {accordions.details && (
                      <div className="pb-4 text-xs text-[#bf9b30]/200 space-y-2 leading-relaxed pl-1 font-body">
                        <p>• 100% Premium Heavyweight Cotton</p>
                        <p>• Heavyweight 240 GSM Fabric for a luxurious structured fall</p>
                        <p>• Custom drop shoulder design and ribbed crewneck</p>
                        <p>• Handwash recommended or machine wash cold inside out</p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Accordion */}
                  <div className="border-b border-[#ffdc73]/20">
                    <button
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full py-4 flex justify-between items-center text-left text-xs font-label font-bold uppercase tracking-widest text-[#1C1917] hover:text-[#bf9b30] transition-colors cursor-pointer bg-transparent border-none"
                    >
                      <span>Shipping & Returns</span>
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-200">
                        {accordions.shipping ? 'remove' : 'add'}
                      </span>
                    </button>
                    {accordions.shipping && (
                      <div className="pb-4 text-xs text-[#bf9b30]/200 space-y-2 leading-relaxed pl-1 font-body">
                        <p>• Free express shipping on all prepaid orders across India.</p>
                        <p>• Dispatched within 24-48 hours. Delivered in 3-5 business days.</p>
                        <p>• Easy returns and size exchanges within 7 days of delivery.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ffdc73]/30 bg-surface-container py-8 text-center relative z-10 mt-16">
        <p className="text-[10px] uppercase tracking-widest font-label text-[#bf9b30]">
          &copy; {new Date().getFullYear()} SNITCH Premium Wear. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default ProductDetail;