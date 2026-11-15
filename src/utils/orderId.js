/**
 * orderId.js
 * Utility for generating and formatting Order / Ticket IDs.
 * Format: "Ticket" + current year-month-date "2026-11-08" + crescent order number
 * Example: Ticket-2026-11-08-001, Ticket-2026-11-08-002, etc.
 */

/**
 * Format a Date object into "YYYY-MM-DD"
 * @param {Date|string|number} [dateInput]
 * @returns {string} - e.g. "2026-11-08"
 */
export function formatTicketDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const y = fallback.getFullYear();
    const m = String(fallback.getMonth() + 1).padStart(2, '0');
    const day = String(fallback.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Generate the next sequential Ticket ID for a given date.
 *
 * @param {Array} orders - Existing orders list
 * @param {string} [targetDateStr] - Target date string in YYYY-MM-DD format
 * @returns {string} - e.g. "Ticket-2026-11-08-001"
 */
export function generateNextTicketId(orders = [], targetDateStr = formatTicketDate()) {
  let maxSeq = 0;

  if (Array.isArray(orders)) {
    orders.forEach((ord) => {
      if (!ord) return;
      const rawId = ord.ticket_id || ord.custom_order_id || ord.order_id || '';
      // Matches Ticket-YYYY-MM-DD-001 or TicketYYYY-MM-DD-001
      const match = String(rawId).trim().match(/^Ticket-?(\d{4}-\d{2}-\d{2})-?(\d+)$/i);
      if (match) {
        const orderDate = match[1];
        const seq = parseInt(match[2], 10);
        if (orderDate === targetDateStr && !isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    // Fallback: if no orders have a formatted ticket_id for this date, count orders created today
    if (maxSeq === 0 && orders.length > 0) {
      const todayCount = orders.filter((ord) => {
        if (!ord) return false;
        const d = ord.createdAt?.toDate ? ord.createdAt.toDate() : ord.createdAt;
        return formatTicketDate(d) === targetDateStr;
      }).length;
      maxSeq = todayCount;
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return `Ticket-${targetDateStr}-${padded}`;
}

/**
 * Return display Ticket ID for an order.
 * If order already has ticket_id, use it. Otherwise, compute a consistent ID based on creation time.
 *
 * @param {Object} order - Order object
 * @param {Array} [allOrders] - List of all orders
 * @returns {string} - e.g. "Ticket-2026-11-08-001"
 */
export function getOrderDisplayId(order, allOrders = []) {
  if (!order) return '';
  if (order.ticket_id) return order.ticket_id;
  if (order.custom_order_id) return order.custom_order_id;
  if (typeof order.order_id === 'string' && order.order_id.startsWith('Ticket-')) {
    return order.order_id;
  }

  // Fallback for legacy orders: determine position among orders on the same day
  const rawDate = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt || new Date());
  const dateStr = formatTicketDate(rawDate);

  const sameDayOrders = (allOrders || [])
    .filter((o) => {
      if (!o) return false;
      const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt || new Date());
      return formatTicketDate(oDate) === dateStr && !o.ticket_id;
    })
    .sort((a, b) => {
      const timeA = (a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime()) || 0;
      const timeB = (b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime()) || 0;
      return timeA - timeB;
    });

  const index = sameDayOrders.findIndex((o) => o.order_id === order.order_id);
  const seqNumber = index >= 0 ? index + 1 : 1;
  return `Ticket-${dateStr}-${String(seqNumber).padStart(3, '0')}`;
}
