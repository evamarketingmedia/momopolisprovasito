"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/dictionaries";
import type { PartyChoice, PartyConfig } from "@/lib/party-config";
import type { PublicAvailabilitySlot } from "./AvailabilityCalendar";

type FormState = {
  date: string; slotId: string; childName: string; age: string; children: string;
  adults: string; packageId: string; cakeId: string; extras: string[];
  setupId: string; customerName: string; email: string; phone: string; notes: string;
};

const initial: FormState = {
  date: "", slotId: "", childName: "", age: "", children: "8", adults: "4",
  packageId: "", cakeId: "", extras: [], setupId: "", customerName: "",
  email: "", phone: "", notes: "",
};

export default function BookingForm({ locale, config }: {
  locale: Locale; config: PartyConfig;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([]);
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

  useEffect(() => {
    fetch("/api/availability").then(r => r.json()).then(d => setSlots(d.slots ?? [])).catch(() => {});
  }, []);

  const dateSlots = slots.filter(s => s.date === form.date && s.isAvailable && s.remaining > 0);
  const find = (list: PartyChoice[], id: string) => list.find(x => x.id === id);
  const total = useMemo(() => {
    const children = Math.max(config.minimumChildren, Number(form.children) || 0);
    const selectedDate = form.date ? new Date(`${form.date}T12:00:00`) : null;
    const isHoliday = Boolean(selectedDate && (
      selectedDate.getDay() === 0 ||
      selectedDate.getDay() === 6 ||
      config.holidayDates.includes(form.date)
    ));
    const basePrice = isHoliday ? config.baseHolidayPrice : config.baseWeekdayPrice;
    return basePrice + children * config.baseChildPrice + (Number(form.adults) || 0) * config.adultPrice
      + (find(config.packages, form.packageId)?.price ?? 0) * children
      + (find(config.cakes, form.cakeId)?.price ?? 0)
      + (find(config.setups, form.setupId)?.price ?? 0)
      + form.extras.reduce((sum, id) => sum + (find(config.extras, id)?.price ?? 0), 0);
  }, [form, config]);

  const steps = ["Quando", "Festeggiato", "Invitati", "Pacchetto", "Torta", "Extra", "Allestimento", "Contatti", "Riepilogo"];
  const set = (key: keyof FormState, value: string | string[]) => setForm(v => ({ ...v, [key]: value }));
  const canContinue = [
    Boolean(form.date && form.slotId), Boolean(form.childName && form.age),
    Number(form.children) >= config.minimumChildren, Boolean(form.packageId),
    Boolean(form.cakeId), true, Boolean(form.setupId),
    Boolean(form.customerName && form.email && form.phone), true,
  ][step];

  async function submit() {
    setStatus("sending");
    const details = [
      `Festeggiato/a: ${form.childName}, ${form.age} anni`,
      `Bambini: ${form.children}; adulti: ${form.adults}`,
      `Pacchetto: ${find(config.packages, form.packageId)?.label}`,
      `Torta: ${find(config.cakes, form.cakeId)?.label}`,
      `Extra: ${form.extras.map(id => find(config.extras, id)?.label).join(", ") || "nessuno"}`,
      `Allestimento: ${find(config.setups, form.setupId)?.label}`,
      `Preventivo stimato: CHF ${total} (base CHF ${isHolidayDate(form.date, config) ? config.baseHolidayPrice : config.baseWeekdayPrice})`,
      form.notes,
    ].filter(Boolean).join("\n");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({
        availabilityId: form.slotId, name: form.customerName, email: form.email, phone: form.phone,
        partyType: find(config.packages, form.packageId)?.label ?? "Festa", participants: Number(form.children) + Number(form.adults),
        message: details, locale,
      })});
      setStatus(response.ok ? "success" : "error");
    } catch { setStatus("error"); }
  }

  if (status === "success") return (
    <div className="py-16 text-center"><CheckCircle2 size={58} className="mx-auto text-momo-green-700" />
      <h3 className="font-display mt-5 text-3xl font-extrabold">Richiesta inviata!</h3>
      <p className="mt-2 text-momo-black/65">Ti contatteremo per confermare disponibilità e dettagli.</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-momo-green-neon to-momo-orange px-5 py-5 text-momo-black sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-momo-green-neon">Passaggio {step + 1} di {steps.length}</p>
          <p className="font-display text-xl font-extrabold text-momo-black">CHF {total}</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-momo-green-700 transition-all" style={{width:`${((step+1)/steps.length)*100}%`}} /></div>
      </div>

      <div className="min-h-[430px] p-6 sm:p-10">
        <h3 className="font-display text-3xl font-extrabold">{question(step)}</h3>
        <p className="mt-2 text-momo-black/55">{hint(step, config.minimumChildren)}</p>
        <div className="mt-8">
          {step === 0 && <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data della festa"><input type="date" className="momo-input" value={form.date} onChange={e=>{set("date",e.target.value);set("slotId","")}} /></Field>
            <Field label="Orario disponibile"><select className="momo-input" value={form.slotId} onChange={e=>set("slotId",e.target.value)}><option value="">Seleziona…</option>{dateSlots.map(s=><option key={s.id} value={s.id}>{s.startTime?.slice(0,5)}{s.endTime ? ` – ${s.endTime.slice(0,5)}`:""} ({s.remaining} posti)</option>)}</select></Field>
          </div>}
          {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><input className="momo-input" value={form.childName} onChange={e=>set("childName",e.target.value)} /></Field><Field label="Età"><input type="number" min="1" max="16" className="momo-input" value={form.age} onChange={e=>set("age",e.target.value)} /></Field></div>}
          {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Numero bambini"><input type="number" min={config.minimumChildren} className="momo-input" value={form.children} onChange={e=>set("children",e.target.value)} /></Field><Field label="Numero adulti"><input type="number" min="0" className="momo-input" value={form.adults} onChange={e=>set("adults",e.target.value)} /></Field></div>}
          {step === 3 && <Choices list={config.packages} selected={[form.packageId]} onToggle={id=>set("packageId",id)} suffix="/ bambino" />}
          {step === 4 && <Choices list={config.cakes} selected={[form.cakeId]} onToggle={id=>set("cakeId",id)} />}
          {step === 5 && <Choices list={config.extras} selected={form.extras} onToggle={id=>set("extras",form.extras.includes(id)?form.extras.filter(x=>x!==id):[...form.extras,id])} />}
          {step === 6 && <Choices list={config.setups} selected={[form.setupId]} onToggle={id=>set("setupId",id)} />}
          {step === 7 && <div className="grid gap-4 sm:grid-cols-2"><Field label="Nome e cognome"><input className="momo-input" value={form.customerName} onChange={e=>set("customerName",e.target.value)} /></Field><Field label="E-mail"><input type="email" className="momo-input" value={form.email} onChange={e=>set("email",e.target.value)} /></Field><Field label="Telefono"><input type="tel" className="momo-input" value={form.phone} onChange={e=>set("phone",e.target.value)} /></Field><Field label="Note"><textarea className="momo-input min-h-24" value={form.notes} onChange={e=>set("notes",e.target.value)} /></Field></div>}
          {step === 8 && <Summary form={form} config={config} total={total} />}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 px-6 py-5 sm:px-10">
        <button type="button" disabled={step===0} onClick={()=>setStep(s=>s-1)} className="inline-flex items-center gap-2 font-extrabold disabled:opacity-25"><ArrowLeft size={18}/> Indietro</button>
        {step < steps.length-1 ? <button type="button" disabled={!canContinue} onClick={()=>setStep(s=>s+1)} className="inline-flex items-center gap-2 rounded-full bg-momo-orange px-6 py-3 font-extrabold disabled:opacity-35">Continua <ArrowRight size={18}/></button>
        : <button type="button" onClick={submit} disabled={status==="sending"} className="inline-flex items-center gap-2 rounded-full bg-momo-green-neon px-6 py-3 font-extrabold text-momo-black">{status==="sending"?<Loader2 className="animate-spin" size={18}/>:<Check size={18}/>} Richiedi preventivo</button>}
      </div>
      {status==="error" && <p className="px-6 pb-5 text-right text-sm font-bold text-red-600">Non è stato possibile inviare. Controlla i dati e riprova.</p>}
    </div>
  );
}

