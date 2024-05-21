const axios = require("axios");
const fs = require("fs");
const path = require("path");

const fetchAndSaveAds = async () => {
  const url = "https://arbeidsplassen.nav.no/public-feed/api/v1/ads";
  const publishedAfter = "2024-05-21"; // Fetch ads published on or after this date
  const params = {
    published: `[${publishedAfter},*)`,
    size: 100, // Adjust size as needed
    page: 0, // Start at the first page
  };
  const headers = {
    Authorization:
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwdWJsaWMudG9rZW4udjFAbmF2Lm5vIiwiYXVkIjoiZmVlZC1hcGktdjEiLCJpc3MiOiJuYXYubm8iLCJpYXQiOjE1NTc0NzM0MjJ9.jNGlLUF9HxoHo5JrQNMkweLj_91bgk97ZebLdfx3_UQ",
  };

  console.time("fetchAndSaveAds");

  try {
    let morePages = true;
    let lastPageFetched = 0;
    let totalAdsFetched = 0;

    while (morePages) {
      const response = await axios.get(url, { params, headers });
      const data = response.data;

      if (data.content && data.content.length > 0) {
        data.content.forEach((ad) => {
          const employerName =
            ad.employer && ad.employer.name
              ? ad.employer.name.replace(/[\/:*?"<>|]/g, "")
              : "unknown";
          const dirPath = path.join(__dirname, "ads", employerName);

          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }

          const filePath = path.join(dirPath, `${ad.uuid}.json`);
          fs.writeFileSync(filePath, JSON.stringify(ad, null, 2));
        });

        totalAdsFetched += data.content.length;
        console.log(`Total ads fetched so far: ${totalAdsFetched}`);

        lastPageFetched = params.page;
        params.page += 1;
      } else {
        morePages = false;
      }
    }

    const statusFilePath = path.join(__dirname, "status.txt");
    fs.writeFileSync(
      statusFilePath,
      `Published after date: ${publishedAfter}\nLast page fetched: ${lastPageFetched}`
    );

    console.log("All ads have been fetched and saved to disk.");
  } catch (error) {
    console.error("Error fetching ads:", error);
  }

  console.timeEnd("fetchAndSaveAds");
};

if (!fs.existsSync(path.join(__dirname, "ads"))) {
  fs.mkdirSync(path.join(__dirname, "ads"));
}

fetchAndSaveAds();
