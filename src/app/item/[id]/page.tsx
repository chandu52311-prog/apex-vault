'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface ColorOption {
  name: string;
  hex: string;
  image?: string;
  cities?: string[];
}

export default function VehicleGallerySection({
  product,
}: {
  product: {
    id: string;
    brand: string;
    model_name: string;
    thumbnail_url: string;
    gallery?: string[];
    colors?: ColorOption[];
  };
}) {
  // 1. Strict Angle Label Mapping
  const ANGLE_LABELS = [
    'Front 3/4 Dynamic',
    'Rear Aero & Diffuser',
    'Side Profile Stance',
    'Driver Cockpit & Steering',
    'Cabin & Bucket Seats',
    'Instrument Cluster & Details',
  ];

  // 2. Safe Gallery Construction: Only from the current product
  const safeGallery = useMemo(() => {
    const list: string[] = [];
    if (product?.thumbnail_url) list.push(product.thumbnail_url);
    if (Array.isArray(product?.gallery)) {
      product.gallery.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }
    // Return max 6 views
    return list.slice(0, 6);
  }, [product]);

  // 3. Isolated Component State per Product ID
  const [activeImage, setActiveImage] = useState<string>(product.thumbnail_url);
  const [activeLabel, setActiveLabel] = useState<string>(
    product?.colors?.[0]?.name || 'Standard Specification'
  );
  const [selectedColorHex, setSelectedColorHex] = useState<string>(
    product?.colors?.[0]?.hex || ''
  );

  // Sync state whenever route/product changes
  useEffect(() => {
    if (product) {
      const initialImg = product.colors?.[0]?.image || product.thumbnail_url;
      setActiveImage(initialImg);
      setActiveLabel(product.colors?.[0]?.name || 'Factory Finish');
      setSelectedColorHex(product.colors?.[0]?.hex || '');
    }
  }, [product.id]);

  // Swatch Click Handler
  const handleColorSelect = (color: ColorOption) => {
    setSelectedColorHex(color.hex);
    setActiveLabel(color.name);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  // Thumbnail Click Handler
  const handleThumbnailClick = (imgUrl: string, idx: number) => {
    setActiveImage(imgUrl);
    // If thumbnail matches a color swatch, update label
    const matchedColor = product.colors?.find((c) => c.image === imgUrl);
    if (matchedColor) {
      setActiveLabel(matchedColor.name);
      setSelectedColorHex(matchedColor.hex);
    } else {
      setActiveLabel(ANGLE_LABELS[idx] || `Studio Angle ${idx + 1}`);
      setSelectedColorHex('');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* HERO IMAGE CONTAINER */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${product.brand} ${product.model_name}`}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-center transition-all duration-500 ease-out"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-neutral-600 uppercase">
            Image Placeholder • {product.brand} {product.model_name}
          </div>
        )}

        {/* Dynamic Label Badge */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
          <p className="text-xs font-medium tracking-wide text-amber-400">
            {activeLabel}
          </p>
        </div>
      </div>

      {/* COLOR FINISHES SWATCHES */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Official Finishes:
          </span>
          <div className="flex items-center gap-2">
            {product.colors.map((color, index) => {
              const isSelected = selectedColorHex === color.hex;
              return (
                <button
                  key={`${color.name}-${index}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={color.name}
                  className={`h-7 w-7 rounded-full border-2 transition-all duration-300 ${
                    isSelected
                      ? 'scale-110 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 6 VERIFIED STUDIO ANGLE THUMBNAILS */}
      {safeGallery.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Studio Angles & Verified Views ({safeGallery.length} Frames)
          </p>
          <div className="grid grid-cols-6 gap-3">
            {safeGallery.map((imgUrl, idx) => {
              const isSelected = activeImage === imgUrl;
              return (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(imgUrl, idx)}
                  className={`group relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-neutral-900 transition-all duration-300 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.model_name} view ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 16vw, 120px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
