/**
 * Typed feature flags system
 */
import { storage } from './storage';
import { z } from 'zod';

const FlagsSchema = z.object({
  celebrationGifs: z.boolean().default(true),
  toolbarHydration: z.boolean().default(true),
  weeklyPetCollection: z.boolean().default(false),
  pinWordBadge: z.boolean().default(true),
  bodyDoublePresets: z.boolean().default(false),
  debugMode: z.boolean().default(false),
  enhancedAccessibility: z.boolean().default(true),
  autoSaveSettings: z.boolean().default(true),
  experimentalFeatures: z.boolean().default(false),
});

export type FeatureFlags = z.infer<typeof FlagsSchema>;

class FeatureFlagManager {
  private flags: FeatureFlags;
  private readonly storageKey = 'fm_feature_flags_v1';

  constructor() {
    this.flags = this.loadFlags();
  }

  private loadFlags(): FeatureFlags {
    return storage.getItem(
      this.storageKey,
      FlagsSchema,
      FlagsSchema.parse({}) // Uses all defaults
    );
  }

  private saveFlags(): void {
    storage.setItem(this.storageKey, this.flags);
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true;
    this.saveFlags();
  }

  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false;
    this.saveFlags();
  }

  toggle(flag: keyof FeatureFlags): boolean {
    this.flags[flag] = !this.flags[flag];
    this.saveFlags();
    return this.flags[flag];
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  setAll(flags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...flags };
    this.saveFlags();
  }

  reset(): void {
    this.flags = FlagsSchema.parse({});
    this.saveFlags();
  }
}

export const featureFlags = new FeatureFlagManager();

// Hook for React components
import { useState, useEffect } from 'react';

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = useState(featureFlags.isEnabled(flag));

  useEffect(() => {
    // In a real app, you might want to listen for flag changes
    // For now, we'll just sync on mount
    setEnabled(featureFlags.isEnabled(flag));
  }, [flag]);

  return enabled;
}