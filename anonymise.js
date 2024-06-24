const fs = require("fs");
const path = require("path");

const removePersonalInfo  = async () => {
    console.log("Started cleaning ads.");

    let cleanedAds = 0;
    let cleanedEmployers = 0;

    try {
        const adsDir = path.join(__dirname, "ads");
        const employerNames = fs.readdirSync(adsDir);

        // Loop over all employers
        for (let i = 0; i < employerNames.length; i++){
            const filename = fs.readdirSync(path.join(adsDir, employerNames[i]));
            
            for (let j = 0; j < filename.length; j++){

                let ad = JSON.parse(fs.readFileSync(path.join(adsDir, employerNames[i], filename[j]), (err, data) => {
                    if (err) throw err;
                    return(data);
                })); 
    
                let sentences = ad['description'].split(/(\.|<br|<h[1-6])[\s/>]/);

                let k = 0;
                while (k < sentences.length){
                    // Check for email-address
                    const emailCheck = /[a-å0-9._%+-]+@[a-å0-9.-]+\.[a-å]{2,}/i.test(sentences[k]);

                    // Check for (Norwegian) phone numbers
                    const phoneCheck = /([0-9]{3}\s[0-9]{2}\s[0-9]{3}|[0-9]{2}\s[0-9]{2}\s[0-9]{2}\s[0-9]{2}|[0-9]{8})/i.test(sentences[k]);

                    // TODO: Check for names

                    if (emailCheck || phoneCheck) {
                        // Remove sentence with personal information
                        sentences.splice(k,1);
                    } else {
                        k++;
                    }
                }

                // Overwrite description
                ad['description'] =  sentences.join();

                // Write cleaned ad to file
                const dirPath = path.join(__dirname, "cleanAds", employerNames[i]);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
                const filePath = path.join(dirPath, `${filename[j]}.json`);
                fs.writeFileSync(filePath, JSON.stringify(ad, null, 2));

                cleanedAds++;
            }

            cleanedEmployers++;
        }

        console.log("Cleaned", cleanedAds, "ads");
        console.log("from", cleanedEmployers, "employers.");
    } catch (error) {
        console.log("Error in anonymisation: ", error)
    }

};

if (!fs.existsSync(path.join(__dirname, "ads"))) {
    console.log("No ads found.");
} else {
    console.log("Ad folder found.");
    removePersonalInfo();
}