interface DiscSvgProps {
  color: string;
  size?: number;
  className?: string;
}

function DiscSvg({ color, size = 80, className = '' }: DiscSvgProps) {
  // Darken the color for the rim
  const rimColor = darken(color, 0.25);
  const highlightColor = lighten(color, 0.2);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    >
      {/* Outer rim */}
      <circle cx="50" cy="50" r="48" fill={rimColor} />
      {/* Flight plate */}
      <circle cx="50" cy="50" r="38" fill={color} />
      {/* Subtle highlight arc */}
      <path
        d="M 25 35 Q 50 15 75 35"
        fill="none"
        stroke={highlightColor}
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Inner ring */}
      <circle cx="50" cy="50" r="14" fill="none" stroke={rimColor} strokeWidth="1.5" opacity="0.4" />
      {/* Center nub */}
      <circle cx="50" cy="50" r="4" fill={rimColor} opacity="0.3" />
    </svg>
  );
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(
    Math.round(rgb.r * (1 - amount)),
    Math.round(rgb.g * (1 - amount)),
    Math.round(rgb.b * (1 - amount)),
  );
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * amount),
    Math.round(rgb.g + (255 - rgb.g) * amount),
    Math.round(rgb.b + (255 - rgb.b) * amount),
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 200, g: 50, b: 50 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export default DiscSvg;
