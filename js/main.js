/**
 * Ogilvy Automation Portal — Shared Utilities
 */

'use strict';

// ── Toast Notifications ──────────────────────────────────────────

function showNotification(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:1.25rem;right:1.25rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = { success: '#065F46', error: '#991B1B', warning: '#92400E', info: '#1E40AF' };

  const toast = document.createElement('div');
  toast.style.cssText = `background:${colors[type]};color:#fff;padding:0.875rem 1.25rem;border-radius:0.625rem;box-shadow:0 10px 25px rgba(0,0,0,0.15);font-size:0.875rem;font-weight:500;display:flex;align-items:center;gap:0.75rem;max-width:380px;animation:slideIn 0.3s ease;`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;

  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{to{transform:translateX(110%);opacity:0}}';
    document.head.appendChild(style);
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Date / Time Formatting ────────────────────────────────────────

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  const now = new Date();
  const d = new Date(dateString);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 172800) return 'Yesterday';
  return formatDate(dateString);
}

// ── Status Helpers ────────────────────────────────────────────────

function getStatusBadgeHTML(status) {
  const map = {
    pending: '<span class="badge badge-pending">⏳ Pending Approval</span>',
    approved: '<span class="badge badge-approved">✅ Approved</span>',
    rejected: '<span class="badge badge-rejected">❌ Rejected</span>',
    completed: '<span class="badge badge-completed">✔ Completed</span>',
    cancelled: '<span class="badge badge-cancelled">🚫 Cancelled</span>',
    'in-progress': '<span class="badge badge-in-progress">🔄 In Progress</span>',
    'info-requested': '<span class="badge badge-info-requested">📋 Info Requested</span>',
    new: '<span class="badge badge-new">🆕 New</span>',
    open: '<span class="badge badge-urgent">🔓 Open</span>',
    resolved: '<span class="badge badge-approved">✔ Resolved</span>',
    closed: '<span class="badge badge-cancelled">🔒 Closed</span>',
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function getUrgencyBadgeHTML(urgency) {
  const map = {
    urgent: '<span class="badge badge-urgent">🔴 Urgent</span>',
    soon: '<span class="badge badge-soon">🟡 Soon</span>',
    standard: '<span class="badge badge-standard">🟢 Standard</span>',
  };
  return map[urgency] || `<span class="badge">${urgency}</span>`;
}

function getSeverityBadgeHTML(severity) {
  const map = {
    critical: '<span class="badge badge-critical">🚨 Critical</span>',
    high: '<span class="badge badge-high">🔴 High</span>',
    medium: '<span class="badge badge-medium">🟡 Medium</span>',
    low: '<span class="badge badge-low">🟢 Low</span>',
  };
  return map[severity] || `<span class="badge">${severity}</span>`;
}

// ── Form Validation ───────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(formElement) {
  let valid = true;
  // Clear previous errors
  formElement.querySelectorAll('.form-error').forEach(el => el.remove());
  formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  formElement.querySelectorAll('[required]').forEach(input => {
    if (!input.value.trim()) {
      valid = false;
      input.classList.add('error');
      const err = document.createElement('p');
      err.className = 'form-error';
      err.textContent = 'This field is required.';
      input.parentNode.insertBefore(err, input.nextSibling);
    } else if (input.type === 'email' && !validateEmail(input.value)) {
      valid = false;
      input.classList.add('error');
      const err = document.createElement('p');
      err.className = 'form-error';
      err.textContent = 'Please enter a valid email address.';
      input.parentNode.insertBefore(err, input.nextSibling);
    }
  });

  if (!valid) {
    const firstError = formElement.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

// ── Date Picker Helpers ───────────────────────────────────────────

function getNextWeekdays(count = 30) {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  while (dates.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function initDatePicker(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  input.min = minDate.toISOString().split('T')[0];
  input.max = maxDate.toISOString().split('T')[0];

  input.addEventListener('change', () => {
    const val = new Date(input.value);
    const day = val.getDay();
    if (day === 0 || day === 6) {
      input.value = '';
      showNotification('Please select a weekday (Monday–Friday).', 'warning');
    }
  });
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots; // ['09:00','09:30', ... '16:30']
}

function formatTimeSlot(slot) {
  const [h, m] = slot.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function populateTimeSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const slots = generateTimeSlots();
  select.innerHTML = '<option value="">Select a time slot</option>';
  slots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = formatTimeSlot(slot);
    select.appendChild(opt);
  });
}

// ── Timezone ──────────────────────────────────────────────────────

function autoDetectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

function formatTimezone(tz) {
  const offset = new Date().toLocaleTimeString('en', { timeZoneName: 'short', timeZone: tz }).split(' ').pop();
  return `${tz.replace('_', ' ')} (${offset})`;
}

// ── Modal Helpers ─────────────────────────────────────────────────

function showModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function hideModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking backdrop
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => {
      m.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
});

// ── Button Loading State ──────────────────────────────────────────

function toggleLoadingState(btn, isLoading, loadingText = 'Loading...') {
  if (typeof btn === 'string') btn = document.getElementById(btn);
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

// ── Misc Utilities ────────────────────────────────────────────────

function debounce(fn, wait = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// ── Mobile Nav Toggle ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Check URL params for notifications
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === '1') {
    showNotification(params.get('msg') || 'Action completed successfully.', 'success');
  }
  if (params.get('error') === '1') {
    showNotification(params.get('msg') || 'An error occurred.', 'error');
  }

  // Accordion
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.accordion-icon');
      if (content) content.classList.toggle('open');
      if (icon) icon.textContent = content.classList.contains('open') ? '−' : '+';
    });
  });
});
