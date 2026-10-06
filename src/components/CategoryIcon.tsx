import React from 'react';
import {
  Utensils,
  Home,
  Car,
  HeartPulse,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Tv,
  Compass,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Laptop,
  Coins,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  color?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color,
  className = '',
  size = 18,
}) => {
  const iconProps = {
    size,
    style: color ? { color } : undefined,
    className: `shrink-0 ${className}`,
  };

  switch (iconName) {
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Coffee':
      return <Coffee {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'Tv':
      return <Tv {...iconProps} />;
    case 'Compass':
      return <Compass {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'Coins':
      return <Coins {...iconProps} />;
    case 'PlusCircle':
      return <PlusCircle {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};
