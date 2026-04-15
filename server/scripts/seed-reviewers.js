const { db, admin } = require('../config/firebase');

const FICS = [
  "Dr. A. Sharma", "Prof. B. Kapoor", "Dr. C. Singh", "Prof. D. Verma", "Dr. E. Das",
  "Prof. F. Khan", "Dr. G. Reddy", "Prof. H. Malhotra", "Dr. I. Joshi", "Prof. J. Nair",
  "Dr. K. Patel", "Prof. L. Gupta", "Dr. M. Rao", "Prof. N. Bose", "Dr. O. Prasad",
  "Prof. P. Kumar", "Dr. Q. Hussain", "Prof. R. Mishra", "Dr. S. Chatterjee", "Prof. T. Iyer",
  "Dr. U. Saxena", "Prof. V. Pandey", "Dr. W. Siddiqui"
];

const CORE_MEMBERS = [
  "Amit Vikram (VP)", "Sneha Roy (Secretary)", "Rahul Dev (Treasurer)", "Priya Singh (Coordinator)"
];

const seedReviewers = async () => {
  console.log("🚀 Starting Seeding Process...");

  try {
    const batch = db.batch();

    // Seed FICs
    FICS.forEach((name, index) => {
      const uid = `fic-dummy-${index + 1}`;
      const userRef = db.collection('users').doc(uid);
      batch.set(userRef, {
        uid,
        name,
        email: `fic${index + 1}@ksac.kiit.ac.in`,
        role: 'fic',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Seed Core Members
    CORE_MEMBERS.forEach((name, index) => {
      const uid = `core-dummy-${index + 1}`;
      const userRef = db.collection('users').doc(uid);
      batch.set(userRef, {
        uid,
        name,
        email: `core${index + 1}@ksac.kiit.ac.in`,
        role: 'ksac_core',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log("✅ Successfully seeded 23 FICs and 4 Core Members!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedReviewers();
