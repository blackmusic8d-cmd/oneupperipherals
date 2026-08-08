import React from 'react';

// Official logo image asset path
const OFFICIAL_LOGO_SRC = '/images/official_1up_logo_1786103391822.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Height sizing
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`flex items-center select-none ${heightClasses[size]} ${className}`}>
      <img
        src={OFFICIAL_LOGO_SRC}
        alt="1UP Peripherals Official Logo"
        referrerPolicy="no-referrer"
        className="h-full w-auto object-contain rounded brightness-105 contrast-105 drop-shadow-md"
      />
    </div>
  );
};


