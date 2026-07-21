import type { Customer, CustomerEvent } from '@/types/customer'
import type { RetentionAction } from '@/types/action'

export function actionEvents(actions: RetentionAction[]): CustomerEvent[] {
  return actions.flatMap((action) => {
    const events: CustomerEvent[] = [{ id:`${action.id}-created`,customerId:action.customerId,occurredAt:action.createdAt,category:'Retention actions',type:'Action created',title:action.title,detail:`Assigned to ${action.owner}.`,synthetic:action.synthetic }]
    if(action.customerResponse!=='Pending') events.push({id:`${action.id}-response`,customerId:action.customerId,occurredAt:action.updatedAt,category:'Retention actions',type:'Customer contacted',title:`Customer response: ${action.customerResponse}`,detail:'Response recorded by the retention team.',synthetic:action.synthetic})
    if(action.outcome!=='Unknown') events.push({id:`${action.id}-outcome`,customerId:action.customerId,occurredAt:action.completedAt??action.updatedAt,category:'Retention actions',type:`Customer ${action.outcome.toLowerCase()}`,title:`Final outcome: ${action.outcome}`,detail:`Recorded saved ARR: ${action.realisedRevenueProtected}.`,synthetic:action.synthetic})
    if(action.completedAt) events.push({id:`${action.id}-completed`,customerId:action.customerId,occurredAt:action.completedAt,category:'Retention actions',type:'Action completed',title:`Action completed · ${action.outcome}`,detail:`Customer response: ${action.customerResponse}.`,synthetic:action.synthetic})
    return events
  })
}
export function customerTimeline(customer: Customer, actions: RetentionAction[]): CustomerEvent[] {
  return [...(customer.events??[]),...actionEvents(actions).filter(e=>e.customerId===customer.id)].sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))
}
