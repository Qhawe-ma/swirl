import * as React from "react";
import { ChromePicker, ColorResult } from 'react-color';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Check, X, Copy } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPicker({ color, onChange, open, onOpenChange }: ColorPickerProps) {
  const [tempColor, setTempColor] = React.useState(color);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setTempColor(color);
  }, [color, open]);

  const handleColorChange = (colorResult: ColorResult) => {
    setTempColor(colorResult.hex);
  };

  const handleApply = () => {
    onChange(tempColor);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempColor(color);
    onOpenChange(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tempColor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#F8B500', '#7B68EE', '#FF6B9D', '#20BF6B', '#FA8072'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl" data-testid="dialog-color-picker">
        {/* Professional Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-50/90 via-white/95 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-slate-800/90 border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 -mx-6 -mt-6 mb-6 backdrop-blur-xl">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Color Selector</h3>
              <DialogDescription className="text-sm text-muted-foreground font-medium">Choose the perfect color for your artwork</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Color Picker */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10">
              <ChromePicker 
                color={tempColor} 
                onChange={handleColorChange}
                disableAlpha
                data-testid="chrome-color-picker"
              />
            </div>
          </div>
          
          {/* Color Input and Preview */}
          <div className="bg-gradient-to-br from-slate-50/40 via-white/20 to-slate-100/30 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/30 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Color Value</label>
                <Input 
                  type="text" 
                  value={tempColor} 
                  onChange={(e) => setTempColor(e.target.value)}
                  className="font-mono text-sm bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600"
                  data-testid="input-color-value"
                  placeholder="#000000"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</label>
                <div 
                  className="w-16 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-md ring-1 ring-slate-900/10 dark:ring-white/10" 
                  style={{ backgroundColor: tempColor }}
                  data-testid="preview-selected-color"
                />
              </div>
              <div className="flex flex-col items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 w-8 p-0 mt-6"
                  title="Copy color code"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Quick Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setTempColor(preset)}
                  className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 shadow-sm hover:shadow-md ring-1 ring-slate-900/10 dark:ring-white/10 hover:scale-105"
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600" 
              onClick={handleCancel}
              data-testid="button-cancel-color"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg" 
              onClick={handleApply}
              data-testid="button-apply-color"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Color
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
