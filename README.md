# NAV-annonser

Enkelt skript som henter annonser publisert hos NAV.

## Kjøring av skriptet

Først installer avhengigheter:

```bash
npm install
```

Så kan skriptet kjøres vha:

```bash
npm start
```

Skriptene kan også kjøres separat med:

```bash
npm run fetch           // Hent annonser fra API
npm run anonymise       // Rens annonsene
```

## Feilsøking

### Ingen (eller mange) nye annonser

Sjekk at dato er satt riktig i `fetchAndSave.js` i forhold til i `ads/status.txt` (eller `cleanAds/status.txt`). 

### Skriptet feiler med 401

Sjekk at `bearer token` er likt det som er spesifisert på [https://github.com/navikt/pam-public-feed/](https://github.com/navikt/pam-public-feed/).
