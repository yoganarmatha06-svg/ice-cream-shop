import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useScrollAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Subtle parallax mouse / scroll handler
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const floatingElements = document.querySelectorAll('.floating-layer');
      floatingElements.forEach((el, index) => {
        const speed = (index + 1) * 0.15;
        const direction = index % 2 === 0 ? 1 : -1;
        el.style.transform = `translate3d(0, ${scrolled * speed * direction}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { containerRef };
};

export const animateOnScroll = (selector, options = {}) => {
  if (typeof window === 'undefined') return;
  gsap.fromTo(
    selector,
    { opacity: 0, y: options.y || 40 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.8,
      stagger: options.stagger || 0.15,
      ease: 'power2.out',
    }
  );
};
