import { useState, useCallback, useMemo } from 'react';
import { validateForm, ValidationRule, ValidationResult } from '@/utils/validationUtils';

export interface FormData {
  [key: string]: any;
}

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFormValidation<T extends FormData>(
  initialData: T,
  rules: ValidationRule<T>[],
  options: FormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [warnings, setWarnings] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    const fieldRules = rules.filter(rule => rule.field === field);
    const fieldData = { ...formData, [field]: value };

    return validateForm(fieldData, fieldRules);
  }, [formData, rules]);

  const validateAllFields = useCallback((): ValidationResult => {
    return validateForm(formData, rules);
  }, [formData, rules]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      const result = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: result.errors[0] || '' }));
      setWarnings(prev => ({ ...prev, [field]: result.warnings[0] || '' }));
    }
  }, [validateField, validateOnChange]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      const result = validateField(field, formData[field]);
      setErrors(prev => ({ ...prev, [field]: result.errors[0] || '' }));
      setWarnings(prev => ({ ...prev, [field]: result.warnings[0] || '' }));
    }
  }, [validateField, validateOnBlur, formData, validateOnBlur]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({} as Record<keyof T, string>);
    setWarnings({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialData]);

  const setFormDataWithValidation = useCallback((data: T) => {
    setFormData(data);

    if (validateOnChange) {
      validateForm(data, rules);
      const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
      const newWarnings: Record<keyof T, string> = {} as Record<keyof T, string>;

      rules.forEach(rule => {
        const fieldResult = validateField(rule.field, data[rule.field]);
        if (fieldResult.errors.length > 0) {
          newErrors[rule.field] = fieldResult.errors[0];
        }
        if (fieldResult.warnings.length > 0) {
          newWarnings[rule.field] = fieldResult.warnings[0];
        }
      });

      setErrors(newErrors);
      setWarnings(newWarnings);
    }
  }, [validateOnChange, rules, validateField]);

  const getFieldError = useCallback((field: keyof T): string => {
    return errors[field] || '';
  }, [errors]);

  const getFieldWarning = useCallback((field: keyof T): string => {
    return warnings[field] || '';
  }, [warnings]);

  const isFieldTouched = useCallback((field: keyof T): boolean => {
    return touched[field] || false;
  }, [touched]);

  const isFieldValid = useCallback((field: keyof T): boolean => {
    return !errors[field];
  }, [errors]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== '');
  }, [errors]);

  const hasWarnings = useMemo(() => {
    return Object.values(warnings).some(warning => warning !== '');
  }, [warnings]);

  const isFormValid = useMemo(() => {
    const result = validateAllFields();
    return result.isValid;
  }, [validateAllFields]);

  const getFormErrors = useCallback((): string[] => {
    return Object.values(errors).filter(error => error !== '');
  }, [errors]);

  const getFormWarnings = useCallback((): string[] => {
    return Object.values(warnings).filter(warning => warning !== '');
  }, [warnings]);

  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: formData[field],
      onChange: (value: any) => updateField(field, value),
      onBlur: () => setFieldTouched(field),
      error: getFieldError(field),
      warning: getFieldWarning(field),
      touched: isFieldTouched(field),
      valid: isFieldValid(field)
    };
  }, [formData, updateField, setFieldTouched, getFieldError, getFieldWarning, isFieldTouched, isFieldValid]);

  const submitForm = useCallback(async (onSubmit: (data: T) => Promise<void> | void) => {
    setIsValidating(true);

    try {
      const result = validateAllFields();
      if (!result.isValid) {
        // Set all fields as touched to show errors
        const allTouched = {} as Record<keyof T, boolean>;
        rules.forEach(rule => {
          allTouched[rule.field] = true;
        });
        setTouched(allTouched);

        // Set errors for all fields
        const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
        rules.forEach(rule => {
          const fieldResult = validateField(rule.field, formData[rule.field]);
          if (fieldResult.errors.length > 0) {
            newErrors[rule.field] = fieldResult.errors[0];
          }
        });
        setErrors(newErrors);

        return;
      }

      await onSubmit(formData);
    } finally {
      setIsValidating(false);
    }
  }, [validateAllFields, rules, validateField, formData]);

  return {
    formData,
    errors,
    warnings,
    touched,
    isValidating,
    hasErrors,
    hasWarnings,
    isFormValid,
    updateField,
    setFieldTouched,
    resetForm,
    setFormData: setFormDataWithValidation,
    getFieldError,
    getFieldWarning,
    isFieldTouched,
    isFieldValid,
    getFormErrors,
    getFormWarnings,
    getFieldProps,
    submitForm,
    validateField,
    validateAllFields
  };
}
