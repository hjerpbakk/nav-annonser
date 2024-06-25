const fs = require("fs");
const path = require("path");

function checkSentence(sentence){

     // Check for contact-information strings
     const contactCheck = /kontaktinf/i.test(sentence);

     // Check for email-address
     const emailCheck = /[a-å0-9._%+-]+@[a-å0-9.-]+\.[a-å]{2,}/i.test(sentence);

     // Check for (Norwegian) phone number
     const nrCheck = /([0-9]{3}\s[0-9]{2}\s[0-9]{3}|[0-9]{2}\s[0-9]{2}\s[0-9]{2}\s[0-9]{2}|[0-9]{8})/i.test(sentence);
     const phoneCheck = /tlf|telefon/i.test(sentence);

     // TODO: Check for names

     if (contactCheck || emailCheck || nrCheck || phoneCheck) {
        return true;
     }

    return false;
}


const removePersonalInfo  = async () => {
    console.log("Started cleaning ads.");

    let cleanedAds = 0;
    let cleanedEmployers = 0;
    let cleanedEmployerDescription = 0;

    try {
        const adsDir = path.join(__dirname, "ads");
        const employerNames = fs.readdirSync(adsDir);

        // Loop over all employers
        //for (let i = 0; i < employerNames.length; i++){
        for (let i = 0; i < 10; i++){
            const filename = fs.readdirSync(path.join(adsDir, employerNames[i]));
            
            // Loop over all ad files
            for (let j = 0; j < filename.length; j++){

                let ad = JSON.parse(fs.readFileSync(path.join(adsDir, employerNames[i], filename[j]), (err, data) => {
                    if (err) throw err;
                    return(data);
                })); 
                
                // Remove personal information from ad description
                let sentences = ad['description'].split(/(\.|<br|<h[1-6])[\s/>]/);
                for (let k = 0; k < sentences.length; k++){

                    personalInformation = checkSentence(sentences[k]);

                    if (personalInformation) {
                        // Remove sentence with personal information
                        //sentences.splice(k,1);
                        sentences[k] = "---PERSONOPPLYSNING---";
                    }
                }
                // Overwrite ad description
                ad['description'] = sentences.join();


                // Remove personal information from employer description
                let employerSentences = ad['employer']['description'];
                for (let k = 0; k < employerSentences.length; k++){
                    
                    personalInformation = checkSentence(employerSentences[k]);

                    if (personalInformation) {
                        employerSentences[k] = "---PERSONOPPLYSNING---";
                        cleanedEmployerDescription++;
                    }
                }
                // Overwrite employer description.
                ad['employer']['description'] = employerSentences.join();


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
        console.log("Cleaned employer descriptions: ", cleanedEmployerDescription);
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