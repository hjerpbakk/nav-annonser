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

For å anonymisere annonsene kjør: 

```bash
npm run anonymise
```

## Feilsøking

### Skriptet feiler med 401

Sjekk at `bearer token` er likt det som er spesifisert på [https://github.com/navikt/pam-public-feed/](https://github.com/navikt/pam-public-feed/).
