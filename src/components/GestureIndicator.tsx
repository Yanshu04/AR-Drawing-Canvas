import type { HandData } from "@/hooks/useHandTracking";

interface GestureIndicatorProps {
  handData: HandData | null;
  isEraser: boolean;
}

export function GestureIndicator({ handData, isEraser }: GestureIndicatorProps) {
  if (!handData) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        NO HAND
      </div>
    );
  }

  let gesture = "IDLE";
  let color = "bg-muted-foreground";
  if (handData.isDrawing && !handData.isPinching) {
    gesture = isEraser ? "ERASING" : "DRAWING";
    color = isEraser ? "bg-destructive" : "bg-primary";
  } else if (handData.isPinching) {
    gesture = "PAUSED";
    color = "bg-accent";
  } else if (handData.isOpen) {
    gesture = "CLEARING...";
    color = "bg-destructive";
  }

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-foreground">{gesture}</span>
    </div>
  );
}
