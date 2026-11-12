import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { getCategoryImage } from '../assets/images/categories';

const getCategory3DTheme = (category) => {
  const name = (category.slug || category.name || '').toLowerCase();
  if (name.includes('vanilla')) {
    return { glow: 'rgba(254, 240, 138, 0.6)', shadow: 'rgba(180, 150, 80, 0.32)', highlight: '#fef08a' };
  }
  if (name.includes('choco') || name.includes('cocoa')) {
    return { glow: 'rgba(120, 70, 50, 0.48)', shadow: 'rgba(70, 35, 20, 0.35)', highlight: '#d7ccc8' };
  }
  if (name.includes('straw') || name.includes('berry')) {
    return { glow: 'rgba(251, 113, 133, 0.52)', shadow: 'rgba(225, 29, 72, 0.32)', highlight: '#fbcfe8' };
  }
  if (name.includes('mango') || name.includes('passion')) {
    return { glow: 'rgba(251, 191, 36, 0.55)', shadow: 'rgba(217, 119, 6, 0.32)', highlight: '#fde68a' };
  }
  if (name.includes('blue') || name.includes('cheese')) {
    return { glow: 'rgba(168, 85, 247, 0.52)', shadow: 'rgba(126, 34, 206, 0.32)', highlight: '#e9d5ff' };
  }
  if (name.includes('pista') || name.includes('nut')) {
    return { glow: 'rgba(74, 222, 128, 0.48)', shadow: 'rgba(22, 163, 74, 0.28)', highlight: '#bbf7d0' };
  }
  if (name.includes('butterscotch') || name.includes('caramel')) {
    return { glow: 'rgba(253, 186, 116, 0.52)', shadow: 'rgba(194, 65, 12, 0.3)', highlight: '#fed7aa' };
  }
  if (name.includes('coffee') || name.includes('mocha')) {
    return { glow: 'rgba(180, 130, 90, 0.48)', shadow: 'rgba(100, 60, 40, 0.32)', highlight: '#e8d7c8' };
  }
  if (name.includes('cookie')) {
    return { glow: 'rgba(148, 163, 184, 0.48)', shadow: 'rgba(51, 65, 85, 0.3)', highlight: '#cbd5e1' };
  }
  if (name.includes('cotton') || name.includes('candy')) {
    return { glow: 'rgba(186, 230, 253, 0.6)', shadow: 'rgba(244, 114, 182, 0.32)', highlight: '#bae6fd' };
  }
  if (name.includes('mint')) {
    return { glow: 'rgba(94, 234, 212, 0.52)', shadow: 'rgba(13, 148, 136, 0.3)', highlight: '#99f6e4' };
  }
  return { glow: 'rgba(255, 107, 139, 0.48)', shadow: 'rgba(225, 29, 72, 0.28)', highlight: '#fce7ec' };
};

const categoryItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CategoryCard = ({ category, customVariants = categoryItemVariants }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const theme = getCategory3DTheme(category);
  const imageSrc = getCategoryImage(category);

  // Mouse tracking for realistic 3D perspective tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 20, mass: 0.65 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Card tilt in 3D perspective
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], ['10deg', '-10deg']);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], ['-12deg', '12deg']);

  // Inner scoop orb extra tilt and depth pop
  const orbRotateX = useTransform(smoothY, [-0.5, 0.5], ['14deg', '-14deg']);
  const orbRotateY = useTransform(smoothX, [-0.5, 0.5], ['-16deg', '16deg']);

  // Dynamic light sheen moves across the surface reflecting tilt angle
  const sheenLeft = useTransform(smoothX, [-0.5, 0.5], ['10%', '90%']);
  const sheenTop = useTransform(smoothY, [-0.5, 0.5], ['10%', '90%']);
  const sheenOpacity = useTransform(smoothX, [-0.5, 0, 0.5], [0.42, 0.12, 0.42]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleTouchMove = (e) => {
    if (!cardRef.current || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
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

  const handleClick = () => {
    navigate(`/shop?category=${encodeURIComponent(category.slug || category.name)}`);
  };

  return (
    <motion.div
      ref={cardRef}
      className="category-card"
      variants={customVariants}
      style={{
        rotateX: isHovered ? cardRotateX : 0,
        rotateY: isHovered ? cardRotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{
        y: -10,
        scale: 1.04,
        transition: { type: 'spring', stiffness: 350, damping: 25 },
      }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      viewport={{ once: false, amount: 0.15 }}
    >
      {/* 3D Stage for Floating & Rotating Scoop Orb */}
      <div className="category-3d-stage">
        {/* Soft Ambient Flavor Aura (Behind Scoop) */}
        <motion.div
          className="category-3d-ambient-glow"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 72%)`,
          }}
          animate={{
            scale: isHovered ? [1, 1.22, 1.05] : [0.92, 1.1, 0.92],
            opacity: isHovered ? 0.95 : 0.65,
          }}
          transition={{
            repeat: Infinity,
            duration: isHovered ? 2.0 : 3.4,
            ease: 'easeInOut',
          }}
        />

        {/* Floating & Y-Axis Rotating Core */}
        <motion.div
          className="category-3d-floating-core"
          animate={{
            y: isHovered ? [-3, 3, -3] : [-6, 6, -6],
            rotateY: isHovered ? [-8, 8, -8] : [-14, 14, -14],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: isHovered ? 2.0 : 3.4,
              ease: 'easeInOut',
            },
            rotateY: {
              repeat: Infinity,
              duration: isHovered ? 2.5 : 4.8,
              ease: 'easeInOut',
            },
          }}
          whileHover={{
            scale: 1.15,
            z: 35,
            transition: { type: 'spring', stiffness: 320, damping: 22 },
          }}
          style={{
            rotateX: isHovered ? orbRotateX : 0,
            rotateY: isHovered ? orbRotateY : 0,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Circular Frame with Depth */}
          <div className="category-3d-orb-frame">
            <motion.img
              src={imageSrc}
              alt={category.name}
              className="category-3d-orb-img"
              loading="lazy"
              onError={(e) => {
                e.target.src = getCategoryImage({ slug: 'vanilla' });
              }}
            />

            {/* Specular Light Reflection (Shine Layer) */}
            <motion.div
              className="category-3d-specular-sheen"
              style={{
                background:
                  'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 75%)',
                left: sheenLeft,
                top: sheenTop,
                opacity: sheenOpacity,
              }}
            />

            {/* 3D Glass Rim Accent */}
            <div className="category-3d-rim-accent" />
          </div>
        </motion.div>

        {/* Realistic Dynamic Floor Shadow */}
        <motion.div
          className="category-3d-floor-shadow"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.shadow} 0%, rgba(0, 0, 0, 0.02) 75%)`,
          }}
          animate={{
            scaleX: isHovered ? [1.15, 0.92, 1.15] : [1.08, 0.85, 1.08],
            scaleY: isHovered ? [1.12, 0.9, 1.12] : [1.05, 0.82, 1.05],
            opacity: isHovered ? [0.6, 0.35, 0.6] : [0.45, 0.22, 0.45],
          }}
          transition={{
            repeat: Infinity,
            duration: isHovered ? 2.0 : 3.4,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Category Text Content */}
      <div className="category-3d-content">
        <h3 className="category-title">{category.name}</h3>
        <span className="category-count">
          {category.productCount ? `${category.productCount} Flavours` : 'Explore Flavours'}
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
