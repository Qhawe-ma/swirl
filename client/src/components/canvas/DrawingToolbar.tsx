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
  '#000000', '#ff0000', '#00ff00', 
  '#0000ff', '#ffff00', '#ff00ff',
  '#00ffff', '#ffffff'
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
    <div className="bg-gray-300 border-2 border-gray-400 h-full overflow-y-auto" style={{ borderStyle: 'outset', borderWidth: '2px' }} data-testid="toolbar-drawing-tools">
      {/* Header */}
      <div className="bg-gray-200 border-b border-gray-400 px-3 py-2">
        <h2 className="text-sm font-bold text-gray-800 flex items-center">
          <span className="mr-2">🖌️</span>
          Drawing Tools
        </h2>
      </div>

      <div className="p-3 space-y-4">
        {/* Drawing Mode Selection - MS Paint Style */}
        <div>
          <div className="bg-gray-200 border border-gray-400 p-2" style={{ borderStyle: 'inset' }}>
            <div className="grid grid-cols-2 gap-1">
              <button
                className={`px-2 py-3 text-xs font-medium border-2 flex flex-col items-center space-y-1 ${
                  drawingMode === 'brush' 
                    ? 'bg-blue-200 border-blue-500' 
                    : 'bg-gray-200 hover:bg-gray-100 border-gray-400'
                }`}
                style={{ borderStyle: drawingMode === 'brush' ? 'inset' : 'outset' }}
                onClick={() => onModeChange('brush')}
                data-testid="button-select-brush"
              >
                <span className="text-lg">🖌️</span>
                <span>Brush</span>
              </button>
              <button
                className={`px-2 py-3 text-xs font-medium border-2 flex flex-col items-center space-y-1 ${
                  drawingMode === 'eraser' 
                    ? 'bg-blue-200 border-blue-500' 
                    : 'bg-gray-200 hover:bg-gray-100 border-gray-400'
                }`}
                style={{ borderStyle: drawingMode === 'eraser' ? 'inset' : 'outset' }}
                onClick={() => onModeChange('eraser')}
                data-testid="button-select-eraser"
              >
                <span className="text-lg">🧽</span>
                <span>Eraser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Color Selection - MS Paint Style */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Color</label>
          <div className="bg-gray-200 border border-gray-400 p-2" style={{ borderStyle: 'inset' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div 
                className="w-10 h-6 border-2 border-gray-600 cursor-pointer" 
                style={{ backgroundColor: selectedColor, borderStyle: 'inset' }}
                onClick={() => setShowColorPicker(true)}
                data-testid="swatch-selected-color"
              />
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                onClick={() => setShowColorPicker(true)}
                data-testid="button-open-color-picker"
              >
                Choose Color
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_PRESETS.map((color) => (
                <div 
                  key={color}
                  className={`w-6 h-6 border cursor-pointer ${
                    selectedColor === color ? 'border-2 border-black' : 'border border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  data-testid={`swatch-preset-${color.replace('#', '')}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Brush Size - MS Paint Style */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            Brush Size: <span className="font-normal" data-testid="text-brush-size">{brushSize}</span>px
          </label>
          <div className="bg-gray-200 border border-gray-400 p-3" style={{ borderStyle: 'inset' }}>
            <input
              type="range"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              max={50}
              min={1}
              step={1}
              className="w-full mb-2"
              data-testid="slider-brush-size"
            />
            <div className="flex justify-center">
              <div 
                className="border border-gray-600 rounded-full bg-white"
                style={{ 
                  width: `${Math.max(brushSize, 4)}px`, 
                  height: `${Math.max(brushSize, 4)}px`,
                  backgroundColor: drawingMode === 'brush' ? selectedColor : '#ffffff',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.3)'
                }}
                data-testid="preview-brush-size"
              />
            </div>
          </div>
        </div>

        {/* Actions - MS Paint Style */}
        <div className="space-y-1">
          <button 
            className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium border-2 ${
              !canUndo 
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-100 active:bg-gray-300'
            }`}
            style={{ borderStyle: !canUndo ? 'inset' : 'outset' }}
            onClick={onUndo}
            disabled={!canUndo}
            data-testid="button-undo"
          >
            <span>↶</span>
            <span>Undo</span>
          </button>
          <button 
            className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium border-2 ${
              !canRedo 
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-100 active:bg-gray-300'
            }`}
            style={{ borderStyle: !canRedo ? 'inset' : 'outset' }}
            onClick={onRedo}
            disabled={!canRedo}
            data-testid="button-redo"
          >
            <span>↷</span>
            <span>Redo</span>
          </button>
          <button 
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium border-2 bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-100 active:bg-gray-300"
            style={{ borderStyle: 'outset' }}
            onClick={onClear}
            data-testid="button-clear-canvas"
          >
            <span>🗑️</span>
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>

      <ColorPicker
        color={selectedColor}
        onChange={onColorChange}
        open={showColorPicker}
        onOpenChange={setShowColorPicker}
      />
    </div>
  );
}