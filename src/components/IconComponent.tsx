import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IconButtonProps {
  iconName: string;
  size?: number;
  color?: string;
  style?: any;
}

export const IconComponent: React.FC<IconButtonProps> = ({ 
  iconName, 
  size = 24, 
  color = '#000', 
  style 
}) => {
  return <Icon name={iconName} size={size} color={color} style={style} />;
};

export default IconComponent;
