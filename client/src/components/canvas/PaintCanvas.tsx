import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

interface PaintCanvasProps {
  selectedColor: string;
  brushSize: number;
  drawingMode: 'brush' | 'eraser';
  canvasFormat: 'square' | 'rectangle';
  onSave: (imageData: string) => void;
  onUndoRedoChange: (canUndo: boolean, canRedo: boolean) => void;
  shouldUndo: boolean;
  shouldRedo: boolean;
  shouldClear: boolean;
  onActionComplete: () => void;
}

export function PaintCanvas({
  selectedColor,
  brushSize,
  drawingMode,
  canvasFormat,
  onSave,
  onUndoRedoChange,
  shouldUndo,
  shouldRedo,
  shouldClear,
  onActionComplete
}: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');
    
    if (!ctx) return;

    // Dynamic canvas sizing based on format
    const container = canvasElement.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const availableWidth = containerRect.width - 16;
      const availableHeight = containerRect.height - 16;
      
      let canvasWidth, canvasHeight;
      
      if (canvasFormat === 'square') {
        // Perfect square canvas
        const squareSize = Math.min(Math.max(availableWidth, 600), Math.max(availableHeight, 600));
        canvasWidth = squareSize;
        canvasHeight = squareSize;
      } else {
        // Rectangle canvas (16:9 aspect ratio)
        const maxWidth = Math.max(availableWidth, 800);
        const maxHeight = Math.max(availableHeight, 450);
        const aspectRatio = 16 / 9;
        
        if (availableWidth / availableHeight > aspectRatio) {
          canvasHeight = Math.min(maxHeight, availableHeight);
          canvasWidth = canvasHeight * aspectRatio;
        } else {
          canvasWidth = Math.min(maxWidth, availableWidth);
          canvasHeight = canvasWidth / aspectRatio;
        }
      }
      
      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Enable smooth drawing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    setCanvas(canvasElement);
    setContext(ctx);
    const initialData = canvasElement.toDataURL();
    setHistory([initialData]);
    setHistoryIndex(0);
    
    // Use setTimeout to avoid calling setState during render
    setTimeout(() => {
      onUndoRedoChange(false, false);
    }, 0);
  }, [canvasFormat]);

  // Update brush properties for smooth drawing
  useEffect(() => {
    if (!context) return;

    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    if (drawingMode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = selectedColor;
      context.fillStyle = selectedColor;
    }
  }, [context, selectedColor, brushSize, drawingMode]);

  // Handle undo
  useEffect(() => {
    if (!shouldUndo || !canvas || !context || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const imageData = history[newIndex];
    
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
      setHistoryIndex(newIndex);
      onUndoRedoChange(newIndex > 0, newIndex < history.length - 1);
      onActionComplete();
    };
    img.src = imageData;
  }, [shouldUndo, canvas, context, history, historyIndex, onUndoRedoChange, onActionComplete]);

  // Handle redo
  useEffect(() => {
    if (!shouldRedo || !canvas || !context || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const imageData = history[newIndex];
    
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
      setHistoryIndex(newIndex);
      onUndoRedoChange(newIndex > 0, newIndex < history.length - 1);
      onActionComplete();
    };
    img.src = imageData;
  }, [shouldRedo, canvas, context, history, historyIndex, onUndoRedoChange, onActionComplete]);

  // Handle clear
  useEffect(() => {
    if (!shouldClear || !canvas || !context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset history
    const newState = canvas.toDataURL();
    setHistory([newState]);
    setHistoryIndex(0);
    onUndoRedoChange(false, false);
    onActionComplete();
  }, [shouldClear, canvas, context, onUndoRedoChange, onActionComplete]);

  const handleSave = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  };

  const saveState = () => {
    if (!canvas) return;
    const newState = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistoryIndex(newHistory.length - 1);
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        onUndoRedoChange(newHistory.length > 1, false);
      }, 0);
      return newHistory;
    });
  };

  // Get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || !canvas) return;
    
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    setLastPoint({ x, y });
    
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y);
    context.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvas || !lastPoint) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    // Draw smooth continuous line
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    saveState();
  };

  return (
    <div className="h-full flex flex-col bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden" data-testid="card-paint-canvas">
      {/* Clean Canvas Header */}
      <div className="flex items-center justify-end bg-gradient-to-r from-slate-50/90 via-white/95 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-2 backdrop-blur-xl">
        <Button
          onClick={handleSave}
          className="bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 rounded-lg font-semibold text-sm border border-slate-200/80 dark:border-slate-600/80 hover:border-slate-300 dark:hover:border-slate-500"
          data-testid="button-save-artwork"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Save Artwork</span>
          </div>
        </Button>
      </div>
      
      {/* Professional Canvas Drawing Area */}
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-50/40 via-white/20 to-slate-100/30 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/30">
        <div className="relative h-full w-full group flex items-center justify-center">
          {/* Dynamic Canvas Container */}
          <div className={`${canvasFormat === 'square' ? 'aspect-square' : 'aspect-video'} max-w-full max-h-full bg-white dark:bg-slate-50 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:ring-slate-900/10`}>
            {/* Subtle Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none" 
              style={{
                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }}
            ></div>
            
            {/* Canvas Element */}
            <canvas 
              ref={canvasRef}
              className="drawing-canvas cursor-crosshair block w-full h-full relative z-10 transition-all duration-200"
              data-testid="canvas-drawing"
              aria-label="Professional drawing canvas with high-DPI support"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              style={{ 
                touchAction: 'none', 
                width: '100%', 
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Professional Corner Frame Indicators */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-l-3 border-t-3 border-primary/40 rounded-tl-xl pointer-events-none transition-all duration-300 group-hover:border-primary/60"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-r-3 border-t-3 border-primary/40 rounded-tr-xl pointer-events-none transition-all duration-300 group-hover:border-primary/60"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-3 border-b-3 border-primary/40 rounded-bl-xl pointer-events-none transition-all duration-300 group-hover:border-primary/60"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-3 border-b-3 border-primary/40 rounded-br-xl pointer-events-none transition-all duration-300 group-hover:border-primary/60"></div>
          
          {/* Floating Action Hint */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              Click and drag to create
            </div>
          </div>
        </div>
      </div>
      
      {/* Professional Status & Info Bar */}
      <div className="bg-gradient-to-r from-slate-50/95 via-white/98 to-slate-50/95 dark:from-slate-800/95 dark:via-slate-900/98 dark:to-slate-800/95 border-t border-slate-200/50 dark:border-slate-700/50 px-6 py-4 backdrop-blur-xl" role="status">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs font-medium">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="material-icons text-xs text-blue-600 dark:text-blue-400">touch_app</span>
              </div>
              <span className="font-semibold">Click & drag to paint</span>
            </div>
            
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600"></div>
            
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="material-icons text-xs text-purple-600 dark:text-purple-400">smartphone</span>
              </div>
              <span className="font-semibold">Touch optimized</span>
            </div>
            
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600"></div>
            
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="material-icons text-xs text-emerald-600 dark:text-emerald-400">hd</span>
              </div>
              <span className="font-semibold">High-DPI rendering</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200/60 dark:border-emerald-700/60 rounded-xl">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
