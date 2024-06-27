const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");

// Diagnostics  
let nameCounter = 0;
let manualCounter = 0;

// Open readline if in manual mode
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Initialise empty array of already checked phrases
let checkedPhrases = [];

function manualCheck(phrase, sentence){
    // Function for removing 'phrase' manually¨

    // Has phrase been checked before? 
    // If so it is not a name.
    if (checkedPhrases.includes(phrase)) {return false;}

    console.log(`Context: ${sentence.replace(/^\s+|\s+$/g,"")}`);
    console.log(`Match: ${phrase.replace(/^\s+|\s+$/g, "")}`);

    return new Promise((resolve) => {
        rl.question(">", (answer) => {
            manualCheck++;
            if (answer === "y") {resolve(true);}

            // Remember answer if not personal information
            checkedPhrases.push(phrase);

            resolve(false);
        });
    });
}

async function checkSentence(sentence){

    // Check for contact-information strings
    const contactCheck = /spørsmål|kontakt|contact/i.test(sentence);

    // Check for email-address
    const emailCheck = /[a-å0-9._%+-]+(@|&#64;)[a-å0-9.-]+\.[a-å]{2,}/i.test(sentence);

    // Check for (Norwegian) phone number
    const nrCheck = /([0-9]{3}\s[0-9]{2}\s[0-9]{3}|[0-9]{2}\s[0-9]{2}\s[0-9]{2}\s[0-9]{2}|[0-9]{8})/i.test(sentence);
    const phoneCheck = /tlf|telefon|tel/i.test(sentence);

    // Perform trivial checks
    if (contactCheck || emailCheck || nrCheck || phoneCheck) {
        return true;
    }

    // Check for names
    const nameRegex = /\b[A-ZÆØÅ][a-zæøå]+ [A-ZÆØÅ][a-zæøå]+\b/g;
    const nameCheck = nameRegex.test(sentence);

    nameCounter += Number(nameCheck);
    if (config.skipManual){return config.nonManualDefault;};
    // Skip manual categorisation. See config.js.

    if (nameCheck) {
        const matches = sentence.match(nameRegex);
        let manCheck = false;
        
        for (let l = 0; l < matches.length; l++){
            manCheck = await manualCheck(matches[l], sentence);
            if (manCheck) {return true;};
        }
    }
    return false;
}


const removePersonalInfo  = async () => {
    // Diagnostics
    console.time("removePersonalInfo");
    console.log("Started cleaning ads.");

    let cleanedAds = 0;
    let cleanedEmployers = 0;
    let cleanedEmployerDescription = 0;

    try {
        const adsPath = path.join(__dirname, "ads");
        const employerNames = fs.readdirSync(adsPath);

        // Need to remove status.txt from ads-folder
        const statusIndex = employerNames.indexOf("status.txt");
        employerNames.splice(statusIndex, 1);

        // Loop over all employers
        for (let i = 0; i < employerNames.length; i++){
            const filename = fs.readdirSync(
                                path.join(
                                    adsPath, 
                                    employerNames[i]
                                )
                            );
            
            // Loop over all ad files
            for (let j = 0; j < filename.length; j++){

                let ad = JSON.parse(
                    fs.readFileSync(
                        path.join(
                            adsPath, 
                            employerNames[i], 
                            filename[j]
                        ), (err, data) => {
                    if (err) throw err;
                    return(data);
                })); 

                // Remove personal information from ad description
                let sentences = ad['description']
                                    .split(/((?<![A-ZÆØÅ])\.|<p|<h[1-6]|<br|<li)(\s| \/>| >|>)/);
                for (let k = 0; k < sentences.length; k++){

                    personalInformation = await checkSentence(sentences[k]);

                    if (personalInformation) {
                        // Remove sentence with personal information
                        sentences[k] = config.anonymityString;
                    }
                }
                
                if (sentences.join() == config.anonymityString){
                   // Diagnostic
                    console.log(ad['description']);
                    exit();
                }

                // Overwrite ad description
                ad['description'] = sentences.join("");


                // Remove personal information from employer description if there is any
                if (ad['employer']['description']) {
                    let employerSentences = ad['employer']['description'].split(/(?<![A-ZÆØÅ])\./);

                    for (let k = 0; k < employerSentences.length; k++){
                    
                        personalInformation = await checkSentence(employerSentences[k]);
    
                        if (personalInformation) {
                            employerSentences[k] = config.anonymityString;
                            cleanedEmployerDescription++;
                        }
                    }
                    // Overwrite employer description.
                    ad['employer']['description'] = employerSentences.join(".");
                }
                

                // Write cleaned ad to file
                const dirPath = path.join(__dirname, "cleanAds", employerNames[i]);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
                const filePath = path.join(dirPath, `${filename[j]}`);
                fs.writeFileSync(filePath, JSON.stringify(ad, null, 2));

                cleanedAds++;
            }

            cleanedEmployers++;
        }

        // Close readline after all manual intervention is completed
        if (!config.skipManual){ rl.close();};

        // Add marker in status.txt
        const adStatusPath = path.join(__dirname, "ads", "status.txt");
        const cleanAdStatusPath = path.join(__dirname, "cleanAds", "status.txt");

        const statusFile = fs.readFileSync(adStatusPath);
        const newStatus = `${statusFile}\nAll ads cleaned.`;

        fs.writeFileSync(cleanAdStatusPath, newStatus);

        if (config.removeRawAds) {
            fs.rm(adsPath, {recursive : true}, err => {
                if (err){
                    throw err;
                }

                console.log("Raw ads deleted.")
            });
        }

        // Diagnostics
        console.log("Cleaned", cleanedAds, "ads");
        console.log("from", cleanedEmployers, "employers.");
        console.log("Cleaned employer descriptions: ", cleanedEmployerDescription);
        console.log("Potential names", nameCounter);
        console.log("Manual checks:", manualCounter);
    } catch (error) {
        console.log("Error in anonymisation: ", error);
    }
    console.timeEnd("removePersonalInfo");
};

if (!fs.existsSync(path.join(__dirname, "ads"))) {
    console.log("No ads found.");
} else {
    console.log("Ad folder found.");

    removePersonalInfo();
}