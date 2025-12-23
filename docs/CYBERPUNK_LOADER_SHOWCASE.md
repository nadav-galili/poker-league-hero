# 🚀 CyberpunkLoader - Immersive Loading Component

A stunning cyberpunk-themed loading component designed to make users actually enjoy waiting! This loader brings the futuristic, neon-lit aesthetic of cyberpunk to your React Native Expo app.

## ✨ Features

### **Visual Elements**
- **Hexagonal Spinner**: Angular, geometric loading animation with multiple rotating layers
- **Matrix Code Rain**: Animated binary/hex code cascading effects (matrix variant)
- **Scan Lines**: Moving holographic scan line effects
- **Corner Brackets**: Cyberpunk-style UI frame elements
- **Holographic Glow**: Pulsing neon glow effects with transparency
- **Animated Text**: Monospace typography with neon glow and animated underlines
- **Loading Dots**: Synchronized pulsing indicator dots

### **Animation Layers**
- **Rotation**: Multi-directional hexagonal spinner rotations
- **Pulse**: Breathing glow effects and scaling animations
- **Flicker**: Holographic interference effects
- **Scan**: Vertical scanning line movements
- **Matrix**: Character rain animations (for matrix variant)
- **Text Glow**: Dynamic shadow radius and color intensity

## 🎨 Design Variants

### Color Variants
- **`cyan`** - Electric cyan with blue accents (default)
- **`pink`** - Hot magenta with purple accents
- **`green`** - Acid green with darker green accents
- **`blue`** - Electric blue with cyan accents
- **`orange`** - Neon orange with pink accents
- **`matrix`** - Classic matrix green with cascading code
- **`cyber`** - Cyan/pink cyberpunk gradient combination
- **`holo`** - Holographic white/blue translucent effects

### Size Options
- **`small`** (60px container) - For inline loading states
- **`medium`** (100px container) - General purpose loading (default)
- **`large`** (140px container) - Hero/full screen loading

## 💻 Usage Examples

### Basic Implementation
```tsx
import { CyberpunkLoader } from '@/components/ui';

// Default loader
<CyberpunkLoader />

// With custom size and color
<CyberpunkLoader size="large" variant="cyan" />

// With loading text
<CyberpunkLoader
  size="medium"
  variant="matrix"
  text="INITIALIZING..."
/>
```

### Overlay Loading (Full Screen)
```tsx
// Full screen overlay with backdrop
<CyberpunkLoader
  overlay={true}
  size="large"
  variant="cyber"
  text="ACCESSING NEURAL NETWORK..."
/>
```

### Integration Examples

#### API Loading State
```tsx
const [loading, setLoading] = useState(false);

if (loading) {
  return (
    <CyberpunkLoader
      size="medium"
      variant="cyan"
      text="SYNCING DATA..."
    />
  );
}
```

#### Authentication Flow
```tsx
<CyberpunkLoader
  overlay={true}
  size="large"
  variant="holo"
  text="AUTHENTICATING USER..."
/>
```

#### Matrix-Style Data Processing
```tsx
<CyberpunkLoader
  size="large"
  variant="matrix"
  text="PROCESSING NEURAL DATA..."
/>
```

#### Inline Component Loading
```tsx
<View className="p-4">
  <CyberpunkLoader size="small" variant="green" />
  <Text>Loading content...</Text>
</View>
```

## 🎯 Use Cases

### **Full Screen Loading**
- App initialization
- User authentication
- Data synchronization
- Route transitions

### **Inline Loading**
- Button loading states
- Form submissions
- Component refresh
- Content fetching

### **Overlay Loading**
- File uploads
- Heavy computations
- Background processing
- Modal operations

## ⚡ Performance Features

- **Native Driver**: All animations use `useNativeDriver: true` for optimal performance
- **Memory Efficient**: Proper cleanup of animations on unmount
- **Lightweight**: Minimal render overhead with optimized animation loops
- **Responsive**: Adapts to different screen sizes and orientations

## 🎨 Color System Integration

The component integrates seamlessly with the app's cyberpunk color system:

```typescript
// Uses colors from @/colors
- colors.neonCyan
- colors.neonPink
- colors.matrixGreen
- colors.holoBlue
- colors.shadowNeonCyan
```

## 🚀 Advanced Features

### **Matrix Code Animation**
When using `variant="matrix"`, the loader displays cascading code characters:
- Animated binary/hex characters
- Randomized opacity effects
- Grid-based positioning
- Classic green-on-black matrix styling

### **Holographic Effects**
- Translucent overlay layers
- Flickering interference simulation
- Dynamic opacity changes
- Futuristic transparency effects

### **Scan Line Technology**
- Moving horizontal scan lines
- Configurable speed and intensity
- Neon glow shadows
- Realistic CRT monitor simulation

## 📱 Cross-Platform Compatibility

- **iOS**: Native animations with proper shadow rendering
- **Android**: Optimized performance with reduced shadow complexity
- **Web**: Full feature compatibility with CSS transforms

## 🛠 Customization

### Extending Color Variants
```typescript
// Add custom colors to @/colors
const customGlow = 'rgba(255, 215, 0, 0.5)'; // Gold glow

// Use in variants
case 'gold':
  return {
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: 'rgba(255, 215, 0, 0.3)',
    glow: customGlow,
  };
```

### Animation Timing
```typescript
// Customize animation speeds
const SCAN_DURATION = 2500;    // Scan line cycle time
const ROTATION_DURATION = 3000; // Spinner rotation time
const PULSE_DURATION = 1500;   // Glow pulse interval
```

## 🎬 Animation Details

### **Hexagonal Spinner**
- Outer border: Clockwise rotation (3s cycle)
- Inner border: Counter-clockwise rotation (3s cycle)
- Center diamond: Static with pulsing opacity
- Multi-layer depth with stroke variations

### **Text Effects**
- Monospace font family for authentic cyber look
- Letter spacing for enhanced readability
- Animated text shadow with dynamic radius
- Pulsing underline with synchronized timing
- Coordinated loading dots with staggered delays

### **Scan Lines**
- Vertical translation from top to bottom
- Configurable start/end positions
- Neon glow shadow effects
- Realistic scanning speed simulation

## 💡 Implementation Tips

1. **Performance**: Use `overlay={true}` sparingly for full-screen scenarios
2. **Accessibility**: Provide alternative loading indicators for users with motion sensitivity
3. **Context**: Match variant colors to your app's current theme/section
4. **Duration**: Don't overuse - cyberpunk aesthetics work best for appropriate waiting times
5. **Contrast**: Ensure text remains readable against the animated background

## 🔮 Future Enhancements

Potential additions for v2:
- Audio integration for authentic cyberpunk sounds
- Particle effect systems
- 3D transformation effects
- Customizable animation speeds
- Progress percentage displays
- Interactive loading states

## 📦 Component Architecture

```
CyberpunkLoader/
├── Main Container (positioning, overlay logic)
├── HexagonalSpinner (multi-layer rotating geometry)
├── MatrixCode (variant-specific code rain)
├── ScanLines (horizontal scanning effects)
├── CornerBrackets (UI frame elements)
├── LoadingDots (synchronized indicators)
└── Animations (cleanup and lifecycle management)
```

This loader transforms mundane waiting periods into engaging, immersive experiences that align perfectly with the app's cyberpunk aesthetic! 🌟