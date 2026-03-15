/**
 * Ogilvy Automation Portal — Admin Panel JavaScript
 */

'use strict';

// ── Auth ──────────────────────────────────────────────────────────

async function checkAdminAuth() {
  // Demo mode: check sessionStorage
  if (sessionStorage.getItem('admin_demo') === 'true') {
    updateAdminUI(sessionStorage.getItem('admin_email') || 'admin@ogilvy.com');
    return true;
  }

  if (!supabaseClient) {
    // No Supabase configured: redirect to login unless demo flag set
    if (!sessionStorage.getItem('admin_demo')) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }
  updateAdminUI(session.user.email);
  return true;
}

function updateAdminUI(email) {
  const emailEls = document.querySelectorAll('.admin-user-email');
  emailEls.forEach(el => { el.textContent = email; });
}

async function signOutAdmin() {
  sessionStorage.removeItem('admin_demo');
  sessionStorage.removeItem('admin_email');
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  window.location.href = 'login.html';
}

// ── Sidebar Navigation ────────────────────────────────────────────

function initAdminNav() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    }
  });

  // Sign out button
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOutAdmin);
  }
}

// ── Dashboard Stats ───────────────────────────────────────────────

async function loadDashboardStats() {
  if (!supabaseClient) {
    // Demo data
    updateStatElement('stat-pending-consultations', 3);
    updateStatElement('stat-total-requests', 12);
    updateStatElement('stat-open-bugs', 5);
    updateStatElement('stat-active-systems', 47);
    updateStatElement('stat-consultations-month', 8);
    return;
  }

  try {
    const [consultPending, requests, bugs, systems] = await Promise.all([
      supabaseClient.from('consultation_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabaseClient.from('system_requests').select('id', { count: 'exact' }),
      supabaseClient.from('bug_reports').select('id', { count: 'exact' }).in('status', ['open', 'in_progress']),
      supabaseClient.from('automation_systems').select('id', { count: 'exact' }).eq('status', 'active'),
    ]);

    updateStatElement('stat-pending-consultations', consultPending.count || 0);
    updateStatElement('stat-total-requests', requests.count || 0);
    updateStatElement('stat-open-bugs', bugs.count || 0);
    updateStatElement('stat-active-systems', systems.count || 0);
  } catch (e) {
    console.error('Failed to load dashboard stats:', e);
  }
}

function updateStatElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Pending Consultations (dashboard widget) ──────────────────────

const DEMO_PENDING = [
  { id: 'CONSULT-REQ-003', fullName: 'James Wilson', email: 'j.wilson@ogilvy.com', department: 'Marketing', preferredDate: 'Tue Mar 18, 2025', preferredTime: '2:00 PM', urgency: 'urgent', submittedAgo: '2 hours ago', purpose: 'Explore Automation Opportunities', description: 'Would like to discuss opportunities to automate our social media reporting process.' },
  { id: 'CONSULT-REQ-002', fullName: 'Sarah Ahmed', email: 's.ahmed@ogilvy.com', department: 'Finance', preferredDate: 'Wed Mar 19, 2025', preferredTime: '10:00 AM', urgency: 'soon', submittedAgo: '5 hours ago', purpose: 'Discuss New Automation System', description: 'Looking to automate monthly invoice reconciliation.' },
  { id: 'CONSULT-REQ-001', fullName: 'Tom Bradley', email: 't.bradley@ogilvy.com', department: 'HR', preferredDate: 'Mon Mar 24, 2025', preferredTime: '11:00 AM', urgency: 'standard', submittedAgo: 'Yesterday', purpose: 'General Consultation', description: 'General overview of what automation options are available for HR team.' },
];

async function loadPendingConsultations() {
  if (!supabaseClient) return DEMO_PENDING;
  const { data } = await supabaseClient
    .from('consultation_requests')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });
  return data || DEMO_PENDING;
}

// ── Consultation Actions ──────────────────────────────────────────

