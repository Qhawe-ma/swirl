import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Square, Circle, Triangle, RectangleHorizontal, PaintBucket } from 'lucide-react';

interface PaintCanvasProps {
  selectedColor: string;
  brushSize: number;
  drawingMode: 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill';
  canvasFormat: 'square' | 'rectangle';
  initialImageData?: string;
  onSave: (imageData: string) => void;
  onUndoRedoChange: (canUndo: boolean, canRedo: boolean) => void;
  shouldUndo: boolean;
  shouldRedo: boolean;
  shouldClear: boolean;
  onActionComplete: () => void;
  onModeChange: (mode: 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill') => void;
}

export function PaintCanvas({
  selectedColor,
  brushSize,
  drawingMode,
  canvasFormat,
  initialImageData,
  onSave,
  onUndoRedoChange,
  shouldUndo,
  shouldRedo,
  shouldClear,
  onActionComplete,
  onModeChange
}: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentImageData, setCurrentImageData] = useState<string>('');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext('2d');
    
    if (!ctx) return;

    // Save current canvas content before resizing
    const previousContent = canvasElement.width > 0 ? canvasElement.toDataURL() : null;
    
    // Dynamic canvas sizing based on format
    const container = canvasElement.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const availableWidth = containerRect.width - 4;
      const availableHeight = containerRect.height - 4;
      
      let canvasWidth, canvasHeight;
      
      if (canvasFormat === 'square') {
        // Perfect square canvas - use much more space
        const minSize = Math.min(availableWidth, availableHeight);
        const squareSize = minSize * 0.95; // Use 95% of available space for better sizing
        canvasWidth = squareSize;
        canvasHeight = squareSize;
      } else {
        // Rectangle canvas (16:9 aspect ratio) - use much more space
        const aspectRatio = 16 / 9;
        
        if (availableWidth / availableHeight > aspectRatio) {
          // Height is the limiting factor
          canvasHeight = availableHeight * 0.99;
          canvasWidth = canvasHeight * aspectRatio;
        } else {
          // Width is the limiting factor
          canvasWidth = availableWidth * 0.99;
          canvasHeight = canvasWidth / aspectRatio;
        }
      }
      
      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Prioritize initialImageData (saved artwork) over previousContent
      const imageToLoad = initialImageData || (previousContent && previousContent !== 'data:,' ? previousContent : null);
      if (imageToLoad) {
        const img = new Image();
        img.onload = () => {
          // Scale the image to fit the new canvas size
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          // Set history with the loaded image
          const newState = canvasElement.toDataURL();
          setHistory([newState]);
          setHistoryIndex(0);
          onUndoRedoChange(false, false);
        };
        img.src = imageToLoad;
      } else {
        // Only set blank history if no image to load
        const initialData = canvasElement.toDataURL();
        setHistory([initialData]);
        setHistoryIndex(0);
      }
      
      // Enable smooth drawing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    setCanvas(canvasElement);
    setContext(ctx);
    
