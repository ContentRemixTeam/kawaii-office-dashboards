/**
 * Date utilities for daily-locked data and time operations
 */

export class DateUtils {
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  static yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  static daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  static isToday(dateISO: string): boolean {
    return dateISO === this.today();
  }

  static isYesterday(dateISO: string): boolean {
    return dateISO === this.yesterday();
  }

  static daysBetween(startISO: string, endISO: string): number {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static formatRelative(dateISO: string): string {
    if (this.isToday(dateISO)) return 'today';
    if (this.isYesterday(dateISO)) return 'yesterday';
    
    const days = this.daysBetween(dateISO, this.today());
    if (days <= 7) return `${days} days ago`;
    if (days <= 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days <= 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  static getWeekStart(dateISO?: string): string {
    const date = dateISO ? new Date(dateISO) : new Date();
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  static getWeekDates(startISO?: string): string[] {
    const start = startISO ? new Date(startISO) : new Date(this.getWeekStart());
    const dates: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  static isSameWeek(date1ISO: string, date2ISO: string): boolean {
    const week1Start = this.getWeekStart(date1ISO);
    const week2Start = this.getWeekStart(date2ISO);
    return week1Start === week2Start;
  }

  static getCurrentHour(): number {
    return new Date().getHours();
  }

  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = this.getCurrentHour();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
}

export const dateUtils = DateUtils;