import type{AuditEvent}from'@/types/advanced'
export function auditEvent(type:AuditEvent['type'],detail:string,actor='Local workspace user',timestamp=new Date().toISOString()):AuditEvent{return{id:`audit-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type,detail,actor,timestamp}}
export function parseAuditLog(raw:string|null):AuditEvent[]{if(!raw)return[];try{const x=JSON.parse(raw);return Array.isArray(x)?x.filter(e=>e&&typeof e.id==='string'&&typeof e.timestamp==='string'):[]}catch{return[]}}
