import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'pulse', 
  color = 'indigo',
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </motion.div>
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className={colorClasses[color]}
                strokeDasharray="62.83"
                strokeDashoffset="62.83"
                animate={{
                  strokeDashoffset: [62.83, 0, 62.83]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        );

      case 'bars':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={`w-1 rounded-full ${colorClasses[color]}`}
                style={{ height: size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px' }}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'cube':
        return (
          <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="relative w-full h-full">
              <motion.div
                className={`absolute w-full h-full border-2 ${colorClasses[color]} border-opacity-20`}
                animate={{
                  rotateX: [0, 90, 180, 270, 360],
                  rotateY: [0, 90, 180, 270, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  transformStyle: "preserve-3d"
                }}
              />
            </div>
          </motion.div>
        );

      case 'wave':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className={`w-1 rounded-full ${colorClasses[color]}`}
                style={{ height: size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px' }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'spinner':
        return (
          <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className={colorClasses[color]}
                strokeLinecap="round"
                animate={{
                  strokeDasharray: ["0 62.83", "31.42 31.42", "0 62.83"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        );

      case 'orbit':
        return (
          <motion.div
            className={`${sizeClasses[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="relative w-full h-full">
              <motion.div
                className={`absolute w-2 h-2 rounded-full ${colorClasses[color]}`}
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px'
                }}
                animate={{
                  x: [0, 8, 0, -8, 0],
                  y: [-8, 0, 8, 0, -8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className={`absolute w-2 h-2 rounded-full ${colorClasses[color]}`}
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px'
                }}
                animate={{
                  x: [0, -8, 0, 8, 0],
                  y: [8, 0, -8, 0, 8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderSpinner()}
      {showText && text && (
        <motion.p
          className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const PageSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner 
      size="lg" 
      variant="spinner" 
      color="indigo" 
      text={text}
      showText={true}
    />
  </div>
);

export const ButtonSpinner = ({ size = 'sm', color = 'white' }) => (
  <LoadingSpinner 
    size={size} 
    variant="dots" 
    color={color} 
    showText={false}
  />
);

export const CardSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner 
      size="md" 
      variant="ring" 
      color="indigo" 
      text={text}
      showText={true}
    />
  </div>
);

export const InlineSpinner = ({ size = 'sm', color = 'indigo' }) => (
  <LoadingSpinner 
    size={size} 
    variant="pulse" 
    color={color} 
    showText={false}
  />
);

export default LoadingSpinner;

