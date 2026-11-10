import "server-only";
export class DatabaseError extends Error {
 constructor(message: string, public status: number) { super(message); }
}
export async function supabaseRequest(path: string, options: RequestInit = {}): Promise<unknown> {
 const base = process.env.SUPABASE_URL?.trim();
 const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
 if (!base || !key) throw new DatabaseError("Configure SUPABASE_URL e SUPABASE_SECRET_KEY no servidor.",503);
 let url: URL;
 try { url = new URL(base); } catch { throw new DatabaseError("SUPABASE_URL inválida.",503); }
 if (url.protocol!=="https:" || !url.hostname.endsWith(".supabase.co") || url.username || url.password || url.search || url.hash || !["","/"].includes(url.pathname)) {
   throw new DatabaseError("Use a URL HTTPS do projeto Supabase (https://SEU-PROJETO.supabase.co).",503);
 }
 const headers = new Headers(options.headers);
 headers.set("apikey",key);
 // Legacy service_role is JWT. Modern sb_secret belongs only in apikey.
 if (!key.startsWith("sb_secret_")) headers.set("Authorization",`Bearer ${key}`);
 headers.set("Content-Type","application/json");
 let response: Response;
 try { response = await fetch(`${url.origin}/rest/v1/${path}`, { ...options, headers, cache:"no-store", signal:AbortSignal.timeout(12000) }); }
 catch { throw new DatabaseError("Não foi possível conectar ao Supabase.",502); }
 if (!response.ok) {
   let code="";
   try { const body=await response.json(); code=typeof body.code==="string"?body.code:""; } catch {}
   if (["23514","23502","22P02","22003"].includes(code)) throw new DatabaseError("Os dados violam uma regra do banco. Confira preços e campos obrigatórios.",400);
   if (code==="23505") throw new DatabaseError("O registro já existe.",409);
   if (["42P01","42883","PGRST202","PGRST205"].includes(code)) throw new DatabaseError("Execute a migração SQL do PromoBot no Supabase.",503);
   throw new DatabaseError("A consulta ao Supabase falhou. Confira a configuração do servidor.",502);
 }
 if (response.status===204) return null;
 return response.json();
}
