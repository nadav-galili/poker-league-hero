import { colors } from '@/colors';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

export type CyberpunkLoaderSize = 'small' | 'medium' | 'large';
export type CyberpunkLoaderVariant =
  | 'cyan'
  | 'pink'
  | 'green'
  | 'blue'
  | 'orange'
  | 'matrix'
  | 'cyber'
  | 'holo';

export interface CyberpunkLoaderProps {
  size?: CyberpunkLoaderSize;
  variant?: CyberpunkLoaderVariant;
  text?: string;
  overlay?: boolean;
}

const getVariantColors = (variant: CyberpunkLoaderVariant) => {
  switch (variant) {
    case 'cyan':
      return {
        primary: colors.neonCyan,
        secondary: colors.neonBlue,
        accent: colors.holoBlue,
        glow: colors.shadowNeonCyan,
      };
    case 'pink':
      return {
        primary: colors.neonPink,
        secondary: colors.neonPurple,
        accent: colors.holoPink,
        glow: colors.shadowNeonPink,
      };
    case 'green':
    case 'matrix':
      return {
        primary: colors.matrixGreen,
        secondary: colors.matrixGreenDark,
        accent: colors.holoGreen,
        glow: colors.shadowNeonGreen,
      };
    case 'blue':
      return {
        primary: colors.neonBlue,
        secondary: colors.neonCyan,
        accent: colors.holoBlue,
        glow: colors.shadowNeonCyan,
      };
    case 'orange':
      return {
        primary: colors.neonOrange,
        secondary: colors.neonPink,
        accent: colors.holoPink,
        glow: 'rgba(255, 69, 0, 0.5)',
      };
    case 'cyber':
      return {
        primary: colors.neonCyan,
        secondary: colors.neonPink,
        accent: colors.holoBlue,
        glow: colors.shadowNeonCyan,
      };
    case 'holo':
      return {
        primary: colors.holoBlue,
        secondary: colors.holoPink,
        accent: colors.holoWhite,
        glow: 'rgba(255, 255, 255, 0.3)',
      };
    default:
      return {
        primary: colors.neonCyan,
        secondary: colors.neonBlue,
        accent: colors.holoBlue,
        glow: colors.shadowNeonCyan,
      };
  }
};

const getSizeConfig = (size: CyberpunkLoaderSize) => {
  switch (size) {
    case 'small':
      return {
        container: 60,
        spinner: 40,
        strokeWidth: 2,
        cornerSize: 6,
        fontSize: 12,
        gridSize: 8,
      };
    case 'medium':
      return {
        container: 100,
        spinner: 70,
        strokeWidth: 3,
        cornerSize: 8,
        fontSize: 14,
        gridSize: 10,
      };
    case 'large':
      return {
        container: 140,
        spinner: 100,
        strokeWidth: 4,
        cornerSize: 12,
        fontSize: 16,
        gridSize: 12,
      };
    default:
      return {
        container: 100,
        spinner: 70,
        strokeWidth: 3,
        cornerSize: 8,
        fontSize: 14,
        gridSize: 10,
      };
  }
};

const HexagonalSpinner: React.FC<{
  size: number;
  colors: ReturnType<typeof getVariantColors>;
  strokeWidth: number;
}> = ({ size, colors: colorSet, strokeWidth }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    rotationAnimation.start();
    pulseAnimation.start();

    return () => {
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, [rotationAnim, pulseAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  // Create hexagonal path points
  const radius = size / 2;
  const hexagonPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = radius + radius * 0.8 * Math.cos(angle);
    const y = radius + radius * 0.8 * Math.sin(angle);
    hexagonPath.push({ x, y });
  }

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: rotation }, { scale }],
        opacity,
      }}
    >
      {/* Outer hexagon */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderWidth: strokeWidth,
          borderColor: colorSet.primary,
          transform: [{ rotate: '0deg' }],
        }}
        className="border-2 rotate-45"
      />

      {/* Inner rotating hexagon */}
      <Animated.View
        style={{
          position: 'absolute',
          top: strokeWidth * 2,
          left: strokeWidth * 2,
          width: size - strokeWidth * 4,
          height: size - strokeWidth * 4,
          borderWidth: strokeWidth / 2,
          borderColor: colorSet.secondary,
          transform: [{ rotate: rotationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-360deg'],
          }) }],
          opacity: 0.7,
        }}
        className="border rotate-45"
      />

      {/* Center diamond */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size / 3,
          height: size / 3,
          marginTop: -size / 6,
          marginLeft: -size / 6,
          borderWidth: strokeWidth / 2,
          borderColor: colorSet.accent,
          backgroundColor: colorSet.accent,
          opacity: 0.3,
        }}
        className="rotate-45"
      />
    </Animated.View>
  );
};

const MatrixCode: React.FC<{
  variant: CyberpunkLoaderVariant;
  size: CyberpunkLoaderSize;
  colors: ReturnType<typeof getVariantColors>;
}> = ({ variant, size, colors: colorSet }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { gridSize } = getSizeConfig(size);

  useEffect(() => {
    if (variant !== 'matrix') return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.2,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [fadeAnim, variant]);

  if (variant !== 'matrix') return null;

  const matrixChars = ['0', '1', 'A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        opacity: fadeAnim,
      }}
    >
      {Array.from({ length: gridSize }).map((_, i) => (
        <View
          key={`col-${i}`}
          style={{
            position: 'absolute',
            left: (i * 100) / gridSize + '%',
            top: 0,
            bottom: 0,
            width: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, j) => (
            <Text
              key={`char-${j}`}
              style={{
                position: 'absolute',
                top: (j * 100) / 8 + '%',
                color: colorSet.primary,
                fontSize: 8,
                fontFamily: 'monospace',
                opacity: Math.random() * 0.8 + 0.2,
              }}
            >
              {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
            </Text>
          ))}
        </View>
      ))}
    </Animated.View>
  );
};

