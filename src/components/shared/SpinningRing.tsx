import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size: number;       // outer diameter of the ring
  avatarSize: number; // inner content size — gap = (size - avatarSize) / 2
  color?: string;
  children: React.ReactNode;
  dashCount?: number;   // number of dash segments (default 32)
  dashRatio?: number;   // dash fraction of one segment 0–1 (default 0.5)
  rounded?: boolean;    // rounded dash caps (default false)
  duration?: number;    // rotation duration ms (default 7000)
}

export default function SpinningRing({
  size,
  avatarSize,
  color = '#7F77DD',
  children,
  dashCount = 20,
  dashRatio = 0.15,
  rounded = true,
  duration = 8000,
}: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentLen = circumference / dashCount;
  const dashLen = segmentLen * dashRatio;
  const gapLen = segmentLen * (1 - dashRatio);

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
            strokeDasharray={`${dashLen} ${gapLen}`}
            strokeLinecap={rounded ? 'round' : 'butt'}
            fill="none"
          />
        </Svg>
      </Animated.View>
      {/* Avatar content centred inside */}
      {children}
    </View>
  );
}
