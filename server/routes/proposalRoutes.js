const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  reviewProposal,
  getProposalPDF
} = require('../controllers/proposalController');

// All proposal routes require authentication
router.use(authenticateUser);

// Create a new proposal (student only)
router.post('/', createProposal);

// Get proposals (student = own, reviewer = assigned)
router.get('/', getProposals);

// Get a single proposal by ID
router.get('/:id', getProposalById);

// Update a draft or review_requested proposal (student only)
router.put('/:id', updateProposal);

// Reviewer action on a proposal (FIC + KSAC core)
router.patch('/:id/review', reviewProposal);

// Fetch generated PDF for a proposal
router.get('/:id/pdf', getProposalPDF);

module.exports = router;
