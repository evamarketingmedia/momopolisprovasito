"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import type { PartyChoice, PartyConfig } from "@/lib/party-config";
import AvailabilityCalendar, { type PublicAvailabilitySlot } from "./AvailabilityCalendar";

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

export default function BookingForm({ locale, dict, config }: {
  locale: Locale; dict: Dictionary; config: PartyConfig;
}) {
  const t = copy(locale);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

  useEffect(() => {
    fetch("/api/availability")
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
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

  const steps = t.steps;
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
      `${t.birthdayChild}: ${form.childName}, ${form.age}`,
      `${t.children}: ${form.children}; ${t.adults.toLowerCase()}: ${form.adults}`,
      `${t.package}: ${choiceLabel(find(config.packages, form.packageId), locale)}`,
      `${t.cake}: ${choiceLabel(find(config.cakes, form.cakeId), locale)}`,
      `${t.extras}: ${form.extras.map(id => choiceLabel(find(config.extras, id), locale)).join(", ") || t.none}`,
      `${t.setup}: ${choiceLabel(find(config.setups, form.setupId), locale)}`,
      `${t.estimate}: CHF ${total} (${t.base} CHF ${isHolidayDate(form.date, config) ? config.baseHolidayPrice : config.baseWeekdayPrice})`,
      form.notes,
    ].filter(Boolean).join("\n");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({
        availabilityId: form.slotId, name: form.customerName, email: form.email, phone: form.phone,
        partyType: find(config.packages, form.packageId)?.label ?? t.party, participants: Number(form.children) + Number(form.adults),
        message: details, locale,
      })});
      setStatus(response.ok ? "success" : "error");
    } catch { setStatus("error"); }
  }

  if (status === "success") return (
    <div className="py-16 text-center"><CheckCircle2 size={58} className="mx-auto text-momo-green-700" />
      <h3 className="font-display mt-5 text-3xl font-extrabold">{t.successTitle}</h3>
      <p className="mt-2 text-momo-black/65">{t.successText}</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-momo-green-neon to-momo-orange px-5 py-5 text-momo-black sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-momo-black/70">{t.step} {step + 1} {t.of} {steps.length}</p>
          <p className="font-display text-xl font-extrabold text-momo-black">CHF {total}</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-momo-green-700 transition-all" style={{width:`${((step+1)/steps.length)*100}%`}} /></div>
      </div>

      <div className="min-h-[430px] p-6 sm:p-10">
        <h3 className="font-display text-3xl font-extrabold">{t.questions[step]}</h3>
        <p className="mt-2 text-momo-black/55">{t.hints(config.minimumChildren)[step]}</p>
        <div className="mt-8">
          {step === 0 && <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <AvailabilityCalendar
              locale={locale}
              dict={dict}
              slots={slots}
              selected={selectedDate}
              loading={loadingSlots}
              onSelect={(date) => {
                setSelectedDate(date);
                if (!date) {
                  set("date", "");
                  set("slotId", "");
                  return;
                }
                const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
                const matching = slots.filter(s => s.date === key && s.isAvailable && s.remaining > 0);
                setForm(v => ({...v, date:key, slotId:matching.length === 1 ? matching[0].id : ""}));
              }}
            />
            <div className="rounded-3xl bg-momo-cream-dim p-5">
              <Field label={t.selectedDate}><input readOnly className="momo-input" value={form.date} placeholder={t.chooseCalendar} /></Field>
              <div className="mt-4">
                <Field label={t.availableTime}><select className="momo-input" value={form.slotId} onChange={e=>set("slotId",e.target.value)}><option value="">{t.select}</option>{dateSlots.map(s=><option key={s.id} value={s.id}>{s.startTime?.slice(0,5) || t.allDay}{s.endTime ? ` – ${s.endTime.slice(0,5)}`:""} ({s.remaining} {t.places})</option>)}</select></Field>
              </div>
            </div>
          </div>}
          {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Field label={t.name}><input className="momo-input" value={form.childName} onChange={e=>set("childName",e.target.value)} /></Field><Field label={t.age}><input type="number" min="1" max="16" className="momo-input" value={form.age} onChange={e=>set("age",e.target.value)} /></Field></div>}
          {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Field label={t.children}><input type="number" min={config.minimumChildren} className="momo-input" value={form.children} onChange={e=>set("children",e.target.value)} /></Field><Field label={t.adults}><input type="number" min="0" className="momo-input" value={form.adults} onChange={e=>set("adults",e.target.value)} /></Field></div>}
          {step === 3 && <Choices locale={locale} list={config.packages} selected={[form.packageId]} onToggle={id=>set("packageId",id)} suffix={t.perChild} included={t.included} />}
          {step === 4 && <Choices locale={locale} list={config.cakes} selected={[form.cakeId]} onToggle={id=>set("cakeId",id)} included={t.included} />}
          {step === 5 && <Choices locale={locale} list={config.extras} selected={form.extras} onToggle={id=>set("extras",form.extras.includes(id)?form.extras.filter(x=>x!==id):[...form.extras,id])} included={t.included} />}
          {step === 6 && <Choices locale={locale} list={config.setups} selected={[form.setupId]} onToggle={id=>set("setupId",id)} included={t.included} />}
          {step === 7 && <div className="grid gap-4 sm:grid-cols-2"><Field label={t.fullName}><input className="momo-input" value={form.customerName} onChange={e=>set("customerName",e.target.value)} /></Field><Field label="E-mail"><input type="email" className="momo-input" value={form.email} onChange={e=>set("email",e.target.value)} /></Field><Field label={t.phone}><input type="tel" className="momo-input" value={form.phone} onChange={e=>set("phone",e.target.value)} /></Field><Field label={t.notes}><textarea className="momo-input min-h-24" value={form.notes} onChange={e=>set("notes",e.target.value)} /></Field></div>}
          {step === 8 && <Summary locale={locale} form={form} config={config} total={total} t={t} />}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/10 px-6 py-5 sm:px-10">
        <button type="button" disabled={step===0} onClick={()=>setStep(s=>s-1)} className="inline-flex items-center gap-2 font-extrabold disabled:opacity-25"><ArrowLeft size={18}/> {t.back}</button>
        {step < steps.length-1 ? <button type="button" disabled={!canContinue} onClick={()=>setStep(s=>s+1)} className="inline-flex items-center gap-2 rounded-full bg-momo-orange px-6 py-3 font-extrabold disabled:opacity-35">{t.continue} <ArrowRight size={18}/></button>
        : <button type="button" onClick={submit} disabled={status==="sending"} className="inline-flex items-center gap-2 rounded-full bg-momo-green-neon px-6 py-3 font-extrabold text-momo-black">{status==="sending"?<Loader2 className="animate-spin" size={18}/>:<Check size={18}/>} {t.requestQuote}</button>}
      </div>
      {status==="error" && <p className="px-6 pb-5 text-right text-sm font-bold text-red-600">{t.error}</p>}
    </div>
  );
}

