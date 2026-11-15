/**
 * productId.js
 * Utility for generating and parsing sequential Product IDs.
 * Format: "AP" + 4-digit year (e.g. 2026) + 3+ digit sequential number in crescent order
 * Example: AP2026001, AP2026002, AP2026003 ...
 */

/**
 * Generate the next sequential Product ID for the database.
 * Analyzes existing history to find the highest number for the given year,
 * ensuring strict crescent order.
 *
 * @param {Array} history - Array of existing budget/product objects from Firestore
 * @param {number} [targetYear] - The year to generate for (defaults to current year, e.g. 2026)
 * @returns {string} - e.g. "AP2026001"
 */
export function generateNextProductId(history = [], targetYear = new Date().getFullYear()) {
  let maxSeq = 0;

  if (Array.isArray(history)) {
    history.forEach((item) => {
      if (!item) return;
      const rawId = item.customId || item.productId || '';
      // Match AP + 4 digits (year) + optional dash + sequence number
      const match = String(rawId).trim().match(/^AP(\d{4})-?(\d+)$/i);
      if (match) {
        const year = parseInt(match[1], 10);
        const seq = parseInt(match[2], 10);
        if (year === targetYear && !isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    // If no products have customId stored yet, use the total number of items
    // created in targetYear (or total items if date is missing) so existing items
    // don't cause ID collisions
    if (maxSeq === 0 && history.length > 0) {
      const yearCount = history.filter((item) => {
        if (!item || !item.date) return true;
        try {
          return new Date(item.date).getFullYear() === targetYear;
        } catch {
          return true;
        }
      }).length;
      maxSeq = yearCount;
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(3, '0');
  return `AP${targetYear}${paddedSeq}`;
}

/**
 * Return display ID for a product. If the item already has a stored customId, return it.
 * Otherwise, dynamically compute its crescent ID based on its position in history.
 *
 * @param {Object} budget - The budget item
 * @param {Array} history - Full history array
 * @returns {string} - e.g. "AP2026001"
 */
export function getProductDisplayId(budget, history = []) {
  if (!budget) return '';
  if (budget.customId) return budget.customId;
  if (budget.productId) return budget.productId;

  // Fallback: compute crescent order position by chronological date
  const year = budget.date ? new Date(budget.date).getFullYear() : new Date().getFullYear();

  // Filter items in the same year that don't have a stored customId, sorted oldest first
  const unassigned = (history || [])
    .filter((b) => {
      if (!b) return false;
      const bYear = b.date ? new Date(b.date).getFullYear() : year;
      return bYear === year && !b.customId && !b.productId;
    })
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  const index = unassigned.findIndex((b) => b.id === budget.id);
  const seqNumber = (index >= 0 ? index + 1 : 1);
  return `AP${year}${String(seqNumber).padStart(3, '0')}`;
}
