import { Eraser, Undo2, Trash2 } from "lucide-react";

interface DrawingToolbarProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  isEraser: boolean;
  onToggleEraser: () => void;
  onUndo: () => void;
  onClear: () => void;
  strokeCount: number;
}

export function DrawingToolbar({
  colors,
  selectedColor,
  onColorSelect,
  brushSize,
  onBrushSizeChange,
  isEraser,
  onToggleEraser,
  onUndo,
  onClear,
  strokeCount,
}: DrawingToolbarProps) {
  return (
    <div className="w-16 flex flex-col items-center gap-3 py-4 bg-card border-r border-border z-10">
      {/* Colors */}
      <div className="flex flex-col gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => {
              onColorSelect(color);
              if (isEraser) onToggleEraser();
            }}
            className="w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: selectedColor === color && !isEraser ? "hsl(var(--foreground))" : "transparent",
              boxShadow: selectedColor === color && !isEraser ? `0 0 12px ${color}` : "none",
            }}
          />
        ))}
      </div>

      <div className="w-8 h-px bg-border" />

      {/* Brush size */}
      <div className="flex flex-col items-center gap-1">
        {[2, 4, 8].map((size) => (
          <button
            key={size}
            onClick={() => onBrushSizeChange(size)}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{
              backgroundColor: brushSize === size ? "hsl(var(--secondary))" : "transparent",
            }}
          >
            <div
              className="rounded-full bg-foreground"
              style={{ width: size * 2 + 4, height: size * 2 + 4 }}
            />
          </button>
        ))}
      </div>

      <div className="w-8 h-px bg-border" />

      {/* Tools */}
      <button
        onClick={onToggleEraser}
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
        style={{
          backgroundColor: isEraser ? "hsl(var(--destructive))" : "hsl(var(--secondary))",
        }}
        title="Eraser"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <button
        onClick={onUndo}
        disabled={strokeCount === 0}
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary transition-colors disabled:opacity-30"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={onClear}
        disabled={strokeCount === 0}
        className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary transition-colors disabled:opacity-30"
        title="Clear all"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Stroke count */}
      <span className="text-[10px] font-mono text-muted-foreground mt-auto">
        {strokeCount}
      </span>
    </div>
  );
}
