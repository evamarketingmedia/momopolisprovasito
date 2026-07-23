# Momopolis — Family Bar & Park

Sito vetrina + sistema di prenotazione per Momopolis, parco giochi indoor e bar per famiglie a Mendrisio (Ticino), a due passi da FoxTown. Costruito con Next.js 16 (App Router), TypeScript e Tailwind CSS v4.

## Funzionalità

- 5 pagine + Pacchetti Feste: Home, Chi siamo, Galleria, Eventi, Pacchetti Feste, Contatti
- Doppia lingua IT/EN con selettore e routing `/it/...` / `/en/...`
- Galleria fotografica filtrabile per categoria (parco giochi, feste, eventi speciali) con lightbox, gestibile da Supabase
- **Prenotazioni con capacità reale**: l'admin definisce quanti posti sono disponibili per ogni data (ed eventuale fascia oraria); il form pubblico mostra solo le date con posti liberi e blocca l'invio se i partecipanti superano i posti rimasti
- **Anti-overbooking a livello di database**: una funzione Postgres atomica (con row lock) ricontrolla la disponibilità server-side prima di ogni salvataggio, anche in caso di prenotazioni simultanee
- Bottone WhatsApp / click-to-call flottante
- Mappa Google integrata con indicazioni stradali
- SEO: meta tag per pagina, sitemap.xml, robots.txt, dati strutturati LocalBusiness (JSON-LD)
- Palette brand nero / verde fluo / arancione fluo, pensata per un pubblico di famiglie con bambini
- **Pannello admin** (`/admin`) protetto da password: gestisci disponibilità/prenotazioni, le foto della galleria e quelle usate in home/chi siamo/eventi, senza toccare il codice
- Email via Resend: notifica interna a Momopolis + conferma automatica al cliente per ogni prenotazione

## Avvio in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) — verrai reindirizzato automaticamente a `/it`. Senza configurare Supabase la galleria e le foto del sito mostrano comunque i placeholder integrati, ma **le prenotazioni richiedono Supabase** (il modello a capacità/posti ha bisogno di transazioni database reali — vedi sotto).

## Configurazione da fare prima del lancio

### 1. Supabase (prenotazioni, disponibilità, galleria, foto sito)

