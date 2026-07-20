import type { Customer, CustomerInput, Plan } from '@/types/customer'
import { enrichCustomer } from '@/utils/riskCalculator'

export const CUSTOMER_CSV_HEADERS = [
  'id',
  'companyName',
  'industry',
  'plan',
  'monthlyRevenue',
  'licensedSeats',
  'activeSeats',
  'logins30d',
  'previousLogins30d',
  'featureUsagePct',
  'unresolvedTickets',
  'latePayments90d',
  'satisfactionScore',
  'daysUntilRenewal',
] as const

export interface CsvIssue {
  row: number
  message: string
}

export interface CsvParseResult {
  customers: Customer[]
  issues: CsvIssue[]
  totalRows: number
}

const requiredHeaders = CUSTOMER_CSV_HEADERS.filter((header) => header !== 'id')
const numericFields = [
  'monthlyRevenue',
  'licensedSeats',
  'activeSeats',
  'logins30d',
  'previousLogins30d',
  'featureUsagePct',
  'unresolvedTickets',
  'latePayments90d',
  'satisfactionScore',
  'daysUntilRenewal',
] as const

function splitCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && quoted && nextCharacter === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  values.push(current.trim())
  return values
}

function toNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isPlan(value: string): value is Plan {
  return value === 'Basic' || value === 'Pro' || value === 'Enterprise'
}

export function parseCustomerCsv(csvText: string): CsvParseResult {
  const normalised = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  if (!normalised) {
    return { customers: [], issues: [{ row: 1, message: 'The CSV file is empty.' }], totalRows: 0 }
  }

  const lines = normalised.split('\n').filter((line) => line.trim().length > 0)
  const headers = splitCsvLine(lines[0])
  const issues: CsvIssue[] = []

  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))
  if (missingHeaders.length > 0) {
    return {
      customers: [],
      issues: [{ row: 1, message: `Missing required columns: ${missingHeaders.join(', ')}` }],
      totalRows: Math.max(0, lines.length - 1),
    }
  }

  const customers: Customer[] = []
  const seenIds = new Set<number>()

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rowNumber = lineIndex + 1
    const cells = splitCsvLine(lines[lineIndex])
    const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])) as Record<string, string>

    if (!record.companyName?.trim()) {
      issues.push({ row: rowNumber, message: 'companyName is required.' })
      continue
    }

    if (!record.industry?.trim()) {
      issues.push({ row: rowNumber, message: 'industry is required.' })
      continue
    }

    if (!isPlan(record.plan)) {
      issues.push({ row: rowNumber, message: 'plan must be Basic, Pro, or Enterprise.' })
      continue
    }

    const numbers: Record<string, number> = {}
    let invalidNumber = false
    for (const field of numericFields) {
      const parsed = toNumber(record[field] ?? '')
      if (parsed === null) {
        issues.push({ row: rowNumber, message: `${field} must be a valid number.` })
        invalidNumber = true
        break
      }
      numbers[field] = parsed
    }
    if (invalidNumber) continue

    const suppliedId = toNumber(record.id ?? '')
    let id = suppliedId !== null && suppliedId > 0 ? Math.trunc(suppliedId) : lineIndex
    while (seenIds.has(id)) id += 1
    seenIds.add(id)

    if (numbers.licensedSeats <= 0) {
      issues.push({ row: rowNumber, message: 'licensedSeats must be greater than 0.' })
      continue
    }
    if (numbers.activeSeats < 0 || numbers.activeSeats > numbers.licensedSeats) {
      issues.push({ row: rowNumber, message: 'activeSeats must be between 0 and licensedSeats.' })
      continue
    }
    if (numbers.featureUsagePct < 0 || numbers.featureUsagePct > 100) {
      issues.push({ row: rowNumber, message: 'featureUsagePct must be between 0 and 100.' })
      continue
    }
    if (numbers.satisfactionScore < 0 || numbers.satisfactionScore > 10) {
      issues.push({ row: rowNumber, message: 'satisfactionScore must be between 0 and 10.' })
      continue
    }
    if (numbers.monthlyRevenue < 0 || numbers.daysUntilRenewal < 0) {
      issues.push({ row: rowNumber, message: 'Revenue and renewal days cannot be negative.' })
      continue
    }

    const input: CustomerInput = {
      id,
      companyName: record.companyName.trim(),
      industry: record.industry.trim(),
      plan: record.plan,
      monthlyRevenue: numbers.monthlyRevenue,
      licensedSeats: Math.trunc(numbers.licensedSeats),
      activeSeats: Math.trunc(numbers.activeSeats),
      logins30d: Math.trunc(numbers.logins30d),
      previousLogins30d: Math.trunc(numbers.previousLogins30d),
      featureUsagePct: numbers.featureUsagePct,
      unresolvedTickets: Math.trunc(numbers.unresolvedTickets),
      latePayments90d: Math.trunc(numbers.latePayments90d),
      satisfactionScore: numbers.satisfactionScore,
      daysUntilRenewal: Math.trunc(numbers.daysUntilRenewal),
    }

    customers.push(enrichCustomer(input))
  }

  return { customers, issues, totalRows: Math.max(0, lines.length - 1) }
}

function escapeCsvValue(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function customersToCsv(customers: Customer[]): string {
  const rows = customers.map((customer) => CUSTOMER_CSV_HEADERS.map((header) => escapeCsvValue(customer[header])).join(','))
  return [CUSTOMER_CSV_HEADERS.join(','), ...rows].join('\n')
}

export function demoTemplateCsv(): string {
  return [
    CUSTOMER_CSV_HEADERS.join(','),
    '1,Example Company,Technology,Pro,620,35,12,24,67,31,2,1,4,22',
    '2,Healthy Customer,Education,Basic,180,12,10,58,61,76,0,0,9,95',
  ].join('\n')
}
