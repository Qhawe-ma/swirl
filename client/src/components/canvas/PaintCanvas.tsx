import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
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
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    // Configure drawing brush
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = selectedColor;
    }

    // Save initial state
    const initialState = fabricCanvas.toJSON();
    setHistory([JSON.stringify(initialState)]);
    setHistoryIndex(0);

    // Add history tracking
    const saveState = () => {
      const currentState = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onUndoRedoChange(true, false);
    };

    fabricCanvas.on('path:created', saveState);
    fabricCanvas.on('object:added', saveState);
    fabricCanvas.on('object:removed', saveState);

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Update brush properties
  useEffect(() => {
    if (!canvas || !canvas.freeDrawingBrush) return;

    canvas.freeDrawingBrush.width = brushSize;
    
    if (drawingMode === 'eraser') {
      canvas.freeDrawingBrush.color = '#ffffff';
    } else {
      canvas.freeDrawingBrush.color = selectedColor;
    }
  }, [canvas, selectedColor, brushSize, drawingMode]);

  // Handle undo
  useEffect(() => {
    if (!shouldUndo || !canvas || historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const state = JSON.parse(history[newIndex]);
    
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
      onUndoRedoChange(newIndex > 0, newIndex < history.length - 1);
      onActionComplete();
    });
  }, [shouldUndo, canvas, history, historyIndex, onUndoRedoChange, onActionComplete]);

  // Handle redo
  useEffect(() => {
    if (!shouldRedo || !canvas || historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const state = JSON.parse(history[newIndex]);
    
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      setHistoryIndex(newIndex);
      onUndoRedoChange(newIndex > 0, newIndex < history.length - 1);
      onActionComplete();
    });
  }, [shouldRedo, canvas, history, historyIndex, onUndoRedoChange, onActionComplete]);

  // Handle clear
  useEffect(() => {
    if (!shouldClear || !canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    
    // Reset history
    const initialState = canvas.toJSON();
    setHistory([JSON.stringify(initialState)]);
    setHistoryIndex(0);
    onUndoRedoChange(false, false);
    onActionComplete();
  }, [shouldClear, canvas, onUndoRedoChange, onActionComplete]);

  const handleSave = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1
    });
    
    onSave(dataURL);
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
            className="drawing-canvas w-full h-full"
            data-testid="canvas-drawing"
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
