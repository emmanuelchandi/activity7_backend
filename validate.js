// Validation rules from the shared data agreement (same as Activity 6).

const STATUSES = ["Pending", "In progress", "Completed"];
const MAX_ID = 2147483647; // largest id the database can store

const TEXT_RULES = [
  { field: "title", label: "Title", min: 3, max: 80 },
  { field: "category", label: "Category", min: 2, max: 40 },
  { field: "description", label: "Description", min: 5, max: 300 }
];

// Returns a positive whole number, or null when the id is not valid.
function parseId(value) {
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

// Checks the four editable fields. Any id sent by the client is ignored.
// Returns { value } with trimmed text, or { error } with a clear message.
function validateRecord(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object with title, category, description and status." };
  }

  const value = {};

  for (const rule of TEXT_RULES) {
    const raw = body[rule.field];
    if (raw === undefined || raw === null) {
      return { error: `${rule.label} is required.` };
    }
    if (typeof raw !== "string") {
      return { error: `${rule.label} must be text.` };
    }
    const text = raw.trim();
    if (text.length < rule.min || text.length > rule.max) {
      return { error: `${rule.label} must have ${rule.min} to ${rule.max} characters.` };
    }
    value[rule.field] = text;
  }

  const rawStatus = body.status;
  if (rawStatus === undefined || rawStatus === null) {
    return { error: "Status is required." };
  }
  if (typeof rawStatus !== "string") {
    return { error: "Status must be text." };
  }
  const status = rawStatus.trim();
  if (!STATUSES.includes(status)) {
    return { error: "Status must be Pending, In progress or Completed." };
  }
  value.status = status;

  return { value };
}

module.exports = { STATUSES, MAX_ID, parseId, validateRecord };
