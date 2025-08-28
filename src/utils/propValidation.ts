/**
 * Validation and Default Props System
 * Centralized prop validation and default values for all components
 */

import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

// ===== VALIDATION SCHEMAS =====

export const ValidationSchemas = {
  // Basic prop schemas
  className: z.string().optional(),
  children: z.any().optional(),
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false),
  
  // Size variants
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  
  // Component variants
  cardVariant: z.enum(['default', 'elevated', 'glass', 'interactive']).default('default'),
  buttonVariant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).default('default'),
  
  // Layout props
  spacing: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  padding: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  
  // Interactive props
  onClick: z.function().optional(),
  onKeyDown: z.function().optional(),
  
  // Accessibility props
  ariaLabel: z.string().optional(),
  ariaDescribedBy: z.string().optional(),
  role: z.string().optional(),
  tabIndex: z.number().optional(),
  
  // Error handling
  error: z.union([z.boolean(), z.string()]).default(false),
  onRetry: z.function().optional(),
  
  // Navigation props
  href: z.string().optional(),
  external: z.boolean().default(false),
  
  // Form props
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  defaultValue: z.string().optional(),
};

// ===== DEFAULT VALUES =====

export const DefaultProps = {
  // Base component defaults
  base: {
    className: '',
    disabled: false,
    loading: false,
  },

  // Card defaults
  card: {
    variant: 'default' as const,
    size: 'md' as const,
    padding: 'md' as const,
    errorBoundary: true,
    scrollable: false,
  },

  // Button defaults
  button: {
    variant: 'default' as const,
    size: 'md' as const,
    type: 'button' as const,
    disabled: false,
    loading: false,
    fullWidth: false,
  },

  // Layout defaults
  layout: {
    maxWidth: 'xl' as const,
    spacing: 'md' as const,
    errorBoundary: true,
  },

  // Grid defaults
  grid: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 2,
    },
    gap: 'md' as const,
    autoFit: false,
  },

  // Form field defaults
  formField: {
    required: false,
    disabled: false,
    error: '',
    helperText: '',
  },

  // Input defaults
  input: {
    type: 'text' as const,
    autoComplete: 'off',
    autoFocus: false,
    readOnly: false,
  },

  // Navigation defaults
  navigation: {
    orientation: 'horizontal' as const,
    variant: 'default' as const,
    size: 'md' as const,
  },

  // Modal defaults
  modal: {
    size: 'md' as const,
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEscape: true,
  },

  // Error boundary defaults
  errorBoundary: {
    isolate: false,
    showDetails: false,
  },

  // Animation defaults
  animation: {
    type: 'fade' as const,
    direction: 'in' as const,
    duration: 'normal' as const,
    delay: 0,
    repeat: false,
    trigger: 'immediate' as const,
  },
} as const;

// ===== VALIDATION FUNCTIONS =====

export function validateProps<T extends Record<string, any>>(
  props: T,
  schema: z.ZodSchema,
  componentName: string
): T {
  try {
    return schema.parse(props) as T;
  } catch (error) {
    console.warn(`Invalid props for ${componentName}:`, error);
    // Return props with defaults applied where possible
    const result = schema.safeParse(props);
    return (result.success ? result.data : props) as T;
  }
}

export function withDefaults<T extends Record<string, any>>(
  props: T,
  defaults: Partial<T>
): T {
  return { ...defaults, ...props };
}

// ===== PROP VALIDATORS =====

export const PropValidators = {
  // Validate icon prop
  icon: (icon: any): icon is LucideIcon => {
    return typeof icon === 'function' || typeof icon === 'object';
  },

  // Validate color prop
  color: (color: string): boolean => {
    const colorRegex = /^(#[0-9A-F]{6}|#[0-9A-F]{3}|rgb\(|rgba\(|hsl\(|hsla\()/i;
    return colorRegex.test(color) || CSS.supports('color', color);
  },

  // Validate URL prop
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validate email prop
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate required prop
  required: (value: any, isRequired: boolean): boolean => {
    if (!isRequired) return true;
    
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return value !== null;
    
    return value !== undefined && value !== null;
  },
};

// ===== COMPONENT PROP SCHEMAS =====

export const ComponentSchemas = {
  Card: z.object({
    ...ValidationSchemas,
    variant: ValidationSchemas.cardVariant,
    featureName: z.string().default('Card'),
    errorBoundary: z.boolean().default(true),
    minHeight: z.string().optional(),
    maxHeight: z.string().optional(),
    scrollable: z.boolean().default(false),
  }),

  Button: z.object({
    ...ValidationSchemas,
    variant: ValidationSchemas.buttonVariant,
    type: z.enum(['button', 'submit', 'reset']).default('button'),
    fullWidth: z.boolean().default(false),
    icon: z.any().optional(),
    iconPosition: z.enum(['left', 'right']).default('left'),
  }),

  Input: z.object({
    ...ValidationSchemas,
    type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'search']).default('text'),
    autoComplete: z.string().default('off'),
    autoFocus: z.boolean().default(false),
    readOnly: z.boolean().default(false),
    pattern: z.string().optional(),
    maxLength: z.number().optional(),
  }),

  Modal: z.object({
    ...ValidationSchemas,
    open: z.boolean(),
    onOpenChange: z.function(),
    title: z.string().optional(),
    description: z.string().optional(),
    showCloseButton: z.boolean().default(true),
    closeOnOverlayClick: z.boolean().default(true),
    closeOnEscape: z.boolean().default(true),
  }),
};

// ===== HELPER FUNCTIONS =====

export function createDefaultProps<T extends keyof typeof DefaultProps>(
  componentType: T
): (typeof DefaultProps)[T] {
  return { ...DefaultProps[componentType] };
}

export function mergeProps<T extends Record<string, any>>(
  defaultProps: T,
  userProps: Partial<T>
): T {
  return { ...defaultProps, ...userProps };
}

export function sanitizeProps<T extends Record<string, any>>(
  props: T,
  allowedKeys: (keyof T)[]
): Pick<T, typeof allowedKeys[number]> {
  const sanitized = {} as Pick<T, typeof allowedKeys[number]>;
  
  allowedKeys.forEach(key => {
    if (key in props) {
      sanitized[key] = props[key];
    }
  });
  
  return sanitized;
}

// ===== EXPORTS =====

export type PropValidator<T = any> = (value: T) => boolean;
export type SchemaValidator<T = any> = z.ZodSchema<T>;

export {
  z as zodValidator,
  type ZodSchema,
} from 'zod';