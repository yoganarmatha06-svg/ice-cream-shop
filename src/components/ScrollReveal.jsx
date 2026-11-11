import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Premium cubic-bezier easing for luxury brand smoothness
const smoothEase = [0.22, 1, 0.36, 1];

// Animation variant presets
const getVariants = (animation, distance = 40) => {
  switch (animation) {
    case 'fade-up':
      return {
        hidden: { opacity: 0, y: distance, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      };
    case 'fade-down':
      return {
        hidden: { opacity: 0, y: -distance, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      };
    case 'fade-left':
      // Slides in from the right toward the left
      return {
        hidden: { opacity: 0, x: distance, filter: 'blur(4px)' },
        visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
      };
    case 'fade-right':
      // Slides in from the left toward the right
      return {
        hidden: { opacity: 0, x: -distance, filter: 'blur(4px)' },
        visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
      };
    case 'zoom-in':
      return {
        hidden: { opacity: 0, scale: 0.88, filter: 'blur(6px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      };
    case 'zoom-out':
      return {
        hidden: { opacity: 0, scale: 1.12, filter: 'blur(6px)' },
        visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      };
    case 'blur-in':
      return {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
        visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
      };
    case 'fade':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
};

/**
 * Reusable ScrollReveal Component
 * Animates into view smoothly when scrolled into the viewport.
 */
export const ScrollReveal = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.7,
  distance = 40,
  once = false,
  threshold = 0.15,
  className = '',
  style = {},
  as = 'div',
  ...rest
}) => {
  const Component = motion[as] || motion.div;
  const variants = getVariants(animation, distance);

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: smoothEase,
      }}
      className={className}
      style={{ willChange: 'transform, opacity, filter', ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * StaggerContainer Component
 * Orchestrates child items to reveal in sequence with stagger effect.
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.12,
  initialDelay = 0.05,
  once = false,
  threshold = 0.1,
  className = '',
  style = {},
  ...rest
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={containerVariants}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem Component
 * Used inside StaggerContainer to animate automatically with parent's stagger timing.
 */
export const StaggerItem = ({
  children,
  animation = 'fade-up',
  distance = 35,
  duration = 0.65,
  className = '',
  style = {},
  ...rest
}) => {
  const variants = getVariants(animation, distance);

  return (
    <motion.div
      variants={variants}
      transition={{ duration, ease: smoothEase }}
      className={className}
      style={{ willChange: 'transform, opacity, filter', ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * TextReveal Component
 * Splits text into words with smooth slide-up and blur clear effect.
 */
export const TextReveal = ({
  text = '',
  className = '',
  style = {},
  as = 'h2',
  delay = 0,
  once = false,
  highlightWord = '',
  highlightClass = '',
}) => {
  const words = text.split(' ');
  const Component = motion[as] || motion.div;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      filter: 'blur(8px)',
      rotateX: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: smoothEase,
      },
    },
  };

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={containerVariants}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28em', ...style }}
    >
      {words.map((word, idx) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());
        return (
          <span key={idx} style={{ display: 'inline-block', overflow: 'hidden' }}>
            <motion.span
              variants={wordVariants}
              style={{ display: 'inline-block' }}
              className={isHighlight ? highlightClass : undefined}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Component>
  );
};

/**
 * ParallaxItem Component
 * Translates vertically or scales smoothly based on page scroll using Framer Motion.
 */
export const ParallaxItem = ({
  children,
  speed = 40,
  direction = 1,
  className = '',
  style = {},
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [-speed * direction, speed * direction]);
  const y = useSpring(rawY, { stiffness: 120, damping: 24 });

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

