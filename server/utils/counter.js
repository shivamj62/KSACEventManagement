const { db } = require('../config/firebase');

/**
 * Atomically generates a custom sequential ID like KSAC-YYYY-XXXX
 */
const generateProposalId = async () => {
  const counterRef = db.collection('counters').doc('proposals');
  const year = new Date().getFullYear();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      
      let nextId = 1;
      if (doc.exists) {
        const data = doc.data();
        if (data.year === year) {
          nextId = data.count + 1;
        }
      }

      transaction.set(counterRef, {
        count: nextId,
        year: year
      }, { merge: true });

      return nextId;
    });

    const paddedId = result.toString().padStart(4, '0');
    return `KSAC-${year}-${paddedId}`;
  } catch (error) {
    console.error('Error generating proposal ID:', error);
    throw new Error('Failed to generate proposal ID');
  }
};

module.exports = {
  generateProposalId
};
