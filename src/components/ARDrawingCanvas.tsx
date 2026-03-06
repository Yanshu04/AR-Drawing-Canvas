import { useRef, useEffect, useCallback, useState } from "react";
import { useHandTracking, type HandData } from "@/hooks/useHandTracking";
import { DrawingToolbar } from "./DrawingToolbar";
import { GestureIndicator } from "./GestureIndicator";
import { HandOverlay } from "./HandOverlay";

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const COLORS = [
  "hsl(160, 80%, 50%)",   // primary green
  "hsl(180, 90%, 55%)",   // cyan
  "hsl(310, 85%, 60%)",   // magenta
  "hsl(48, 95%, 60%)",    // yellow
  "hsl(25, 95%, 58%)",    // orange
  "hsl(220, 90%, 60%)",   // blue
  "hsl(0, 0%, 95%)",      // white
];

export function ARDrawingCanvas() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { handData, isLoading, startDetection, stopDetection } = useHandTracking(videoRef);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const prevDrawingRef = useRef(false);
  const prevOpenRef = useRef(false);
  const openGestureTimeRef = useRef(0);
  const smoothPosRef = useRef<{ x: number; y: number } | null>(null);

  // Start webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setCameraReady(true);
            startDetection();
          };
        }
      } catch (e) {
        console.error("Camera access denied:", e);
      }
    }
    startCamera();
    return () => {
      stopDetection();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [startDetection, stopDetection]);

  // Smooth position
  const smoothPosition = useCallback((raw: { x: number; y: number }) => {
    const alpha = 0.4;
    if (!smoothPosRef.current) {
      smoothPosRef.current = raw;
      return raw;
    }
    const smoothed = {
      x: smoothPosRef.current.x + alpha * (raw.x - smoothPosRef.current.x),
      y: smoothPosRef.current.y + alpha * (raw.y - smoothPosRef.current.y),
    };
    smoothPosRef.current = smoothed;
    return smoothed;
  }, []);

  // Handle gestures
  useEffect(() => {
    if (!handData) {
      if (currentStroke && currentStroke.points.length > 1) {
        setStrokes((prev) => [...prev, currentStroke]);
      }
      setCurrentStroke(null);
      prevDrawingRef.current = false;
      smoothPosRef.current = null;
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    // Mirror x for selfie view
    const pos = smoothPosition({
      x: (1 - handData.indexTip.x) * canvas.width,
      y: handData.indexTip.y * canvas.height,
    });

    // Open hand = clear (hold for 1 second)
    if (handData.isOpen) {
      if (!prevOpenRef.current) {
        openGestureTimeRef.current = performance.now();
      } else if (performance.now() - openGestureTimeRef.current > 1000) {
        setStrokes([]);
        setCurrentStroke(null);
        openGestureTimeRef.current = Infinity;
      }
    }
    prevOpenRef.current = handData.isOpen;

    if (handData.isDrawing && !handData.isPinching) {
      if (!prevDrawingRef.current) {
        // Start new stroke
        setCurrentStroke({
          points: [pos],
          color: isEraser ? "erase" : selectedColor,
          width: isEraser ? brushSize * 4 : brushSize,
        });
      } else if (currentStroke) {
        setCurrentStroke((prev) =>
          prev ? { ...prev, points: [...prev.points, pos] } : null
        );
      }
      prevDrawingRef.current = true;
    } else {
      if (prevDrawingRef.current && currentStroke && currentStroke.points.length > 1) {
        setStrokes((prev) => [...prev, currentStroke]);
      }
      setCurrentStroke(null);
      prevDrawingRef.current = false;
    }
  }, [handData, selectedColor, brushSize, isEraser, smoothPosition]);

  // Render drawing canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) continue;
      if (stroke.color === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 12;
      }
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      // Catmull-Rom interpolation for smooth lines
      const pts = stroke.points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      if (pts.length > 1) {
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.globalCompositeOperation = "source-over";
  }, [strokes, currentStroke]);

  // Resize canvases
  useEffect(() => {
    function resize() {
      const container = containerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      [drawCanvasRef, overlayCanvasRef].forEach((ref) => {
        if (ref.current) {
          ref.current.width = w;
          ref.current.height = h;
        }
      });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [cameraReady]);

  const handleUndo = () => setStrokes((prev) => prev.slice(0, -1));
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <h1 className="text-lg font-semibold tracking-tight">
            AR Sketch
          </h1>
          <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-secondary">
            {cameraReady ? "LIVE" : isLoading ? "LOADING..." : "READY"}
          </span>
        </div>
        <GestureIndicator handData={handData} isEraser={isEraser} />
      </header>

      {/* Main area */}
      <div className="flex-1 flex relative">
        {/* Toolbar */}
        <DrawingToolbar
          colors={COLORS}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          isEraser={isEraser}
          onToggleEraser={() => setIsEraser(!isEraser)}
          onUndo={handleUndo}
          onClear={handleClear}
          strokeCount={strokes.length}
        />

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 relative bg-canvas overflow-hidden">
          {/* Webcam */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Drawing canvas */}
          <canvas
            ref={drawCanvasRef}
            className="absolute inset-0 w-full h-full z-10"
          />

          {/* Hand overlay */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          />
          <HandOverlay
            canvasRef={overlayCanvasRef}
            handData={handData}
            isEraser={isEraser}
            brushSize={brushSize}
            selectedColor={selectedColor}
          />

          {/* Loading overlay */}
          {(isLoading || !cameraReady) && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-mono text-sm">
                {isLoading ? "Loading hand tracking model..." : "Starting camera..."}
              </p>
            </div>
          )}

          {/* Instructions */}
          {cameraReady && !isLoading && !handData && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-6 py-4 text-center max-w-md">
              <p className="text-sm text-foreground font-medium mb-2">Show your hand to start drawing</p>
              <div className="flex gap-4 text-xs text-muted-foreground justify-center">
                <span>☝️ Index finger = Draw</span>
                <span>🤏 Pinch = Pause</span>
                <span>🖐️ Open hand = Clear</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
