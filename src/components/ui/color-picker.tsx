import React from 'react';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#374151', // Dark Gray
];

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border border-input cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              onChange(target.value);
            };
            input.click();
          }}
        />
        <span className="text-sm font-mono">{value}</span>
      </div>
      
      <div className="grid grid-cols-9 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded border border-input hover:scale-110 transition-transform ${
              value === color ? 'ring-2 ring-ring ring-offset-1' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