const ScanLines: React.FC<{
  size: CyberpunkLoaderSize;
  colors: ReturnType<typeof getVariantColors>;
}> = ({ size, colors: colorSet }) => {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const sizeConfig = getSizeConfig(size);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sizeConfig.container, sizeConfig.container],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: colorSet.primary,
        transform: [{ translateY }],
        shadowColor: colorSet.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        opacity: 0.8,
      }}
    />
  );
};

const CornerBrackets: React.FC<{
  size: CyberpunkLoaderSize;
  colors: ReturnType<typeof getVariantColors>;
}> = ({ size, colors: colorSet }) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { cornerSize } = getSizeConfig(size);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [glowAnim]);

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const opacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const borderStyle = {
    borderColor: colorSet.primary,
    borderWidth: 2,
    opacity,
    shadowColor: colorSet.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius,
  };

  return (
    <>
      {/* Top-left corner */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -10,
            left: -10,
            width: cornerSize,
            height: cornerSize,
            borderLeftWidth: 2,
            borderTopWidth: 2,
          },
          borderStyle,
        ]}
      />

      {/* Top-right corner */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -10,
            right: -10,
            width: cornerSize,
            height: cornerSize,
            borderRightWidth: 2,
            borderTopWidth: 2,
          },
          borderStyle,
        ]}
      />

      {/* Bottom-left corner */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -10,
            left: -10,
            width: cornerSize,
            height: cornerSize,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
          },
          borderStyle,
        ]}
      />

      {/* Bottom-right corner */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: cornerSize,
            height: cornerSize,
            borderRightWidth: 2,
            borderBottomWidth: 2,
          },
          borderStyle,
        ]}
      />
    </>
  );
};

export default function CyberpunkLoader({
  size = 'medium',
  variant = 'cyan',
  text,
  overlay = false,
}: CyberpunkLoaderProps) {
  const colorSet = getVariantColors(variant);
  const sizeConfig = getSizeConfig(size);

  // Main container animations
  const hologramFlicker = useRef(new Animated.Value(0)).current;
  const textGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hologram flicker effect
    const flickerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(hologramFlicker, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(hologramFlicker, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.delay(Math.random() * 3000 + 2000), // Random delay between flickers
      ])
    );

    // Text glow animation
    const textAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(textGlow, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    );

    flickerAnimation.start();
    textAnimation.start();

    return () => {
      flickerAnimation.stop();
      textAnimation.stop();
    };
  }, [hologramFlicker, textGlow]);

  const flickerOpacity = hologramFlicker.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.4],
  });

  const textShadowRadius = textGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 20],
  });

  const LoaderContent = (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Main spinner container */}
      <View
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background holographic glow */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            backgroundColor: colorSet.accent,
            opacity: flickerOpacity,
            borderRadius: 8,
          }}
        />

        {/* Matrix code background (only for matrix variant) */}
        <MatrixCode variant={variant} size={size} colors={colorSet} />

        {/* Main hexagonal spinner */}
        <HexagonalSpinner
          size={sizeConfig.spinner}
          colors={colorSet}
          strokeWidth={sizeConfig.strokeWidth}
        />

        {/* Scan lines overlay */}
        <ScanLines size={size} colors={colorSet} />

        {/* Corner brackets */}
        <CornerBrackets size={size} colors={colorSet} />

        {/* Side accent lines */}
        <View
          style={{
            position: 'absolute',
            left: -15,
            top: '25%',
            bottom: '25%',
            width: 1,
            backgroundColor: colorSet.secondary,
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -15,
            top: '25%',
            bottom: '25%',
            width: 1,
            backgroundColor: colorSet.secondary,
            opacity: 0.6,
          }}
        />
      </View>

      {/* Loading text with cyberpunk styling */}
      {text && (
        <Animated.View style={{ marginTop: 20, alignItems: 'center' }}>
          <Animated.Text
            style={{
              color: colorSet.primary,
              fontSize: sizeConfig.fontSize,
              fontFamily: 'monospace',
              letterSpacing: 2,
              fontWeight: 'bold',
              textAlign: 'center',
              textShadowColor: colorSet.primary,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius,
            }}
          >
            {text}
          </Animated.Text>

          {/* Animated underline */}
          <Animated.View
            style={{
              marginTop: 8,
              height: 1,
              width: text.length * (sizeConfig.fontSize * 0.8),
              backgroundColor: colorSet.primary,
              opacity: textGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
              shadowColor: colorSet.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: textShadowRadius,
            }}
          />

          {/* Loading dots animation */}
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 4 }}>
            {[0, 1, 2].map((index) => (
              <LoadingDot
                key={index}
                delay={index * 200}
                color={colorSet.primary}
                size={4}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {/* Overlay scan lines */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
          }}
        >
          {Array.from({ length: Math.floor(screenHeight / 4) }).map((_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: i * 4,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colorSet.primary,
                opacity: 0.1,
              }}
            />
          ))}
        </View>

        {LoaderContent}
      </View>
    );
  }

  return LoaderContent;
}

// Helper component for animated loading dots
const LoadingDot: React.FC<{
  delay: number;
  color: string;
  size: number;
}> = ({ delay, color, size }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scaleAnim, opacityAnim, delay]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
};