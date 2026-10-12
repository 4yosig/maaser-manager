/**
 * Utilities Module - Helper functions used throughout the app
 */

/**
 * Format date to MM/DD/YYYY string
 */
export function formatDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Parse date from MM/DD/YYYY string
 */
export function parseDate(dateString) {
  const [month, day, year] = dateString.split('/');
  return new Date(year, parseInt(month) - 1, day);
}

/**
 * Get current date in MM/DD/YYYY format
 */
export function getTodayFormatted() {
  return formatDate(new Date());
}

/**
 * Format currency in NIS
 */
export function formatCurrency(amount) {
  return `₪${amount.toLocaleString('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Get year-month string from date (e.g., "2026-09")
 */
export function getMonthYear(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return {
    yearMonth: `${year}-${month}`,
    year: year,
    month: parseInt(month)
  };
}

/**
 * Get current month-year
 */
export function getCurrentMonthYear() {
  return getMonthYear(new Date());
}

/**
 * Format month-year for display
 */
export function formatMonthYear(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

/**
 * Get Hebrew month name
 */
export function getHebrewMonthName(month) {
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return monthNames[month - 1] || '';
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date) {
  const today = new Date();
  const d = new Date(date);
  return d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Get relative date text (e.g., "היום", "אתמול", "לפני 3 ימים")
 */
export function getRelativeDate(date) {
  const d = new Date(date);
  const today = new Date();
  const diffTime = today - d;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  return `לפני ${Math.floor(diffDays / 365)} שנים`;
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * Debounce a function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Download file to device
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file as text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * CSV export
 */
export function exportToCSV(data, headers, filename) {
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
    });
    csv += values.join(',') + '\n';
  });
  
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get browser notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Send browser notification
 */
export function sendNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231b5e20" width="192" height="192"/><text x="96" y="120" font-size="80" fill="white" text-anchor="middle" font-weight="bold">מ</text></svg>',
      ...options
    });
  }
}
