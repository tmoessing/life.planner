import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createFormFieldProps, createFormFieldDescription, createFormFieldError } from '@/utils/accessibilityUtils';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  inputClassName?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  description,
  error,
  required = false,
  disabled = false,
  options = [],
  className,
  inputClassName
}: FormFieldProps) {
  const fieldProps = createFormFieldProps(id, label, description, error);
  const descriptionProps = description ? createFormFieldDescription(id, description) : null;
  const errorProps = error ? createFormFieldError(id, error) : null;

  const renderInput = () => {
    const commonProps = {
      ...fieldProps,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(e.target.value),
      placeholder,
      disabled,
      className: cn(
        error && 'border-red-500 focus:border-red-500',
        inputClassName
      )
    };

    switch (type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={4} />;
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn(
              error && 'border-red-500 focus:border-red-500',
              inputClassName
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return <Input {...commonProps} type={type} />;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
        {label}
      </Label>
      
      {renderInput()}
      
      {description && (
        <p {...descriptionProps}>
          {description}
        </p>
      )}
      
      {error && (
        <p {...errorProps} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
