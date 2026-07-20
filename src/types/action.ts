export type ActionStatus = 'Not started' | 'Planned' | 'In progress' | 'Completed'

export interface ActionStatusMap {
  [customerId: string]: ActionStatus
}
