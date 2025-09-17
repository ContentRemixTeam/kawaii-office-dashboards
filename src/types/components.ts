/**
 * Comprehensive Component Props Interfaces
 * Production-ready TypeScript interfaces for all components
 */

import { ReactNode, MouseEvent, KeyboardEvent, ChangeEvent } from 'react';
import { LucideIcon } from 'lucide-react';
import { VariantProps } from 'class-variance-authority';

// ===== BASE COMPONENT INTERFACES =====

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
}

// ===== CARD COMPONENT INTERFACES =====

export interface CardVariants {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface StandardCardProps extends BaseComponentProps, CardVariants {
  loading?: boolean;
  error?: boolean | string;
  onRetry?: () => void;
  errorBoundary?: boolean;
  featureName?: string;
  minHeight?: string;
  maxHeight?: string;
  scrollable?: boolean;
}

export interface CardHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
  compact?: boolean;
}

export interface CardContentProps extends BaseComponentProps {
  scrollable?: boolean;
  maxHeight?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps extends BaseComponentProps {
  justify?: 'start' | 'center' | 'end' | 'between';
  align?: 'start' | 'center' | 'end';
}

// ===== LAYOUT COMPONENT INTERFACES =====

export interface LayoutProps extends BaseComponentProps {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  errorBoundary?: boolean;
}

export interface GridProps extends BaseComponentProps {
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
  minItemWidth?: string;
  autoFit?: boolean;
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// ===== FORM COMPONENT INTERFACES =====

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  maxLength?: number;
}

export interface TextareaProps extends FormFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  maxLength?: number;
}

export interface SelectProps extends FormFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  searchable?: boolean;
}

// ===== BUTTON COMPONENT INTERFACES =====

export interface ButtonProps extends InteractiveComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

// ===== NAVIGATION INTERFACES =====

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  emoji?: string;
  disabled?: boolean;
  badge?: string | number;
  external?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  title: string;
  emoji?: string;
  icon?: LucideIcon;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  sections: NavSection[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'tabs';
  size?: 'sm' | 'md' | 'lg';
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}

// ===== DATA INTERFACES =====

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TasksData {
  tasks: string[];
  reflections: string[];
  completed: boolean[];
  selectedAnimal: string;
  roundsCompleted: number;
  totalTasksCompleted: number;
}

export interface PetData {
  animal: string | null;
  stage: number;
  health: number;
  happiness: number;
  lastFed?: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'excited';
}


// Task and productivity types
export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface VisionBoardItem {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  tags?: string[];
  createdAt: string;
}

// ===== MODAL AND DIALOG INTERFACES =====

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface AlertDialogProps extends ModalProps {
  variant?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

// ===== ERROR HANDLING INTERFACES =====

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  timestamp: number;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  retry: () => void;
  resetErrorBoundary?: () => void;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  showDetails?: boolean;
}

// ===== TIMER AND PROGRESS INTERFACES =====

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  phase: 'idle' | 'focus' | 'break' | 'longBreak';
  timeRemaining: number;
  totalTime: number;
  sessionCount: number;
  completedSessions: number;
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

// ===== THEME AND STYLING INTERFACES =====

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontFamily?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  reducedMotion?: boolean;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  destructive: string;
  success: string;
  warning: string;
}

// ===== ANIMATION INTERFACES =====

export interface AnimationProps {
  type?: 'fade' | 'slide' | 'scale' | 'bounce' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  repeat?: boolean;
  trigger?: 'hover' | 'focus' | 'visible' | 'immediate';
}

// ===== ACCESSIBILITY INTERFACES =====

export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  role?: string;
  tabIndex?: number;
}

// ===== API AND ASYNC INTERFACES =====

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== UTILITY TYPES =====

export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ValueOf<T> = T[keyof T];
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== COMPONENT REF INTERFACES =====

export interface ComponentRefs {
  root?: HTMLDivElement;
  content?: HTMLDivElement;
  header?: HTMLElement;
  footer?: HTMLElement;
}

// ===== EVENT INTERFACES =====

export interface CustomEventData<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
}

// ===== VALIDATION INTERFACES =====

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export all interfaces for easy importing
export type {
  // Re-export commonly used types
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  ChangeEvent,
  LucideIcon,
  VariantProps,
};