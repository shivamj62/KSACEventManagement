require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { db } = require('../config/firebase');
const { generateProposalId } = require('../utils/counter');
const { sendEmailOnStatusChange } = require('../services/emailService');
const { generateProposalPDF } = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🚀 Starting Backend Service Tests...');

  try {
    // 1. Test ID Generation
    console.log('\n1️⃣ Testing ID Generation...');
    const newId = await generateProposalId();
    console.log(`✅ Success! Generated ID: ${newId}`);

    // 2. Test PDF Generation
    console.log('\n2️⃣ Testing PDF Generation (Puppeteer)...');
    const mockData = {
      proposalId: newId,
      studentName: 'Test Student',
      studentEmail: process.env.GMAIL_USER, // Sending to yourself for testing
      formData: {
        eventName: 'Tech Genesis 2024',
        clubName: 'KSAC Technical Club',
        eventEdition: '1st Edition',
        about: 'This is a test event for backend verification.',
        budget: [
          { item: 'Inauguration', quantity: 1, unitCost: 5000, totalCost: 5000, notes: 'Stage setup' }
        ]
      }
    };
    
    const pdfBuffer = await generateProposalPDF(mockData);
    const testPdfPath = path.join(__dirname, 'test-output.pdf');
    fs.writeFileSync(testPdfPath, pdfBuffer);
    console.log(`✅ Success! PDF generated at: ${testPdfPath}`);

    // 3. Test Email Service
    console.log('\n3️⃣ Testing Email Service (Nodemailer)...');
    console.log(`(Sending to: ${process.env.GMAIL_USER})`);
    
    // Simulate an 'accepted' status change which triggers email + PDF attachment
    const emailData = {
      ...mockData,
      pdfBase64: pdfBuffer.toString('base64')
    };
    
    await sendEmailOnStatusChange(newId, emailData, 'accepted');
    console.log('✅ Success! Check your inbox for the acceptance email and PDF.');

    console.log('\n✨ All backend services verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    process.exit(1);
  }
}

runTests();