    // Use setTimeout to avoid calling setState during render
    setTimeout(() => {
      onUndoRedoChange(false, false);
    }, 0);
  }, [canvasFormat, initialImageData]);

  // Add keyboard event listeners for Ctrl+Z undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Trigger undo by calling the undo function
        if (canvas && context && historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const imageData = history[newIndex];
          
          const img = new Image();
          img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
            setHistoryIndex(newIndex);
            onUndoRedoChange(newIndex > 0, newIndex < history.length - 1);
          };
          img.src = imageData;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, context, history, historyIndex, onUndoRedoChange]);

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
    
    // Enhanced settings for shapes
    if (['rectangle', 'circle', 'triangle'].includes(drawingMode)) {
      context.lineWidth = Math.max(brushSize / 3, 2);
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
    
    // Settings for fill tool
    if (drawingMode === 'fill') {
      context.globalCompositeOperation = 'source-over';
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

  // Get coordinates from mouse or touch event with pixel-perfect accuracy
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate exact pixel coordinates with high precision and no restrictions
    const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (clientY - rect.top) * (canvas.height / rect.height);
    
    // Return coordinates without any boundary limitations
    return {
      x: canvasX,
      y: canvasY
    };
  };

  // Improved flood fill algorithm for paint bucket tool
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!context || !canvas) return;
    
    const x = Math.floor(startX);
    const y = Math.floor(startY);
    
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert fill color to RGB
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const tempData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fillR = tempData[0];
    const fillG = tempData[1];
    const fillB = tempData[2];
    const fillA = 255; // Always use full opacity
    
    // Get the target color at the clicked point
    const targetIndex = (y * canvas.width + x) * 4;
    const targetR = data[targetIndex];
    const targetG = data[targetIndex + 1];
    const targetB = data[targetIndex + 2];
    const targetA = data[targetIndex + 3];
    
    // If the target color is the same as fill color, don't fill
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) {
      return;
    }
    
    // Use a more robust color matching with tolerance for anti-aliased edges
    const colorTolerance = 5; // Small tolerance for similar colors
    
    const colorsMatch = (r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number) => {
      return Math.abs(r1 - r2) <= colorTolerance && 
             Math.abs(g1 - g2) <= colorTolerance && 
             Math.abs(b1 - b2) <= colorTolerance && 
             Math.abs(a1 - a2) <= colorTolerance;
    };
    
    // Scanline flood fill algorithm for better performance and completeness
    const stack: number[] = [];
    stack.push(x, y);
    
    while (stack.length > 0) {
      const currentY = stack.pop()!;
      const currentX = stack.pop()!;
      
      if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) continue;
      
      const currentIndex = (currentY * canvas.width + currentX) * 4;
      const currentR = data[currentIndex];
      const currentG = data[currentIndex + 1];
      const currentB = data[currentIndex + 2];
      const currentA = data[currentIndex + 3];
      
      // Skip if this pixel doesn't match the target color
      if (!colorsMatch(currentR, currentG, currentB, currentA, targetR, targetG, targetB, targetA)) {
        continue;
      }
      
      // Find the leftmost and rightmost bounds of this scanline
      let leftX = currentX;
      let rightX = currentX;
      
      // Expand left
      while (leftX > 0) {
        const leftIndex = (currentY * canvas.width + (leftX - 1)) * 4;
        const leftR = data[leftIndex];
        const leftG = data[leftIndex + 1];
        const leftB = data[leftIndex + 2];
        const leftA = data[leftIndex + 3];
        
        if (!colorsMatch(leftR, leftG, leftB, leftA, targetR, targetG, targetB, targetA)) break;
        leftX--;
      }
      
      // Expand right
      while (rightX < canvas.width - 1) {
        const rightIndex = (currentY * canvas.width + (rightX + 1)) * 4;
        const rightR = data[rightIndex];
        const rightG = data[rightIndex + 1];
        const rightB = data[rightIndex + 2];
        const rightA = data[rightIndex + 3];
        
        if (!colorsMatch(rightR, rightG, rightB, rightA, targetR, targetG, targetB, targetA)) break;
        rightX++;
      }
      
      // Fill the entire scanline
      for (let fillX = leftX; fillX <= rightX; fillX++) {
        const fillIndex = (currentY * canvas.width + fillX) * 4;
        data[fillIndex] = fillR;
        data[fillIndex + 1] = fillG;
        data[fillIndex + 2] = fillB;
        data[fillIndex + 3] = fillA;
      }
      
      // Add scanlines above and below to the stack
      for (let fillX = leftX; fillX <= rightX; fillX++) {
        // Check above
        if (currentY > 0) {
          const aboveIndex = ((currentY - 1) * canvas.width + fillX) * 4;
          const aboveR = data[aboveIndex];
          const aboveG = data[aboveIndex + 1];
          const aboveB = data[aboveIndex + 2];
          const aboveA = data[aboveIndex + 3];
          
          if (colorsMatch(aboveR, aboveG, aboveB, aboveA, targetR, targetG, targetB, targetA)) {
            stack.push(fillX, currentY - 1);
          }
        }
        
        // Check below
        if (currentY < canvas.height - 1) {
          const belowIndex = ((currentY + 1) * canvas.width + fillX) * 4;
          const belowR = data[belowIndex];
          const belowG = data[belowIndex + 1];
          const belowB = data[belowIndex + 2];
          const belowA = data[belowIndex + 3];
          
          if (colorsMatch(belowR, belowG, belowB, belowA, targetR, targetG, targetB, targetA)) {
            stack.push(fillX, currentY + 1);
          }
        }
      }
    }
    
    // Apply the changes
    context.putImageData(imageData, 0, 0);
  };

  const drawShape = (startX: number, startY: number, endX: number, endY: number) => {
    if (!context) return;
    
    const width = endX - startX;
    const height = endY - startY;
    
    context.beginPath();
    
    switch (drawingMode) {
      case 'rectangle':
        context.rect(startX, startY, width, height);
        break;
      case 'circle':
        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      case 'triangle':
        // Make triangle bigger and more proportional
        const triangleWidth = Math.abs(width) * 1.2; // 20% bigger
        const triangleHeight = Math.abs(height) * 1.2; // 20% bigger
        
        const topX = startX + width / 2;
        const topY = startY;
        const leftX = startX - (triangleWidth - Math.abs(width)) / 2;
        const leftY = startY + triangleHeight;
        const rightX = endX + (triangleWidth - Math.abs(width)) / 2;
        const rightY = startY + triangleHeight;
        
        context.moveTo(topX, topY);
        context.lineTo(leftX, leftY);
        context.lineTo(rightX, rightY);
        context.closePath();
        break;
    }
    
    context.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || !canvas) return;
    
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    if (['rectangle', 'circle', 'triangle'].includes(drawingMode)) {
      // For shapes, save the starting point and current canvas state
      setStartPoint({ x, y });
      setCurrentImageData(canvas.toDataURL());
    } else if (drawingMode === 'fill') {
      // For fill tool, perform flood fill immediately
      floodFill(x, y, selectedColor);
      saveState();
    } else {
      // For brush/eraser, start drawing immediately with precise positioning
      setLastPoint({ x, y });
      context.beginPath();
      
      // For 1px brush, draw exact pixel
      if (brushSize <= 1) {
        context.fillRect(x, y, 1, 1);
      } else if (brushSize <= 3) {
        context.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
        context.fill();
      } else {
        context.moveTo(x, y);
        context.lineTo(x, y);
        context.stroke();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvas) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    if (['rectangle', 'circle', 'triangle'].includes(drawingMode) && startPoint) {
      // Clear canvas and redraw the saved state
      if (currentImageData) {
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);
          
          // Draw preview shape with semi-transparent style
          context.save();
          context.globalAlpha = 0.7;
          context.strokeStyle = selectedColor;
          context.lineWidth = Math.max(brushSize / 3, 2);
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.setLineDash([5, 5]); // Dashed line for preview
          
          drawShape(startPoint.x, startPoint.y, x, y);
          
          context.restore();
        };
        img.src = currentImageData;
      }
      return;
    }
    
    if (!lastPoint) return;
    
    // Draw smooth continuous line for brush/eraser with improved accuracy
    if (drawingMode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }
    
    // For 1px brush, draw individual pixels along the path
    if (brushSize <= 1) {
      const dx = Math.abs(x - lastPoint.x);
      const dy = Math.abs(y - lastPoint.y);
      const sx = lastPoint.x < x ? 1 : -1;
      const sy = lastPoint.y < y ? 1 : -1;
      let err = dx - dy;
      
      let currentX = Math.floor(lastPoint.x);
      let currentY = Math.floor(lastPoint.y);
      const targetX = Math.floor(x);
      const targetY = Math.floor(y);
      
      while (true) {
        // Draw pixel without boundary restrictions
        context.fillRect(currentX, currentY, 1, 1);
        
        if (currentX === targetX && currentY === targetY) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          currentX += sx;
        }
        if (e2 < dx) {
          err += dx;
          currentY += sy;
        }
      }
    } else if (brushSize <= 3) {
      const midX = (lastPoint.x + x) / 2;
      const midY = (lastPoint.y + y) / 2;
      context.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
      context.stroke();
      context.beginPath();
      context.moveTo(midX, midY);
    } else {
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    }
    
    setLastPoint({ x, y });
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    if (['rectangle', 'circle', 'triangle'].includes(drawingMode) && startPoint && e && context && canvas) {
      // Clear canvas and redraw the saved state
      if (currentImageData) {
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);
          
          // Draw the final shape with solid style
          context.strokeStyle = selectedColor;
          context.lineWidth = Math.max(brushSize / 3, 2);
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.setLineDash([]); // Solid line for final shape
          
          const { x, y } = getCoordinates(e);
          drawShape(startPoint.x, startPoint.y, x, y);
          
          saveState();
        };
        img.src = currentImageData;
      }
      setStartPoint(null);
      setCurrentImageData('');
    } else if (!['rectangle', 'circle', 'triangle'].includes(drawingMode)) {
      saveState();
    }
    
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <div className="h-full flex flex-col bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden" data-testid="card-paint-canvas">
      {/* Canvas Header with Shape Tools */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50/90 via-white/95 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-2 sm:px-4 py-2 backdrop-blur-xl">
        {/* Shape Tools */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-xs font-medium text-muted-foreground mr-1 sm:mr-2 hidden sm:inline">Shapes:</span>
          <button
            onClick={() => onModeChange('rectangle')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation ${
              drawingMode === 'rectangle'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            data-testid="button-shape-rectangle"
            title="Rectangle"
          >
            <RectangleHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onModeChange('circle')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation ${
              drawingMode === 'circle'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            data-testid="button-shape-circle"
            title="Circle"
          >
            <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onModeChange('triangle')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation ${
              drawingMode === 'triangle'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            data-testid="button-shape-triangle"
            title="Triangle"
          >
            <Triangle className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onModeChange('fill')}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation ${
              drawingMode === 'fill'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            data-testid="button-tool-fill"
            title="Fill (Paint Bucket)"
          >
            <PaintBucket className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
        
        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-md hover:shadow-lg transition-all duration-200 px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-600/80 hover:border-slate-300 dark:hover:border-slate-500 touch-manipulation"
          data-testid="button-save-artwork"
        >
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Save Artwork</span>
            <span className="sm:hidden">Save</span>
          </div>
        </Button>
      </div>
      
      {/* Professional Canvas Drawing Area */}
      <div className="flex-1 p-1 bg-gradient-to-br from-slate-50/40 via-white/20 to-slate-100/30 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/30">
        <div className="relative h-full w-full group flex items-center justify-center">
          {/* Dynamic Canvas Container */}
          <div className={`${canvasFormat === 'square' ? 'aspect-square w-[min(90vw,85vh)] sm:w-[min(85vw,85vh)] max-w-[90%] sm:max-w-[85%] max-h-[85%]' : 'aspect-video w-[min(95vw,85vh)] max-w-[95%] max-h-[85%]'} bg-white dark:bg-slate-50 border-2 border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 transition-all duration-300 group-hover:shadow-3xl group-hover:ring-slate-900/10`}>
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
              onMouseUp={(e) => stopDrawing(e)}
              onMouseLeave={() => stopDrawing()}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={(e) => stopDrawing(e)}
              onTouchCancel={() => stopDrawing()}
              style={{ 
                touchAction: 'none', 
                width: '100%', 
                height: '100%',
                display: 'block',
                margin: 0,
                padding: 0,
                border: 'none',
                outline: 'none'
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
              <span className="hidden sm:inline">Click and drag to create</span>
              <span className="sm:hidden">Tap and drag to draw</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}