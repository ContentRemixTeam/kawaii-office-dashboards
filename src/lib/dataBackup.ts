/**
 * Data backup and versioning system for user data protection
 */

import { errorHandler } from './errorHandler';
import { dataValidator } from './dataValidator';

export interface BackupMetadata {
  version: string;
  timestamp: number;
  checksum: string;
  dataKeys: string[];
  userAgent: string;
  url: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any>;
}

class DataBackup {
  private readonly BACKUP_PREFIX = 'fm_backup_';
  private readonly METADATA_KEY = 'fm_backup_metadata';
  private readonly MAX_BACKUPS = 5;
  private readonly CURRENT_VERSION = '1.0.0';

  /**
   * Create a complete backup of all app data
   */
  createBackup(): string | null {
    try {
      const appDataKeys = this.getAppDataKeys();
      const backupData: Record<string, any> = {};
      const timestamp = Date.now();

      // Collect all app data
      appDataKeys.forEach(key => {
        try {
          const data = errorHandler.safeLocalStorage.getItem(key);
          if (data !== null) {
            backupData[key] = data;
          }
        } catch (error) {
          errorHandler.logError(
            error as Error,
            'medium',
            'storage',
            { key, operation: 'backup_collection' }
          );
        }
      });

      // Create metadata
      const metadata: BackupMetadata = {
        version: this.CURRENT_VERSION,
        timestamp,
        checksum: this.generateChecksum(backupData),
        dataKeys: Object.keys(backupData),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const backup: BackupData = {
        metadata,
        data: backupData
      };

      // Store backup
      const backupKey = `${this.BACKUP_PREFIX}${timestamp}`;
      const success = errorHandler.safeLocalStorage.setItem(backupKey, backup);

      if (success) {
        this.updateBackupMetadata(backupKey, metadata);
        this.cleanupOldBackups();
        
        errorHandler.logError(
          new Error('Backup created successfully'),
          'low',
          'storage',
          { backupKey, dataKeys: metadata.dataKeys.length }
        );

        return backupKey;
      }

      return null;
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'storage',
        { operation: 'create_backup' },
        'Failed to create data backup'
      );
      return null;
    }
  }

