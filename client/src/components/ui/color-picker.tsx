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
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-2xl p-0" data-testid="dialog-color-picker">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-slate-50/95 via-white/98 to-slate-50/95 dark:from-slate-800/95 dark:via-slate-900/98 dark:to-slate-800/95 border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-lg font-bold">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900 dark:text-white">Choose Color</span>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Modern Content */}
        <div className="p-6 space-y-6">
          {/* Color Picker */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3">
            <ChromePicker 
              color={tempColor} 
              onChange={handleColorChange}
              disableAlpha
              data-testid="chrome-color-picker"
            />
          </div>
          
          {/* Color Input & Preview */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">Color Code</label>
            <div className="flex items-center space-x-3">
              <Input 
                type="text" 
                value={tempColor} 
                onChange={(e) => setTempColor(e.target.value)}
                className="flex-1 font-mono text-sm h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-900 rounded-lg transition-all duration-200"
                data-testid="input-color-value"
              />
              <div 
                className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md" 
                style={{ backgroundColor: tempColor }}
                data-testid="preview-selected-color"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-12 px-3 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                data-testid="button-copy-color"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Color Presets */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">Quick Colors</label>
            <div className="grid grid-cols-5 gap-3">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTempColor(color)}
                  className={`w-full h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    tempColor === color ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                  data-testid={`preset-color-${color.replace('#', '')}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Modern Footer */}
        <div className="bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-slate-800/80 border-t border-slate-200/60 dark:border-slate-700/60 px-6 py-4 rounded-b-2xl">
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1 h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold transition-all duration-200" 
              onClick={handleCancel}
              data-testid="button-cancel-color"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition-all duration-200" 
              onClick={handleApply}
              data-testid="button-apply-color"
            >
              Apply Color
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
