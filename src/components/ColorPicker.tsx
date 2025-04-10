
import React from 'react';
import { Check } from 'lucide-react';

const colors = [
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#0EA5E9', // Blue
  '#10B981', // Green
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Yellow
  '#6366F1', // Indigo
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <div
          key={color}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        >
          {color === selectedColor && (
            <Check className="text-white" size={16} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;
