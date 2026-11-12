import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import '../styles/product3d.css';

const getFlavorColors = (flavor = '') => {
  const f = flavor.toLowerCase();
  if (f.includes('vanilla')) {
    return {
      glow: 'rgba(254, 240, 138, 0.5)',
      shadow: 'rgba(180, 150, 80, 0.28)',
      highlight: '#fef08a',
    };
  }
  if (f.includes('choco') || f.includes('cocoa')) {
    return {
      glow: 'rgba(120, 70, 50, 0.42)',
      shadow: 'rgba(70, 35, 20, 0.32)',
      highlight: '#d7ccc8',
    };
  }
  if (f.includes('straw') || f.includes('berry') || f.includes('pink')) {
    return {
      glow: 'rgba(251, 113, 133, 0.45)',
      shadow: 'rgba(225, 29, 72, 0.28)',
      highlight: '#fbcfe8',
    };
  }
  if (f.includes('mango') || f.includes('passion')) {
    return {
      glow: 'rgba(251, 191, 36, 0.48)',
      shadow: 'rgba(217, 119, 6, 0.3)',
      highlight: '#fde68a',
    };
  }
  if (f.includes('blue') || f.includes('cheese')) {
    return {
      glow: 'rgba(168, 85, 247, 0.45)',
      shadow: 'rgba(126, 34, 206, 0.28)',
      highlight: '#e9d5ff',
    };
  }
  if (f.includes('pista') || f.includes('mint')) {
    return {
      glow: 'rgba(74, 222, 128, 0.4)',
      shadow: 'rgba(22, 163, 74, 0.25)',
      highlight: '#bbf7d0',
    };
  }
  return {
    glow: 'rgba(255, 107, 139, 0.4)',
    shadow: 'rgba(45, 24, 16, 0.24)',
    highlight: '#fed7aa',
  };
};

/**
 * Product3DRotator
 * A high-performance, reusable 3D rotating product image component.
 * Features:
 * - Slow & smooth Y-axis ambient rotation
 * - Realistic floating animation with responsive 3D floor shadow
 * - Mouse-driven 3D perspective tilt with spring physics
 * - Dynamic specular lighting sheen and flavor-tinted ambient glow
 * - Mobile & touch support with zero layout shift
 */
const Product3DRotator = ({
  src,
  alt = 'Ice Cream Product',
  flavor = '',
  className = '',
  imageClassName = '',
  showShadow = true,
  showGlow = true,
  showSheen = true,
  fallbackSrc = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  maxTilt = 16,
  onImageClick = null,
}) => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const colors = getFlavorColors(flavor);

  // Motion values for smooth cursor tracking (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Soft springs for silky smooth rotation transitions without sudden snaps
  const springConfig = { stiffness: 220, damping: 22, mass: 0.75 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D perspective rotations driven by cursor tilt
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [`${maxTilt * 0.85}deg`, `-${maxTilt * 0.85}deg`]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  // Dynamic light sheen moves across the surface reflecting the tilt angle
  const sheenLeft = useTransform(smoothX, [-0.5, 0.5], ['10%', '90%']);
  const sheenTop = useTransform(smoothY, [-0.5, 0.5], ['10%', '90%']);
  const sheenOpacity = useTransform(smoothX, [-0.5, 0, 0.5], [0.38, 0.12, 0.38]);

  // Handle Mouse Move over the card to calculate cursor offset
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly glide back to center position
    mouseX.set(0);
    mouseY.set(0);
  };

  // Touch handlers for mobile devices
  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
    mouseX.set(Math.max(-0.5, Math.min(0.5, xPct)));
    mouseY.set(Math.max(-0.5, Math.min(0.5, yPct)));
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={`product-3d-stage size-${size} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onImageClick}
    >
      {/* 3D Perspective Card Wrapper */}
      <motion.div
        className="product-3d-perspective-card"
        style={{
          rotateX: isHovered ? tiltX : 0,
          rotateY: isHovered ? tiltY : 0,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        {/* Soft Ambient Flavor Aura (Behind Product) */}
        {showGlow && (
          <motion.div
            className="product-3d-ambient-glow"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 72%)`,
            }}
            animate={{
              scale: isHovered ? [1, 1.15, 1.05] : [0.95, 1.08, 0.95],
              opacity: isHovered ? 0.9 : 0.65,
            }}
            transition={{
              repeat: Infinity,
              duration: isHovered ? 2.2 : 3.8,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Floating & Rotating 3D Object Core */}
        <motion.div
          className="product-3d-floating-core"
          animate={{
            y: isHovered ? [-4, 4, -4] : [-7, 7, -7],
            rotateY: isHovered ? [-8, 8, -8] : [-12, 12, -12],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: isHovered ? 2.2 : 3.6,
              ease: 'easeInOut',
            },
            rotateY: {
              repeat: Infinity,
              duration: isHovered ? 2.8 : 5.2,
              ease: 'easeInOut',
            },
          }}
          whileHover={{
            scale: 1.08,
            z: 40,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Main Ice Cream Product Image */}
          <div className="product-3d-image-frame">
            <motion.img
              src={imgError && fallbackSrc ? fallbackSrc : src}
              alt={alt}
              className={`product-3d-img ${imageClassName}`}
              loading="lazy"
              onError={() => {
                if (!imgError && fallbackSrc) {
                  setImgError(true);
                }
              }}
            />

            {/* Specular Light Reflection (Shine Layer) */}
            {showSheen && (
              <motion.div
                className="product-3d-specular-sheen"
                style={{
                  background: `radial-gradient(circle at center, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.1) 45%, transparent 75%)`,
                  left: sheenLeft,
                  top: sheenTop,
                  opacity: sheenOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* 3D Rim Lighting Edge Accent */}
            <div
              className="product-3d-rim-accent"
              style={{
                boxShadow: `inset 0 0 16px 2px ${colors.highlight}`,
              }}
            />
          </div>
        </motion.div>

        {/* Realistic Dynamic 3D Floor Shadow */}
        {showShadow && (
          <motion.div
            className="product-3d-floor-shadow"
            style={{
              background: `radial-gradient(ellipse at center, ${colors.shadow} 0%, rgba(0, 0, 0, 0.02) 75%)`,
            }}
            animate={{
              scaleX: isHovered ? [1.12, 0.95, 1.12] : [1.08, 0.88, 1.08],
              scaleY: isHovered ? [1.1, 0.92, 1.1] : [1.05, 0.85, 1.05],
              opacity: isHovered ? [0.55, 0.32, 0.55] : [0.42, 0.22, 0.42],
            }}
            transition={{
              repeat: Infinity,
              duration: isHovered ? 2.2 : 3.6,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Product3DRotator;

