interface FloatingColorPaletteProps {
  colors: string[];
  selectedColor: string;
  hoveredIndex: number | null;
  visible: boolean;
  fingerPos: { x: number; y: number } | null;
}

export function FloatingColorPalette({
  colors,
  selectedColor,
  hoveredIndex,
  visible,
  fingerPos,
}: FloatingColorPaletteProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 animate-in fade-in" />

      {/* Color palette - horizontal row at top center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-4 bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300">
        <p className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono text-foreground bg-card/90 px-3 py-1 rounded-md border border-border whitespace-nowrap animate-in fade-in duration-500 delay-150">
          ✌️ Hover finger over a color to select
        </p>
        {colors.map((color, i) => {
          const isHovered = hoveredIndex === i;
          const isSelected = selectedColor === color;
          return (
            <div
              key={color}
              data-color-index={i}
              className="relative flex items-center justify-center transition-all duration-200 ease-out"
              style={{
                transform: isHovered ? "scale(1.4)" : "scale(1)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full border-3 transition-all duration-200 ease-out"
                style={{
                  backgroundColor: color,
                  borderColor: isHovered
                    ? "white"
                    : isSelected
                    ? "hsl(var(--foreground))"
                    : "transparent",
                  borderWidth: isHovered ? 3 : 2,
                  boxShadow: isHovered
                    ? `0 0 24px ${color}, 0 0 48px ${color}`
                    : isSelected
                    ? `0 0 12px ${color}`
                    : "none",
                }}
              />
              {isHovered && (
                <div className="absolute -bottom-6 text-[10px] font-mono text-foreground bg-card px-2 py-0.5 rounded border border-border whitespace-nowrap">
                  {isSelected ? "CURRENT" : "SELECT"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finger cursor indicator */}
      {fingerPos && (
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-white/80 pointer-events-none transition-all duration-100 ease-out"
          style={{
            left: fingerPos.x - 12,
            top: fingerPos.y - 12,
            boxShadow: "0 0 12px rgba(255,255,255,0.5)",
          }}
        />
      )}
    </div>
  );
}