function question(step:number) { return ["Quando si svolgerà la festa?","Chi festeggiamo?","Quanti sarete?","Scegli il pacchetto","Che torta vuoi?","Vuoi aggiungere qualcosa?","Quale allestimento vuoi?","Come possiamo contattarti?","La tua festa, in sintesi"][step]; }
function isHolidayDate(date:string, config:PartyConfig) { if (!date) return false; const d = new Date(`${date}T12:00:00`); return d.getDay()===0 || d.getDay()===6 || config.holidayDates.includes(date); }
function hint(step:number,min:number) { return ["Scegli data e fascia oraria tra quelle disponibili.","Nome ed età ci aiutano a personalizzare la festa.",`Il minimo previsto è di ${min} bambini.`,"Il prezzo indicato si aggiunge alla quota base.","Scegli una proposta oppure porta la tua torta.","Puoi scegliere anche più di un extra.","Dai alla sala il carattere giusto.","Servono per ricontattarti e confermare.","Controlla tutto prima di inviare la richiesta."][step]; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-1.5 block text-sm font-extrabold">{label}</span>{children}</label> }
function Choices({list,selected,onToggle,suffix=""}:{list:PartyChoice[];selected:string[];onToggle:(id:string)=>void;suffix?:string}) { return <div className="grid gap-4 md:grid-cols-3">{list.map(item=><button type="button" key={item.id} onClick={()=>onToggle(item.id)} className={`relative rounded-2xl border-2 p-5 text-left transition ${selected.includes(item.id)?"border-momo-green-700 bg-momo-green-700/5":"border-black/10 hover:border-momo-orange"}`}><span className="font-display block text-xl font-extrabold">{item.label}</span><span className="mt-2 block text-sm text-momo-black/60">{item.description}</span><span className="mt-4 block font-extrabold text-momo-green-700">{item.price ? `+ CHF ${item.price} ${suffix}`:"Incluso"}</span>{selected.includes(item.id)&&<Check className="absolute right-4 top-4 text-momo-green-700" size={20}/>}</button>)}</div> }
function Summary({form,config,total}:{form:FormState;config:PartyConfig;total:number}) { const label=(list:PartyChoice[],id:string)=>list.find(x=>x.id===id)?.label; return <div className="grid gap-3 rounded-2xl bg-momo-cream-dim p-6 sm:grid-cols-2"><p><b>Data:</b> {form.date}</p><p><b>Festeggiato/a:</b> {form.childName}, {form.age} anni</p><p><b>Invitati:</b> {form.children} bambini, {form.adults} adulti</p><p><b>Pacchetto:</b> {label(config.packages,form.packageId)}</p><p><b>Torta:</b> {label(config.cakes,form.cakeId)}</p><p><b>Allestimento:</b> {label(config.setups,form.setupId)}</p><p className="sm:col-span-2"><b>Extra:</b> {form.extras.map(id=>label(config.extras,id)).join(", ")||"Nessuno"}</p><p className="font-display mt-3 text-2xl font-extrabold text-momo-green-700 sm:col-span-2">Totale stimato: CHF {total}</p></div> }
