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
    <div className="h-full flex flex-col bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden" data-testid="card-paint-canvas">
      {/* Modern Canvas Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30 px-4 py-3">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-semibold text-foreground tracking-wide">Canvas</span>
          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md" data-testid="text-canvas-size">
            {canvas ? `${canvas.width}×${canvas.height}px` : 'Loading...'}
          </span>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 motion-safe:hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          data-testid="button-save-artwork"
        >
          Save Artwork
        </Button>
      </div>
      
      {/* Modern Canvas Area */}
      <div className="flex-1 p-4 bg-gradient-to-br from-muted/20 via-transparent to-muted/30">
        <div className="h-full w-full bg-card border border-border/50 rounded-xl overflow-hidden shadow-inner">
          <canvas 
            ref={canvasRef}
            className="drawing-canvas cursor-crosshair block w-full h-full"
            data-testid="canvas-drawing"
            aria-label="Drawing canvas"
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
      </div>
      
      {/* Modern Status Bar */}
      <div className="bg-muted/30 border-t border-border/30 px-4 py-2 text-xs text-muted-foreground font-medium" role="status">
        <div className="flex items-center justify-between">
          <span>Click and drag to draw • Touch supported on mobile</span>
          <span className="flex items-center space-x-1 text-primary/80">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            <span>Ready</span>
          </span>
        </div>
      </div>
    </div>
  );
}
