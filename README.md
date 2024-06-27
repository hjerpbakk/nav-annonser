# NAV-annonser

Enkelt skript som henter annonser publisert hos NAV.

## Kjøring av skriptet

Først installer avhengigheter:

```bash
npm install
```

Se gjennom `config.js` og sjekk innstillingene før du kjører skriptene.
Så kan skriptet kjøres vha:

```bash
npm start
```

Skriptene kan også kjøres separat med:

```bash
npm run fetch           // Hent annonser fra API
npm run anonymise       // Rens annonsene
```

### Manuell navngjenkjenning

For å klare å fjerne personopplysninger ordentlig, og uten tap av fritekstinformasjon, sjekkes fraser identifisert som mulig navn manuelt av bruker. Dette kan kan skrus av om det ikke er ønsket oppførsel. Se `config.js`. 

Du vil en prompt på formatet: 

```bash
Context: Adresse: Østre Aker vei 50, 0581 Oslo. 
Match: Østre Aker
>
```

Om du vil klassifisere dette som en personopplysning skriver du inn `y` før du trykker `Enter`.  
Om du ikke vil klassifisere det som en personopplysning trykker du bare `Enter`. 

Merk at hele setningen(alt som vises etter `Context:`) klassifiseres som en personopplysning og vil bli anonymisert. Om det er flere treff i en enkelt setning vil du får opp hver av disse som et treff. 

## Feilsøking

### Ingen (eller mange) nye annonser

Sjekk at dato er satt riktig i `config.js` i forhold til i `ads/status.txt` (eller `cleanAds/status.txt`). 

### Skriptet feiler med 401

Sjekk at `bearer token` er likt det som er spesifisert på [https://github.com/navikt/pam-public-feed/](https://github.com/navikt/pam-public-feed/).
