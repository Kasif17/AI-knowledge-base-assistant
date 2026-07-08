/**
 * Shared shape references for the app (documented via JSDoc since this
 * is a plain JS project, not TypeScript).
 *
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {"USER"|"ADMIN"} role
 *
 * @typedef {Object} DocumentItem
 * @property {string} _id
 * @property {string} title
 * @property {string} originalName
 * @property {"pdf"|"txt"|"md"} fileType
 * @property {number} fileSize
 * @property {"processing"|"ready"|"failed"} status
 * @property {string} createdAt
 *
 * @typedef {Object} Conversation
 * @property {string} _id
 * @property {string} question
 * @property {string} answer
 * @property {DocumentItem} document
 * @property {string} createdAt
 */

export const FILE_TYPE_LABELS = {
  pdf: "PDF",
  txt: "Text",
  md: "Markdown",
};

export const DOCUMENT_STATUS_LABELS = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.txt,.md";
export const MAX_FILE_SIZE_MB = 10;