async function approveConsultation(id, meetingData) {
  if (!supabaseClient) {
    await new Promise(r => setTimeout(r, 600));
    return { error: null };
  }
  const { error } = await supabaseClient
    .from('consultation_requests')
    .update({
      status: 'approved',
      confirmed_date: meetingData.confirmedDate,
      confirmed_time: meetingData.confirmedTime,
      teams_link: meetingData.teamsLink,
      assigned_to: meetingData.assignedTo,
      admin_notes: meetingData.adminNotes,
      approved_at: new Date().toISOString()
    })
    .eq('id', id);
  return { error };
}

async function rejectConsultation(id, reason, message) {
  if (!supabaseClient) {
    await new Promise(r => setTimeout(r, 600));
    return { error: null };
  }
  const { error } = await supabaseClient
    .from('consultation_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      rejection_message: message,
      rejected_at: new Date().toISOString()
    })
    .eq('id', id);
  return { error };
}

// ── Email Notifications (Edge Functions) ─────────────────────────

async function sendEmailNotification(type, data) {
  // Calls a Supabase Edge Function named 'send-email'
  if (!supabaseClient) {
    console.log('Demo: Would send email:', type, data);
    return { error: null };
  }
  try {
    const { data: result, error } = await supabaseClient.functions.invoke('send-email', {
      body: { type, ...data }
    });
    return { data: result, error };
  } catch (e) {
    console.error('Email notification failed:', e);
    return { error: e };
  }
}

// ── Teams Meeting Link Generation ────────────────────────────────

async function generateTeamsMeetingLink(consultationData) {
  // Calls a Supabase Edge Function named 'create-teams-meeting'
  if (!supabaseClient) {
    // Demo: return fake link
    await new Promise(r => setTimeout(r, 1200));
    const demoId = Math.random().toString(36).substr(2, 10).toUpperCase();
    return {
      link: `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${demoId}%40thread.v2/0?context=%7b%7d`,
      error: null
    };
  }
  try {
    const { data, error } = await supabaseClient.functions.invoke('create-teams-meeting', {
      body: consultationData
    });
    return { link: data?.meetingLink, error };
  } catch (e) {
    return { link: null, error: e };
  }
}

// ── CSV Export ────────────────────────────────────────────────────

function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
    showNotification('No data to export.', 'warning');
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
    return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Team Members ──────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { id: 1, name: 'Alex Johnson', role: 'Head of Automation' },
  { id: 2, name: 'Sarah Chen', role: 'Systems Developer' },
  { id: 3, name: 'Marcus Williams', role: 'Process Analyst' },
  { id: 4, name: 'Priya Patel', role: 'UX & Testing Lead' },
];

async function loadTeamMembers() {
  if (!supabaseClient) return TEAM_MEMBERS;
  const { data } = await supabaseClient.from('team_members').select('id, name, role');
  return data || TEAM_MEMBERS;
}

function populateTeamMemberSelect(selectId, members = TEAM_MEMBERS) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Select team member</option>';
  members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.name} — ${m.role}`;
    sel.appendChild(opt);
  });
}

// ── Real-time Subscriptions ───────────────────────────────────────

class AdminRealtime {
  constructor() {
    this.subscriptions = [];
  }

  subscribeToConsultations(onNew) {
    if (!supabaseClient) return;
    const sub = supabaseClient
      .channel('admin-consultations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consultation_requests' }, payload => {
        showNotification(`📅 New consultation request from ${payload.new.full_name}`, 'info', 6000);
        if (onNew) onNew(payload.new);
      })
      .subscribe();
    this.subscriptions.push(sub);
  }

  subscribeToRequests(onNew) {
    if (!supabaseClient) return;
    const sub = supabaseClient
      .channel('admin-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_requests' }, payload => {
        showNotification(`📋 New system request from ${payload.new.full_name}`, 'info', 5000);
        if (onNew) onNew(payload.new);
      })
      .subscribe();
    this.subscriptions.push(sub);
  }

  unsubscribeAll() {
    if (!supabaseClient) return;
    this.subscriptions.forEach(sub => supabaseClient.removeChannel(sub));
    this.subscriptions = [];
  }
}

// ── Initialise on Admin Pages ─────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  if (document.body.classList.contains('admin-page')) {
    await checkAdminAuth();
    initAdminNav();
  }
});
