// Animation configurations for consistent, professional animations
export const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },

  // Staggered container animations
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Card/item animations
  card: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1]
      }
    }
  },

  // Button animations
  button: {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
    }
  },

  // Modal animations
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    content: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.9, y: 20 },
      transition: { 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        scale: { duration: 0.3 }
      }
    }
  },

  // Sidebar animations
  sidebar: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Loading spinner
  spinner: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  },

  // Fade in animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },

  // Slide up animations
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },

  // Scale animations
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Drag and drop animations
  drag: {
    drag: { scale: 1.05, rotate: 2 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },

  // Form field animations
  formField: {
    focus: { scale: 1.02 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },

  // Success/error animations
  notification: {
    initial: { opacity: 0, y: -20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.9 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// Easing functions for consistent motion
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1]
};

// Spring configurations
export const spring = {
  stiffness: 300,
  damping: 30,
  mass: 1
}; 