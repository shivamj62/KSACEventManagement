# KSAC Event Management System - Fixes Log

The following issues have been successfully addressed, tested, and implemented across the frontend and backend architectures of the KSAC Event Proposal Management System.

## 1. Remove "John Doe" dummy placeholders
**Status:** ✅ Fixed
* **Files Affected:** `client/src/pages/Login.jsx`, `client/src/pages/Register.jsx`
* **Changes Made:** Removed all hardcoded default values and placeholders (e.g., "John Doe", dummy emails, dummy student IDs). Replaced them with context-aware placeholders like `"Enter your full name"`, `"Enter your email address"`, and `"Enter your student ID"`.

## 2. Searchable FIC Dropdown with Dark Theme
**Status:** ✅ Fixed
* **Files Affected:** `client/src/pages/proposals/NewProposal.jsx`
* **Changes Made:** Removed the native HTML `<select>` element (which forced a white background on some browsers). Created a custom `SearchableFICDropdown` component featuring a dark glassmorphism aesthetic (`#1f2937`), complete with real-time case-insensitive search filtering, scrollable menus, and click-outside dismissal.

## 3. Preview PDF / Hide PDF Integration
**Status:** ✅ Fixed
* **Files Affected:** `client/src/pages/proposals/ProposalDetail.jsx`
* **Changes Made:** Rewrote the PDF preview logic. It no longer relies on checking a static `pdfUrl` in Firestore (which is often empty while a proposal is in process). Instead, clicking "Preview" fetches a fresh PDF blob on-demand from the server (`GET /api/proposals/:id/pdf`). The file is safely embedded in an `iframe` and cached in state so toggling it open/closed is instantaneous. 

## 4. Download Proposal Functionality
**Status:** ✅ Fixed
* **Files Affected:** `client/src/pages/proposals/ProposalDetail.jsx`
* **Changes Made:** Wired the "Download Proposal" button to the same robust server-side PDF generation endpoint. It converts the incoming blob response to an Object URL (`window.URL.createObjectURL`), attaches it to a hidden anchor tag, and triggers a clean, named file download (e.g., `<proposal-id>-proposal.pdf`) without redirecting the user.

## 5. Event Type Selection replacing KSAC Core Selection
**Status:** ✅ Fixed
* **Files Affected:** `client/src/pages/proposals/NewProposal.jsx`, `server/controllers/proposalController.js`, `server/config/reviewerMapping.js`
* **Changes Made:** 
    * **Frontend:** Removed the confusing "Select 3 of 4 Core Members" multi-select UI. Replaced it with an intuitive "Event Type" selector (`Technical`, `Non-Technical`, `Both`).
    * **Backend Configuration:** Created a mapping configuration that routes `Technical` events to the Technical Dean, `Non-Technical` events to the Cultural Dean, etc.
    * **Backend Enforcement:** The backend now intercepts the proposal upon submission, reads the chosen `eventType`, dynamically searches Firestore by the assigned deans' emails, and maps the exact correct reviewer UIDs automatically. The frontend is completely decoupled from the reviewer IDs.

---
*Generated dynamically based on requested system enhancements.*