function isHolidayDate(date:string, config:PartyConfig) { if (!date) return false; const d = new Date(`${date}T12:00:00`); return d.getDay()===0 || d.getDay()===6 || config.holidayDates.includes(date); }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-1.5 block text-sm font-extrabold">{label}</span>{children}</label> }
function Choices({locale,list,selected,onToggle,suffix="",included="Incluso"}:{locale:Locale;list:PartyChoice[];selected:string[];onToggle:(id:string)=>void;suffix?:string;included?:string}) { return <div className="grid gap-4 md:grid-cols-3">{list.map(item=>{const translated=choiceCopy(item,locale);return <button type="button" key={item.id} onClick={()=>onToggle(item.id)} className={`relative rounded-2xl border-2 p-5 text-left transition ${selected.includes(item.id)?"border-momo-green-700 bg-momo-green-700/5":"border-black/10 hover:border-momo-orange"}`}><span className="font-display block text-xl font-extrabold">{translated.label}</span><span className="mt-2 block text-sm text-momo-black/60">{translated.description}</span><span className="mt-4 block font-extrabold text-momo-green-700">{item.price ? `+ CHF ${item.price} ${suffix}`:included}</span>{selected.includes(item.id)&&<Check className="absolute right-4 top-4 text-momo-green-700" size={20}/>}</button>})}</div> }
function Summary({locale,form,config,total,t}:{locale:Locale;form:FormState;config:PartyConfig;total:number;t:ReturnType<typeof copy>}) { const label=(list:PartyChoice[],id:string)=>choiceLabel(list.find(x=>x.id===id),locale); return <div className="grid gap-3 rounded-2xl bg-momo-cream-dim p-6 sm:grid-cols-2"><p><b>{t.date}:</b> {form.date}</p><p><b>{t.birthdayChild}:</b> {form.childName}, {form.age}</p><p><b>{t.guests}:</b> {form.children} {t.children.toLowerCase()}, {form.adults} {t.adults.toLowerCase()}</p><p><b>{t.package}:</b> {label(config.packages,form.packageId)}</p><p><b>{t.cake}:</b> {label(config.cakes,form.cakeId)}</p><p><b>{t.setup}:</b> {label(config.setups,form.setupId)}</p><p className="sm:col-span-2"><b>{t.extras}:</b> {form.extras.map(id=>label(config.extras,id)).join(", ")||t.none}</p><p className="font-display mt-3 text-2xl font-extrabold text-momo-green-700 sm:col-span-2">{t.estimate}: CHF {total}</p></div> }

