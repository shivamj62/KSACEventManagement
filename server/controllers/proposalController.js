const { db, admin } = require('../config/firebase');
const { generateProposalId } = require('../utils/counter');
const { sendEmailOnStatusChange } = require('../services/emailService');
const { generateProposalPDF } = require('../services/pdfService');
const { REVIEWER_MAPPING } = require('../config/reviewerMapping');

// ─── Helper: Resolve KSAC Core UIDs from email mapping ───────────────────────
const resolveKsacCoreIds = async (eventType) => {
  const emails = REVIEWER_MAPPING[eventType];
  if (!emails || emails.length === 0) {
    throw new Error(`Invalid or unmapped eventType: "${eventType}". Must be technical, non-technical, or both.`);
  }

  const uids = [];
  for (const email of emails) {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .where('role', '==', 'ksac_core')
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error(`KSAC Core reviewer not found for email: ${email}. Ensure this account is registered with role 'ksac_core'.`);
    }
    uids.push(snapshot.docs[0].id);
  }
  return uids;
};

// ─── Helper: Compute overall status from approvals ───────────────────────────
const computeOverallStatus = (approvals) => {
  const decisions = Object.values(approvals).map(a => a.decision);

  if (decisions.some(d => d === 'rejected')) return 'rejected';
  if (decisions.some(d => d === 'review_requested')) return 'review_requested';
  if (decisions.every(d => d === 'approved')) return 'accepted';
  return 'in_process';
};

const buildInitialApprovals = (ficId, ksacCoreIds) => {
  const approvals = {};
  approvals[ficId] = { role: 'fic', decision: 'pending', comment: '', decidedAt: null };
  ksacCoreIds.forEach(uid => {
    approvals[uid] = { role: 'ksac_core', decision: 'pending', comment: '', decidedAt: null };
  });
  return approvals;
};

