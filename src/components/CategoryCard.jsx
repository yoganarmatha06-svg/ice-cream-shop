import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategoryImage } from '../assets/images/categories';

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

  const handleClick = () => {
    navigate(`/shop?category=${encodeURIComponent(category.slug || category.name)}`);
  };

  const imageSrc = getCategoryImage(category);

  return (
    <motion.div
      className="category-card"
      variants={customVariants}
      whileHover={{
        y: -10,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 350, damping: 25 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      viewport={{ once: false, amount: 0.15 }}
    >
      <div className="category-img-wrapper">
        <motion.img
          src={imageSrc}
          alt={category.name}
          loading="lazy"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.4 }}
          onError={(e) => {
            e.target.src = getCategoryImage({ slug: 'vanilla' });
          }}
        />
      </div>
      <h3 className="category-title">{category.name}</h3>
      <span className="category-count">
        {category.productCount ? `${category.productCount} Flavours` : 'Explore Flavours'}
      </span>
    </motion.div>
  );
};

export default CategoryCard;