1. Crea un account gratuito su [supabase.com](https://supabase.com) e un nuovo progetto.
2. Vai su **SQL Editor → New query** ed esegui, in ordine, questi tre script (uno per query, uno dopo l'altro):
   1. [`supabase/schema.sql`](supabase/schema.sql) — crea `bookings` e `gallery_images` (già popolata con le 20 foto placeholder attuali).
   2. [`supabase/site_images.sql`](supabase/site_images.sql) — crea `site_images`, le foto di home/chi siamo/eventi gestite dal pannello admin.
   3. [`supabase/booking_availability.sql`](supabase/booking_availability.sql) — crea `booking_availability` (capacità per data/fascia), aggiunge le colonne `availability_id`/`status`/`start_time`/`end_time` a `bookings`, e la funzione `create_booking()` che verifica i posti in modo atomico prima di ogni prenotazione.
3. Vai su **Project Settings → API**, copia **Project URL** e **service_role key**.
4. Copia `.env.example` in `.env.local` e incolla i valori:

   ```bash
   cp .env.example .env.local
   ```

   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

5. Riavvia `npm run dev`.

**Gestire le foto**: dal pannello [`/admin`](#pannello-admin) qui sotto, oppure direttamente dalle tabelle `gallery_images` / `site_images` nel Table Editor di Supabase — nessuna modifica al codice necessaria in entrambi i casi.

> La `service_role key` ha accesso completo e bypassa la sicurezza a livello di riga: viene usata solo lato server (API routes, Server Actions), non è mai esposta al browser e non deve mai essere assegnata a una variabile `NEXT_PUBLIC_*`. Non committarla né condividerla pubblicamente.

**Senza il passaggio 3 (`booking_availability.sql`)**: il calendario di prenotazione pubblico resta vuoto (nessuna data selezionabile) finché non aggiungi almeno una disponibilità dal pannello `/admin/availability`.

### 2. Email delle prenotazioni (Resend)

1. Crea un account gratuito su [resend.com](https://resend.com) e genera una API key.
2. Aggiungi in `.env.local`:

   ```
   RESEND_API_KEY=re_...
   BOOKING_NOTIFICATION_EMAIL=info@momopolis.ch
   ```

3. (Consigliato prima di andare online) Verifica il tuo dominio in Resend e imposta anche `RESEND_FROM_EMAIL="Momopolis <no-reply@tuodominio.ch>"` — senza dominio verificato, Resend consente di inviare solo all'indirizzo email del tuo account Resend, utile per testare ma non per la produzione.

Senza `RESEND_API_KEY` le prenotazioni vengono comunque salvate e i posti bloccati normalmente — le email vengono semplicemente saltate con un avviso nei log del server. Un eventuale errore di invio non fa mai fallire il salvataggio della prenotazione.

Per ogni prenotazione riuscita partono due email indipendenti (un errore sull'una non blocca l'altra):
- **Notifica interna** a `BOOKING_NOTIFICATION_EMAIL`, in italiano, con nome/email/telefono/data/fascia/partecipanti/note/ID prenotazione.
- **Conferma automatica** al cliente, nella lingua (IT/EN) in cui ha compilato il form.

### 3. Dati reali del locale

Modifica [`src/lib/site-config.ts`](src/lib/site-config.ts): indirizzo esatto, coordinate GPS, numero di telefono/WhatsApp, email, orari, link social e la query dell'embed di Google Maps (attualmente punta a FoxTown Mendrisio come riferimento).

### 4. Dominio e metadata

In `src/lib/site-config.ts` aggiorna `domain` con l'URL definitivo — è usato per la sitemap, i tag Open Graph e i dati strutturati SEO.

## Prenotazioni e disponibilità — come funzionano

Il modello è a **capacità**: l'admin definisce, per ogni data (ed eventuale fascia oraria), quanti posti esistono. Il sito calcola sempre `posti rimasti = capacità − partecipanti delle prenotazioni non annullate`.

- [`supabase/booking_availability.sql`](supabase/booking_availability.sql) crea `booking_availability` (una riga per data/fascia, con capacità e stato aperto/bloccato) e la vista `booking_availability_status`, che calcola in tempo reale posti prenotati/rimasti.
- `bookings` ha ora `availability_id`, `status` (`pending` | `confirmed` | `cancelled`) e `start_time`/`end_time`. Le prenotazioni `cancelled` non contano nel calcolo dei posti occupati. Il vecchio vincolo "una prenotazione per data" è stato rimosso: più prenotazioni possono coesistere sulla stessa data finché restano posti.
- **Anti-overbooking**: ogni prenotazione passa dalla funzione Postgres `create_booking()` ([`src/lib/bookings-store.ts`](src/lib/bookings-store.ts) → `createBookingAtomic`), che blocca la riga di disponibilità (`SELECT ... FOR UPDATE`), ricalcola i posti rimasti e rifiuta la richiesta se non ce ne sono abbastanza — il tutto in un'unica transazione, quindi due prenotazioni simultanee sulla stessa data non possono mai superare la capacità.
- `GET /api/availability` ([`src/app/api/availability/route.ts`](src/app/api/availability/route.ts)) espone al form pubblico solo data/fascia/capacità/posti rimasti/stato — mai dati dei clienti.
- `POST /api/bookings` valida i dati e delega tutto il controllo di capacità alla funzione atomica; se la disponibilità è cambiata nel frattempo (es. un altro cliente ha prenotato gli ultimi posti) risponde 409 e il form pubblico lo mostra come messaggio chiaro invitando a scegliere un'altra data.

Questo sistema **richiede Supabase**: non esiste un fallback locale, perché il controllo atomico dei posti ha bisogno di transazioni database reali.

## Pannello admin

Vai su `/admin` (es. `https://tuosito.ch/admin`) e accedi con la password impostata in `ADMIN_PASSWORD` (vedi `.env.local`). Da lì puoi:

- **Disponibilità** (`/admin/availability`): aggiungere date singole o in blocco (un intervallo, con opzione "salta i weekend"), impostare posti/fascia oraria/nota interna, bloccare o riaprire una data, modificare la capacità, vedere l'elenco delle prenotazioni per ogni data e annullarle (i posti tornano subito disponibili).
- **Foto del sito**: sostituire le foto usate in home, chi siamo ed eventi (11 posizioni fisse).
- **Galleria**: aggiungere nuove foto per categoria, modificarne l'URL o eliminarle.

Le modifiche compaiono sul sito pubblico entro 5 minuti al massimo (di solito immediatamente, grazie a un aggiornamento automatico della cache innescato da ogni salvataggio).

Richiede Supabase configurato (sezione 1 sopra). Senza `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` in `.env.local` il login non funziona. Genera un secret sicuro con:

```bash
openssl rand -hex 32
```

> Il pannello non ha un sistema multi-utente: è pensato per un solo amministratore con una password condivisa. Non è indicizzato dai motori di ricerca (`robots: noindex`) ma resta raggiungibile da chiunque conosca l'URL — usa una password lunga.
>
> **Importante**: appena esegui `booking_availability.sql`, il calendario pubblico risulterà vuoto finché non aggiungi almeno una disponibilità da `/admin/availability` — è un cambiamento rispetto a prima, quando ogni data futura era prenotabile di default.

## Struttura del progetto

```
src/
  app/
    [lang]/                pagine pubbliche (una cartella per route, entrambe le lingue condividono gli slug)
    admin/                  pannello admin (protetto da password)
      page.tsx, actions.ts    dashboard: foto sito + galleria
      login/                  pagina di login
      availability/           gestione disponibilità/prenotazioni
    api/
      bookings/               POST — crea una prenotazione (atomico)
      availability/            GET — disponibilità pubblica (data/fascia/posti rimasti)
    sitemap.ts, robots.ts
  components/               componenti UI condivisi (BookingForm, AvailabilityCalendar, ...)
  lib/
    dictionaries/              testi IT/EN
    site-config.ts              dati del locale (placeholder da sostituire)
    supabase.ts                  client Supabase (server-only)
    admin-auth.ts                 password + sessione firmata per /admin
    revalidate-site.ts             rinfresca le pagine pubbliche dopo un salvataggio admin
    bookings-store.ts             prenotazioni: creazione atomica (RPC), elenco, annullamento
    availability-store.ts          disponibilità: lettura pubblica/admin, CRUD, creazione in blocco
    gallery-store.ts               galleria: Supabase o fallback foto placeholder
    site-images-store.ts           foto home/chi siamo/eventi: Supabase o fallback
    email.ts                       notifica interna + conferma cliente via Resend
  data/
    gallery.ts                 foto placeholder + helper URL
supabase/
  schema.sql                 bookings + gallery_images (esegui prima)
  site_images.sql             site_images per il pannello admin (esegui poi)
  booking_availability.sql     disponibilità/capacità + funzione atomica create_booking() (esegui per ultimo)
```

## Deploy

Qualsiasi host Node.js o serverless compatibile con Next.js funziona (Vercel, Netlify, un server Node tradizionale via `npm run build && npm start`). Supabase è obbligatorio in produzione: senza, le prenotazioni non funzionano (nessun fallback locale per il modello a capacità).
