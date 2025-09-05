import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

interface PaintCanvasProps {
  selectedColor: string;
  brushSize: number;
  drawingMode: 'brush' | 'eraser';
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

    // Make canvas optimized for smooth drawing
    const container = canvasElement.parentElement;
    if (container) {
      // Use full available space
      let canvasWidth = Math.max(container.clientWidth, 400);
      let canvasHeight = Math.max(container.clientHeight, 300);
      
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
  }, []);

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
      {/* Compact Canvas Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50/90 via-white/95 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-7 h-7 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center ring-1 ring-primary/20">
              <span className="text-sm">🎨</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">Live</span>
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-primary via-primary/98 to-primary/95 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 motion-safe:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 px-4 py-2 rounded-lg font-bold text-sm tracking-wide ring-1 ring-white/20"
          data-testid="button-save-artwork"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-foreground/20 rounded-sm flex items-center justify-center">
              <span className="material-icons text-xs">save</span>
            </div>
            <span>Save Artwork</span>
          </div>
        </Button>
      </div>
      
      {/* Professional Canvas Drawing Area */}
      <div className="flex-1 p-6 bg-gradient-to-br from-slate-50/40 via-white/20 to-slate-100/30 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/30">
        <div className="relative h-full w-full group">
          {/* Premium Canvas Container */}
          <div className="h-full w-full bg-white dark:bg-slate-50 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:ring-slate-900/10">
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
              style={{ touchAction: 'none', maxWidth: '100%', maxHeight: '100%' }}
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
