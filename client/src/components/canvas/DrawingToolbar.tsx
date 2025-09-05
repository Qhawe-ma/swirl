import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Brush, Eraser, Undo2, Redo2, Trash2, Palette } from "lucide-react";

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
    <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 h-64 lg:h-full overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10" data-testid="toolbar-drawing-tools">
      {/* Premium Tools Header */}
      <div className="bg-gradient-to-r from-slate-50/95 via-white/98 to-slate-50/95 dark:from-slate-800/95 dark:via-slate-900/98 dark:to-slate-800/95 border-b border-slate-200/50 dark:border-slate-700/50 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
                <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Creative Studio
              </h2>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Professional Tools
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-xs font-black rounded-xl tracking-wider uppercase">
            Pro
          </div>
        </div>
      </div>

      <div className="p-5 space-y-8">
        {/* Premium Drawing Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <label htmlFor="drawing-mode" className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">Drawing Mode</label>
            </div>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
              {drawingMode === 'brush' ? '🖌 Paint' : '🧩 Erase'}
            </div>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <ToggleGroup
              type="single"
              value={drawingMode}
              onValueChange={(value) => value && onModeChange(value as 'brush' | 'eraser')}
              className="grid grid-cols-1 gap-3"
              aria-label="Drawing mode selection"
              data-testid="toggle-group-drawing-mode"
            >
              <ToggleGroupItem
                value="brush"
                className="w-full flex items-center justify-start space-x-4 px-5 py-4 text-sm font-bold transition-all duration-300 motion-reduce:transition-none motion-safe:hover:scale-[1.01] data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:via-primary/95 data-[state=on]:to-primary/90 data-[state=on]:text-primary-foreground data-[state=on]:shadow-xl hover:bg-white dark:hover:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 data-[state=on]:border-primary/30"
                aria-label="Select brush tool"
                data-testid="button-select-brush"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 data-[state=on]:bg-primary-foreground/20 rounded-xl flex items-center justify-center ring-1 ring-blue-200/60 dark:ring-blue-700/60 data-[state=on]:ring-primary-foreground/30">
                    <Brush className="h-5 w-5 text-blue-600 dark:text-blue-400 data-[state=on]:text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold tracking-wide">Brush Tool</span>
                  <span className="text-xs font-semibold opacity-70 tracking-wide">Paint & create</span>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 data-[state=on]:bg-primary-foreground/60 rounded-full"></div>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="eraser"
                className="w-full flex items-center justify-start space-x-4 px-5 py-4 text-sm font-bold transition-all duration-300 motion-reduce:transition-none motion-safe:hover:scale-[1.01] data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:via-primary/95 data-[state=on]:to-primary/90 data-[state=on]:text-primary-foreground data-[state=on]:shadow-xl hover:bg-white dark:hover:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 data-[state=on]:border-primary/30"
                aria-label="Select eraser tool"
                data-testid="button-select-eraser"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 data-[state=on]:bg-primary-foreground/20 rounded-xl flex items-center justify-center ring-1 ring-red-200/60 dark:ring-red-700/60 data-[state=on]:ring-primary-foreground/30">
                    <Eraser className="h-5 w-5 text-red-600 dark:text-red-400 data-[state=on]:text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold tracking-wide">Eraser Tool</span>
                  <span className="text-xs font-semibold opacity-70 tracking-wide">Remove & clean</span>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 data-[state=on]:bg-primary-foreground/60 rounded-full"></div>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Premium Color Palette */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <label htmlFor="color-selection" className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">Color Palette</label>
            </div>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
              🎨 8 colors
            </div>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 space-y-5 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div 
                  className="w-14 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 motion-reduce:transition-none motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-1 ring-slate-900/10 dark:ring-white/10" 
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(true)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowColorPicker(true)}
                  aria-label="Current selected color"
                  data-testid="swatch-selected-color"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(true)}
                className="bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-primary/5 hover:border-primary/30 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
                aria-label="Open color picker"
                data-testid="button-open-color-picker"
              >
                <div className="flex items-center space-x-2">
                  <span className="material-icons text-sm">palette</span>
                  <span>Custom</span>
                </div>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_PRESETS.map((color, index) => (
                <div 
                  key={color}
                  className={`relative w-10 h-10 rounded-xl cursor-pointer shadow-md transition-all duration-300 motion-reduce:transition-none motion-safe:hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-1 ring-slate-200/60 dark:ring-slate-700/60 hover:shadow-lg ${
                    selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onColorChange(color)}
                  aria-label={`Select ${color} color`}
                  data-testid={`swatch-preset-${color.replace('#', '')}`}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Brush Size Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <label htmlFor="brush-size" className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">Brush Size</label>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-2.5 py-1 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-sm font-black rounded-lg tracking-wide">
                {brushSize}px
              </div>
            </div>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 space-y-5 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <Slider
              id="brush-size"
              value={[brushSize]}
              onValueChange={(value) => onBrushSizeChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
              aria-label="Brush size control"
              data-testid="slider-brush-size"
            />
            <div className="flex justify-center">
              <div className="relative">
                <div 
                  className="border-2 border-slate-200 dark:border-slate-700 rounded-full shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 transition-all duration-200"
                  style={{ 
                    width: `${Math.max(brushSize, 8)}px`, 
                    height: `${Math.max(brushSize, 8)}px`,
                    backgroundColor: drawingMode === 'brush' ? selectedColor : '#f1f5f9',
                    minWidth: '8px',
                    minHeight: '8px',
                    maxWidth: '50px',
                    maxHeight: '50px'
                  }}
                  data-testid="preview-brush-size"
                />
                {brushSize > 20 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Action Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <label className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide">Quick Actions</label>
            </div>
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
              ⚡ 3 tools
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                size="default"
                className="flex items-center justify-center space-x-2.5 py-3 px-4 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 backdrop-blur-sm"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo last action"
                data-testid="button-undo"
              >
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Undo2 className="h-3 w-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold tracking-wide">Undo</span>
              </Button>
              <Button 
                variant="outline"
                size="default"
                className="flex items-center justify-center space-x-2.5 py-3 px-4 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 backdrop-blur-sm"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo last action"
                data-testid="button-redo"
              >
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Redo2 className="h-3 w-3 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold tracking-wide">Redo</span>
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="default"
                  className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 bg-white/80 dark:bg-slate-800/80 border-red-200/60 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 text-red-700 dark:text-red-300 font-bold rounded-xl transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02] backdrop-blur-sm mt-2"
                  aria-label="Clear entire canvas"
                  data-testid="button-clear-canvas"
                >
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">Clear Canvas</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear the entire canvas? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear Canvas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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