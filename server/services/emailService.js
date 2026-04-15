const nodemailer = require('nodemailer');
const { db } = require('../config/firebase');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// ─── Helper: Fetch email addresses for a list of UIDs ────────────────────────
const getEmailsByUids = async (uids) => {
  const emails = [];
  for (const uid of uids) {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      emails.push({ email: doc.data().email, name: doc.data().name });
    }
  }
  return emails;
};

// ─── Email Templates ─────────────────────────────────────────────────────────
const buildReviewerEmail = (proposalId, eventName, studentName, recipientName) => ({
  subject: `[KSAC] New Proposal for Review: ${eventName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #e94560; margin: 0;">KSAC Proposal Review Request</h2>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${recipientName}</strong>,</p>
        <p>A new event proposal has been submitted by <strong>${studentName}</strong> and requires your review.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px 12px; font-weight: bold;">Proposal ID</td>
            <td style="padding: 8px 12px;">${proposalId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold;">Event Name</td>
            <td style="padding: 8px 12px;">${eventName}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px 12px; font-weight: bold;">Submitted By</td>
            <td style="padding: 8px 12px;">${studentName}</td>
          </tr>
        </table>
        <p>Please log in to your KSAC dashboard to review, approve, reject, or request changes.</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/reviewer"
             style="background: #e94560; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Review Proposal
          </a>
        </div>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">This is an automated email from KSAC Event Management System.</p>
      </div>
    </div>
  `
});

const buildAcceptedEmail = (proposalId, eventName, studentName) => ({
  subject: `[KSAC] 🎉 Your Proposal Has Been Accepted! — ${eventName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f3460; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #4CAF50; margin: 0;">✅ Proposal Accepted</h2>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Congratulations! Your event proposal <strong>${eventName}</strong> (ID: <code>${proposalId}</code>) has been <strong style="color: #4CAF50;">accepted</strong> by all reviewers.</p>
        <p>Please find the approved proposal PDF attached to this email for your records.</p>
        <p>You can now proceed with the event organization as per KSAC guidelines.</p>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">— KSAC Event Management Team</p>
      </div>
    </div>
  `
});

const buildRejectedEmail = (proposalId, eventName, studentName, comments) => ({
  subject: `[KSAC] Proposal Status Update — ${eventName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7b0000; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ff6b6b; margin: 0;">❌ Proposal Rejected</h2>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Unfortunately, your event proposal <strong>${eventName}</strong> (ID: <code>${proposalId}</code>) has been <strong style="color: #e53935;">rejected</strong>.</p>
        ${comments ? `
        <div style="background: #fff3f3; border-left: 4px solid #e53935; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong>Reviewer Comments:</strong>
          <pre style="margin-top: 8px; white-space: pre-wrap; font-family: Arial; font-size: 14px;">${comments}</pre>
        </div>` : ''}
        <p>If you believe this decision was made in error, please contact your Faculty In-Charge directly.</p>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">— KSAC Event Management Team</p>
      </div>
    </div>
  `
});

const buildReviewRequestedEmail = (proposalId, eventName, studentName, comments) => ({
  subject: `[KSAC] Changes Requested on Your Proposal — ${eventName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #e65100; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">🔄 Changes Requested</h2>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your reviewers have requested changes on proposal <strong>${eventName}</strong> (ID: <code>${proposalId}</code>).</p>
        ${comments ? `
        <div style="background: #fff8e1; border-left: 4px solid #FF8F00; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong>Consolidated Reviewer Feedback:</strong>
          <pre style="margin-top: 8px; white-space: pre-wrap; font-family: Arial; font-size: 14px;">${comments}</pre>
        </div>` : ''}
        <p>Please log in to your dashboard, address the feedback, and re-submit your proposal.</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/proposals/${proposalId}/edit"
             style="background: #FF8F00; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Edit & Resubmit Proposal
          </a>
        </div>
        <p style="margin-top: 24px; color: #888; font-size: 12px;">— KSAC Event Management Team</p>
      </div>
    </div>
  `
});

// ─── Main Dispatcher ──────────────────────────────────────────────────────────
const sendEmailOnStatusChange = async (proposalId, proposalData, newStatus) => {
  const {
    studentEmail,
    studentName,
    ficId,
    ksacCoreIds,
    reviewComment,
    formData
  } = proposalData;

  const eventName = formData?.eventName || 'Your Event';

  try {
    if (newStatus === 'in_process') {
      // Notify all reviewers
      const reviewerUids = [ficId, ...ksacCoreIds];
      const reviewers = await getEmailsByUids(reviewerUids);

      for (const reviewer of reviewers) {
        const { subject, html } = buildReviewerEmail(proposalId, eventName, studentName, reviewer.name);
        await transporter.sendMail({
          from: `"KSAC Event System" <${process.env.GMAIL_USER}>`,
          to: reviewer.email,
          subject,
          html
        });
      }
      console.log(`[Email] Sent reviewer notifications for proposal ${proposalId}`);

    } else if (newStatus === 'accepted') {
      const { subject, html } = buildAcceptedEmail(proposalId, eventName, studentName);
      const mailOptions = {
        from: `"KSAC Event System" <${process.env.GMAIL_USER}>`,
        to: studentEmail,
        subject,
        html
      };

      // Attach PDF if available
      if (proposalData.pdfBase64) {
        mailOptions.attachments = [{
          filename: `${proposalId}.pdf`,
          content: Buffer.from(proposalData.pdfBase64, 'base64'),
          contentType: 'application/pdf'
        }];
      }

      await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent acceptance email to ${studentEmail}`);

    } else if (newStatus === 'rejected') {
      const { subject, html } = buildRejectedEmail(proposalId, eventName, studentName, reviewComment);
      await transporter.sendMail({
        from: `"KSAC Event System" <${process.env.GMAIL_USER}>`,
        to: studentEmail,
        subject,
        html
      });
      console.log(`[Email] Sent rejection email to ${studentEmail}`);

    } else if (newStatus === 'review_requested') {
      const { subject, html } = buildReviewRequestedEmail(proposalId, eventName, studentName, reviewComment);
      const mailOptions = {
        from: `"KSAC Event System" <${process.env.GMAIL_USER}>`,
        to: studentEmail,
        subject,
        html
      };

      if (proposalData.pdfBase64) {
        mailOptions.attachments = [{
          filename: `${proposalId}-draft.pdf`,
          content: Buffer.from(proposalData.pdfBase64, 'base64'),
          contentType: 'application/pdf'
        }];
      }

      await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent review-requested email to ${studentEmail}`);
    }
  } catch (error) {
    // Non-fatal: log but don't crash the main flow
    console.error(`[Email] Failed to send email for status "${newStatus}":`, error.message);
  }
};

module.exports = { sendEmailOnStatusChange };
