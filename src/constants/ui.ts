// src/constants/ui.ts
export const COLORS = {
  primary: '#6e44ff',
  cardBackground: '#EADFCA',
  black: '#000000',
  hover: '#1f2937',
} as const;

export const NO_SELECT_STYLES = {
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
};

export const ANIMATION_VARIANTS = {
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  featureCard: {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }
} as const;

export const FOOD_EMOJIS = ['🥗', '🍎', '🥑', '🍊', '🥕', '🫐', '🍇', '🥦', '🍌', '🫒'] as const;