  /**
   * Restore data from a backup
   */
  restoreBackup(backupKey: string): boolean {
    try {
      const backup = errorHandler.safeLocalStorage.getItem(backupKey) as BackupData;
      
      if (!backup || !backup.metadata || !backup.data) {
        throw new Error('Invalid backup data structure');
      }

      // Verify backup integrity
      const expectedChecksum = this.generateChecksum(backup.data);
      if (backup.metadata.checksum !== expectedChecksum) {
        throw new Error('Backup data integrity check failed');
      }

      // Create a backup of current state before restoring
      const currentBackupKey = this.createBackup();
      if (!currentBackupKey) {
        throw new Error('Failed to create safety backup before restore');
      }

      // Restore each data item with validation
      let restoredCount = 0;
      let failedCount = 0;

      Object.entries(backup.data).forEach(([key, value]) => {
        try {
          // Validate data before restoring
          const validation = dataValidator.validateAndSanitize(key, value);
          
          if (validation.isValid && validation.sanitizedData) {
            const success = errorHandler.safeLocalStorage.setItem(key, validation.sanitizedData);
            if (success) {
              restoredCount++;
            } else {
              failedCount++;
            }
          } else {
            failedCount++;
            errorHandler.logError(
              new Error(`Validation failed for ${key}: ${validation.errors.join(', ')}`),
              'medium',
              'validation',
              { key, operation: 'backup_restore' }
            );
          }
        } catch (error) {
          failedCount++;
          errorHandler.logError(
            error as Error,
            'medium',
            'storage',
            { key, operation: 'restore_item' }
          );
        }
      });

      errorHandler.logError(
        new Error(`Backup restored: ${restoredCount} items restored, ${failedCount} failed`),
        failedCount > 0 ? 'medium' : 'low',
        'storage',
        { backupKey, restoredCount, failedCount }
      );

      return failedCount === 0;
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'storage',
        { backupKey, operation: 'restore_backup' },
        'Failed to restore backup'
      );
      return false;
    }
  }

  /**
   * Get list of available backups
   */
  getAvailableBackups(): Array<{ key: string; metadata: BackupMetadata }> {
    try {
      const backups: Array<{ key: string; metadata: BackupMetadata }> = [];
      
      // Get all backup keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.BACKUP_PREFIX)) {
          try {
            const backup = errorHandler.safeLocalStorage.getItem(key) as BackupData;
            if (backup && backup.metadata) {
              backups.push({
                key,
                metadata: backup.metadata
              });
            }
          } catch (error) {
            // Skip invalid backups
            continue;
          }
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'storage',
        { operation: 'get_available_backups' }
      );
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  deleteBackup(backupKey: string): boolean {
    try {
      const success = errorHandler.safeLocalStorage.removeItem(backupKey);
      if (success) {
        this.removeFromBackupMetadata(backupKey);
      }
      return success;
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'storage',
        { backupKey, operation: 'delete_backup' }
      );
      return false;
    }
  }

  /**
   * Export backup data as downloadable file
   */
  exportBackup(backupKey?: string): void {
    try {
      let exportData: BackupData;

      if (backupKey) {
        // Export specific backup
        exportData = errorHandler.safeLocalStorage.getItem(backupKey) as BackupData;
        if (!exportData) {
          throw new Error('Backup not found');
        }
      } else {
        // Create and export current state
        const currentBackupKey = this.createBackup();
        if (!currentBackupKey) {
          throw new Error('Failed to create backup for export');
        }
        exportData = errorHandler.safeLocalStorage.getItem(currentBackupKey) as BackupData;
      }

      // Create downloadable file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `workfromfun-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      errorHandler.logError(
        new Error('Backup exported successfully'),
        'low',
        'storage',
        { operation: 'export_backup' }
      );
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'storage',
        { backupKey, operation: 'export_backup' },
        'Failed to export backup'
      );
    }
  }

  /**
   * Import backup from uploaded file
   */
  async importBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text) as BackupData;

      if (!importedData.metadata || !importedData.data) {
        throw new Error('Invalid backup file format');
      }

      // Store as new backup
      const timestamp = Date.now();
      const backupKey = `${this.BACKUP_PREFIX}imported_${timestamp}`;
      
      const success = errorHandler.safeLocalStorage.setItem(backupKey, importedData);
      if (success) {
        this.updateBackupMetadata(backupKey, importedData.metadata);
        
        errorHandler.logError(
          new Error('Backup imported successfully'),
          'low',
          'storage',
          { backupKey, operation: 'import_backup' }
        );
      }

      return success;
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'high',
        'storage',
        { fileName: file.name, operation: 'import_backup' },
        'Failed to import backup file'
      );
      return false;
    }
  }

  /**
   * Automatic backup creation (should be called periodically)
   */
  createAutomaticBackup(): void {
    try {
      const backups = this.getAvailableBackups();
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);

      // Check if we need a new backup (once per day)
      const recentBackup = backups.find(backup => backup.metadata.timestamp > oneDayAgo);
      
      if (!recentBackup) {
        const backupKey = this.createBackup();
        if (backupKey) {
          errorHandler.logError(
            new Error('Automatic backup created'),
            'low',
            'storage',
            { backupKey, operation: 'automatic_backup' }
          );
        }
      }
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'storage',
        { operation: 'automatic_backup' }
      );
    }
  }

  /**
   * Get app-specific localStorage keys
   */
  private getAppDataKeys(): string[] {
    const appKeys: string[] = [];
    const appPrefixes = ['fm_', 'workfromfun_', 'focus_', 'habit_', 'task_', 'pet_', 'trophy_'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith(this.BACKUP_PREFIX)) {
        // Include keys with app prefixes or known app keys
        if (appPrefixes.some(prefix => key.startsWith(prefix)) || 
            ['theme', 'settings', 'preferences'].some(suffix => key.includes(suffix))) {
          appKeys.push(key);
        }
      }
    }
    
    return appKeys;
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Update backup metadata index
   */
  private updateBackupMetadata(backupKey: string, metadata: BackupMetadata): void {
    try {
      const currentMeta = errorHandler.safeLocalStorage.getItem(this.METADATA_KEY) || [];
      const newMeta = Array.isArray(currentMeta) ? currentMeta : [];
      
      newMeta.push({ key: backupKey, ...metadata });
      errorHandler.safeLocalStorage.setItem(this.METADATA_KEY, newMeta);
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'storage',
        { backupKey, operation: 'update_backup_metadata' }
      );
    }
  }

  /**
   * Remove backup from metadata index
   */
  private removeFromBackupMetadata(backupKey: string): void {
    try {
      const currentMeta = errorHandler.safeLocalStorage.getItem(this.METADATA_KEY) || [];
      const filteredMeta = Array.isArray(currentMeta) 
        ? currentMeta.filter((item: any) => item.key !== backupKey)
        : [];
      
      errorHandler.safeLocalStorage.setItem(this.METADATA_KEY, filteredMeta);
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'low',
        'storage',
        { backupKey, operation: 'remove_backup_metadata' }
      );
    }
  }

  /**
   * Clean up old backups (keep only MAX_BACKUPS)
   */
  private cleanupOldBackups(): void {
    try {
      const backups = this.getAvailableBackups();
      
      if (backups.length > this.MAX_BACKUPS) {
        const backupsToDelete = backups.slice(this.MAX_BACKUPS);
        
        backupsToDelete.forEach(backup => {
          this.deleteBackup(backup.key);
        });
        
        errorHandler.logError(
          new Error(`Cleaned up ${backupsToDelete.length} old backups`),
          'low',
          'storage',
          { operation: 'cleanup_old_backups', deletedCount: backupsToDelete.length }
        );
      }
    } catch (error) {
      errorHandler.logError(
        error as Error,
        'medium',
        'storage',
        { operation: 'cleanup_old_backups' }
      );
    }
  }
}

// Export singleton instance
export const dataBackup = new DataBackup();

// Setup automatic backup (once per day)
if (typeof window !== 'undefined') {
  // Run automatic backup on app load (with delay)
  setTimeout(() => {
    dataBackup.createAutomaticBackup();
  }, 10000); // 10 second delay after app load
  
  // Setup periodic backup check (every hour)
  setInterval(() => {
    dataBackup.createAutomaticBackup();
  }, 60 * 60 * 1000); // 1 hour
}

export default dataBackup;