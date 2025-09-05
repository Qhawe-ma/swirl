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
    <div className="bg-card/80 backdrop-blur-xl border border-border/50 h-48 lg:h-full overflow-y-auto lg:overflow-y-auto rounded-2xl shadow-xl" data-testid="toolbar-drawing-tools">
      {/* Modern Header - Responsive */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30 px-3 lg:px-4 py-2 lg:py-3">
        <h2 className="text-xs lg:text-sm font-semibold text-foreground flex items-center tracking-wide">
          <Palette className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Drawing Tools</span>
          <span className="sm:hidden">Tools</span>
        </h2>
      </div>

      <div className="p-3 lg:p-4 space-y-4 lg:space-y-6">
        {/* Modern Drawing Mode Selection - Responsive */}
        <div className="space-y-2 lg:space-y-3">
          <label htmlFor="drawing-mode" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mode</label>
          <div className="bg-muted/30 rounded-lg lg:rounded-xl p-2 lg:p-3">
            <ToggleGroup
              type="single"
              value={drawingMode}
              onValueChange={(value) => value && onModeChange(value as 'brush' | 'eraser')}
              className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-2"
              aria-label="Drawing mode selection"
              data-testid="toggle-group-drawing-mode"
            >
              <ToggleGroupItem
                value="brush"
                className="w-full flex items-center space-x-1 lg:space-x-3 px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label="Select brush tool"
                data-testid="button-select-brush"
              >
                <Brush className="h-3 w-3 lg:h-4 lg:w-4" aria-hidden="true" />
                <span className="font-medium">Brush</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="eraser"
                className="w-full flex items-center space-x-1 lg:space-x-3 px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label="Select eraser tool"
                data-testid="button-select-eraser"
              >
                <Eraser className="h-3 w-3 lg:h-4 lg:w-4" aria-hidden="true" />
                <span className="font-medium">Eraser</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Modern Color Selection */}
        <div className="space-y-3">
          <label htmlFor="color-selection" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</label>
          <div className="bg-muted/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-8 border border-border rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowColorPicker(true)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setShowColorPicker(true)}
                aria-label="Current selected color"
                data-testid="swatch-selected-color"
              />
              <Button 
                variant="link"
                size="sm"
                onClick={() => setShowColorPicker(true)}
                aria-label="Open color picker"
                data-testid="button-open-color-picker"
              >
                Choose Color
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded-lg cursor-pointer shadow-sm transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border border-border/50'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onColorChange(color)}
                  aria-label={`Select ${color} color`}
                  data-testid={`swatch-preset-${color.replace('#', '')}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modern Brush Size - Responsive */}
        <div className="space-y-2 lg:space-y-3">
          <label htmlFor="brush-size" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Brush Size</span>
            <span className="text-foreground font-semibold" data-testid="text-brush-size">{brushSize}px</span>
          </label>
          <div className="bg-muted/30 rounded-lg lg:rounded-xl p-3 lg:p-4 space-y-3 lg:space-y-4">
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
              <div 
                className="border border-border/50 rounded-full bg-card shadow-sm"
                style={{ 
                  width: `${Math.max(brushSize, 6)}px`, 
                  height: `${Math.max(brushSize, 6)}px`,
                  backgroundColor: drawingMode === 'brush' ? selectedColor : 'hsl(var(--card))',
                  boxShadow: 'var(--shadow-sm)'
                }}
                data-testid="preview-brush-size"
              />
            </div>
          </div>
        </div>

        {/* Modern Actions - Responsive */}
        <div className="space-y-2 lg:space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</label>
          <div className="space-y-1 lg:space-y-2">
            <Button 
              variant="secondary"
              size="default"
              className="w-full flex items-center justify-center space-x-3 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02]"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo last action"
              data-testid="button-undo"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              <span>Undo</span>
            </Button>
            <Button 
              variant="secondary"
              size="default"
              className="w-full flex items-center justify-center space-x-3 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02]"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo last action"
              data-testid="button-redo"
            >
              <Redo2 className="h-4 w-4" aria-hidden="true" />
              <span>Redo</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size="default"
                  className="w-full flex items-center justify-center space-x-3 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.02]"
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