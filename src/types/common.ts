/**
 * Common TypeScript interfaces and types
 * Centralized type definitions for component props and data structures
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Card component props
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  error?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export interface CardHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export interface CardContentProps extends BaseComponentProps {
  scrollable?: boolean;
  maxHeight?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  emoji: string;
  icon?: LucideIcon;
  disabled?: boolean;
  badge?: string | number;
}

export interface NavSection {
  title: string;
  emoji: string;
  items: NavItem[];
}

// Dashboard types
export interface DashboardCardData {
  id: string;
  title: string;
  icon?: LucideIcon;
  emoji?: string;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date;
}

export interface TaskData {
  tasks: string[];
  completed: boolean[];
  selectedAnimal: string;
}

export interface PetData {
  animal: string | null;
  stage: number;
  health?: number;
  happiness?: number;
}

// Error handling types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  retry: () => void;
  resetErrorBoundary?: () => void;
}

// Theme and styling types
export type ThemeVariant = 'kawaii' | 'minimal' | 'professional' | 'dark';
export type ColorScheme = 'light' | 'dark' | 'auto';

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

// Layout types
export interface LayoutProps extends BaseComponentProps {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Storage types
export interface StorageData {
  [key: string]: any;
}

// Event types
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}