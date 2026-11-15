import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Brush, Eraser, Undo2, Redo2, Trash2, Palette, PaintBucket } from "lucide-react";

interface DrawingToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  drawingMode: 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill';
  onModeChange: (mode: 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill') => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isCollapsed?: boolean;
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
  canRedo,
  isCollapsed = false
}: DrawingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 h-auto lg:max-h-[calc(100vh-6rem)] overflow-y-auto lg:overflow-y-auto overflow-x-auto rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10" data-testid="toolbar-drawing-tools">

      <div className="lg:hidden p-2">
        <div className="flex items-center space-x-4 min-w-max">
          <div className="flex space-x-1">
            <Button
              variant={drawingMode === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('brush')}
              className="h-8 w-8 p-0"
              data-testid="button-mobile-brush"
            >
              <Brush className="h-4 w-4" />
            </Button>
            <Button
              variant={drawingMode === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('eraser')}
              className="h-8 w-8 p-0"
              data-testid="button-mobile-eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={drawingMode === 'fill' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('fill')}
              className="h-8 w-8 p-0"
              data-testid="button-mobile-fill"
            >
              <PaintBucket className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shadow-sm"
              style={{ backgroundColor: selectedColor }}
              onClick={() => setShowColorPicker(true)}
              data-testid="mobile-color-current"
            />
            <div className="flex space-x-1">
              {COLOR_PRESETS.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-md cursor-pointer border transition-all ${
                    selectedColor === color ? 'border-primary border-2 scale-110' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  data-testid={`mobile-color-${color.replace('#', '')}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 min-w-[120px]">
            <div className="text-xs font-medium">{brushSize}</div>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => onBrushSizeChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="flex-1"
              data-testid="mobile-brush-size"
            />
          </div>

          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              data-testid="button-mobile-undo"
            >
              <Undo2 className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              data-testid="button-mobile-redo"
            >
              <Redo2 className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                  data-testid="button-mobile-clear"
                >
                  <Trash2 className="h-3 w-3" />
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

      <div className="hidden lg:block p-4 space-y-4">
        <div className="space-y-3">
          <ToggleGroup
            type="single"
            value={drawingMode}
            onValueChange={(value) => value && onModeChange(value as 'brush' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'fill')}
            className="grid grid-cols-3 gap-3"
            aria-label="Drawing mode selection"
            data-testid="toggle-group-drawing-mode"
          >
            <ToggleGroupItem
              value="brush"
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border-2 border-slate-200/80 dark:border-slate-700/80 data-[state=on]:border-primary"
              aria-label="Select brush tool"
              data-testid="button-select-brush"
            >
              <Brush className="h-4 w-4" aria-hidden="true" />
              <span>Brush</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="eraser"
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border-2 border-slate-200/80 dark:border-slate-700/80 data-[state=on]:border-primary"
              aria-label="Select eraser tool"
              data-testid="button-select-eraser"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              <span>Eraser</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="fill"
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border-2 border-slate-200/80 dark:border-slate-700/80 data-[state=on]:border-primary"
              aria-label="Select fill tool"
              data-testid="button-select-fill"
            >
              <PaintBucket className="h-4 w-4" aria-hidden="true" />
              <span>Fill</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Colors</label>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(true)}
              className="h-8 px-3 text-xs font-semibold rounded-lg border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-primary/50"
              aria-label="Open color picker"
              data-testid="button-open-color-picker"
            >
              Custom
            </Button>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105" 
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowColorPicker(true)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setShowColorPicker(true)}
                aria-label="Current selected color"
                data-testid="swatch-selected-color"
              />
              <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                {selectedColor.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_PRESETS.map((color, index) => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded-xl cursor-pointer shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
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
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white/90 rounded-full shadow-md border border-slate-200/50"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Size</label>
            <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              {brushSize}px
            </div>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center space-x-4">
              <div className="flex-1 py-2">
                <Slider
                  id="brush-size"
                  value={[brushSize]}
                  onValueChange={(value) => onBrushSizeChange(value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full [&>span[data-orientation=horizontal]]:h-3 [&>span[data-orientation=horizontal]]:bg-slate-200 [&>span[data-orientation=horizontal]]:dark:bg-slate-600 [&>span[data-orientation=horizontal]]:rounded-full [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-3 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-white/50"
                  style={{
                    '--slider-thumb-bg': drawingMode === 'brush' ? selectedColor : '#6b7280'
                  } as React.CSSProperties & { '--slider-thumb-bg': string }}
                  aria-label="Brush size control"
                  data-testid="slider-brush-size"
                />
              </div>
              <div 
                className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-full shadow-md flex-shrink-0 transition-all duration-200"
                style={{ 
                  backgroundColor: drawingMode === 'brush' ? selectedColor : '#f1f5f9',
                  transform: `scale(${Math.min(Math.max(brushSize / 25, 0.4), 1)})`
                }}
                data-testid="preview-brush-size"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Actions</label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                size="default"
                className="flex items-center justify-center gap-2 h-11 text-sm font-semibold transition-all duration-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-700/80"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo last action"
                data-testid="button-undo"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                <span>Undo</span>
              </Button>
              <Button 
                variant="outline"
                size="default"
                className="flex items-center justify-center gap-2 h-11 text-sm font-semibold transition-all duration-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-200/80 dark:border-slate-700/80"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo last action"
                data-testid="button-redo"
              >
                <Redo2 className="h-4 w-4" aria-hidden="true" />
                <span>Redo</span>
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="default"
                  className="w-full flex items-center justify-center gap-2 h-11 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                  aria-label="Clear entire canvas"
                  data-testid="button-clear-canvas"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>Clear Canvas</span>
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