const englishChoices: Record<string, {label:string;description:string}> = {
  classic: {label:"Classic Party",description:"Admission, reserved table, drinks and crisps"},
  super: {label:"Super Party",description:"Classic + pizza and digital invitations"},
  wow: {label:"Wow Party",description:"Super + entertainment and a birthday gift"},
  none: {label:"I’ll bring my own cake",description:"Cake service included"},
  chocolate: {label:"Chocolate cake",description:"Momopolis decoration"},
  fruit: {label:"Fruit cake",description:"Fresh and colourful"},
  snacks: {label:"Small pastries",description:"Assorted tray"},
  mascot: {label:"Mascot",description:"Mascot entrance and photos"},
  facepaint: {label:"Face painting",description:"One hour with an entertainer"},
  momo: {label:"Momopolis",description:"Our signature colours and decorations"},
  jungle: {label:"Jungle",description:"Leaves, animals and balloons"},
  space: {label:"Space",description:"Planets, stars and rockets"},
};
function choiceCopy(item:PartyChoice,locale:Locale) { return locale === "en" && englishChoices[item.id] ? englishChoices[item.id] : item; }
function choiceLabel(item:PartyChoice|undefined,locale:Locale) { return item ? choiceCopy(item,locale).label : ""; }

function copy(locale:Locale) {
  const en = locale === "en";
  return {
    steps: en ? ["When","Birthday child","Guests","Package","Cake","Extras","Setup","Contact","Summary"] : ["Quando","Festeggiato","Invitati","Pacchetto","Torta","Extra","Allestimento","Contatti","Riepilogo"],
    questions: en ? ["When will the party take place?","Who are we celebrating?","How many guests will there be?","Choose your package","Which cake would you like?","Would you like to add anything?","Which setup would you like?","How can we contact you?","Your party at a glance"] : ["Quando si svolgerà la festa?","Chi festeggiamo?","Quanti sarete?","Scegli il pacchetto","Che torta vuoi?","Vuoi aggiungere qualcosa?","Quale allestimento vuoi?","Come possiamo contattarti?","La tua festa, in sintesi"],
    hints: (min:number) => en ? ["Choose an available date and time slot.","The name and age help us personalise the party.",`The minimum is ${min} children.`,"The displayed amount is added to the base price.","Choose one of our cakes or bring your own.","You can choose more than one extra.","Give the party room the perfect style.","We will use these details to confirm your request.","Check everything before sending your request."] : ["Scegli data e fascia oraria tra quelle disponibili.","Nome ed età ci aiutano a personalizzare la festa.",`Il minimo previsto è di ${min} bambini.`,"Il prezzo indicato si aggiunge alla quota base.","Scegli una proposta oppure porta la tua torta.","Puoi scegliere anche più di un extra.","Dai alla sala il carattere giusto.","Servono per ricontattarti e confermare.","Controlla tutto prima di inviare la richiesta."],
    step: en?"Step":"Passaggio", of:en?"of":"di", back:en?"Back":"Indietro", continue:en?"Continue":"Continua", requestQuote:en?"Request quote":"Richiedi preventivo",
    selectedDate:en?"Selected date":"Data selezionata", chooseCalendar:en?"Choose a date from the calendar":"Scegli una data dal calendario", availableTime:en?"Available time":"Orario disponibile", select:en?"Select…":"Seleziona…", allDay:en?"Flexible time":"Orario flessibile", places:en?"places":"posti",
    name:en?"Name":"Nome", age:en?"Age":"Età", children:en?"Number of children":"Numero bambini", adults:en?"Number of adults":"Numero adulti", fullName:en?"Full name":"Nome e cognome", phone:en?"Phone":"Telefono", notes:en?"Notes":"Note",
    birthdayChild:en?"Birthday child":"Festeggiato/a", package:en?"Package":"Pacchetto", cake:en?"Cake":"Torta", extras:en?"Extras":"Extra", setup:en?"Setup":"Allestimento", estimate:en?"Estimated total":"Totale stimato", base:en?"base":"base", party:en?"Party":"Festa", none:en?"None":"Nessuno", date:en?"Date":"Data", guests:en?"Guests":"Invitati",
    perChild:en?"/ child":"/ bambino", included:en?"Included":"Incluso", successTitle:en?"Request sent!":"Richiesta inviata!", successText:en?"We will contact you to confirm availability and details.":"Ti contatteremo per confermare disponibilità e dettagli.", error:en?"We could not send your request. Check the details and try again.":"Non è stato possibile inviare. Controlla i dati e riprova.",
  };
}
