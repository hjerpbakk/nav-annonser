const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const start = config.startDate;

const validCategories = [
  {
    level1: "Kontor og økonomi",
    level2: "Ledelse, administrasjon og rådgivning",
  },
  { level1: "Salg og service", level2: "Markedsføring og reklame" },
  { level1: "Utdanning", level2: "Forskningsarbeid" },
  { level1: "IT", level2: "Ledere av IKT-enheter" },
  { level1: "Utdanning", level2: "Ledere av undervisning og utdanning" },
  { level1: "Industri og produksjon", level2: "Fysikk, kjemi og metallurgi" },
  { level1: "Natur og miljø", level2: "Naturvitenskapelige yrker" },
  { level1: "Natur og miljø", level2: "Biologer, zoologer, botanikere" },
  { level1: "Natur og miljø", level2: "Miljøvern" },
  { level1: "Bygg og anlegg", level2: "Ingeniør miljøteknikk" },
  { level1: "Industri og produksjon", level2: "Maskinteknikk og mekanikk" },
  { level1: "Industri og produksjon", level2: "Elektro/elektronikk" },
  { level1: "Bygg og anlegg", level2: "Arealplanlegging og arkitektur" },
  { level1: "IT", level2: "Interaksjonsdesign" },
  { level1: "Utdanning", level2: "Universitet og høyskole" },
  { level1: "Utdanning", level2: "Videregående skole" },
  { level1: "Utdanning", level2: "Instruktører  og pedagoger" },
  {
    level1: "Kontor og økonomi",
    level2: "Kontor, forvaltning og saksbehandling",
  },
  {
    level1: "Kontor og økonomi",
    level2: "Personal, arbeidsmiljø og rekruttering",
  },
  { level1: "IT", level2: "Utvikling" },
  { level1: "Bygg og anlegg", level2: "Ingeniør bygg" },
  { level1: "Industri og produksjon", level2: "Olje, gass og bergverk" },
  { level1: "Industri og produksjon", level2: "Arbeidsleder, industri" },
  { level1: "Bygg og anlegg", level2: "Arbeidsleder, bygg og anlegg" },
  { level1: "Industri og produksjon", level2: "Jern og metall" },
  { level1: "Natur og miljø", level2: "Skogbruk, gartnerarbeid og hagebruk" },
  { level1: "Kontor og økonomi", level2: "Økonomi, statistikk og regnskap" },
  { level1: "Transport og lager", level2: "Speditør og befrakter" },
  { level1: "Kontor og økonomi", level2: "Juridisk arbeid" },
  {
    level1: "Sikkerhet og beredskap",
    level2: "Vakt-, sikrings- og kontrollarbeid",
  },
  {
    level1: "Kultur og kreative yrker",
    level2: "Design, grafisk arbeid og illustrasjon",
  },
  { level1: "IT", level2: "Drift, vedlikehold" },
  { level1: "Håndverkere", level2: "Elektriker/elektro" },
  { level1: "Transport og lager", level2: "Logistikk, lagerarbeid og innkjøp" },
  { level1: "Salg og service", level2: "Post og måleavlesere" },
  { level1: "Håndverkere", level2: "Murer" },
  { level1: "Håndverkere", level2: "Betongfagarbeider" },
  { level1: "Håndverkere", level2: "Tømrer og snekker" },
  { level1: "Håndverkere", level2: "Maler" },
  { level1: "Håndverkere", level2: "Rørlegger" },
  { level1: "Håndverkere", level2: "Platearbeider og sveiser" },
  { level1: "Håndverkere", level2: "Mekaniker" },
  { level1: "Industri og produksjon", level2: "Trevarearbeid og –foredling" },
  { level1: "Bygg og anlegg", level2: "Skytebaser og sprengningsarbeidere" },
  { level1: "Håndverkere", level2: "Øvrige håndverksyrker" },
  { level1: "Transport og lager", level2: "Tog-, sporvogn- og vegtrafikk" },
  { level1: "Bygg og anlegg", level2: "Maskin- og kranfører" },
  { level1: "Transport og lager", level2: "Truckfører" },
  { level1: "Bygg og anlegg", level2: "Hjelpearbeider Bygg og anlegg" },
  { level1: "Industri og produksjon", level2: "Andre hjelpearbeidere" },
];

const fetchAndSaveAds = async () => {
  const baseURL = "https://arbeidsplassen.nav.no/public-feed/api/v1/ads";
  const end = new Date(new Date().toISOString().split("T")[0]);
  const headers = {
    Authorization:
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwdWJsaWMudG9rZW4udjFAbmF2Lm5vIiwiYXVkIjoiZmVlZC1hcGktdjEiLCJpc3MiOiJuYXYubm8iLCJpYXQiOjE1NTc0NzM0MjJ9.jNGlLUF9HxoHo5JrQNMkweLj_91bgk97ZebLdfx3_UQ",
  };

  console.time("fetchAndSaveAds");

  try {
    let totalAdsFetched = 0;
    let currentDate = new Date(start);
    while (currentDate < end) {
      let dayLater = new Date(currentDate);
      dayLater.setDate(dayLater.getDate() + 1);
      const dateRange = `[${currentDate.toISOString().split("T")[0]}, ${
        dayLater.toISOString().split("T")[0]
      })`;

      let adsPrDay = 0;
      let morePages = true;
      let page = 0;

      while (morePages) {
        const params = {
          published: dateRange,
          size: 100,
          page: page,
        };

        const response = await axios.get(baseURL, { params, headers });
        const data = response.data;

        if (data.content && data.content.length > 0) {
          data.content.forEach((ad) => {
            const isValidCategory =
              ad.occupationCategories &&
              ad.occupationCategories.some((category) =>
                validCategories.some(
                  (validCategory) =>
                    validCategory.level1 === category.level1 &&
                    validCategory.level2 === category.level2
                )
              );

            if (isValidCategory) {
              const employerName =
                ad.employer && ad.employer.name
                  ? ad.employer.name.replace(/[\/:*?"<>|]|\n/g, "")
                  : "unknown";
              const dirPath = path.join(__dirname, "ads", employerName);
              if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
              }
              const filePath = path.join(dirPath, `${ad.uuid}.json`);
              fs.writeFileSync(filePath, JSON.stringify(ad, null, 2));
              adsPrDay++;
              totalAdsFetched++;
            }
          });

          page++;
        } else {
          morePages = false;
          console.log(
            `${adsPrDay} ads fetched between ${
              currentDate.toISOString().split("T")[0]
            } and ${dayLater.toISOString().split("T")[0]}`
          );
        }
      }

      currentDate = dayLater;
    }

    console.log(
      `${totalAdsFetched} have been fetched between ${
        start.toISOString().split("T")[0]
      } and ${end.toISOString().split("T")[0]}`
    );
    end.setDate(end.getDate() - 1);
    const statusFilePath = path.join(__dirname, "ads", "status.txt");
    fs.writeFileSync(
      statusFilePath,
      `Ads fetched until : ${end.toISOString().split("T")[0]}`
    );
  } catch (error) {
    console.error("Error fetching ads:", error);
  }

  console.timeEnd("fetchAndSaveAds");
};

if (!fs.existsSync(path.join(__dirname, "ads"))) {
  fs.mkdirSync(path.join(__dirname, "ads"));
}

fetchAndSaveAds();