// ─── GET /api/proposals ───────────────────────────────────────────────────────
const getProposals = async (req, res) => {
  try {
    const { uid } = req.user;

    // Get the user's role
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found. Please register first.' });
    }
    const { role } = userDoc.data();

    let query;
    if (role === 'student') {
      query = db.collection('proposals').where('studentId', '==', uid);
    } else if (role === 'fic') {
      query = db.collection('proposals').where('ficId', '==', uid);
    } else if (role === 'ksac_core') {
      query = db.collection('proposals').where('ksacCoreIds', 'array-contains', uid);
    } else if (role === 'admin') {
      query = db.collection('proposals');
    } else {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const snapshot = await query.get();
    const proposals = [];
    snapshot.forEach(doc => {
      proposals.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── GET /api/proposals/:id ───────────────────────────────────────────────────
const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const docRef = db.collection('proposals').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Proposal not found.' });
    }

    const data = docSnap.data();

    // Access control
    const isAuthorized =
      data.studentId === uid ||
      data.ficId === uid ||
      (data.ksacCoreIds && data.ksacCoreIds.includes(uid));

    // Also allow admins
    const userDoc = await db.collection('users').doc(uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

    if (!isAuthorized && !isAdmin) {
      return res.status(403).json({ message: 'Access denied to this proposal.' });
    }

    res.status(200).json({ id: docSnap.id, ...data });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── POST /api/proposals ─────────────────────────────────────────────────────
const createProposal = async (req, res) => {
  try {
    const { uid, email } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found in database. Please register a new account.' });
    }

    if (userDoc.data().role !== 'student') {
      return res.status(403).json({ message: `Access Denied: Only students can create proposals (Your role: ${userDoc.data().role})` });
    }

    const { name: studentName } = userDoc.data();
    const { ficId, formData, isDraft } = req.body;

    // Validation
    if (!ficId) return res.status(400).json({ message: 'ficId is required.' });

    const eventType = formData?.eventType;
    if (!eventType) return res.status(400).json({ message: 'formData.eventType is required (technical, non-technical, or both).' });

    // Auto-resolve KSAC Core reviewers based on event type
    let ksacCoreIds;
    try {
      ksacCoreIds = await resolveKsacCoreIds(eventType);
    } catch (resolveErr) {
      return res.status(400).json({ message: resolveErr.message });
    }

    const proposalId = await generateProposalId();
    const status = isDraft ? 'drafting' : 'in_process';
    const approvals = buildInitialApprovals(ficId, ksacCoreIds);

    const proposalData = {
      proposalId,
      studentId: uid,
      studentName,
      studentEmail: email,
      status,
      ficId,
      ksacCoreIds,
      approvals,
      reviewComment: '',
      pdfUrl: '',
      formData: formData || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('proposals').doc(proposalId).set(proposalData);

    // If submitting (not a draft), notify reviewers
    if (!isDraft) {
      await sendEmailOnStatusChange(proposalId, proposalData, 'in_process');
    }

    res.status(201).json({ message: 'Proposal created successfully.', proposalId });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── PUT /api/proposals/:id ──────────────────────────────────────────────────
const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const docRef = db.collection('proposals').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return res.status(404).json({ message: 'Proposal not found.' });

    const data = docSnap.data();

    if (data.studentId !== uid) {
      return res.status(403).json({ message: 'Only the proposal author can edit it.' });
    }

    const editableStatuses = ['drafting', 'review_requested'];
    if (!editableStatuses.includes(data.status)) {
      return res.status(400).json({ message: `Proposal cannot be edited in "${data.status}" status.` });
    }

    const { formData, ficId, isDraft } = req.body;

    const isResubmission = data.status === 'review_requested' && !isDraft;
    const newStatus = isDraft ? data.status : 'in_process';

    // On re-submission after review_requested:
    // ONLY reset the reviewer(s) who requested changes back to pending.
    // Reviewers who already approved keep their approved status — they
    // should not have to re-approve because of someone else's review request.
    let updatedApprovals = data.approvals;
    if (isResubmission) {
      updatedApprovals = Object.fromEntries(
        Object.entries(data.approvals).map(([uid, approval]) => [
          uid,
          approval.decision === 'review_requested'
            ? { ...approval, decision: 'pending', comment: '', decidedAt: null }
            : approval
        ])
      );
    }

    const updatePayload = {
      formData: formData || data.formData,
      status: newStatus,
      approvals: updatedApprovals,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (ficId) updatePayload.ficId = ficId;
    if (isResubmission) updatePayload.reviewComment = '';

    await docRef.update(updatePayload);

    // Notify reviewers when proposal moves to in_process
    // (covers both: drafting→submitted and review_requested→resubmitted)
    if (!isDraft) {
      const updatedDoc = { ...data, ...updatePayload };
      await sendEmailOnStatusChange(id, updatedDoc, 'in_process');
    }

    res.status(200).json({ message: 'Proposal updated successfully.' });
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── PATCH /api/proposals/:id/review ─────────────────────────────────────────
const reviewProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const { decision, comment } = req.body;

    const validDecisions = ['approved', 'rejected', 'review_requested'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Must be: approved | rejected | review_requested' });
    }

    const docRef = db.collection('proposals').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return res.status(404).json({ message: 'Proposal not found.' });

    const data = docSnap.data();

    // Must be a reviewer on this proposal
    if (!data.approvals[uid]) {
      return res.status(403).json({ message: 'You are not a reviewer on this proposal.' });
    }

    if (data.status !== 'in_process') {
      return res.status(400).json({ message: `Cannot review proposal in "${data.status}" status.` });
    }

    // Update this reviewer's decision
    const updatedApprovals = {
      ...data.approvals,
      [uid]: {
        ...data.approvals[uid],
        decision,
        comment: comment || '',
        decidedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    const newStatus = computeOverallStatus(updatedApprovals);

    // Build consolidated review comment for student (all non-approved comments)
    let reviewComment = '';
    if (newStatus === 'review_requested' || newStatus === 'rejected') {
      const comments = Object.values(updatedApprovals)
        .filter(a => a.comment && a.comment.trim() !== '')
        .map(a => `[${a.role.toUpperCase()}]: ${a.comment}`)
        .join('\n\n');
      reviewComment = comments;
    }

    const updatePayload = {
      approvals: updatedApprovals,
      status: newStatus,
      reviewComment,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.update(updatePayload);

    const updatedData = { ...data, ...updatePayload };

    // Trigger side-effects when status changes to a terminal/action state
    if (['accepted', 'rejected', 'review_requested'].includes(newStatus)) {
      // Generate PDF for accepted and review_requested
      if (newStatus === 'accepted' || newStatus === 'review_requested') {
        try {
          const pdfBuffer = await generateProposalPDF(updatedData);
          // For now, save PDF to disk and log — later upload to Firebase Storage
          const pdfBase64 = pdfBuffer.toString('base64');
          await docRef.update({ pdfBase64 }); // temporarily store inline, replace with Storage URL
          updatedData.pdfBase64 = pdfBase64;
        } catch (pdfErr) {
          console.error('PDF generation failed:', pdfErr.message);
        }
      }

      await sendEmailOnStatusChange(id, updatedData, newStatus);
    }

    res.status(200).json({ message: `Review submitted. Proposal status is now: ${newStatus}` });
  } catch (error) {
    console.error('Error reviewing proposal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ─── GET /api/proposals/:id/pdf ───────────────────────────────────────────────
const getProposalPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    const docSnap = await db.collection('proposals').doc(id).get();
    if (!docSnap.exists) return res.status(404).json({ message: 'Proposal not found.' });

    const data = docSnap.data();

    const isAuthorized =
      data.studentId === uid ||
      data.ficId === uid ||
      (data.ksacCoreIds && data.ksacCoreIds.includes(uid));

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied.' });

    // Generate fresh PDF
    const pdfBuffer = await generateProposalPDF(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  reviewProposal,
  getProposalPDF
};
