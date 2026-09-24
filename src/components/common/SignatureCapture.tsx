import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
  FileImage,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ESignatureData } from '../../types';
import { contractSigningService } from '../../services/contractSigningService';

interface SignatureCaptureProps {
  onSignatureCaptured: (sig: ESignatureData | null) => void;
  signerName?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureCaptured,
  signerName = 'John Doe',
}) => {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  // --- DRAWING STATE & REFS ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnUrlRef = useRef<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // Ink color

  // --- UPLOAD STATE ---
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [originalUploadUrl, setOriginalUploadUrl] = useState<string | null>(null);
  const [processedUploadUrl, setProcessedUploadUrl] = useState<string | null>(null);
  const [isUploadConfirmed, setIsUploadConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Setup Canvas on Mount / Mode change
  useEffect(() => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = rect.width || 560;
    const displayHeight = rect.height || 176;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);

      // If we previously had a drawn signature, restore it
      if (lastDrawnUrlRef.current) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
          const restored = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([restored]);
          setHasDrawn(true);
        };
        img.src = lastDrawnUrlRef.current;
      } else {
        const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([blank]);
      }
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  // Update stroke color dynamically without clearing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
  }, [strokeColor]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }

    ctx.closePath();
    setIsDrawing(false);

    // Save snapshot to history stack
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]);

    // Export transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    lastDrawnUrlRef.current = dataUrl;
    onSignatureCaptured({
      type: 'draw',
      data: dataUrl,
      processedData: dataUrl,
      createdAt: new Date().toISOString(),
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    lastDrawnUrlRef.current = null;
    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blank]);
    onSignatureCaptured(null);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length <= 1) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove latest state
    const previous = newHistory[newHistory.length - 1];

    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);

    if (newHistory.length <= 1) {
      setHasDrawn(false);
      lastDrawnUrlRef.current = null;
      onSignatureCaptured(null);
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      lastDrawnUrlRef.current = dataUrl;
      onSignatureCaptured({
        type: 'draw',
        data: dataUrl,
        processedData: dataUrl,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setIsProcessingImage(true);
    setIsUploadConfirmed(false);

    try {
      const result = await contractSigningService.processUploadedSignatureImage(file);
      setOriginalUploadUrl(result.originalDataUrl);
      setProcessedUploadUrl(result.processedDataUrl);
      setIsUploadConfirmed(true);

      onSignatureCaptured({
        type: 'upload',
        data: result.originalDataUrl,
        processedData: result.processedDataUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process signature image.');
      onSignatureCaptured(null);
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const handleRemoveUpload = () => {
    setOriginalUploadUrl(null);
    setProcessedUploadUrl(null);
    setIsUploadConfirmed(false);
    setUploadError(null);
    onSignatureCaptured(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab Switcher: Draw vs Upload */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('draw');
              if (!hasDrawn) onSignatureCaptured(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'draw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
            <span className="text-[10px] py-0.5 px-1.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              Recommended
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload');
              if (!isUploadConfirmed) onSignatureCaptured(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Handwritten Signature</span>
          </button>
        </div>

        {mode === 'draw' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Ink:
            </span>
            <button
              type="button"
              onClick={() => setStrokeColor('#0f172a')}
              className={`w-5 h-5 rounded-full bg-slate-900 transition-all ${
                strokeColor === '#0f172a' ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-70'
              }`}
              title="Black/Slate Ink"
            />
            <button
              type="button"
              onClick={() => setStrokeColor('#1e40af')}
              className={`w-5 h-5 rounded-full bg-blue-800 transition-all ${
                strokeColor === '#1e40af' ? 'ring-2 ring-offset-2 ring-blue-800 scale-110' : 'opacity-70'
              }`}
              title="Navy Blue Ink"
            />
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* OPTION A: DRAW SIGNATURE (CANVAS)                                   */}
      {/* =================================================================== */}
      {mode === 'draw' && (
        <div className="space-y-3">
          <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white shadow-inner overflow-hidden select-none touch-none">
            {/* Guide line */}
            <div className="absolute left-8 right-8 bottom-12 border-b border-slate-200 pointer-events-none flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-300">Sign along line ✕</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">{signerName}</span>
            </div>

            {/* Interactive Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="w-full h-44 cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                <PenTool className="w-6 h-6 mb-1.5 opacity-40 animate-bounce" />
                <p className="text-xs font-medium">Click and drag or use your finger/stylus to sign</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Touch-enabled & transparent background export</p>
              </div>
            )}
          </div>

          {/* Canvas Action Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasDrawn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              {hasDrawn ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Signature captured</span>
                </span>
              ) : (
                <span className="text-slate-400">Awaiting signature capture</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* OPTION B: UPLOAD HANDWRITTEN SIGNATURE                             */}
      {/* =================================================================== */}
      {mode === 'upload' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!originalUploadUrl && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform mb-3">
                <FileImage className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">Upload Handwritten Signature Image</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Drop your signature file here or <span className="text-blue-600 font-bold underline">browse files</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">PNG</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">JPG</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">JPEG</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">WEBP</span>
                <span>(Max 6MB)</span>
              </div>
            </div>
          )}

          {isProcessingImage && (
            <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-slate-900 animate-spin" />
              <p className="text-xs font-bold text-slate-900">Processing Signature Pipeline...</p>
              <p className="text-[11px] text-slate-500">
                Grayscale conversion → noise reduction → ink segmentation → transparent alpha background
              </p>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Side-by-side comparison: Original vs Processed */}
          {originalUploadUrl && processedUploadUrl && !isProcessingImage && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Frontend Processing Pipeline Complete:</strong> Paper background removed, signature cropped, and rendered as a transparent PNG.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Image */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">Original Upload</span>
                    <span className="text-slate-400">Raw Source</span>
                  </div>
                  <div className="h-32 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden p-2">
                    <img
                      src={originalUploadUrl}
                      alt="Original signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Processed Signature Preview */}
                <div className="p-3.5 rounded-xl border-2 border-emerald-500/80 bg-white space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Processed Transparent Signature
                    </span>
                    <span className="text-emerald-700 font-mono text-[10px]">Alpha Mask</span>
                  </div>
                  {/* Checkered pattern background to clearly display transparency */}
                  <div
                    className="h-32 rounded-lg flex items-center justify-center overflow-hidden p-2 border border-slate-200"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    <img
                      src={processedUploadUrl}
                      alt="Processed signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveUpload}
                    className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>

                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Signature Ready</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
