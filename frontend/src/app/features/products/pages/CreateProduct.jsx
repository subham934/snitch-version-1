import React, { useState, useRef, useEffect } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import gsap from 'gsap';

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Form drawing borders
  const topLine = useRef(null);
  const rightLine = useRef(null);
  const bottomLine = useRef(null);
  const leftLine = useRef(null);

  useEffect(() => {
    const mountTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Set initial border sizes
    gsap.set([topLine.current, bottomLine.current], { width: '0%' });
    gsap.set([rightLine.current, leftLine.current], { height: '0%' });

    // 1. Draw card gold borders
    mountTl.to(topLine.current, { width: '100%', duration: 0.5 })
           .to(rightLine.current, { height: '100%', duration: 0.5 }, '-=0.25')
           .to(bottomLine.current, { width: '100%', duration: 0.5 }, '-=0.25')
           .to(leftLine.current, { height: '100%', duration: 0.5 });

    // 2. Stagger animate heading elements and form fields
    const animateElements = containerRef.current.querySelectorAll('.animate-field');
    mountTl.fromTo(animateElements,
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.7 },
      '-=0.7'
    );

    return () => {
      mountTl.kill();
    };
  }, []);

  const addFiles = (files) => {
    const incoming = Array.from(files).slice(0, 7 - images.length);
    if (!incoming.length) return;
    const newImages = [...images, ...incoming].slice(0, 7);
    const newPreviews = newImages.map((f) => URL.createObjectURL(f));
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDropzoneClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => addFiles(e.target.files);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priceAmount', priceAmount);
      formData.append('priceCurrency', priceCurrency);
      images.forEach((img) => formData.append('images', img));
      await handleCreateProduct(formData);
      setTitle(''); setDescription(''); setPriceAmount(''); setPriceCurrency('INR');
      previews.forEach((url) => URL.revokeObjectURL(url));
      setImages([]); setPreviews([]);
      alert('Product created successfully!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared input class (Light gold theme) ──────────────────────────────────
  const inputCls = "w-full bg-white border border-[#ffdc73] rounded-lg px-4 py-3 text-[#1C1917] text-base outline-none focus:border-[#ffbf00] focus:ring-1 focus:ring-[#ffbf00] transition-all placeholder:text-[#bf9b30]/40 selection:bg-[#ffcf40]/20";

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-[#1C1917]" style={{ fontFamily: "'Geist', sans-serif" }}>

      {/* Ambient glow blobs — matching login/register page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffcf40]/15 rounded-full filter blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffbf00]/10 rounded-full filter blur-[140px]" />
      </div>

      {/* ── Main ── */}
      <main className="py-14 px-4 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <div className="mb-10 animate-field">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1C1917] mb-2">Create Product</h1>
            <p className="text-[#bf9b30] text-base">Add a new drop to your SNITCH store</p>
          </div>

          {/* Form card */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white border border-[#ffdc73]/40 rounded-xl p-8 md:p-12 space-y-8 shadow-[0_12px_40px_rgba(191,155,48,0.08)] relative overflow-hidden"
          >
            {/* Form drawing gold borders */}
            <div className="absolute inset-0 rounded-xl border border-transparent pointer-events-none overflow-hidden">
              <div ref={topLine} className="gold-draw-line top-0 left-0" />
              <div ref={rightLine} className="gold-draw-line-v top-0 right-0" />
              <div ref={bottomLine} className="gold-draw-line bottom-0 right-0" />
              <div ref={leftLine} className="gold-draw-line-v bottom-0 left-0" />
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Left column: text fields */}
              <div className="space-y-6">

                {/* Title */}
                <div className="space-y-2 animate-field">
                  <label htmlFor="title" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#bf9b30]">
                    Product Title
                  </label>
                  <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter product title" required className={inputCls} />
                </div>

                {/* Description */}
                <div className="space-y-2 animate-field">
                  <label htmlFor="description" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#bf9b30]">
                    Description
                  </label>
                  <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..." required className={`${inputCls} resize-none`} />
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-2 gap-4 animate-field">
                  <div className="space-y-2">
                    <label htmlFor="priceAmount" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#bf9b30]">
                      Price
                    </label>
                    <input id="priceAmount" type="number" min="0" step="0.01" value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)} placeholder="0.00" required className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priceCurrency" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#bf9b30]">
                      Currency
                    </label>
                    <select id="priceCurrency" value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)}
                      className={`${inputCls} cursor-pointer`}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Right column: image upload */}
              <div className="space-y-4">
                <div className="flex justify-between items-end animate-field">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#bf9b30]">
                    Product Images (up to 7)
                  </label>
                  <span className="text-[10px] text-[#bf9b30]/60 uppercase tracking-wider font-semibold">Max 5 MB each</span>
                </div>

                {/* Dropzone */}
                <div
                  onClick={handleDropzoneClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none animate-field
                    ${isDragging ? 'border-[#ffcf40] bg-[#ffcf40]/5' : 'border-[#ffdc73] hover:border-[#ffcf40]/60 hover:bg-[#ffcf40]/5'}
                    ${images.length >= 7 ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-[#ffbf00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <p className="text-sm text-[#1C1917] font-medium">
                    {images.length >= 7 ? 'Maximum images reached' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-[#bf9b30]/60 font-semibold">{images.length}/7 images selected</p>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />

                {/* Preview Grid — 7 slots */}
                <div className="grid grid-cols-4 gap-2 animate-field">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="aspect-square relative">
                      {previews[i] ? (
                        <>
                          <img src={previews[i]} alt={`preview-${i}`}
                            className="w-full h-full object-cover rounded-lg border border-[#ffdc73]" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#bf9b30] text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors font-bold shadow-xs">
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full border border-dashed border-[#ffdc73] rounded-lg flex items-center justify-center bg-white">
                          {i === 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ffdc73]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Submit — full width */}
            <div className="pt-4 animate-field">
              <button type="submit" disabled={isLoading}
                className="w-full bg-[#bf9b30] cursor-pointer text-white font-bold text-sm uppercase tracking-[0.1em] py-4 rounded-lg hover:bg-[#ffbf00] hover:text-[#1C1917] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs">
                {isLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>

          </form>
        </div>
      </main>

    </div>
  );
};

export default CreateProduct;
