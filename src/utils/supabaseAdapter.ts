const url=import.meta.env.VITE_SUPABASE_URL as string|undefined,key=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined
export const supabaseMode=url&&key?'configured':'local-demo'
export async function supabaseSelect<T>(table:string):Promise<T[]|null>{if(!url||!key)return null;try{const r=await fetch(`${url}/rest/v1/${table}?select=*`,{headers:{apikey:key,Authorization:`Bearer ${key}`}});return r.ok?await r.json() as T[]:null}catch{return null}}
