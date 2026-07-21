import type { Customer, CustomerEvent } from './customer'

export type SourceId = 'accounts' | 'usage' | 'billing' | 'support' | 'feedback'
export type SourceStatus = 'Not loaded' | 'Ready' | 'Has issues'
export interface SourceIssue { row: number; message: string }
export interface SourceImport {
  id: SourceId
  fileName: string
  status: SourceStatus
  rowsDetected: number
  validRows: number
  invalidRows: number
  duplicates: number
  importedAt: string
  records: Record<string, string | number>[]
  issues: SourceIssue[]
}
export interface MergeSummary {
  customers: Customer[]
  events: CustomerEvent[]
  matchedCustomers: number
  unmatchedRecords: number
  duplicateCustomerIds: number
  missingRequiredSources: SourceId[]
  missingOptionalSources: SourceId[]
  completenessPct: number
  invalidDates: number
  invalidNumericRanges: number
  finalCustomerCount: number
}
