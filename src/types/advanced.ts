import type { Recommendation } from './customer'
export type RiskEngine='heuristic'|'logistic'
export interface LogisticArtifact{schemaVersion:1;modelType:'logistic_regression';featureOrder:string[];coefficients:number[];intercept:number;means:Record<string,number>;scales:Record<string,number>;trainedAt:string;datasetLabel:string;synthetic:boolean}
export interface Experiment{ id:string;name:string;hypothesis:string;targetSegment:string;controlGroup:number[];treatmentGroup:number[];startDate:string;endDate:string;assignedAction:Recommendation['actionType'];customersContacted:number;offersAccepted:number;customersRetained:number;controlCustomersRetained:number;incrementalRetainedRevenue:number;notes:string;createdAt:string }
export interface CampaignDraft{id:string;subject:string;body:string;segment:string;tokens:string[];status:'Draft'|'Simulated sent';createdAt:string;updatedAt:string}
export interface AuditEvent{id:string;type:'Dataset imported'|'Risk engine changed'|'Action created'|'Owner changed'|'Status changed'|'Customer response recorded'|'Outcome recorded'|'Revenue value edited'|'Experiment created'|'Campaign simulated';actor:string;timestamp:string;detail:string}
