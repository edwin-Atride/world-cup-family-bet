import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDateTime(value:string){ return new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
export function getPickLabel(pick:string, home:string, away:string){ if(pick==='home') return `Victoire ${home}`; if(pick==='away') return `Victoire ${away}`; return 'Match nul'; }
