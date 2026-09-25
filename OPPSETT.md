# Oppsett: Bygghjelp1 (bygghjelp1.no)

Varig, praktisk dokumentasjon for hvordan nettsiden er satt opp. Kan brukes som mal for andre statiske sider (samme mønster: Domeneshop DNS + Netlify hosting + ImprovMX mottak).

**Repo:** [BadenDag/bygghjelp1](https://github.com/BadenDag/bygghjelp1)  
**Lokal mappe:** `~/Documents/Nettside filer/bygghjelp1.no`  
**Domene:** `bygghjelp1.no`  
**Sist oppdatert:** september 2026

---

## 1. Mål / stack

| Del | Valg |
|-----|------|
| Side | Statisk HTML/CSS/JS (ingen Node-build) |
| Hosting | Netlify |
| Domene | `bygghjelp1.no` (+ `www`) |
| DNS | Domeneshop (`ns*.hyp.net`) |
| E-postmottak | ImprovMX → Gmail |
| SEO | `robots.txt` + `sitemap.xml` + Google Search Console |

Målet: én enkel, billig stack der DNS og e-post ikke ødelegges når nettsiden går live.

---

## 2. Leverandører — hva hver gjør

| Leverandør | Rolle |
|------------|--------|
| **Domeneshop** | Registrar (kjøp/fornying av `.no`) **og** DNS-eier. Nameservere forblir hos Domeneshop. Hit settes A, CNAME, MX, TXT (SPF, Search Console). |
| **Netlify** | Hosting av den statiske siden. Kobles til GitHub. Får **ikke** DNS/nameservere. |
| **GitHub** (`BadenDag/bygghjelp1`) | Kildekode. Push til `main` → Netlify publiserer automatisk. |
| **ImprovMX** | E-post**mottak**: alias (`*` og `post@`) videresendes til Gmail. Gratis for mottak. |
| **Google Search Console** | Eierskap/verifisering av domenet og oversikt over indeksering. |

**Ikke bland:** Resend (eller lignende) er API for **utsending** av e-post fra apper — ikke innboks/mottak. Det erstatter ikke ImprovMX/MX.

---

## 3. Hovedregel (DNS)

**Behold nameservere hos Domeneshop** (`ns1.hyp.net`, `ns2.hyp.net`, `ns3.hyp.net`).

**ALDRI** flytt DNS / nameservere til Netlify.

### Hvorfor (badengress-lærdom)

På badengress.no ble nameservere flyttet til Netlify DNS. Da forsvant MX-postene, og e-postmottak sluttet å fungere. Netlify trenger bare A- og CNAME-poster hos den eksisterende DNS-eieren — ikke hele DNS-sonen.

**Sjekk etter endringer:**

```bash
dig bygghjelp1.no NS +short     # skal være ns1/2/3.hyp.net
dig bygghjelp1.no MX +short     # skal vise Improvmx (ikke tom)
dig bygghjelp1.no A +short      # Netlify apex
dig www.bygghjelp1.no CNAME +short
```

---

## 4. E-post

### Prototyp (nåværende)

| Del | Valg |
|-----|------|
| Domeneshop-pakke | **«DNS»** (ikke Epost-abonnement) |
| Mottak | ImprovMX gratis |
| Alias | `*` (catch-all) og `post@` → Gmail |
| Flere mottakere | Kommaseparert i ImprovMX (f.eks. `en@gmail.com, to@gmail.com`) |

### DNS for e-post (hos Domeneshop)

| Type | Navn | Verdi | Prioritet |
|------|------|--------|-----------|
| **MX** | `@` | `mx1.improvmx.com` | 10 |
| **MX** | `@` | `mx2.improvmx.com` | 20 |
| **TXT** (SPF) | `@` | `v=spf1 include:spf.improvmx.com ~all` | — |

### Sending som `dag@` / `post@`

Gratis ImprovMX dekker **mottak** (videresending til Gmail). Å **sende** med egen adresse i Fra-feltet krever oppgradering senere, f.eks.:

- ImprovMX Premium (SMTP), eller
- Domeneshop Epost-abonnement, eller
- Google Workspace

### Resend

Resend = utsending via API. Brukes **ikke** til innboks. Ikke sett Resend-MX hvis målet er vanlig postmottak.

---

## 5. Web DNS (hos Domeneshop)

| Type | Navn | Verdi | Merknad |
|------|------|--------|---------|
| **A** | `@` (apex) | `75.2.60.5` | Netlify load balancer for custom domains |
| **CNAME** | `www` | `bygghjelp1.netlify.app` | www → Netlify-site |

**Ikke** aktiver Domeneshop «WWW-videresending» / web forwarding. Bruk ekte DNS-poster (A + CNAME) slik at HTTPS og Netlify-sertifikat fungerer rent.

Etter at domenet er lagt til i Netlify, bør HTTPS/sertifikat komme automatisk når DNS peker riktig.

---

## 6. Netlify

1. Ny site → **Connect to GitHub** → repo `BadenDag/bygghjelp1`.
2. **Build command:** tom / ingen.
3. **Publish directory:** `/` (root) — siden er ferdig HTML.
4. **Custom domain:** legg til `bygghjelp1.no` og `www.bygghjelp1.no`.
5. **Ikke** bytt til Netlify DNS — velg å beholde eksterne nameservere og kopier bare A/CNAME til Domeneshop (se §5).

Deploy: push til `main` → Netlify bygger ikke noe, publiserer root direkte.

---

## 7. SEO

### I repoet

- `robots.txt` — `Allow: /` + peker til sitemap
- `sitemap.xml` — alle hovedsider med `https://bygghjelp1.no/...`

### Google Search Console

1. Legg til eiendom som **domene** (`bygghjelp1.no`), ikke bare URL-prefiks.
2. Verifiser med **TXT**-record hos Domeneshop (verdi fra Search Console).
3. Etter verifisering: send inn sitemap (`https://bygghjelp1.no/sitemap.xml`).

### Indeksering på nye `.no`

Nye norske domener kan midlertidig vise f.eks. «robots.txt unreachable» i Search Console selv om filen er live. Det er ofte **forsinkelse** hos Google — vent og prøv live-test / indeksering på nytt etter noen timer/dager. Verifiser lokalt først:

```bash
curl -sI https://bygghjelp1.no/robots.txt
curl -sI https://bygghjelp1.no/sitemap.xml
```

---

## 8. Steg-for-steg checklist (ny side / nytt domene)

Bytt `dittdomene.no` og `ditt-repo` gjennomgående.

### A. Domene og DNS-eier

- [ ] Kjøp domenet hos **Domeneshop**
- [ ] Bekreft nameservere: `ns1/2/3.hyp.net` (ikke bytt)
- [ ] Velg Domeneshop-pakke **DNS** (ikke Epost) hvis du bruker ImprovMX for mottak

### B. E-postmottak

- [ ] Opprett ImprovMX-konto for domenet
- [ ] Sett alias `*` og `post@` → ønsket Gmail (evt. flere, kommaseparert)
- [ ] Legg inn MX: `mx1.improvmx.com` (10), `mx2.improvmx.com` (20)
- [ ] Legg inn SPF: `v=spf1 include:spf.improvmx.com ~all`
- [ ] Test: send e-post til `post@dittdomene.no` og catch-all

### C. GitHub + Netlify

- [ ] Repo med statisk HTML i root (eller dokumenter publish-mappa)
- [ ] Netlify: connect GitHub, **ingen build**, publish `/`
- [ ] Add custom domain i Netlify (**uten** Netlify DNS)

### D. Web DNS

- [ ] A `@` → `75.2.60.5`
- [ ] CNAME `www` → `dittsite.netlify.app`
- [ ] **Ikke** WWW-videresending hos Domeneshop
- [ ] Sjekk at MX fortsatt finnes etter A/CNAME
- [ ] Vent på HTTPS i Netlify

### E. SEO

- [ ] Legg `robots.txt` + `sitemap.xml` i repo
- [ ] Search Console: domain-verifisering via TXT hos Domeneshop
- [ ] Send inn sitemap
- [ ] Ved midlertidig «unreachable»: vent og retry (nye `.no` kan lagge)

### F. Innhold

- [ ] Oppdater `mailto:` / kontaktinfo til nye adresser når mottak er testet
- [ ] Push til `main` og verifiser live-URL

---

## 9. Hva som er gjort (september 2026)

Kort tidslinje for Bygghjelp1:

1. **Domene kjøpt** — `bygghjelp1.no` hos Domeneshop.
2. **E-post** — MX/SPF for ImprovMX; alias `*` og `post@` → Gmail; Domeneshop DNS-pakke (ikke Epost).
3. **Netlify** — GitHub `BadenDag/bygghjelp1` koblet; publish root, ingen build; custom domain uten Netlify DNS.
4. **Web DNS** — A apex → `75.2.60.5`; CNAME `www` → `bygghjelp1.netlify.app`.
5. **Live HTTPS** — siden tilgjengelig på `https://bygghjelp1.no`.
6. **Innhold synket** — siste HTML/CSS/assets publisert via GitHub → Netlify.
7. **Search Console** — domain-eierskap verifisert (TXT hos Domeneshop).
8. **SEO-filer** — `robots.txt` og `sitemap.xml` i repo og live.

---

## 10. Vanlige fallgruver

| Fallgruve | Konsekvens | Gjør i stedet |
|-----------|------------|----------------|
| Bytte nameservere til Netlify | MX forsvinner; e-post dør (badengress) | Behold `ns*.hyp.net`; bare A/CNAME til Netlify |
| Aktivere WWW-/web-videresending hos Domeneshop | Rot med HTTPS, sertifikat, redirect-loop | Ekte A + CNAME |
| Slette MX når man legger inn A-record | Ingen e-postmottak | Legg A/CNAME **ved siden av** eksisterende MX |
| Domeneshop SPF-veiviser uten ImprovMX | Feil eller mangelfull SPF | Bruk `include:spf.improvmx.com` eksplisitt |
| Anta at Resend = innboks | Ingen vanlig mottak | ImprovMX (eller Domeneshop Epost / Workspace) for mottak |
| Glemme at nye `.no` lagges i Google | Unødvendig panikk over «robots.txt unreachable» | Verifiser med `curl`; retry Search Console senere |

---

## Hurtigreferanse DNS (bygghjelp1.no)

```
NS   @     ns1.hyp.net / ns2.hyp.net / ns3.hyp.net
A    @     75.2.60.5
CNAME www  bygghjelp1.netlify.app
MX   @     mx1.improvmx.com  (10)
MX   @     mx2.improvmx.com  (20)
TXT  @     v=spf1 include:spf.improvmx.com ~all
TXT  @     (Google Search Console-verifisering — verdi fra GSC)
```

---

*Mal-tips: kopier denne filen til et nytt repo, erstatt domenenavn, Netlify-site-URL, GitHub-repo og ImprovMX-alias — følg deretter checklisten i §8.*
