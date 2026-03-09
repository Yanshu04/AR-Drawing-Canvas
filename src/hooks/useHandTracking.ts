import { useRef, useCallback, useState, useEffect } from "react";
import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface HandData {
  landmarks: NormalizedLandmark[];
  indexTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
  isDrawing: boolean; // index up, others down
  isPinching: boolean; // index + thumb close
  isOpen: boolean; // all fingers open
  isColorPicking: boolean; // index + middle up, ring + pinky down (peace sign)
}

function fingerIsUp(landmarks: NormalizedLandmark[], tipIdx: number, pipIdx: number) {
  return landmarks[tipIdx].y < landmarks[pipIdx].y;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [handData, setHandData] = useState<HandData | null>(null);
  const lastTimeRef = useRef<number>(-1);

  const initHandLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      handLandmarkerRef.current = handLandmarker;
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to init hand landmarker:", e);
      setIsLoading(false);
    }
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now === lastTimeRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimeRef.current = now;

    try {
      const results = landmarker.detectForVideo(video, now);
      if (results.landmarks && results.landmarks.length > 0) {
        const lm = results.landmarks[0];
        const indexTip = { x: lm[8].x, y: lm[8].y };
        const thumbTip = { x: lm[4].x, y: lm[4].y };

        const indexUp = fingerIsUp(lm, 8, 6);
        const middleUp = fingerIsUp(lm, 12, 10);
        const ringUp = fingerIsUp(lm, 16, 14);
        const pinkyUp = fingerIsUp(lm, 20, 18);

        const isDrawing = indexUp && !middleUp && !ringUp && !pinkyUp;
        const isPinching = distance(indexTip, thumbTip) < 0.05;
        const isOpen = indexUp && middleUp && ringUp && pinkyUp;
        const isColorPicking = indexUp && middleUp && !ringUp && !pinkyUp && !isPinching;

        setHandData({ landmarks: lm, indexTip, thumbTip, isDrawing, isPinching, isOpen, isColorPicking });
      } else {
        setHandData(null);
      }
    } catch {
      // skip frame
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  useEffect(() => {
    initHandLandmarker();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      handLandmarkerRef.current?.close();
    };
  }, [initHandLandmarker]);

  const startDetection = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(detect);
  }, [detect]);

  const stopDetection = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  return { handData, isLoading, startDetection, stopDetection };
}
