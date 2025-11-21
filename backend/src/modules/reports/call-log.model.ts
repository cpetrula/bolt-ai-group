import { CallReason } from '@prisma/client';

/**
 * Call log types and interfaces
 */

export interface CallLogReport {
  totalCalls: number;
  callsByReason: {
    reason: CallReason;
    count: number;
  }[];
}

export interface CallLogFilters {
  startDate?: string;
  endDate?: string;
}
