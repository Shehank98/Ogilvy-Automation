/**
 * Ogilvy Automation Portal — Supabase Configuration
 *
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual
 * Supabase project credentials from:
 * https://supabase.com/dashboard/project/_/settings/api
 */

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
let supabaseClient = null;
try {
  if (window.supabase && SUPABASE_URL !== 'https://your-project.supabase.co') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('Supabase not configured — running in demo mode');
}

// Database table names
const TABLES = {
  CONSULTATION_REQUESTS: 'consultation_requests',
  SYSTEM_REQUESTS: 'system_requests',
  BUG_REPORTS: 'bug_reports',
  TEAM_MEMBERS: 'team_members',
  SYSTEMS: 'automation_systems',
  ACTIVITY_LOG: 'activity_log'
};

// Storage bucket names
const BUCKETS = {
  ATTACHMENTS: 'attachments',
  SCREENSHOTS: 'screenshots',
  CONSULTATION_DOCS: 'consultation-docs'
};

/**
 * Generate a sequential request ID.
 * In production, Supabase returns the row id; this is a client-side helper for demo mode.
 */
function generateId(prefix) {
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${num}`;
}

/**
 * Submit a consultation request.
 * Returns { data: { id, requestId }, error }
 */
async function submitConsultationRequest(formData) {
  if (!supabaseClient) {
    // Demo mode
    await new Promise(r => setTimeout(r, 900));
    const requestId = generateId('CONSULT-REQ');
    return { data: { id: requestId, requestId }, error: null };
  }
  const { data, error } = await supabaseClient
    .from(TABLES.CONSULTATION_REQUESTS)
    .insert([{
      full_name: formData.fullName,
      email: formData.email,
      department: formData.department,
      phone: formData.phone || null,
      preferred_date: formData.preferredDate,
      preferred_time: formData.preferredTime,
      alt_date: formData.altDate || null,
      alt_time: formData.altTime || null,
      timezone: formData.timezone,
      meeting_purpose: formData.purpose,
      description: formData.description,
      urgency: formData.urgency,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (data && !error) {
    const requestId = `CONSULT-REQ-${String(data.id).padStart(3, '0')}`;
    return { data: { id: data.id, requestId }, error: null };
  }
  return { data: null, error };
}

/**
 * Look up a consultation request status by ID and email.
 */
async function getConsultationStatus(requestId, email) {
  if (!supabaseClient) {
    // Demo mode responses
    await new Promise(r => setTimeout(r, 700));
    if (requestId.includes('001')) {
      return { data: { requestId, status: 'pending', fullName: 'Demo User', email, preferredDate: '2025-03-25', preferredTime: '10:00 AM', purpose: 'General Consultation', submittedAt: new Date().toISOString() }, error: null };
    }
    if (requestId.includes('002')) {
      return { data: { requestId, status: 'approved', fullName: 'Demo User', email, confirmedDate: '2025-03-22', confirmedTime: '2:00 PM', teamsLink: 'https://teams.microsoft.com/l/meetup-join/demo-link', assignedTo: 'Alex Johnson' }, error: null };
    }
    if (requestId.includes('003')) {
      return { data: { requestId, status: 'rejected', fullName: 'Demo User', email, rejectionReason: 'Requested time not available', rejectionMessage: 'Please resubmit with alternative times.' }, error: null };
    }
    return { data: null, error: { message: 'Request not found. Please check your Request ID and email.' } };
  }

  // Extract numeric ID from CONSULT-REQ-001 format
  const numId = parseInt(requestId.replace('CONSULT-REQ-', ''));
  const { data, error } = await supabaseClient
    .from(TABLES.CONSULTATION_REQUESTS)
    .select('*')
    .eq('id', numId)
    .eq('email', email.toLowerCase())
    .single();

  return { data, error };
}

/**
 * Submit a system automation request.
 */
async function submitSystemRequest(formData) {
  if (!supabaseClient) {
    await new Promise(r => setTimeout(r, 800));
    return { data: { requestId: generateId('SYS-REQ') }, error: null };
  }
  const { data, error } = await supabaseClient
    .from(TABLES.SYSTEM_REQUESTS)
    .insert([{
      full_name: formData.fullName,
      email: formData.email,
      department: formData.department,
      phone: formData.phone || null,
      system_name: formData.systemName,
      current_process: formData.currentProcess,
      automation_goal: formData.automationGoal,
      frequency: formData.frequency,
      time_spent: formData.timeSpent,
      people_count: formData.peopleCount || null,
      priority: formData.priority,
      expected_outcomes: formData.expectedOutcomes,
      existing_systems: formData.existingSystems || null,
      also_consultation: formData.alsoConsultation || false,
      deadline: formData.deadline || null,
      status: 'new',
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (data && !error) {
    return { data: { requestId: `SYS-REQ-${new Date().getFullYear()}-${String(data.id).padStart(3, '0')}` }, error: null };
  }
  return { data: null, error };
}

/**
 * Submit a bug report.
 */
async function submitBugReport(formData) {
  if (!supabaseClient) {
    await new Promise(r => setTimeout(r, 800));
    return { data: { requestId: generateId('BUG') }, error: null };
  }
  const { data, error } = await supabaseClient
    .from(TABLES.BUG_REPORTS)
    .insert([{
      system_name: formData.systemName,
      issue_type: formData.issueType,
      severity: formData.severity,
      description: formData.description,
      steps_to_reproduce: formData.stepsToReproduce || null,
      when_started: formData.whenStarted,
      reporter_name: formData.reporterName,
      reporter_email: formData.reporterEmail,
      department: formData.department,
      status: 'open',
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (data && !error) {
    return { data: { requestId: `BUG-${new Date().getFullYear()}-${String(data.id).padStart(3, '0')}` }, error: null };
  }
  return { data: null, error };
}

/**
 * Load automation systems with optional filters.
 */
async function getAutomationSystems(filters = {}) {
  if (!supabaseClient) {
    return { data: null, error: { message: 'demo' } };
  }
  let query = supabaseClient.from(TABLES.SYSTEMS).select('*');
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.department && filters.department !== 'all') query = query.eq('department', filters.department);
  if (filters.search) query = query.ilike('name', `%${filters.search}%`);
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Upload a file to Supabase Storage.
 */
async function uploadFile(bucket, file, path) {
  if (!supabaseClient) {
    return { url: null, error: { message: 'demo' } };
  }
  const { data, error } = await supabaseClient.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
}

/**
 * Subscribe to real-time changes on a table.
 */
function subscribeToRealtime(table, callback) {
  if (!supabaseClient) return null;
  return supabaseClient
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}
