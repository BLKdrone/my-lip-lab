"use client";
import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface LipOverlayProps {
  activeColor: string;
  videoRef: React.RefObject<HTMLVideoElement | null>; // We use the ref from your CameraPanel
}

const LipOverlay: React.FC<LipOverlayProps> = ({ activeColor, videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(null);

  // 1. Initialize the AI Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const instance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
        landmarkerRef.current = instance;
        console.log("MediaPipe Face Landmarker Loaded");
      } catch (e) {
        console.error("Failed to load MediaPipe:", e);
      }
    };
    loadModel();
  }, []);

  // 2. The Drawing Loop
  const predict = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Sync canvas size to the actual video stream
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];

          // These indices cover the full lip area
          const upperLipIdx = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];
          const lowerLipIdx = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];

          const drawShape = (indices: any[]) => {
            ctx.beginPath();
            indices.forEach((idx, i) => {
              const pt = landmarks[idx];
              if (i === 0) ctx.moveTo(pt.x * canvas.width, pt.y * canvas.height);
              else ctx.lineTo(pt.x * canvas.width, pt.y * canvas.height);
            });
            ctx.closePath();
            ctx.fill();
          };

          // Style and Draw
          ctx.fillStyle = activeColor;
          ctx.globalAlpha = 0.5; // Start with 50% transparency
          ctx.globalCompositeOperation = "multiply";

          drawShape(upperLipIdx);
          drawShape(lowerLipIdx);
        }
      }
    }
    // @ts-ignore
    requestRef.current = requestAnimationFrame(predict);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(predict);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: 'scaleX(-1)', // Important: Matches your video's mirror
        pointerEvents: 'none',
        zIndex: 20
      }}
    />
  );
};

export default LipOverlay;