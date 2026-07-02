import React, { useEffect, useState } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import { useParams } from 'react-router';
import { useTransitionNavigate } from '../../../components/TransitionLayout.jsx';
import gsap from 'gsap';

// Helper Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const SellerProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [localVariants, setLocalVariants] = useState([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // UI state for inputs to maintain focus
  const [attributeInputs, setAttributeInputs] = useState([{ key: '', value: '' }]);

  // New variant state
  const [newVariant, setNewVariant] = useState({
    images: [],
    stock: 0,
    attributes: {},
    price: { amount: '', currency: 'INR' }
  });

  const { productId } = useParams();
  const transitionNavigate = useTransitionNavigate();
  const productHook = useProduct();
  const { handleGetProductById, handleAddProductVariant } = productHook;

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const data = await handleGetProductById(productId);
      const prod = data?.product || data;
      setProduct(prod);
      if (prod?.variants) {
        setLocalVariants(prod.variants);
      }
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Entrance animations for sections
  useEffect(() => {
    if (loading || !product) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.anim-header', { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
      .fromTo('.anim-gallery', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .fromTo('.anim-info', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.5')
      .fromTo('.anim-variants', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');
  }, [loading, product]);

  const handleStockChange = (index, newStock) => {
    const updatedVariants = [...localVariants];
    updatedVariants[index] = { ...updatedVariants[index], stock: Number(newStock) };
    setLocalVariants(updatedVariants);
  };

  const handleAddNewVariant = async () => {
    const hasValidAttribute = attributeInputs.some(attr => attr.key.trim() && attr.value.trim());
    if (!hasValidAttribute) {
      alert("At least one valid attribute is required.");
      return;
    }

    const cleanImages = newVariant.images.map(img => ({ url: img.previewUrl, file: img.file }));
    const cleanAttributes = { ...newVariant.attributes };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined // price is optional
    };

    setLocalVariants([...localVariants, variantToSave]);
    setIsAddingVariant(false);

    try {
      await handleAddProductVariant(productId, variantToSave);
    } catch (err) {
      console.error("Failed to add product variant via API", err);
    }
    // Reset Form
    setAttributeInputs([{ key: '', value: '' }]);
    setNewVariant({
      images: [],
      stock: 0,
      attributes: {},
      price: { amount: '', currency: 'INR' }
    });
  };

  const handleAddAttribute = () => {
    setAttributeInputs(prev => [...prev, { key: '', value: '' }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedInputs = [...attributeInputs];
    updatedInputs[index][field] = value;
    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[attr.key.trim()] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleRemoveAttribute = (index) => {
    const updatedInputs = attributeInputs.filter((_, i) => i !== index);
    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};
    updatedInputs.forEach(attr => {
      if (attr.key.trim() !== '') {
        newAttrsObj[attr.key.trim()] = attr.value;
      }
    });
    setNewVariant(prev => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 7 - newVariant.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`You can only upload up to 7 images. ${filesToAdd.length} added.`);
    }

    const newImageObjects = filesToAdd.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setNewVariant(prev => ({
      ...prev,
      images: [...prev.images, ...newImageObjects]
    }));
    
    e.target.value = '';
  };
  
  const handleRemoveImage = (index) => {
    const imageToRemove = newVariant.images[index];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const updatedImages = newVariant.images.filter((_, i) => i !== index);
    setNewVariant(prev => ({ ...prev, images: updatedImages }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-[#1C1917] font-body relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ffcf40]/10 rounded-full filter blur-[140px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffdc73]/30 border-t-[#ffbf00] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-[#bf9b30] uppercase">Loading product gallery...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-[#1C1917] font-body">
        <div className="w-16 h-16 rounded-2xl bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-[32px] text-[#ffbf00]">error</span>
        </div>
        <h3 className="font-headline font-bold text-[#1C1917] text-xl mb-2">Product Not Found</h3>
        <button
          onClick={() => transitionNavigate('/seller/dashboard')}
          className="flex items-center gap-2 bg-[#bf9b30] hover:bg-[#ffbf00] text-white hover:text-[#1C1917] font-bold text-sm px-5 py-3 rounded-lg transition-all duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-[#1C1917] pb-24 relative overflow-hidden">
      {/* Ambient gold glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ffcf40]/15 rounded-full filter blur-[140px]" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[#ffbf00]/10 rounded-full filter blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-10">
        {/* Header / Top Bar */}
        <header className="anim-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-[#ffdc73]/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => transitionNavigate('/seller/dashboard')}
              className="w-10 h-10 rounded-lg bg-white border border-[#ffdc73]/50 hover:border-[#ffbf00]/60 flex items-center justify-center text-[#bf9b30] hover:text-[#1C1917] transition-all hover:shadow-[0_4px_12px_rgba(191,155,48,0.1)] active:scale-95"
            >
              <BackIcon />
            </button>
            <div>
              <p className="text-[#ffbf00] font-headline font-black tracking-[0.2em] text-xs uppercase mb-1">SNITCH</p>
              <h1 className="font-headline font-black text-2xl md:text-3xl text-[#1C1917] tracking-tight">
                {product.title}
              </h1>
            </div>
          </div>
          <div className="bg-[#ffdc73]/20 border border-[#ffcf40]/30 rounded-lg px-4 py-2 self-start sm:self-auto">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-[#bf9b30]/80 block">Base Price</span>
            <span className="font-headline font-black text-xl text-[#bf9b30]">
              {formatCurrency(product.price?.amount, product.price?.currency)}
            </span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Base Product Info Block */}
          <section className="lg:col-span-5 space-y-6 anim-gallery">
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl border border-[#ffdc73]/40 p-4 shadow-[0_4px_24px_rgba(191,155,48,0.06)]">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-50 border border-stone-100 mb-4 group">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#ffdc73]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs text-[#bf9b30]/50 font-label font-semibold">No Image Available</span>
                  </div>
                )}
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#ffbf00]/60 to-transparent" />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === i ? 'border-[#ffbf00] scale-95' : 'border-transparent hover:border-[#ffdc73]'
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Info */}
            <div className="anim-info bg-white rounded-2xl border border-[#ffdc73]/40 p-6 shadow-[0_4px_24px_rgba(191,155,48,0.06)]">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-[#bf9b30]/90 mb-2">Description</h3>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </section>

          {/* Variants & Inventory Section */}
          <section className="lg:col-span-7 space-y-6 anim-variants">
            <div className="bg-white rounded-2xl border border-[#ffdc73]/40 p-6 md:p-8 shadow-[0_4px_24px_rgba(191,155,48,0.06)]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-[#ffdc73]/20">
                <div>
                  <h2 className="font-headline font-black text-xl text-[#1C1917] tracking-tight">
                    Product Variants
                  </h2>
                  <p className="text-xs text-[#bf9b30]/80 mt-0.5">Manage details and stocks for variations</p>
                </div>
                {!isAddingVariant && (
                  <button
                    onClick={() => setIsAddingVariant(true)}
                    className="flex items-center gap-2 bg-[#bf9b30] hover:bg-[#ffbf00] text-white hover:text-[#1C1917] font-bold text-xs px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.97]"
                  >
                    <PlusIcon /> Add New Variant
                  </button>
                )}
              </div>

              {/* Form to Add New Variant */}
              {isAddingVariant && (
                <div className="bg-stone-50/70 border border-[#ffdc73]/50 rounded-xl p-5 md:p-6 mb-8 shadow-inner animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline font-bold text-base text-[#1C1917]">Create Variant</h3>
                    <button
                      onClick={() => setIsAddingVariant(false)}
                      className="text-stone-400 hover:text-[#ba1a1a] text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Attributes */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#bf9b30] mb-2">
                          Attributes (e.g. Size, Color) *
                        </label>
                        <div className="space-y-2">
                          {attributeInputs.map((attr, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Key (e.g. Size)"
                                value={attr.key}
                                onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                className="w-1/2 bg-white border border-[#ffdc73]/60 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffbf00]"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g. XL)"
                                value={attr.value}
                                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                className="w-1/2 bg-white border border-[#ffdc73]/60 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffbf00]"
                              />
                              {attributeInputs.length > 1 && (
                                <button
                                  onClick={() => handleRemoveAttribute(index)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleAddAttribute}
                          className="mt-2 text-[#bf9b30] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#ffbf00] transition-colors"
                        >
                          <PlusIcon /> Add Attribute
                        </button>
                      </div>

                      {/* Stock & Custom Price */}
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#bf9b30] mb-1.5">
                            Initial Stock
                          </label>
                          <input
                            type="number"
                            value={newVariant.stock}
                            onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                            className="w-full bg-white border border-[#ffdc73]/60 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffbf00]"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#bf9b30] mb-1.5">
                            Custom Price (Optional)
                          </label>
                          <input
                            type="number"
                            value={newVariant.price.amount}
                            onChange={(e) => setNewVariant({
                              ...newVariant,
                              price: { ...newVariant.price, amount: e.target.value }
                            })}
                            placeholder="Base price is used"
                            className="w-full bg-white border border-[#ffdc73]/60 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffbf00]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Images */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#bf9b30]">
                            Upload Images (Max 7)
                          </label>
                          <span className="text-[10px] font-semibold text-stone-500">
                            {newVariant.images.length}/7
                          </span>
                        </div>

                        {newVariant.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {newVariant.images.map((img, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white border border-stone-200">
                                <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute top-0.5 right-0.5 bg-white/90 p-1 text-red-500 rounded hover:bg-white hover:text-red-700 transition-colors"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {newVariant.images.length < 7 && (
                          <div className="relative border-2 border-dashed border-[#ffdc73]/60 hover:border-[#ffbf00] rounded-xl p-4 bg-white flex flex-col items-center justify-center transition-colors cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="material-symbols-outlined text-[24px] text-[#bf9b30] group-hover:scale-110 transition-transform mb-1">
                              cloud_upload
                            </span>
                            <span className="text-[10px] font-bold text-stone-500 group-hover:text-stone-700">
                              CHOOSE IMAGE FILES
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleAddNewVariant}
                      className="bg-gradient-to-r from-[#bf9b30] to-[#ffbf00] text-white hover:text-[#1C1917] font-bold text-xs px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-[0_4px_16px_rgba(191,155,48,0.25)]"
                    >
                      Save Variant
                    </button>
                  </div>
                </div>
              )}

              {/* Variants Grid / List */}
              {localVariants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#ffdc73]/40 rounded-xl bg-stone-50/50">
                  <div className="w-12 h-12 rounded-xl bg-[#ffdc73]/20 border border-[#ffcf40]/30 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px] text-[#ffbf00]">layers</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-[#1C1917] mb-1">No variants created yet</h4>
                  <p className="text-xs text-stone-500 font-label max-w-xs">
                    Create size, color, or other options for this product to manage unique inventory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#ffdc73]/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col pt-3"
                    >
                      {/* Details row */}
                      <div className="px-4 flex gap-3 h-20 mb-3">
                        {/* Variant Thumb */}
                        <div className="w-14 h-14 bg-stone-50 border border-stone-100 rounded-lg overflow-hidden shrink-0">
                          {variant.images && variant.images.length > 0 ? (
                            <img src={variant.images[0]?.url} alt="Variant" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[#bf9b30]/50 font-bold uppercase">
                              N/A
                            </div>
                          )}
                        </div>

                        {/* Info details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(variant.attributes)
                              ? variant.attributes.map(a => [a.key, a.value])
                              : Object.entries(variant.attributes || {})
                            ).map(([key, val]) => (
                              <span
                                key={key}
                                className="bg-[#ffdc73]/20 border border-[#ffcf40]/25 text-[#bf9b30] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              >
                                <span className="opacity-60">{key}:</span> {val}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs font-bold text-stone-600">
                            {variant.price
                              ? typeof variant.price === 'object'
                                ? formatCurrency(variant.price.amount, variant.price.currency)
                                : formatCurrency(variant.price, product.price?.currency)
                              : formatCurrency(product.price?.amount, product.price?.currency)}
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Selector / Slider */}
                      <div className="mt-auto border-t border-[#ffdc73]/20 bg-[#ffdc73]/5 px-4 py-2.5 flex items-center justify-between">
                        <label className="text-[10px] font-label font-bold uppercase tracking-wider text-[#bf9b30]">
                          Current Stock
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={variant.stock || 0}
                            onChange={(e) => handleStockChange(idx, e.target.value)}
                            className="w-16 bg-white border border-[#ffdc73]/60 rounded-md py-1 px-2 text-right focus:outline-none focus:border-[#ffbf00] font-headline font-bold text-xs text-[#1C1917]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SellerProductDetails;
