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

    // Also count unassigned items for this year to avoid potential sequence collisions
    const unassignedCount = history.filter((item) => {
      if (!item) return false;
      const rawId = item.customId || item.productId || '';
      const hasId = rawId && String(rawId).trim() !== '';
      if (hasId) return false;
      try {
        const itemYear = item.date ? new Date(item.date).getFullYear() : targetYear;
        return itemYear === targetYear;
      } catch {
        return true;
      }
    }).length;

    if (unassignedCount > maxSeq) {
      maxSeq = unassignedCount;
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(3, '0');
  return `AP${targetYear}${paddedSeq}`;
}

/**
 * Return display ID for a product. If the item already has a stored customId, return it.
 * Otherwise, dynamically compute its crescent ID based on its position in history,
 * ensuring no collisions with already assigned IDs.
 *
 * @param {Object} budget - The budget item
 * @param {Array} history - Full history array
 * @returns {string} - e.g. "AP2026001"
 */
export function getProductDisplayId(budget, history = []) {
  if (!budget) return '';
  if (budget.customId && String(budget.customId).trim() !== '') return String(budget.customId).trim();
  if (budget.productId && String(budget.productId).trim() !== '') return String(budget.productId).trim();

  // Fallback: compute crescent order position by chronological date
  const year = budget.date ? new Date(budget.date).getFullYear() : new Date().getFullYear();

  // Collect all already assigned sequence numbers for this year to avoid collisions
  const assignedSeqs = new Set();
  (history || []).forEach((b) => {
    if (!b) return;
    const rawId = b.customId || b.productId || '';
    const match = String(rawId).trim().match(/^AP(\d{4})-?(\d+)$/i);
    if (match && parseInt(match[1], 10) === year) {
      assignedSeqs.add(parseInt(match[2], 10));
    }
  });

  // Filter items in the same year that don't have a stored customId, sorted oldest first
  const unassigned = (history || [])
    .filter((b) => {
      if (!b) return false;
      const bYear = b.date ? new Date(b.date).getFullYear() : year;
      const hasId = (b.customId && String(b.customId).trim() !== '') || (b.productId && String(b.productId).trim() !== '');
      return bYear === year && !hasId;
    })
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  const index = unassigned.findIndex((b) => b.id === budget.id);
  const targetIndex = index >= 0 ? index : unassigned.length;

  let currentSeq = 1;
  let availableCount = 0;
  while (true) {
    if (!assignedSeqs.has(currentSeq)) {
      if (availableCount === targetIndex) {
        return `AP${year}${String(currentSeq).padStart(3, '0')}`;
      }
      availableCount++;
    }
    currentSeq++;
  }
}
