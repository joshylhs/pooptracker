import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size: number;       // outer diameter of the ring
  avatarSize: number; // inner content size — gap = (size - avatarSize) / 2
  color?: string;
  children: React.ReactNode;
}

export default function SpinningRing({ size, avatarSize, color = '#7F77DD', children }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // more dashes, smaller gaps
  const dashLen = circumference / 32;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Spinning dashed ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate }],
        }}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${dashLen}`}
            fill="none"
          />
        </Svg>
      </Animated.View>
      {/* Avatar content centred inside */}
      {children}
    </View>
  );
}
