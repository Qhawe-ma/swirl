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

    canvasElement.width = 800;
    canvasElement.height = 600;
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    
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
      context.clearRect(0, 0, 800, 600);
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
      context.clearRect(0, 0, 800, 600);
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
    context.fillRect(0, 0, 800, 600);
    
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
      onUndoRedoChange(newHistory.length > 1, false);
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
    <Card className="p-6 mb-8" data-testid="card-paint-canvas">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <span className="material-icons mr-2">create</span>
          Canvas
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500" data-testid="text-canvas-size">800x600</span>
          <Button
            className="bg-secondary hover:bg-orange-600 text-white flex items-center space-x-2"
            onClick={handleSave}
            data-testid="button-save-artwork"
          >
            <span className="material-icons text-sm">save</span>
            <span>Save Artwork</span>
          </Button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex justify-center">
        <div className="canvas-container w-full max-w-4xl bg-white">
          <canvas 
            ref={canvasRef}
            className="drawing-canvas w-full h-full cursor-crosshair"
            data-testid="canvas-drawing"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
      
      {/* Canvas Instructions */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <span className="material-icons text-sm align-middle mr-1">touch_app</span>
        Click and drag to draw • Touch supported on mobile
      </div>
    </Card>
  );
}
