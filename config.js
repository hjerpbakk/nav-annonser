// Initialise config
var config = {};

// This is the date to start fetching ads from. The script fetches ads from this
// date until today. Check ads/status.txt or cleanAds/status.txt for the last date fetched.
config.startDate = new Date("2024-06-11");

/* Anonymisation settings*/

config.anonymityString = "---PERSONOPPLYSNING---";

// This setting controls if manual checks of name candidates are completed.
// If this is set to false the user will have to manually go through all patterns that 
// look like names and classify them.
config.skipManual = false;

// If config.skipManual is true all name-candidates(phrases) are counted as 
// personal information according to this value. 
// true     - All phrases are considered names and anonymised.
// false    - Phrases are by default not considered names
//            Note: Names may pass this filter unanonymised if set to false.
config.nonManualDefault = false;

// Set to false if raw ads should be retained after anonymisation script is run.
config.removeRawAds = false;

// Export config
module.exports = config;