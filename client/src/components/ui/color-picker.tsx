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
      <DialogContent className="max-w-sm p-6" data-testid="dialog-color-picker">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base">
            <Palette className="w-4 h-4" />
            <span>Choose Color</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ChromePicker 
            color={tempColor} 
            onChange={handleColorChange}
            disableAlpha
            data-testid="chrome-color-picker"
          />
          
          <div className="flex items-center space-x-3">
            <Input 
              type="text" 
              value={tempColor} 
              onChange={(e) => setTempColor(e.target.value)}
              className="flex-1 font-mono text-sm"
              data-testid="input-color-value"
            />
            <div 
              className="w-10 h-10 rounded border-2 border-border" 
              style={{ backgroundColor: tempColor }}
              data-testid="preview-selected-color"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleCancel}
              data-testid="button-cancel-color"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleApply}
              data-testid="button-apply-color"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
