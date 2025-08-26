import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');
    
    if (!ctx) return;

    // Make canvas large like classic Paint
    const container = canvasElement.parentElement;
    if (container) {
      const containerWidth = container.clientWidth - 24; // Minimal padding
      const maxHeight = window.innerHeight - 180; // Use most of screen height
      
      // Make canvas much larger - use most available space
      let canvasWidth = Math.min(containerWidth, 900);
      let canvasHeight = Math.min(maxHeight - 80, 600); // Larger height
      
      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
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

  // Update brush properties
  useEffect(() => {
    if (!context) return;

    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (drawingMode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = selectedColor;
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvas) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  return (
    <div className="h-full flex flex-col bg-gray-100 border border-gray-300" data-testid="card-paint-canvas">
      {/* Classic Paint-style toolbar */}
      <div className="flex items-center justify-between bg-gray-200 border-b border-gray-300 px-3 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-800">Canvas</span>
          <span className="text-xs text-gray-600" data-testid="text-canvas-size">
            {canvas ? `${canvas.width}x${canvas.height}` : 'Canvas'}
          </span>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 h-7"
          onClick={handleSave}
          data-testid="button-save-artwork"
        >
          Save Artwork
        </Button>
      </div>
      
      {/* Classic Paint canvas area - fills most space */}
      <div className="flex-1 p-3 bg-gray-100">
        <div className="h-full w-full bg-white border-2 border-gray-400" style={{ borderStyle: 'inset' }}>
          <canvas 
            ref={canvasRef}
            className="drawing-canvas cursor-crosshair block"
            data-testid="canvas-drawing"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
      
      {/* Status bar like classic Paint */}
      <div className="bg-gray-200 border-t border-gray-300 px-3 py-1 text-xs text-gray-600">
        Click and drag to draw • Touch supported on mobile
      </div>
    </div>
  );
}
