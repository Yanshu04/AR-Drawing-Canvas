import { useEffect } from "react";
import type { HandData } from "@/hooks/useHandTracking";

interface HandOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handData: HandData | null;
  isEraser: boolean;
  brushSize: number;
  selectedColor: string;
}

// MediaPipe hand connections
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

export function HandOverlay({ canvasRef, handData, isEraser, brushSize, selectedColor }: HandOverlayProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!handData) return;

    const lm = handData.landmarks;
    const w = canvas.width;
    const h = canvas.height;

    // Draw skeleton
    ctx.strokeStyle = "hsla(160, 80%, 50%, 0.3)";
    ctx.lineWidth = 1.5;
    for (const [a, b] of CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo((1 - lm[a].x) * w, lm[a].y * h);
      ctx.lineTo((1 - lm[b].x) * w, lm[b].y * h);
      ctx.stroke();
    }

    // Draw landmarks
    for (let i = 0; i < lm.length; i++) {
      const x = (1 - lm[i].x) * w;
      const y = lm[i].y * h;
      ctx.beginPath();
      ctx.arc(x, y, i === 8 ? 6 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === 8 ? (isEraser ? "hsl(0, 72%, 55%)" : selectedColor) : "hsla(160, 80%, 50%, 0.5)";
      ctx.fill();
    }

    // Cursor around index tip
    const ix = (1 - handData.indexTip.x) * w;
    const iy = handData.indexTip.y * h;
    ctx.beginPath();
    ctx.arc(ix, iy, isEraser ? brushSize * 4 : brushSize * 2 + 6, 0, Math.PI * 2);
    ctx.strokeStyle = isEraser ? "hsla(0, 72%, 55%, 0.6)" : selectedColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [handData, canvasRef, isEraser, brushSize, selectedColor]);

  return null;
}
