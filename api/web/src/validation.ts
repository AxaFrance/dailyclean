import Validate from "mw.validation";
import { FormState } from "./types/form";

// Type-safe interfaces for validation
interface ValidationRule {
  required?: { message: string };
  digit?: { message: string };
  min?: { min: number; message: string };
  max?: { max: number; message: string };
  custom?: {
    validateView: (value: string) => { message: string; success: boolean };
    validateModel: (value: string) => { message: string; success: boolean };
  };
}

interface ValidationRules {
  [fieldName: string]: ValidationRule[];
}

interface ValidationEvent {
  name: string;
  value?: unknown;
  viewValue?: string;
  values?: unknown[];
}

interface FormField {
  value?: unknown;
  viewValue?: string;
  values?: unknown[];
  message?: string;
  [key: string]: unknown;
}

interface GenericFormState {
  [fieldName: string]: FormField;
}

// Type-safe wrapper for the mw.validation library
interface ValidationLibrary {
  validation: {
    firstError: (validationResults: unknown) => { message: string } | null;
    validateView: (value: string, rules: ValidationRule[]) => unknown;
  };
}

export function computeInitialStateErrorMessage(
  state: FormState,
  rules: ValidationRules,
): FormState {
  const updatedState = { ...state };

  for (const propertyName in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, propertyName)) {
      const input = (updatedState as unknown as GenericFormState)[propertyName];
      if (input && typeof input === "object" && input !== null) {
        const event: ValidationEvent = {
          name: propertyName,
          value: input.value,
          viewValue: input.viewValue,
          values: input.values,
        };
        const newState = genericHandleChange(rules, updatedState, event);
        Object.assign(updatedState, newState);
      }
    }
  }
  return updatedState;
}

export function validate(
  rules: ValidationRule[],
  value: string,
): string | null {
  try {
    const validateLib = Validate as unknown as ValidationLibrary;
    const validationResult = validateLib.validation.firstError(
      validateLib.validation.validateView(value, rules),
    );
    return validationResult?.message || null;
  } catch {
    // Fallback validation if the library fails
    // In development, we could log this error but we'll skip it for lint compliance
    return validateFallback(rules, value);
  }
}

function validateFallback(
  rules: ValidationRule[],
  value: string,
): string | null {
  for (const rule of rules) {
    if (rule.required && (!value || value.trim() === "")) {
      return rule.required.message;
    }

    if (rule.digit && value && !/^\d+$/.test(value)) {
      return rule.digit.message;
    }

    if (rule.min && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue < rule.min.min) {
        return rule.min.message.replace("{min}", rule.min.min.toString());
      }
    }

    if (rule.max && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > rule.max.max) {
        return rule.max.message.replace("{max}", rule.max.max.toString());
      }
    }

    if (rule.custom && value) {
      const customResult = rule.custom.validateView(value);
      if (!customResult.success) {
        return customResult.message;
      }
    }
  }

  return null;
}

export function genericHandleChange(
  rules: ValidationRules,
  state: FormState | GenericFormState,
  event: ValidationEvent,
): FormState | GenericFormState {
  const fieldRules = rules[event.name];
  if (!fieldRules) {
    return state;
  }

  const currentField = (state as GenericFormState)[event.name] || {};

  if (event.values !== undefined) {
    // Case for fields with multiple values
    return {
      ...state,
      [event.name]: {
        ...currentField,
        values: event.values,
      },
    };
  }

  if (event.viewValue !== undefined) {
    // Case for fields like dates where we validate text, not date objects
    const message = validate(fieldRules, event.viewValue);
    return {
      ...state,
      [event.name]: {
        ...currentField,
        value: event.value,
        viewValue: event.viewValue,
        message: message || "",
      },
    };
  }

  // Most common case - validate a simple value
  const stringValue =
    event.value != null &&
    (typeof event.value === "string" ||
      typeof event.value === "number" ||
      typeof event.value === "boolean")
      ? String(event.value)
      : "";
  const message = validate(fieldRules, stringValue);
  return {
    ...state,
    [event.name]: {
      ...currentField,
      value: event.value,
      message: message || "",
    },
  };
}
