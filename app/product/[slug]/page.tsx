'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Review } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import ProductCard from '@/components/ProductCard';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Sparkles,
  Check,
  Bell,
  Send,
  ArrowRight,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Restock form
  const [restockEmail, setRestockEmail] = useState('');
  const [restockRegistered, setRestockRegistered] = useState(false);

  // Review form
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          const found = data.products.find(
            (p: Product) => p.slug === slug || p.id === slug
          );
          if (found) {
            setProduct(found);
            setSelectedImage(found.images[0] || '/images/loop-and-love-logo.jpg');
            if (found.variants && found.variants.length > 0) {
              setSelectedColor(found.variants[0].colorName);
              setSelectedSize(found.variants[0].sizeName);
            }

            // Find related
            const related = data.products
              .filter((p: Product) => p.id !== found.id && p.categoryId === found.categoryId)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      })
      .catch((err) => console.error('Product fetch error:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-brand-900">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
        <p className="text-sm font-medium">Gathering artisanal details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested crochet creation could not be located.</p>
        <Link href="/shop" className="mt-6 inline-block px-6 py-2.5 rounded-full bg-brand-600 text-white text-xs font-semibold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isSoldOut = product.status === 'SOLD_OUT' || product.stock <= 0;
  const currentPrice = product.discountPrice || product.price;
  const originalPrice = product.price;
  const discountPercent =
    product.discountPrice && originalPrice > product.discountPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    router.push('/checkout');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockEmail.trim()) {
      setRestockRegistered(true);
      setRestockEmail('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userId: user?.id || 'guest',
      userName: user?.name || 'Handmade Lover',
      rating: newRating,
      comment: newComment,
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* BREADCRUMB */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-900">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-900">Shop</Link>
        <span>/</span>
        <span className="text-brand-700 font-medium truncate">{product.name}</span>
      </nav>

      {/* PRODUCT MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* LEFT: GALLERY & IMAGES */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white border border-canvas-border shadow-cozy">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center">
                <span className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold text-sm tracking-widest uppercase shadow-lg">
                  SOLD OUT
                </span>
              </div>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
                isInWishlist(product.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-brand-900 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img ? 'border-brand-600 ring-2 ring-brand-300' : 'border-canvas-border hover:border-brand-400'
                  }`}
                >
                  <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS & ACTIONS */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-500">
              {product.category} • SKU: {product.sku}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-brand-900 mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating) ? 'fill-amber-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-900">
                {product.averageRating} ({product.reviewCount} verified reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 bg-brand-50/70 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-900">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {product.discountPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                Inclusive of all taxes • Free Shipping above ₹999
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isSoldOut
                    ? 'bg-rose-100 text-rose-700'
                    : product.stock <= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isSoldOut
                  ? 'Sold Out'
                  : product.stock <= 5
                  ? `Only ${product.stock} left in stock!`
                  : 'In Stock & Ready'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants: Colors */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                Color Shade: <span className="text-brand-900 font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedColor(v.colorName);
                      if (v.sizeName) setSelectedSize(v.sizeName);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      selectedColor === v.colorName
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold ring-1 ring-brand-400'
                        : 'border-canvas-border hover:border-brand-300 text-gray-700'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: v.colorHex || '#9D7BB0' }}
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                    />
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants: Sizes */}
          {product.variants && product.variants[0]?.sizeName && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                Size / Dimension: <span className="text-brand-900 font-bold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v) => v.sizeName))).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                      selectedSize === sz
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold ring-1 ring-brand-400'
                        : 'border-canvas-border hover:border-brand-300 text-gray-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          {isSoldOut ? (
            /* SOLD OUT RESTOCK NOTIFICATION BOX */
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Bell className="w-4 h-4 text-rose-600" />
                <span>Currently Out of Stock</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Our artisans are preparing the next batch of yarn for this creation. Enter your email to be the first to know when it restocks!
              </p>
              {restockRegistered ? (
                <div className="p-3 bg-white rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> You are on the restock notification list!
                </div>
              ) : (
                <form onSubmit={handleRestockSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={restockEmail}
                    onChange={(e) => setRestockEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-rose-300 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs"
                  >
                    Notify Me
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-canvas-border bg-white rounded-2xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl hover:bg-canvas-subtle font-bold text-brand-900 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-brand-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 rounded-xl hover:bg-canvas-subtle font-bold text-brand-900 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-cozy hover:shadow-cozy-lg transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-2xl bg-brand-900 hover:bg-black text-white font-bold text-sm shadow-cozy transition-all active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              {addedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Added to your cart!
                  </span>
                  <Link href="/cart" className="font-bold underline">
                    View Cart →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* SPECIFICATIONS & ACCORDION PILLS */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-canvas-border text-xs">
            <div className="p-3 rounded-2xl bg-white border border-canvas-border">
              <span className="text-gray-400 block font-medium">Materials</span>
              <span className="font-semibold text-brand-900 mt-0.5 block">{product.materials}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-canvas-border">
              <span className="text-gray-400 block font-medium">Dimensions</span>
              <span className="font-semibold text-brand-900 mt-0.5 block">{product.dimensions}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-canvas-border">
              <span className="text-gray-400 block font-medium">Handmade Prep Time</span>
              <span className="font-semibold text-brand-900 mt-0.5 block">
                ⏱️ {product.prepTimeDays} Business Days
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-canvas-border">
              <span className="text-gray-400 block font-medium">Care Guide</span>
              <span className="font-semibold text-brand-900 mt-0.5 block line-clamp-1" title={product.careInstructions}>
                {product.careInstructions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS */}
      <section className="mt-16 sm:mt-24 pt-12 border-t border-canvas-border">
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-brand-900">Artisan Reviews & Feedback</h2>
          <p className="text-xs text-gray-500 mt-1">Read honest experiences from fellow crochet collectors.</p>

          {/* New Review Form */}
          <form onSubmit={handleReviewSubmit} className="mt-6 bg-white p-6 rounded-3xl border border-canvas-border shadow-cozy space-y-4">
            <h3 className="font-serif font-bold text-sm text-brand-900">Leave Your Review</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Your Rating:</span>
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setNewRating(num)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-5 h-5 ${num <= newRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={3}
              placeholder="How do you love the yarn texture, stitch quality, or packaging?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full text-xs p-3 bg-canvas-subtle border border-canvas-border rounded-xl focus:outline-none focus:border-brand-500 text-brand-900 resize-none"
            />
            <div className="flex items-center justify-between">
              {reviewSubmitted && (
                <span className="text-xs text-emerald-600 font-semibold">
                  Thank you! Your review has been added.
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </div>
          </form>

          {/* Reviews List */}
          <div className="mt-8 space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-2xl border border-canvas-border shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-900">{rev.userName}</span>
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-gray-400 block">Verified Buyer • Just now</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-12 border-t border-canvas-border">
          <h2 className="font-serif text-2xl font-bold text-brand-900 mb-8">You Might Also Adore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
