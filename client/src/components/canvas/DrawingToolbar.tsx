import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { Card } from "@/components/ui/card";

interface DrawingToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  drawingMode: 'brush' | 'eraser';
  onModeChange: (mode: 'brush' | 'eraser') => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const COLOR_PRESETS = [
  '#000000', '#ef4444', '#3b82f6', 
  '#10b981', '#fbbf24', '#8b5cf6'
];

export function DrawingToolbar({
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  drawingMode,
  onModeChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}: DrawingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Card className="p-6 sticky top-8" data-testid="toolbar-drawing-tools">
      <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
        <span className="material-icons mr-2">build</span>
        Drawing Tools
      </h2>
      
      {/* Drawing Mode Selection */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-2">
          <Button
            variant={drawingMode === 'brush' ? 'default' : 'outline'}
            className="toolbar-item flex-1 flex flex-col items-center space-y-1 h-auto py-3"
            onClick={() => onModeChange('brush')}
            data-testid="button-select-brush"
          >
            <span className="material-icons">brush</span>
            <span className="text-xs">Brush</span>
          </Button>
          <Button
            variant={drawingMode === 'eraser' ? 'default' : 'outline'}
            className="toolbar-item flex-1 flex flex-col items-center space-y-1 h-auto py-3"
            onClick={() => onModeChange('eraser')}
            data-testid="button-select-eraser"
          >
            <span className="material-icons">auto_fix_high</span>
            <span className="text-xs">Eraser</span>
          </Button>
        </div>
      </div>
      
      {/* Color Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
        <div className="flex items-center space-x-3 mb-3">
          <div 
            className="color-swatch" 
            style={{ backgroundColor: selectedColor }}
            onClick={() => setShowColorPicker(true)}
            data-testid="swatch-selected-color"
          />
          <Button 
            variant="ghost" 
            className="text-sm text-primary hover:text-blue-700 flex items-center p-0"
            onClick={() => setShowColorPicker(true)}
            data-testid="button-open-color-picker"
          >
            <span className="material-icons text-sm mr-1">palette</span>
            Choose Color
          </Button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PRESETS.map((color) => (
            <div 
              key={color}
              className="color-swatch cursor-pointer" 
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              data-testid={`swatch-preset-${color.replace('#', '')}`}
            />
          ))}
        </div>
      </div>
      
      {/* Brush Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Brush Size: <span className="font-normal" data-testid="text-brush-size">{brushSize}</span>px
        </label>
        <Slider
          value={[brushSize]}
          onValueChange={([value]) => onBrushSizeChange(value)}
          max={50}
          min={1}
          step={1}
          className="w-full"
          data-testid="slider-brush-size"
        />
        <div className="flex justify-center mt-2">
          <div 
            className="brush-preview bg-black rounded-full"
            style={{ 
              width: `${brushSize}px`, 
              height: `${brushSize}px`,
              backgroundColor: drawingMode === 'brush' ? selectedColor : '#ffffff'
            }}
            data-testid="preview-brush-size"
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2"
          onClick={onUndo}
          disabled={!canUndo}
          data-testid="button-undo"
        >
          <span className="material-icons text-sm">undo</span>
          <span>Undo</span>
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2"
          onClick={onRedo}
          disabled={!canRedo}
          data-testid="button-redo"
        >
          <span className="material-icons text-sm">redo</span>
          <span>Redo</span>
        </Button>
        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center space-x-2"
          onClick={onClear}
          data-testid="button-clear-canvas"
        >
          <span className="material-icons text-sm">clear</span>
          <span>Clear Canvas</span>
        </Button>
      </div>

      <ColorPicker
        color={selectedColor}
        onChange={onColorChange}
        open={showColorPicker}
        onOpenChange={setShowColorPicker}
      />
    </Card>
  );
}
