import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useSpell } from '../lib/stores/useSpell';
import { SpellParser } from '../lib/SpellParser';

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [effectApplied, setEffectApplied] = useState(false);
  const [effectType, setEffectType] = useState<string>('');
  const { spellCode } = useSpell();
  const parser = new SpellParser();

  // Start camera when component mounts
  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setCapturedImage(null);
        setEffectApplied(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataURL = canvas.toDataURL('image/png');
      setCapturedImage(imageDataURL);
      stopCamera();
    }
  };

  const applySpellEffect = () => {
    // Parse spell to determine effect type
    try {
      const parsedSpells = parser.parse(spellCode);
      if (parsedSpells.length > 0) {
        const mainSpell = parsedSpells[0];
        setEffectType(mainSpell.focus);
        setEffectApplied(true);
        
        // In a full implementation, we would send the image to the server
        // along with the spell, and receive back a processed image
        console.log("Applied spell with focus:", mainSpell.focus);
      }
    } catch (error) {
      console.error("Error parsing spell:", error);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setEffectApplied(false);
    startCamera();
  };

  // Apply visual effect based on spell focus
  const getEffectStyle = () => {
    switch (effectType.toLowerCase()) {
      case 'energy':
        return {
          filter: 'saturate(1.5) brightness(1.2) contrast(1.1)',
          boxShadow: '0 0 20px rgba(255, 165, 0, 0.8)'
        };
      case 'probability':
        return {
          filter: 'hue-rotate(40deg) saturate(1.2)',
          boxShadow: '0 0 20px rgba(147, 112, 219, 0.8)'
        };
      case 'entropy':
        return {
          filter: 'contrast(1.3) grayscale(0.3)',
          boxShadow: '0 0 20px rgba(255, 69, 0, 0.8)'
        };
      case 'time':
        return {
          filter: 'sepia(0.3) brightness(1.1)',
          boxShadow: '0 0 20px rgba(70, 130, 180, 0.8)'
        };
      default:
        return {};
    }
  };

  return (
    <div className="camera-container w-full h-full flex flex-col">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {isCameraActive && (
        <div className="relative flex-1">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="camera-overlay">
            <Button
              variant="default"
              onClick={captureImage}
              className="bg-primary/90 hover:bg-primary py-6 rounded-lg shadow-lg w-full text-lg"
            >
              Capture Image
            </Button>
          </div>
        </div>
      )}
      
      {capturedImage && (
        <div className="relative flex-1">
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
            style={effectApplied ? getEffectStyle() : {}}
          />
          <div className="camera-overlay">
            <div className="flex gap-3 w-full">
              {!effectApplied ? (
                <>
                  <Button
                    variant="outline"
                    onClick={resetCapture}
                    className="flex-1 border-primary/50 hover:border-primary py-4 rounded-lg"
                  >
                    Retake
                  </Button>
                  <Button
                    variant="default"
                    onClick={applySpellEffect}
                    className="flex-1 bg-primary hover:bg-primary/80 py-4 rounded-lg shadow-lg"
                  >
                    Cast Spell on Image
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={resetCapture}
                  className="w-full bg-secondary hover:bg-secondary/80 py-4 rounded-lg"
                >
                  New Capture
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!isCameraActive && !capturedImage && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/40 rounded-lg border border-primary/20">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-primary mb-2">Camera Capture</h3>
            <p className="text-muted-foreground text-sm">
              Take a photo and apply your AetherCast spell to influence the image
            </p>
          </div>
          <Button
            variant="default"
            onClick={startCamera}
            className="bg-primary hover:bg-primary/80 py-6 px-8 rounded-lg shadow-lg text-lg"
          >
            Start Camera
          </Button>
        </div>
      )}
    </div>
  );
}