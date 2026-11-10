"use client";
import { useEffect,useState } from "react";
import type { Game } from "@/front/services/games";
import { money } from "@/front/services/games";
import type { OfertaSalva } from "@/back/repositories/promocao.repository";

const button="rounded bg-purple-600 px-4 py-2 text-sm text-white disabled:opacity-40";
const input="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-white";
async function api(path:string,options?:RequestInit) {
 const response=await fetch(path,options);
 if(response.status===204)return null;
 const data=await response.json();
 if(!response.ok)throw new Error(data.error ?? "A operação falhou.");
 return data;
}
export default function AdminPromocoes() {
 const [token,setToken]=useState("");
 const [term,setTerm]=useState("");
 const [games,setGames]=useState<Game[]>([]);
 const [saved,setSaved]=useState<OfertaSalva[]>([]);
 const [prices,setPrices]=useState<Record<string,string>>({});
 const [page,setPage]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 async function refresh(current:number) {
   const data=await api(`/api/promocoes?page=${current}`);
   setSaved(data.ofertas);setHasMore(data.hasMore);setPage(current);
 }
 useEffect(()=>{let active=true;api("/api/promocoes?page=0").then(data=>{if(active){setSaved(data.ofertas);setHasMore(data.hasMore);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 async function run(action:()=>Promise<void>) {
   if(busy)return;
   setBusy(true);setError("");setMessage("");
   try{await action();}catch(e){setError(e instanceof Error?e.message:"Erro inesperado.");}finally{setBusy(false);}
 }
 const headers=()=>({"Content-Type":"application/json",Authorization:`Bearer ${token}`});
 async function save(game:Game) {
   const offer=game.offers[0];
   if(!offer)throw new Error("Oferta sem link.");
   const record=await api("/api/promocoes",{method:"POST",headers:headers(),body:JSON.stringify({
     chaveExterna:`steam:${game.id}`,titulo:game.title,loja:{nome:"Steam",tipo:"loja"},fonte:"steam",moeda:"BRL",
     precoPromocional:offer.price,precoNormal:offer.originalPrice,url:offer.url,
   })});
   await refresh(0);setMessage(`Oferta salva no banco. ID: ${record.id}`);
 }
 return <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100"><div className="mx-auto max-w-5xl space-y-8">
   <a href="/" className="text-purple-300 underline">Voltar ao catálogo</a>
   <h1 className="text-3xl font-bold">Ofertas salvas · Administração</h1>
   <p className="text-sm text-slate-300">Selecione uma promoção real da Steam para gravar no PostgreSQL. O catálogo ao vivo continua independente destas ofertas salvas.</p>
   <label className="block">Token administrativo<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} className={`${input} mt-2 block w-full`} placeholder="Valor de PROMOBOT_ADMIN_TOKEN"/></label>
   <p className="text-xs text-slate-400">O token fica somente na memória desta página. Não é a chave do Supabase e não deve aparecer na gravação.</p>
   {error && <p role="alert" className="rounded border border-red-600 p-3 text-red-300">{error}</p>}
   {message && <p role="status" className="rounded border border-green-600 p-3 text-green-300">{message}</p>}
   <section className="space-y-4 rounded-xl border border-slate-700 p-5">
     <h2 className="text-xl font-semibold">1. Buscar uma promoção real</h2>
     <form onSubmit={e=>{e.preventDefault();void run(async()=>{const data=await api(`/api/catalogo?source=steam&page=0&title=${encodeURIComponent(term)}`);setGames(data.games);if(!data.games.length)setMessage("Nenhuma promoção encontrada para esse título.");});}} className="flex flex-wrap gap-3">
       <input aria-label="Nome do jogo" maxLength={120} value={term} onChange={e=>setTerm(e.target.value)} className={`${input} min-w-0 flex-1`} placeholder="Nome do jogo (ou vazio para ofertas atuais)"/>
       <button disabled={busy} className={button}>Buscar na Steam</button>
     </form>
     <div className="space-y-2">{games.map(game=><div key={game.id} className="flex flex-wrap items-center justify-between gap-3 rounded bg-slate-900 p-3"><span>{game.title} · {money(game.promotionalPrice,"BRL")}</span><button disabled={busy||token.length<32} onClick={()=>void run(()=>save(game))} className={button}>Salvar no banco</button></div>)}</div>
   </section>
   <section className="space-y-4 rounded-xl border border-slate-700 p-5">
     <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">2. Registros persistidos</h2><button disabled={busy} onClick={()=>void run(()=>refresh(page))} className={button}>Consultar banco</button></div>
     {!saved.length && <p className="text-slate-400">Nenhuma oferta salva nesta página.</p>}
     {saved.map(offer=><article key={offer.id} className="space-y-3 rounded bg-slate-900 p-4">
       <h3 className="font-bold">{offer.jogo.titulo} · {offer.loja.nome}</h3>
       <p className="text-sm">{money(offer.preco_promocional,offer.moeda)} · {offer.fonte}</p>
       <p className="break-all text-xs text-slate-400">ID: {offer.id} · Atualizado: {new Date(offer.atualizado_em).toLocaleString("pt-BR")}</p>
       <div className="flex flex-wrap items-center gap-3"><label className="text-sm">Novo preço<input aria-label={`Novo preço de ${offer.jogo.titulo}`} type="number" min="0" step="0.01" className={`${input} ml-2 w-32`} value={prices[offer.id] ?? String(offer.preco_promocional)} onChange={e=>setPrices({...prices,[offer.id]:e.target.value})}/></label>
         <button disabled={busy||token.length<32} className={button} onClick={()=>void run(async()=>{const raw=prices[offer.id] ?? String(offer.preco_promocional);if(raw.trim()==="")throw new Error("Informe o novo preço.");await api(`/api/promocoes/${offer.id}`,{method:"PATCH",headers:headers(),body:JSON.stringify({precoPromocional:Number(raw)})});await refresh(page);setMessage("Preço atualizado no banco. Alteração manual não modifica a oferta na Steam.");})}>Atualizar preço salvo</button>
         <button disabled={busy||token.length<32} className="rounded bg-red-800 px-4 py-2 text-sm disabled:opacity-40" onClick={()=>{if(window.confirm("Excluir esta oferta salva?"))void run(async()=>{await api(`/api/promocoes/${offer.id}`,{method:"DELETE",headers:headers()});await refresh(page);setMessage("Oferta excluída. O jogo e a loja permanecem cadastrados.");});}}>Excluir oferta</button>
       </div>
     </article>)}
     <div className="flex items-center gap-3"><button className={button} disabled={busy||page===0} onClick={()=>void run(()=>refresh(page-1))}>Anterior</button><span>Página {page+1}</span><button className={button} disabled={busy||!hasMore} onClick={()=>void run(()=>refresh(page+1))}>Próxima</button></div>
   </section>
 </div></main>;
}
