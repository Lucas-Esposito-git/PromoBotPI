import "server-only";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { DatabaseError } from "../database/supabase";
export function requireAdmin(request: Request) {
 const token=process.env.PROMOBOT_ADMIN_TOKEN;
 if (!token || token.length<32) throw new DatabaseError("Configure PROMOBOT_ADMIN_TOKEN com ao menos 32 caracteres no servidor.",503);
 const sent=request.headers.get("Authorization")?.replace(/^Bearer /,"") ?? "";
 const expected=Buffer.from(token); const actual=Buffer.from(sent);
 if (actual.length!==expected.length || !timingSafeEqual(actual,expected)) throw new DatabaseError("Token administrativo inválido.",401);
}
export const IdSchema=z.string().uuid();
export async function bodyJson(request: Request): Promise<unknown> {
 const length=Number(request.headers.get("content-length") ?? 0);
 if (length>16384) throw new DatabaseError("Corpo da requisição muito grande.",413);
 const text=await request.text();
 if (Buffer.byteLength(text)>16384) throw new DatabaseError("Corpo da requisição muito grande.",413);
 try {return JSON.parse(text);} catch {throw new DatabaseError("JSON inválido.",400);}
}
export function dbResponseError(error: unknown): Response {
 if (error instanceof z.ZodError) return Response.json({error:"Dados inválidos.",detalhes:error.issues.map(issue=>({campo:issue.path.join("."),mensagem:issue.message}))},{status:400});
 if (error instanceof DatabaseError) return Response.json({error:error.message},{status:error.status});
 return Response.json({error:"Não foi possível concluir a operação."},{status:500});
}
