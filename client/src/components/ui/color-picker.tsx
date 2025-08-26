import * as React from "react";
import { ChromePicker, ColorResult } from 'react-color';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPicker({ color, onChange, open, onOpenChange }: ColorPickerProps) {
  const [tempColor, setTempColor] = React.useState(color);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="dialog-color-picker">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons">palette</span>
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
              className="w-12 h-10 rounded border-2 border-gray-300" 
              style={{ backgroundColor: tempColor }}
              data-testid="preview-selected-color"
            />
          </div>
          
          <div className="flex space-x-3">
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
