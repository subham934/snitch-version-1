import React, { useState, useRef } from 'react';
import { useProduct } from '../hooks/useProduct.js';

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

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls = "w-full bg-[#1b1b1d] border border-[#4f4633] rounded-lg px-4 py-3 text-[#e5e1e4] text-base outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all placeholder:text-[#4f4633] selection:bg-[#fbbf24]/20";

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]" style={{ fontFamily: "'Geist', sans-serif" }}>

      {/* Ambient glow blobs — matching login page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container rounded-full mix-blend-screen filter blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container rounded-full mix-blend-screen filter blur-[140px]" />
      </div>

      {/* ── Main ── */}
      <main className="py-14 px-4 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#e5e1e4] mb-2">Create Product</h1>
            <p className="text-[#d3c5ac] text-base">Add a new drop to your SNITCH store</p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#1f1f21] border border-outline-variant rounded-xl p-8 md:p-12 space-y-8"
          >

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Left column: text fields */}
              <div className="space-y-6">

                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3c5ac]">
                    Product Title
                  </label>
                  <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter product title" required className={inputCls} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3c5ac]">
                    Description
                  </label>
                  <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..." required className={`${inputCls} resize-none`} />
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="priceAmount" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                      Price
                    </label>
                    <input id="priceAmount" type="number" min="0" step="0.01" value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)} placeholder="0.00" required className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priceCurrency" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3c5ac]">
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
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d3c5ac]">
                    Product Images (up to 7)
                  </label>
                  <span className="text-[10px] text-[#9c8f79] uppercase tracking-wider">Max 5 MB each</span>
                </div>

                {/* Dropzone */}
                <div
                  onClick={handleDropzoneClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none
                    ${isDragging ? 'border-[#fbbf24] bg-[#fbbf24]/5' : 'border-[#4f4633] hover:border-[#fbbf24]/60 hover:bg-[#fbbf24]/5'}
                    ${images.length >= 7 ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-[#fbbf24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <p className="text-sm text-[#e5e1e4]">
                    {images.length >= 7 ? 'Maximum images reached' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-[#9c8f79]">{images.length}/7 images selected</p>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />

                {/* Preview Grid — 7 slots */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="aspect-square relative">
                      {previews[i] ? (
                        <>
                          <img src={previews[i]} alt={`preview-${i}`}
                            className="w-full h-full object-cover rounded-lg border border-[#4f4633]" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#fbbf24] text-[#0e0e10] rounded-full text-[10px] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors font-bold">
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full border border-dotted border-[#4f4633] rounded-lg flex items-center justify-center bg-[#1b1b1d]/50">
                          {i === 0 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#4f4633]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
            <div className="pt-4">
              <button type="submit" disabled={isLoading}
                className="w-full bg-primary-container cursor-pointer text-[#0e0e10] font-bold text-sm uppercase tracking-[0.1em] py-4 rounded-lg hover:bg-[#f9bd22] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed">
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
