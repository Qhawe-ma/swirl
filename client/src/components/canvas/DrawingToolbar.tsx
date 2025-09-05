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
    <div className="bg-card/90 backdrop-blur-2xl border border-border/30 h-64 lg:h-full overflow-y-auto rounded-2xl shadow-2xl" data-testid="toolbar-drawing-tools">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border-b border-border/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center tracking-wide">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <span>Creative Tools</span>
          </h2>
          <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full tracking-wide">
            Pro
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Professional Drawing Mode Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="drawing-mode" className="text-xs font-semibold text-foreground uppercase tracking-wider">Drawing Mode</label>
            <div className="text-xs text-muted-foreground font-medium">{drawingMode === 'brush' ? 'Paint' : 'Erase'}</div>
          </div>
          <div className="bg-muted/20 rounded-xl p-3 border border-border/20">
            <ToggleGroup
              type="single"
              value={drawingMode}
              onValueChange={(value) => value && onModeChange(value as 'brush' | 'eraser')}
              className="grid grid-cols-1 gap-2"
              aria-label="Drawing mode selection"
              data-testid="toggle-group-drawing-mode"
            >
              <ToggleGroupItem
                value="brush"
                className="w-full flex items-center justify-start space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.01] data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:to-primary/90 data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg rounded-lg"
                aria-label="Select brush tool"
                data-testid="button-select-brush"
              >
                <div className="w-8 h-8 bg-primary/10 data-[state=on]:bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <Brush className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Brush Tool</span>
                  <span className="text-xs opacity-80">Paint & draw</span>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="eraser"
                className="w-full flex items-center justify-start space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.01] data-[state=on]:bg-gradient-to-r data-[state=on]:from-primary data-[state=on]:to-primary/90 data-[state=on]:text-primary-foreground data-[state=on]:shadow-lg rounded-lg"
                aria-label="Select eraser tool"
                data-testid="button-select-eraser"
              >
                <div className="w-8 h-8 bg-primary/10 data-[state=on]:bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Eraser Tool</span>
                  <span className="text-xs opacity-80">Remove & clean</span>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Professional Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="color-selection" className="text-xs font-semibold text-foreground uppercase tracking-wider">Color Palette</label>
            <div className="text-xs text-muted-foreground font-medium">8 presets</div>
          </div>
          <div className="bg-muted/20 rounded-xl p-4 space-y-4 border border-border/20">
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

        {/* Professional Brush Size Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="brush-size" className="text-xs font-semibold text-foreground uppercase tracking-wider">Brush Size</label>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-primary" data-testid="text-brush-size">{brushSize}px</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl p-4 space-y-4 border border-border/20">
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

        {/* Professional Action Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick Actions</label>
            <div className="text-xs text-muted-foreground font-medium">3 tools</div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary"
                size="default"
                className="flex items-center justify-center space-x-2 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.01] disabled:opacity-40"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo last action"
                data-testid="button-undo"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Undo</span>
              </Button>
              <Button 
                variant="secondary"
                size="default"
                className="flex items-center justify-center space-x-2 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.01] disabled:opacity-40"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo last action"
                data-testid="button-redo"
              >
                <Redo2 className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Redo</span>
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size="default"
                  className="w-full flex items-center justify-center space-x-2 transition-all duration-200 motion-reduce:transition-none motion-safe:hover:scale-[1.01] mt-2"
                  aria-label="Clear entire canvas"
                  data-testid="button-clear-canvas"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Clear Canvas</span>
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