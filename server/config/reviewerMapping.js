/**
 * KSAC Core Reviewer Mapping Configuration
 * 
 * Maps each event type to the list of KSAC Core reviewer emails
 * who must approve proposals of that type.
 * 
 * To update reviewers: change the emails here. UIDs are resolved
 * dynamically from Firestore at proposal creation time.
 */
const REVIEWER_MAPPING = {
  technical: [
    'dean@kiit.ac.in',      // Krishna Maam
    'gipsita@kiit.ac.in',   // Gipsita Maam
    'technical@kiit.ac.in', // Ajit Sir
  ],
  'non-technical': [
    'dean@kiit.ac.in',      // Krishna Maam
    'gipsita@kiit.ac.in',   // Gipsita Maam
    'cultural@kiit.ac.in',  // Hiranmay Sir
  ],
  both: [
    'dean@kiit.ac.in',      // Krishna Maam
    'gipsita@kiit.ac.in',   // Gipsita Maam
    'technical@kiit.ac.in', // Ajit Sir
    'cultural@kiit.ac.in',  // Hiranmay Sir
  ]
};

module.exports = { REVIEWER_MAPPING };
