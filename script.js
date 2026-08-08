/* ═══════════════════════════════════════════════
   WellSpace v2 - script.js
   Full application logic
═══════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// XSS PREVENTION - escape any user-supplied text before it goes into
// innerHTML. Use this on every field a student/teacher typed themselves
// (names, class subjects, task/goal text, journal entries, banner
// messages, responsibilities, etc). Never needed for values you fully
// control (hardcoded strings, computed dates, enum labels like mood names).
// ─────────────────────────────────────────────
function escapeHtml(str){
  if(str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

const NEGATIVE_MOODS = ['Sad','Frustrated','Tired','Confused'];
const MOOD_CFG = {
  Happy:     {icon:'😊', msg:"You're radiating good energy today! Keep it up 🌟"},
  Energized: {icon:'⚡', msg:"Amazing - channel that energy into something great!"},
  Sad:       {icon:'😢', msg:"It's okay to feel sad. Be kind to yourself today 💙"},
  Frustrated:{icon:'😤', msg:"Take a breath. This feeling is temporary. You've got this 💪"},
  Tired:     {icon:'😴', msg:"Rest is productive too. Small breaks help a lot 🌙"},
  Confused:  {icon:'🤔', msg:"Confusion is the beginning of learning. Ask for help!"},
};
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const PROVINCES = ['Ontario','British Columbia','Alberta','Quebec','Nova Scotia','New Brunswick','Manitoba','Saskatchewan','PEI','Newfoundland & Labrador','Northwest Territories','Nunavut','Yukon'];

// Helpline data by province
const HELPLINES = {
  Ontario: {
    phone:[
      {name:"Kids Help Phone",desc:"Free support for young people (24/7, confidential)",url:"https://www.kidshelpphone.ca",contact:"📞 1-800-668-6868 | Text CONNECT to 686868"},
      {name:"Good2Talk",desc:"Counselling & referrals for post-secondary students",url:"https://www.good2talk.ca",contact:"📞 1-866-925-5454 | Online chat 24/7"},
      {name:"ConnexOntario",desc:"Mental health, addiction & crisis services info/referral",url:"https://www.connexontario.ca",contact:"📞 1-866-531-2600"},
      {name:"One Stop Talk",desc:"Free therapy sessions for youth ages 6-18",url:"https://onestoptalk.ca",contact:"📞 1-855-416-8255"},
      {name:"Canada Suicide Prevention Service",desc:"English/French, 24/7",url:"https://www.crisisservicescanada.ca",contact:"📞 1-833-456-4566"},
      {name:"Hope for Wellness Help Line",desc:"24/7 counselling for Indigenous Peoples",url:"https://hopeforwellness.ca/home.html",contact:"📞 1-855-242-3310"},
    ],
    online:[
      {name:"Youth Wellness Hubs Ontario",desc:"In-person supports ages 12-25",url:"https://youthhubs.ca/en/"},
      {name:"Ontario Mental Health Support Directory",desc:"Government directory of local supports",url:"https://www.ontario.ca/page/find-mental-health-support"},
      {name:"School Mental Health Ontario - Helpline Hub",desc:"Crisis & wellness info for students",url:"https://smho-smso.ca/students/helpline-hub/"},
      {name:"Be There",desc:"Tips on supporting friends & yourself",url:"https://bethere.org/Home"},
      {name:"Mind Your Mind",desc:"Youth mental health tools & info",url:"https://mindyourmind.ca"},
    ]
  },
  "British Columbia":{
    phone:[
      {name:"Kids Help Phone",url:"https://www.kidshelpphone.ca",contact:"📞 1-800-668-6868 | Text CONNECT to 686868",desc:"24/7 free support"},
      {name:"BC Crisis Line",url:"https://www.crisiscentre.bc.ca",contact:"📞 1-866-661-3311",desc:"24/7 emotional support"},
      {name:"YouthSpace BC",url:"https://www.youthspace.ca",contact:"Text 778-783-0177",desc:"Youth crisis chat & text"},
    ],
    online:[
      {name:"Here2Talk BC",desc:"Free counselling for post-secondary students",url:"https://here2talk.ca"},
      {name:"BC Mental Health & Substance Use",desc:"Provincial resources & directory",url:"https://www.bcmhsus.ca"},
    ]
  },
  Alberta:{
    phone:[
      {name:"Kids Help Phone",url:"https://www.kidshelpphone.ca",contact:"📞 1-800-668-6868",desc:"24/7 free support"},
      {name:"Distress Centre Calgary",url:"https://www.distresscentre.com",contact:"📞 403-266-HELP (4357)",desc:"24/7 crisis & mental health"},
      {name:"211 Alberta",url:"https://ab.211.ca",contact:"📞 2-1-1",desc:"Connect to social & mental health services"},
    ],
    online:[
      {name:"Alberta Health Services-Mental Health",desc:"Provincial mental health services",url:"https://www.albertahealthservices.ca/findhealth/service.aspx?id=6810&serviceAtFacilityID=1047652"},
    ]
  },
  default:{
    phone:[
      {name:"Kids Help Phone",desc:"Free support for young people across Canada (24/7)",url:"https://www.kidshelpphone.ca",contact:"📞 1-800-668-6868 | Text CONNECT to 686868"},
      {name:"Canada Suicide Prevention Service",desc:"English/French, 24/7",url:"https://www.crisisservicescanada.ca",contact:"📞 1-833-456-4566"},
      {name:"Hope for Wellness Help Line",desc:"24/7 counselling for Indigenous Peoples",url:"https://hopeforwellness.ca",contact:"📞 1-855-242-3310"},
    ],
    online:[
      {name:"Be There",desc:"Supporting yourself and friends",url:"https://bethere.org/Home"},
    ]
  }
};

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let CU = null;
let authRole = null;
let pendingMoodSel = null;
let periodOrder = [];

// ─────────────────────────────────────────────
// FIREBASE CONFIG
// ─────────────────────────────────────────────
const FB_CFG = {
  apiKey: "AIzaSyCpUsu0Y2zbd7PH6a8b-NP6B7yEB7UL9Go",
  authDomain: "wellspace-71c0c.firebaseapp.com",
  projectId: "wellspace-71c0c",
};

let fbDb   = null;
let fbAuth = null;

function initFirebase(){
  try {
    if(!firebase.apps.length) firebase.initializeApp(FB_CFG);
    fbDb   = firebase.firestore();
    fbAuth = firebase.auth();
  } catch(e){ fbDb = null; fbAuth = null; }
}

// ─────────────────────────────────────────────
// GLOBAL SAFETY NET - catches anything that slips
// past a local try/catch, plus offline/online state
// ─────────────────────────────────────────────
window.addEventListener('error', function(e){
  console.error('Uncaught error:', e.error || e.message);
  toast('⚠️ Something went wrong. Try refreshing the page.');
});

window.addEventListener('unhandledrejection', function(e){
  console.error('Unhandled promise rejection:', e.reason);
  toast('⚠️ Something went wrong. Try refreshing the page.');
});

window.addEventListener('offline', function(){
  toast('📡 You\'re offline — changes will save once you\'re back online.');
});

window.addEventListener('online', function(){
  toast('✅ Back online.');
});

// ─────────────────────────────────────────────
// FIRESTORE HELPERS - per-user + shared
// ─────────────────────────────────────────────

// Save a key to the current user's private Firestore doc
async function fsSet(key, value){
  if(!fbDb || !fbAuth?.currentUser) return;
  try {
    await fbDb.collection('users').doc(fbAuth.currentUser.uid)
      .set({ [key]: JSON.stringify(value) }, { merge: true });
  } catch(e){
    console.error('fsSet failed for key', key, e);
    toast('⚠️ Could not save - check your connection and try again.');
  }
}

// Read a key from the current user's private Firestore doc
async function fsGet(key, def=null){
  if(!fbDb || !fbAuth?.currentUser) return def;
  try {
    const doc = await fbDb.collection('users').doc(fbAuth.currentUser.uid).get();
    if(!doc.exists) return def;
    const val = doc.data()[key];
    return val ? JSON.parse(val) : def;
  } catch(e){ return def; }
}

// Save to shared collection (class codes, classes list - readable by all authenticated users)
async function fsSetShared(key, value){
  if(!fbDb) return;
  try {
    await fbDb.collection('shared').doc('data')
      .set({ [key]: JSON.stringify(value) }, { merge: true });
  } catch(e){
    console.error('fsSetShared failed for key', key, e);
    toast('⚠️ Could not save - check your connection and try again.');
  }
}

// Read from shared collection
async function fsGetShared(key, def=null){
  if(!fbDb) return def;
  try {
    const doc = await fbDb.collection('shared').doc('data').get();
    if(!doc.exists) return def;
    const val = doc.data()?.[key];
    return val ? JSON.parse(val) : def;
  } catch(e){ return def; }
}

// ─────────────────────────────────────────────
// JOURNALS - dedicated owner-only collection.
// Journals used to be embedded as a field inside /users/{uid} alongside
// moods/goals/wellness. That doc's read rule grants access to any teacher
// whose uid is in the student's teacherUids, so once a student joined a
// class, their journal entries were reachable by that teacher via direct
// Firestore access - even though the UI itself never surfaced them. The
// security rules already define /journals/{uid} as owner-only with no
// exceptions; these helpers actually route writes/reads there so that
// rule is the one doing the work.
// ─────────────────────────────────────────────
async function fsSetJournal(uid, journals){
  if(!fbDb || !uid) return;
  try {
    await fbDb.collection('journals').doc(uid).set({ entries: JSON.stringify(journals) }, { merge: true });
  } catch(e){
    console.error('fsSetJournal failed', e);
    toast('⚠️ Could not save your journal - check your connection and try again.');
  }
}

async function fsGetJournal(uid){
  if(!fbDb || !uid) return [];
  try {
    const doc = await fbDb.collection('journals').doc(uid).get();
    if(!doc.exists) return [];
    return JSON.parse(doc.data().entries || '[]');
  } catch(e){ return []; }
}

// ─────────────────────────────────────────────
// LOCAL CACHE - fast reads, Firestore is source of truth
// ─────────────────────────────────────────────
const cache = {};

function cSet(k, v){ cache[k] = v; }
function cGet(k, def=null){ return k in cache ? cache[k] : def; }

// Keys that are shared across all users (classes, class codes)
const SHARED_KEYS = ['classes'];
// Keys that belong to all users but need to be read by teachers (moods, wellness, goals, responsibilities)
// These are stored per-user but teachers read their students' docs
const CROSS_KEYS  = ['moods','goals','wellness','responsibilities','journals','messages'];
// Keys private to one user
const PRIVATE_KEYS= ['students','teachers'];

// ─────────────────────────────────────────────
// UNIFIED S - same API as before, now Firestore-backed
// ─────────────────────────────────────────────
const S = {
  get(k, def=null){
    // Return from cache first for speed
    return cGet(k, def);
  },
  set(k, v){
    cSet(k, v);
    // Persist to correct Firestore location
    if(k === 'journals'){
      // Journals are private-by-rule and live in their own collection -
      // see fsSetJournal for why this can't just fall through to fsSet().
      if(fbAuth?.currentUser) fsSetJournal(fbAuth.currentUser.uid, v);
    } else if(SHARED_KEYS.includes(k)){
      fsSetShared(k, v);
    } else {
      fsSet(k, v);
    }
  },
};

// Shortcuts - same as original
const gs  = ()=> S.get('students',[]);
const gt  = ()=> S.get('teachers',[]);
const gc  = ()=> S.get('classes',[]);
const gm  = ()=> S.get('moods',[]);
const ggo = ()=> S.get('goals',[]);
const gw  = ()=> S.get('wellness',[]);
const gmsg= ()=> S.get('messages',[]);
const gj  = ()=> S.get('journals',[]);

// ─────────────────────────────────────────────
// LOAD USER DATA FROM FIRESTORE INTO CACHE
// (single, de-duplicated version - also loads profile + per-doc classes)
// ─────────────────────────────────────────────
async function loadUserData(){
  if(!fbDb || !fbAuth?.currentUser) return;
  try {
    // Load user's private data from /users/{uid}
    const userDoc = await fbDb.collection('users').doc(fbAuth.currentUser.uid).get();
    if(userDoc.exists){
      const data = userDoc.data();
      Object.entries(data).forEach(([k,v])=>{
        try{ cSet(k, JSON.parse(v)); }catch{}
      });

      // MIGRATION: journals used to be stored inline in this doc, which a
      // linked teacher could technically read directly from Firestore even
      // though the UI never showed them. Move any old entries into the
      // owner-only /journals/{uid} collection and scrub them out of here.
      if(data.journals){
        try{
          const oldJournals = JSON.parse(data.journals);
          const existingJournals = await fsGetJournal(fbAuth.currentUser.uid);
          const merged = [...existingJournals, ...oldJournals];
          await fsSetJournal(fbAuth.currentUser.uid, merged);
          await fbDb.collection('users').doc(fbAuth.currentUser.uid)
            .update({ journals: firebase.firestore.FieldValue.delete() });
        } catch(e){ console.error('journal migration failed', e); }
      }
    }

    // Load journals from their dedicated owner-only collection (source of
    // truth going forward - never from /users/{uid}).
    const journals = await fsGetJournal(fbAuth.currentUser.uid);
    cSet('journals', journals);

    // ALSO load profile data (classIds, name, etc.) from /profiles/{uid}
    const profileDoc = await fbDb.collection('profiles').doc(fbAuth.currentUser.uid).get();
    if(profileDoc.exists){
      const pdata = profileDoc.data();
      if(CU){
        if(pdata.classIds) CU.classIds = pdata.classIds;
        if(pdata.name) CU.name = pdata.name;
        if(pdata.grade) CU.grade = pdata.grade;
        if(pdata.periodOrder) CU.periodOrder = pdata.periodOrder;
      }
    }

    // Load shared data (classes) - legacy blob, for backwards compatibility
    const sharedDoc = await fbDb.collection('shared').doc('data').get();
    if(sharedDoc.exists){
      const data = sharedDoc.data();
      ['classes'].forEach(k=>{
        if(data[k]){ try{ cSet(k, JSON.parse(data[k])); }catch{} }
      });
    }

    // Load from new per-doc classes collection (this is the source of truth going forward)
    const classes = await fsGetAllClasses();
    if(classes.length) cSet('classes', classes);

  } catch(e){ console.error('loadUserData error', e); }
}

// ─────────────────────────────────────────────
// STUDENT-TEACHER LINK - store uid mapping
// ─────────────────────────────────────────────
// When a user signs up we store their profile in /profiles/{uid}
// So teachers can look up student uids to read their data
async function saveProfile(uid, profile){
  if(!fbDb) return;
  try {
    await fbDb.collection('profiles').doc(uid).set(profile, { merge: true });
  } catch(e){
    console.error('saveProfile failed', e);
    toast('⚠️ Could not save your profile - check your connection and try again.');
  }
}

async function getProfile(uid){
  if(!fbDb) return null;
  try {
    const doc = await fbDb.collection('profiles').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch(e){ return null; }
}

// ─────────────────────────────────────────────
// TEACHER LINK BACKFILL - some student profiles may be missing
// teacherUids because they joined a class (either via joinClass() or
// via the signup-with-code flow) before teacherUids tracking existed,
// or through a code path that never set it. Security rules require
// teacherUids to grant a teacher read access to a student's data, so
// this repairs any student profile that's missing a link for a class
// they're already in. Safe to call on every login - it's a no-op once
// a profile is caught up, and joinClass() already sets this correctly
// for brand-new joins going forward.
// ─────────────────────────────────────────────
async function ensureTeacherLinks(){
  if(!CU || CU.role !== 'student' || !fbAuth?.currentUser) return;
  if(!CU.classIds?.length) return;

  const classes = gc().length ? gc() : await fsGetAllClasses();
  const existingTeacherUids = new Set(CU.teacherUids || []);
  let changed = false;

  CU.classIds.forEach(classId=>{
    const cls = classes.find(c=>c.id===classId);
    const teacherUid = cls?.teacherUid || cls?.teacherId;
    if(teacherUid && !existingTeacherUids.has(teacherUid)){
      existingTeacherUids.add(teacherUid);
      changed = true;
    }
  });

  if(changed){
    CU.teacherUids = [...existingTeacherUids];
    try {
      await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
        .set({ teacherUids: CU.teacherUids }, { merge: true });
    } catch(e){ console.error('ensureTeacherLinks failed', e); }
  }
}

// Get all student profiles for this teacher.
//
// FIX: this used to query `.where('classIds','array-contains-any', chunk)`
// and rely on the /profiles read rule (which checks `teacherUids`, not
// `classIds`) to gate access. Firestore rejects an entire list query if
// the security rule can't be validated purely from the query's own where
// clauses - since the rule checked a field the query didn't filter on,
// every call came back `permission-denied` for the WHOLE query. The old
// catch block only toasted on `failed-precondition` (missing index), so
// this specific failure was silent: students joined classes fine, but
// teachers never saw them or any of their shared data, with no visible
// error anywhere.
//
// Querying directly on `teacherUids array-contains teacherUid` matches
// the rule exactly, so Firestore can validate the query and actually
// return results. This also removes the old 10-item chunking, which was
// only needed for `array-contains-any`'s limit - plain `array-contains`
// has no such cap.
async function getStudentUids(teacherUid){
  if(!fbDb || !teacherUid) return [];
  try {
    const snap = await fbDb.collection('profiles')
      .where('role','==','student')
      .where('teacherUids','array-contains', teacherUid)
      .get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch(e){
    console.error('getStudentUids error', e);
    if(e.code === 'failed-precondition' || /index/i.test(e.message||'')){
      toast('⚠️ Missing Firestore index for student lookup — check the browser console for a link to create it.');
    } else if(e.code === 'permission-denied'){
      toast('⚠️ Could not load students — permission denied. Check that student profiles have teacherUids set.');
    } else {
      toast('⚠️ Could not load students — check the browser console for details.');
    }
  }
  return [];
}

// Load a single student's full data doc (used by the teacher dashboard)
async function loadStudentData(uid){
  if(!fbDb) return {};
  try {
    const doc = await fbDb.collection('users').doc(uid).get();
    if(!doc.exists) return {};
    const raw = doc.data();
    const parsed = {};
    Object.entries(raw).forEach(([k,v])=>{
      try{ parsed[k] = JSON.parse(v); }catch{ parsed[k] = v; }
    });
    // Ensure a 'students' entry always exists, built from the profile if missing,
    // so the teacher dashboard can always render a row for this student.
    if(!parsed.students){
      const profile = await getProfile(uid);
      if(profile){
        parsed.students = [{
          id: profile.localId || uid,
          name: profile.name,
          email: profile.email,
          grade: profile.grade,
          classIds: profile.classIds || [],
          periodOrder: profile.periodOrder || [],
          joined: profile.joined,
        }];
      }
    }
    return parsed;
  } catch(e){ console.error('loadStudentData error', e); return {}; }
}

// Merge an array of records into another array by a unique key (studentId + extra fields),
// replacing any existing record for that student/date/type combo so re-fetches don't duplicate.
function mergeInto(target, incoming, keyField){
  incoming.forEach(item=>{
    const idx = target.findIndex(t => t.id && item.id && t.id === item.id);
    if(idx >= 0) target[idx] = item;
    else target.push(item);
  });
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
function validEmail(e){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}
function validPw(p){
  return p.length>=8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*(),.?":{}|<>]/.test(p);
}
function checkPwStrength(v){
  const rules = {
    'r-len':   v.length>=8,
    'r-upper': /[A-Z]/.test(v),
    'r-num':   /[0-9]/.test(v),
    'r-special':/[!@#$%^&*(),.?":{}|<>]/.test(v),
  };
  let score = Object.values(rules).filter(Boolean).length;
  const fill = document.getElementById('pw-strength-fill');
  const colors = ['','#ef4444','#f59e0b','#3b82f6','#22c55e'];
  if(fill){ fill.style.width=(score*25)+'%'; fill.style.background=colors[score]||''; }
  Object.entries(rules).forEach(([id,ok])=>{
    const el=document.getElementById(id);
    if(el){ el.classList.toggle('ok',ok); }
  });
}
function togglePw(id,btn){
  const inp=document.getElementById(id);
  if(!inp)return;
  if(inp.type==='password'){ inp.type='text'; btn.textContent='🙈'; }
  else{ inp.type='password'; btn.textContent='👁'; }
}

// ─────────────────────────────────────────────
// SCREEN NAVIGATION
// ─────────────────────────────────────────────
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>{
    s.classList.remove('active','fade');
    s.style.display='none';
    s.style.flexDirection='';
  });
  const el=document.getElementById(id);
  if(!el)return;
  el.style.display='flex';
  if(id==='screen-student'||id==='screen-teacher') el.style.flexDirection='column';
  el.classList.add('active','fade');
}

function gotoAuth(role){
  authRole=role;
  const brand=document.getElementById('auth-brand-label');
  brand.textContent = role==='student' ? '🎒 Student Login' : '📋 Teacher Login';
  document.getElementById('su-student-fields').classList.toggle('hidden', role!=='student');
  document.getElementById('su-teacher-fields').classList.toggle('hidden', role!=='teacher');
  authTab('login');
  showScreen('screen-auth');
}

function authTab(tab){
  document.getElementById('form-login').classList.toggle('hidden', tab!=='login');
  document.getElementById('form-signup').classList.toggle('hidden', tab!=='signup');
  document.getElementById('atab-login').classList.toggle('active', tab==='login');
  document.getElementById('atab-signup').classList.toggle('active', tab!=='login');
}

// ─────────────────────────────────────────────
// COOKIE CONSENT - synced to the account, not just the browser
// So the consent question only ever gets asked once per account,
// even if the student logs in on a different device later.
// ─────────────────────────────────────────────
async function saveCookieConsentToAccount(accepted){
  if(!fbAuth?.currentUser) return; // not logged in yet, localStorage handles it for now
  try {
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid).set(
      { cookieConsent: accepted, cookieConsentDate: today() },
      { merge: true }
    );
  } catch(e){ console.error('saveCookieConsentToAccount failed', e); }
}
window.saveCookieConsentToAccount = saveCookieConsentToAccount;

async function syncCookieConsentAfterLogin(uid){
  try {
    const profile = await getProfile(uid);
    const banner = document.getElementById('cookie-banner');
    if(profile && typeof profile.cookieConsent === 'boolean'){
      // Account already answered before (maybe on another device) - use that,
      // don't ask again.
      localStorage.setItem('wellspace_cookie_consent', profile.cookieConsent ? 'accepted' : 'declined');
      if(banner) banner.classList.add('hidden');
      if(profile.cookieConsent && typeof loadGoogleAnalytics==='function') loadGoogleAnalytics();
    } else {
      // Account has no answer yet. If this browser already answered
      // (e.g. they chose on the entry screen before logging in), save
      // that answer to the account now so it's remembered going forward.
      const local = localStorage.getItem('wellspace_cookie_consent');
      if(local === 'accepted' || local === 'declined'){
        await saveCookieConsentToAccount(local === 'accepted');
      }
    }
  } catch(e){ console.error('syncCookieConsentAfterLogin failed', e); }
}

// ─────────────────────────────────────────────
// AUTH - LOGIN (Firebase Auth)
// ─────────────────────────────────────────────
async function doLogin(){
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-err');

  if(!email||!pass) return showErr(errEl,'Please enter your email and password.');
  if(!validEmail(email)) return showErr(errEl,'Please enter a valid email address.');

  try {
    showErr(errEl,''); // clear error
    const cred = await fbAuth.signInWithEmailAndPassword(email, pass);
    const uid  = cred.user.uid;

    // Load profile
    const profile = await getProfile(uid);
    if(!profile) return showErr(errEl,'Account not found. Please sign up.');

    // Check role matches
    if(profile.role !== authRole) return showErr(errEl, `This is a ${profile.role} account. Please use the ${profile.role} login.`);

    CU = { ...profile, id: profile.localId || uid, uid };
    await loadUserData();
    await ensureTeacherLinks();
    syncCookieConsentAfterLogin(uid);

    toast(`Welcome back, ${CU.name}! 👋`);
    if(authRole==='student') loadStudentDash();
    else { await loadTeacherStudents(); loadTeacherDash(); }

  } catch(e){
    if(e.code==='auth/wrong-password'||e.code==='auth/user-not-found'||e.code==='auth/invalid-credential'){
      showErr(errEl,'Email or password incorrect. Check your details.');
    } else {
      showErr(errEl,'Login failed. Please try again.');
    }
  }
}

// ─────────────────────────────────────────────
// AUTH - SIGNUP (Firebase Auth)
// ─────────────────────────────────────────────
async function doSignup(){
  const name  = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim().toLowerCase();
  const pass  = document.getElementById('su-pass').value;
  const privacyOk = document.getElementById('su-privacy').checked;
  const errEl = document.getElementById('signup-err');

  if(!name||!email||!pass) return showErr(errEl,'Please fill in all required fields.');
  if(!validEmail(email))   return showErr(errEl,'Please enter a valid email address.');
  if(!validPw(pass))       return showErr(errEl,'Password must be 8+ chars with uppercase, number & special character.');
  if(!privacyOk)           return showErr(errEl,'Please accept the privacy policy to continue.');

  try {
    if(authRole==='student'){
      const grade = document.getElementById('su-grade').value;
      const code  = document.getElementById('su-code').value.trim().toUpperCase();
      if(!grade) return showErr(errEl,'Please select your grade.');

      // Look up class code in the per-doc classes collection (source of truth)
      const classes = await fsGetAllClasses();
      cSet('classes', classes);

      let classIds = [];
      if(code){
        const cls = classes.find(c=>c.code===code);
        if(!cls) return showErr(errEl,`Class code "${code}" not found. Ask your teacher for the correct code.`);
        classIds = [cls.id];
      }

      // Create Firebase Auth account
      const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
      const uid  = cred.user.uid;
      const localId = 's'+uid8();

      const profile = { role:'student', name, email, grade, classIds, periodOrder:[], joined:today(), localId, uid };

      // Save profile to shared profiles collection (this is what teachers query)
      await saveProfile(uid, profile);

      // Save student list entry to user's own doc
      const studentEntry = { id:localId, name, email, grade, classIds, periodOrder:[], joined:today() };
      cSet('students', [studentEntry]);
      await fsSet('students', [studentEntry]);

      CU = { ...profile, id: localId };
      await loadUserData();
      await ensureTeacherLinks();
      toast(`Account created! Welcome, ${name} 🎉`);
      loadStudentDash();

    } else {
      const province = document.getElementById('su-province').value;
      const school   = document.getElementById('su-school').value.trim();
      if(!province) return showErr(errEl,'Please select your province.');

      const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
      const uid  = cred.user.uid;
      const localId = 't'+uid8();

      const profile = { role:'teacher', name, email, province, school, socialWorker:null, joined:today(), localId, uid };
      await saveProfile(uid, profile);

      const teacherEntry = { id:localId, name, email, province, school, socialWorker:null, joined:today() };
      cSet('teachers', [teacherEntry]);
      await fsSet('teachers', [teacherEntry]);

      CU = { ...profile, id: localId };
      await loadUserData();
      toast(`Account created! Welcome, ${name} 📋`);
      loadTeacherDash();
    }
  } catch(e){
    if(e.code==='auth/email-already-in-use'){
      showErr(errEl,'An account with this email already exists.');
    } else {
      showErr(errEl,'Could not create account. Please try again.');
      console.error(e);
    }
  }
}

function logout(){
  CU=null; authRole=null;
  pendingMoodSel=null;
  Object.keys(cache).forEach(k=>delete cache[k]);
  invalidateTeacherCache();
  if(fbAuth) fbAuth.signOut().catch(()=>{});
  showScreen('screen-entry');
}

// ─────────────────────────────────────────────
// TEACHER - load students across Firestore docs
// Cached for 60s so the dashboard doesn't re-read everything on every click.
// ─────────────────────────────────────────────
let _teacherStudentCache = null;
let _teacherStudentCacheTime = 0;
const TEACHER_CACHE_TTL = 60 * 1000; // 60 seconds

async function loadTeacherStudents(){
  const now = Date.now();

  // Serve from cache if fresh
  if (_teacherStudentCache && (now - _teacherStudentCacheTime) < TEACHER_CACHE_TTL) {
    Object.entries(_teacherStudentCache).forEach(([k, v]) => cSet(k, v));
    return;
  }

  const myClasses  = gc().filter(c => c.teacherId === CU.id);
  const myClassIds = myClasses.map(c => c.id);
  if (!myClassIds.length) {
    // No classes yet - clear any stale student data and bail
    cSet('students', []);
    return;
  }

  try {
    // FIX: query on the teacher's uid (matches the /profiles security rule)
    // instead of passing classIds into getStudentUids - see comment on
    // getStudentUids for why the old classIds-based query was silently
    // returning permission-denied for the whole query.
    const studentProfiles = await getStudentUids(CU.uid);

    const allStudents = [];
    const allMoods    = cGet('moods', []);
    const allGoals    = cGet('goals', []);
    const allWellness = cGet('wellness', []);
    const allResps    = cGet('responsibilities', []);

    for (const sp of studentProfiles) {
      const data = await loadStudentData(sp.uid);

      if (data.students) {
        // Only add students who are actually in one of this teacher's classes
        const myStudents = data.students.filter(s =>
          s.classIds && s.classIds.some(id => myClassIds.includes(id))
        );
        allStudents.push(...myStudents);
      }

      if (data.moods)            mergeInto(allMoods,    data.moods,            'studentId');
      if (data.goals)            mergeInto(allGoals,    data.goals,            'studentId');
      if (data.wellness)         mergeInto(allWellness, data.wellness,         'studentId');
      if (data.responsibilities) mergeInto(allResps,    data.responsibilities, 'studentId');
    }

    cSet('students',         allStudents);
    cSet('moods',            allMoods);
    cSet('goals',            allGoals);
    cSet('wellness',         allWellness);
    cSet('responsibilities', allResps);

    _teacherStudentCache = {
      students: allStudents,
      moods: [...allMoods],
      goals: [...allGoals],
      wellness: [...allWellness],
      responsibilities: [...allResps],
    };
    _teacherStudentCacheTime = now;

  } catch (e) { console.error('loadTeacherStudents error', e); }
}

// Call this after any action that changes student/class data, so the next
// dashboard read pulls fresh data instead of serving the 60s cache.
function invalidateTeacherCache(){
  _teacherStudentCache = null;
  _teacherStudentCacheTime = 0;
}

// ─────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────
function loadStudentDash(){
  showScreen('screen-student');
  const el=document.getElementById('screen-student');
  el.style.display='flex'; el.classList.add('active');

  const h=new Date().getHours();
  const gr=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  document.getElementById('s-greet').textContent=`${gr}, ${CU.name}! 👋`;
  document.getElementById('s-date').textContent=new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('s-av').textContent=CU.name[0].toUpperCase();

  updateStudentNav();
  sSection('home');
}

function hasClasses(){
  return CU.classIds && CU.classIds.length > 0;
}

function updateStudentNav(){
  const navItems = document.querySelectorAll('#s-sidebar .sn');
  if(navItems[8]) navItems[8].style.display = '';
}

function sSection(name){
  document.querySelectorAll('#s-sidebar .sn').forEach(n=>n.classList.remove('active'));
  const navMap=['home','mood','goals','calendar','stats','wellness','help','classes','profile'];
  const idx=navMap.indexOf(name);
  const navItems=document.querySelectorAll('#s-sidebar .sn');
  if(navItems[idx]) navItems[idx].classList.add('active');

  document.querySelectorAll('#s-main .dsec').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('s-sec-'+name);
  if(sec) sec.classList.add('active');

  if(name==='home')     renderHome();
  if(name==='mood')     renderMoodCheck();
  if(name==='goals')    renderGoalsSection();
  if(name==='calendar') renderCalendar();
  if(name==='stats')    renderStats();
  if(name==='wellness') renderWellnessSection();
  if(name==='help')     renderHelpSection();
  if(name==='classes')  renderClassesSection();
  if(name==='profile')  renderStudentProfile();
}

// HOME
function renderHome(){
  const hour=new Date().getHours();
  const bannerEl=document.getElementById('s-home-banner');
  const msgs=[
    [5,11,"Morning, {n}! 🌅 Start your day with intention."],
    [11,14,"Hey {n}! 🌤 It's the middle of the day - how are you feeling?"],
    [14,18,"Afternoon, {n}! 📚 Great time to focus on your most important tasks."],
    [18,21,"Evening, {n}! 🌙 Wind down your work and get ready for tomorrow."],
    [21,24,"Late night, {n}! 😴 Remember - sleep is the best productivity tool."],
    [0,5,"Very late, {n}! 🌙 You need rest. Your goals will be here tomorrow."],
  ];
  const [, , msg] = msgs.find(([s,e])=>hour>=s&&hour<e)||msgs[0];
  bannerEl.innerHTML=`<strong>${msg.replace('{n}',escapeHtml(CU.name))}</strong><p>${new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>`;

  const goals=ggo().filter(g=>g.studentId===CU.id&&!g.done).slice(0,4);
  const todayDay=new Date().toLocaleDateString('en-CA',{weekday:'long'});
  const todayGoals=goals.filter(g=>g.day===todayDay);
  const prevEl=document.getElementById('s-home-goals-preview');
  if(todayGoals.length>0){
    prevEl.innerHTML=`
      <div class="sub-hdr" style="margin-top:0">Today's Tasks (${todayDay})</div>
      ${todayGoals.map(g=>`
        <div class="goal-row" style="margin-bottom:8px">
          <div class="gcheck ${g.done?'checked':''}" role="button" tabindex="0" aria-pressed="${g.done?'true':'false'}" aria-label="Mark ${escapeHtml(g.task)} as ${g.done?'not done':'done'}" onclick="quickToggleGoal('${g.id}');" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quickToggleGoal('${g.id}');}">${g.done?'✓':''}</div>
          <div class="ginfo"><h5>${escapeHtml(g.task)}</h5><span class="gmeta">🕐 ${escapeHtml(g.time)} · ${escapeHtml(g.duration)}</span></div>
          <span class="gtype-badge gtype-${g.type||'study'}">${typeLabel(g.type)}</span>
        </div>
      `).join('')}
    `;
  } else {
    prevEl.innerHTML=`<div class="ai-nudge" style="margin-top:16px"><div class="ai-nudge-icon">🎯</div><div><strong>No tasks for today yet</strong><p>Head to Goals to plan your day!</p></div></div>`;
  }
}

// MOOD CHECK
function renderMoodCheck(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const todayMoods = gm().filter(m => m.studentId === CU.id && m.date === today());
  const container = document.getElementById('s-mood-list');
  const hasTeacher = hasClasses();

  const items = [
    ...(hasTeacher ? myClasses.map(c => ({id:c.id, label:c.subject, time:`${c.startTime} - ${c.endTime}`, isClass:true})) : []),
    {id:'general', label:'How are you feeling today?', time:'', isClass:false},
  ];

  const sub = document.querySelector('#s-sec-mood .sec-hdr p');
  if(sub) sub.textContent = hasTeacher ? 'How are you feeling in each period today?' : 'Check in with yourself - just for you 🌱';

  container.innerHTML = items.map(item => {
    const existing = todayMoods.find(m => m.classId === item.id);
    const shareButtons = hasTeacher
      ? `<button class="btn-green" onclick="saveMood(true)">Share with Teacher</button>
         <button class="btn-outline" onclick="saveMood(false)">Keep Private</button>`
      : `<button class="btn-green" onclick="saveMood(false)">Save</button>`;

    return `
      <div class="mood-card">
        <div class="mood-card-hdr">
          <h4>${item.isClass ? '📚 ' : ''}${escapeHtml(item.label)}</h4>
          ${item.time ? `<span class="cls-time">${escapeHtml(item.time)}</span>` : ''}
        </div>
        <div class="mood-btns">
          ${Object.keys(MOOD_CFG).map(mood=>`
            <button class="mood-btn ${existing?.mood===mood?'sel':''}" data-m="${mood}"
              onclick="selectMood('${item.id}','${escQ(item.label)}','${mood}')">
              ${MOOD_CFG[mood].icon} ${mood}
            </button>
          `).join('')}
        </div>
        ${existing ? `<div class="mood-done">✓ Mood logged${hasTeacher && existing.shared ? ' · Shared with teacher' : ' · Private'}</div>` : ''}
      </div>
      <div id="mood-support-popup-${item.id}" class="support-popup hidden">
        <div class="sp-inner">
          <div id="sp-icon-${item.id}" class="sp-icon"></div>
          <p id="sp-msg-${item.id}"></p>
          <div class="sp-actions">${shareButtons}</div>
        </div>
      </div>
    `;
  }).join('');
}

function escQ(s){ return s.replace(/'/g,"\\'"); }

function selectMood(classId, classLabel, mood){
  document.querySelectorAll('.support-popup').forEach(p => p.classList.add('hidden'));
  pendingMoodSel = {classId, classLabel, mood};
  const cfg = MOOD_CFG[mood];
  const popup  = document.getElementById(`mood-support-popup-${classId}`);
  const iconEl = document.getElementById(`sp-icon-${classId}`);
  const msgEl  = document.getElementById(`sp-msg-${classId}`);
  if(popup && iconEl && msgEl){
    iconEl.textContent = cfg.icon;
    msgEl.textContent  = cfg.msg;
    popup.classList.remove('hidden');
  }
  if(NEGATIVE_MOODS.includes(mood)){
    if(!S.get('sw_dismissed_' + CU.id)){
      setTimeout(() => showSWPopup(mood), 1500);
    }
  }
}

function saveMood(shared){
  if(!pendingMoodSel) return;
  const moods = gm().filter(m => !(m.studentId===CU.id && m.classId===pendingMoodSel.classId && m.date===today()));
  moods.push({studentId:CU.id, classId:pendingMoodSel.classId, classLabel:pendingMoodSel.classLabel, mood:pendingMoodSel.mood, date:today(), shared});
  S.set('moods', moods);
  pendingMoodSel = null;
  document.querySelectorAll('.support-popup').forEach(p => p.classList.add('hidden'));
  toast('Mood saved! ' + (shared && hasClasses() ? 'Shared with teacher.' : 'Saved privately.'));
  renderMoodCheck();
}

function showSWPopup(mood){
  if(sessionStorage.getItem('sw_popup_shown')) return;
  let swInfo = null;
  if(hasClasses()){
    const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
    if(myClasses.length > 0){
      const teacher = gt().find(t => t.id === myClasses[0].teacherId);
      if(teacher?.socialWorker) swInfo = teacher.socialWorker;
    }
  }
  const contactEl = document.getElementById('sw-contact-display');
  if(swInfo){
    contactEl.innerHTML = `
      <div class="sw-contact-box">
        <strong>Your School Social Worker</strong>
        <div>${escapeHtml(swInfo.name)}</div>
        <div><a href="mailto:${escapeHtml(swInfo.email)}">${escapeHtml(swInfo.email)}</a></div>
        <p style="font-size:.78rem;color:var(--muted);margin-top:6px">They won't be notified automatically - this is just their contact info.</p>
      </div>`;
  } else {
    contactEl.innerHTML = `<div class="sw-contact-box"><strong>💙 Help is available</strong><p style="font-size:.88rem;margin-top:4px">Head to Help & Crisis for 24/7 support lines.</p></div>`;
  }
  document.getElementById('sw-popup').classList.remove('hidden');
  sessionStorage.setItem('sw_popup_shown', '1');
}

function dismissSWPopup(dontShowAgain){
  closeModal('sw-popup');
  if(dontShowAgain){
    S.set('sw_dismissed_' + CU.id, true);
    toast("Got it - we won't show this again 👍");
  }
}

// GOALS
function renderGoalsSection(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const sel = document.getElementById('goal-cls-sel');
  if(hasClasses()){
    sel.style.display = '';
    sel.innerHTML = `<option value="">All Tasks</option>` + myClasses.map(c=>`<option value="${c.id}">${escapeHtml(c.subject)}</option>`).join('');
  } else {
    sel.style.display = 'none';
  }
  renderGoals();
}

function renderGoals(){
  const classFilter=document.getElementById('goal-cls-sel')?.value||'';
  let goals=ggo().filter(g=>g.studentId===CU.id);
  if(classFilter) goals=goals.filter(g=>g.classId===classFilter);

  const container=document.getElementById('goals-container');
  if(goals.length===0){
    container.innerHTML=`<div class="ai-nudge"><div class="ai-nudge-icon">🎯</div><div><strong>No tasks yet</strong><p>Add your first task above!</p></div></div>`;
    return;
  }
  container.innerHTML='';
  DAYS.forEach(day=>{
    const dg=goals.filter(g=>g.day===day);
    if(!dg.length)return;
    const dl=document.createElement('div');
    dl.className='day-label'; dl.textContent=day;
    container.appendChild(dl);
    dg.sort((a,b)=>a.time.localeCompare(b.time)).forEach(g=>{
      const row=document.createElement('div');
      row.className='goal-row'+(g.done?' done':'');
      row.innerHTML=`
        <div class="gcheck ${g.done?'checked':''}" role="button" tabindex="0" aria-pressed="${g.done?'true':'false'}" aria-label="Mark ${escapeHtml(g.task)} as ${g.done?'not done':'done'}" onclick="toggleGoal('${g.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleGoal('${g.id}');}">${g.done?'✓':''}</div>
        <div class="ginfo">
          <h5 style="${g.done?'text-decoration:line-through':''}">${escapeHtml(g.task)}</h5>
          <span class="gmeta">🕐 ${escapeHtml(g.time)} · ⏱ ${escapeHtml(g.duration)}</span>
        </div>
        <span class="gtype-badge gtype-${g.type||'study'}">${typeLabel(g.type)}</span>
        <button class="gdel" onclick="deleteGoal('${g.id}')">🗑</button>
      `;
      container.appendChild(row);
    });
  });
}


function openGoalModal(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const sel = document.getElementById('gm-class');
  const clsGroup = sel?.closest('.fgroup');
  if(hasClasses()){
    if(clsGroup) clsGroup.style.display = '';
    sel.innerHTML = `<option value=""> - No specific class - </option>` + myClasses.map(c=>`<option value="${c.id}">${escapeHtml(c.subject)}</option>`).join('');
  } else {
    if(clsGroup) clsGroup.style.display = 'none';
    sel.innerHTML = '';
  }
  openModal('goal-modal');
}

function addGoal(){
  const task=document.getElementById('gm-task').value.trim();
  const day =document.getElementById('gm-day').value;
  const time=document.getElementById('gm-time').value;
  const dur =document.getElementById('gm-dur').value;
  const type=document.getElementById('gm-type').value;
  const cls =document.getElementById('gm-class').value;
  if(!task)return toast('Please enter a task name.');
  const goals=ggo();
  goals.push({id:'g'+uid8(),studentId:CU.id,classId:cls,task,day,time,duration:dur,type,done:false,created:today()});
  S.set('goals',goals);
  closeModal('goal-modal');
  document.getElementById('gm-task').value='';
  toast('Task added! 🎯');
  renderGoals();
}

function toggleGoal(id){
  const goals=ggo(); const g=goals.find(x=>x.id===id); if(g)g.done=!g.done;
  S.set('goals',goals); renderGoals();
}
function quickToggleGoal(id){ toggleGoal(id); renderHome(); }
function deleteGoal(id){ S.set('goals',ggo().filter(g=>g.id!==id)); toast('Task removed.'); renderGoals(); }

function typeLabel(type){
  return {study:'📖 Study',gym:'🏋️ Gym',rest:'😴 Rest',personal:'🏠 Personal',social:'👥 Social',other:'📌 Other'}[type]||'📖 Study';
}

// CALENDAR
function renderCalendar(){
  const goals=ggo().filter(g=>g.studentId===CU.id);
  const myClasses=gc().filter(c=>CU.classIds&&CU.classIds.includes(c.id));
  const todayDay=new Date().toLocaleDateString('en-CA',{weekday:'long'});
  const wrap=document.getElementById('cal-wrap');

  const grid=document.createElement('div'); grid.className='cal-grid';
  DAYS.forEach(day=>{
    const col=document.createElement('div'); col.className='cal-col';
    const isToday=day===todayDay;
    col.innerHTML=`<div class="cal-day-hdr ${isToday?'today':''}">${day.slice(0,3)}${isToday?' · Today':''}</div>`;

    myClasses.filter(c=>c.days?.includes(day)).forEach(c=>{
      const ev=document.createElement('div'); ev.className='cal-event';
      ev.textContent=`${c.startTime} ${c.subject}`;
      col.appendChild(ev);
    });

    goals.filter(g=>g.day===day).sort((a,b)=>a.time.localeCompare(b.time)).forEach(g=>{
      const ev=document.createElement('div'); ev.className=`cal-event ${g.type||'study'}`;
      ev.textContent=`${g.time} ${g.task}`;
      col.appendChild(ev);
    });

    if(!col.querySelector('.cal-event')){
      const emp=document.createElement('div'); emp.className='cal-empty'; emp.textContent='Free day';
      col.appendChild(emp);
    }
    grid.appendChild(col);
  });
  wrap.innerHTML=''; wrap.appendChild(grid);
}

// STATS
function renderStats(){
  const classes = gc();
  const activeClassIds = new Set(classes.map(c => c.id));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  // MOOD PRUNE: drop anything shared to a class that's since been deleted
  // (no teacher left who could see it), AND anything older than 7 days so
  // history doesn't grow forever - matches the same weekly-reset behavior
  // as the Wellness tracker.
  const allMoods = gm();
  const keptMoods = allMoods.filter(m => {
    if(m.studentId !== CU.id) return true; // never touch other students' rows
    if(m.date < cutoffStr) return false;
    if(m.classId && m.classId !== 'general' && !activeClassIds.has(m.classId)) return false;
    return true;
  });
  if(keptMoods.length !== allMoods.length) S.set('moods', keptMoods);

  const myMoods=keptMoods.filter(m=>m.studentId===CU.id);
  const myGoals=ggo().filter(g=>g.studentId===CU.id);
  const completed=myGoals.filter(g=>g.done).length;
  const shared=myMoods.filter(m=>m.shared).length;
  document.getElementById('stats-cards').innerHTML=`
    <div class="stat-card"><div class="stat-n">${myMoods.length}</div><div class="stat-l">Mood Check-ins</div></div>
    <div class="stat-card"><div class="stat-n">${myGoals.length}</div><div class="stat-l">Total Tasks</div></div>
    <div class="stat-card"><div class="stat-n">${completed}</div><div class="stat-l">Completed</div></div>
    <div class="stat-card"><div class="stat-n">${shared}</div><div class="stat-l">Moods Shared</div></div>
  `;
  const hist=document.getElementById('mood-history');
  hist.innerHTML=[...myMoods].reverse().slice(0,20).map(m=>{
    const cls=classes.find(c=>c.id===m.classId);
    return `<div class="mood-hist-item">
      <span class="mtag ${m.mood}">${MOOD_CFG[m.mood]?.icon} ${escapeHtml(m.mood)}</span>
      <span>${escapeHtml(cls?.subject||m.classLabel||'General')}</span>
      <span style="margin-left:auto;color:var(--muted);font-size:.78rem">${m.date}</span>
    </div>`;
  }).join('')||'<p style="color:var(--muted);padding:16px 0">No mood history yet.</p>';
}
// ─────────────────────────────────────────────
// WELLNESS LOG CLEANUP - runs every time the Wellness section loads.
//   1) Class-deleted prune: if a log was shared to a class that no longer
//      exists, there's no teacher left who can see it - drop it so the
//      student's own view doesn't show stale "Sent to teacher" entries
//      for a class that's gone.
//   2) Weekly rolling window: anything older than 7 days is dropped so
//      the list doesn't grow forever. Applies to private and shared
//      entries alike. Journals are untouched - that's a long-term
//      reflective log, kept on purpose.
// ─────────────────────────────────────────────
function pruneWellnessLogs(){
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const activeClassIds = new Set(gc().map(c => c.id));

  const before = gw();
  const kept = before.filter(w => {
    if(w.studentId !== CU.id) return true; // never touch other students' rows
    if(w.date < cutoffStr) return false;
    if(w.shared && w.sharedWith?.classId && !activeClassIds.has(w.sharedWith.classId)) return false;
    return true;
  });
  if(kept.length !== before.length) S.set('wellness', kept);
}

// Injects (once) a "view by teacher" filter dropdown above a log list,
// then re-renders that list whenever it changes.
function ensureLogFilterDropdown(type, displayElId, myClasses, onChangeFn){
  const displayEl = document.getElementById(displayElId);
  if(!displayEl) return;
  let sel = document.getElementById(`${type}-log-filter`);
  if(!sel){
    sel = document.createElement('select');
    sel.id = `${type}-log-filter`;
    sel.style.cssText = 'margin-bottom:8px;width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--border);font-size:.8rem;background:var(--surface)';
    displayEl.parentNode.insertBefore(sel, displayEl);
    sel.addEventListener('change', onChangeFn);
  }
  const opts = [`<option value="">All entries</option>`]
    .concat(myClasses.map(c=>`<option value="${c.id}">Sent to ${escapeHtml(c.subject)}</option>`))
    .concat([`<option value="__private">Private only</option>`]);
  sel.innerHTML = opts.join('');
  sel.style.display = myClasses.length ? '' : 'none';
}

function renderSleepLog(){
  const filterVal = document.getElementById('sleep-log-filter')?.value || '';
  let logs = gw().filter(w => w.studentId === CU.id && w.type==='sleep');
  if(filterVal === '__private') logs = logs.filter(l => !l.shared);
  else if(filterVal) logs = logs.filter(l => l.shared && l.sharedWith?.classId === filterVal);
  logs = logs.slice(-5).reverse();
  document.getElementById('sleep-log-display').innerHTML = logs.map(l=>`
    <div class="wlog-entry">
      <span>${escapeHtml(l.date)} · ${escapeHtml(l.hours)}h · ${escapeHtml(l.quality)}</span>
      <span style="color:var(--muted);font-size:.75rem">${l.sharedWith ? '📤 Sent to teacher' : '🔒 Private'}</span>
    </div>`).join('') || '<p style="color:var(--muted);font-size:.82rem;padding:8px 0">No entries in the last 7 days.</p>';
}

function renderRespLog(){
  const filterVal = document.getElementById('resp-log-filter')?.value || '';
  let logs = gw().filter(w => w.studentId === CU.id && w.type==='resp');
  if(filterVal === '__private') logs = logs.filter(l => !l.shared);
  else if(filterVal) logs = logs.filter(l => l.shared && l.sharedWith?.classId === filterVal);
  logs = logs.slice(-5).reverse();
  document.getElementById('resp-log-display').innerHTML = logs.map(l=>`
    <div class="wlog-entry"><span>${escapeHtml(l.text)}</span><span>${escapeHtml(l.date)}</span></div>`).join('') || '<p style="color:var(--muted);font-size:.82rem;padding:8px 0">No entries in the last 7 days.</p>';
}

// WELLNESS
function renderWellnessSection(){
  pruneWellnessLogs();

  const myClasses = gc().filter(c => CU.classIds?.includes(c.id));

  ensureLogFilterDropdown('sleep', 'sleep-log-display', myClasses, renderSleepLog);
  ensureLogFilterDropdown('resp',  'resp-log-display',  myClasses, renderRespLog);

  renderSleepLog();
  renderRespLog();

  const shareRows = ['sleep-share-row','resp-share-row','energy-share-row'];
  shareRows.forEach(id => {
    const row = document.getElementById(id);
    if(row) row.style.display = hasClasses() ? '' : 'none';
  });

  if(hasClasses()){
    const teacherOpts = myClasses.map(c => {
      const teacher = gt().find(t => t.id === c.teacherId);
      return `<option value="${c.teacherId}|${c.id}">${c.subject} (${teacher?.name || 'Teacher'})</option>`;
    }).join('');
    const optHtml = `<option value="">Pick a period…</option>` + teacherOpts;
    ['sleep-teacher-sel','resp-teacher-sel','energy-teacher-sel'].forEach(id => {
      const sel = document.getElementById(id);
      if(sel) sel.innerHTML = optHtml;
    });
    ['sleep','resp','energy'].forEach(type => {
      const cb  = document.getElementById(`share-${type}`);
      const sel = document.getElementById(`${type}-teacher-sel`);
      if(cb && sel){
        cb.onchange = () => sel.classList.toggle('hidden', !cb.checked);
      }
    });
  }
}

function logWellness(type){
  const logs = gw();

  function getShareTarget(checkboxId, selId){
    const cb = document.getElementById(checkboxId);
    if(!cb?.checked) return { shared: false, sharedWith: null };
    const sel = document.getElementById(selId);
    const val = sel?.value || '';
    const [teacherId, classId] = val.split('|');
    return { shared: true, sharedWith: { teacherId, classId } };
  }

  if(type === 'sleep'){
    const hours   = document.getElementById('w-sleep').value;
    const quality = document.getElementById('w-sleep-quality').value;
    if(!hours || !quality) return toast('Please fill in sleep hours and quality.');
    const { shared, sharedWith } = getShareTarget('share-sleep','sleep-teacher-sel');
    if(shared && !sharedWith?.teacherId) return toast('Please pick which teacher to send this to.');
    logs.push({ id:'w'+uid8(), studentId:CU.id, type:'sleep', hours, quality, shared, sharedWith, date:today() });
    toast(shared ? `Sleep sent to ${getTeacherName(sharedWith.teacherId)} 📤` : 'Sleep logged privately 😴');
  } else if(type === 'resp'){
    const text = document.getElementById('w-resp').value.trim();
    if(!text) return toast('Please describe your responsibility.');
    const { shared, sharedWith } = getShareTarget('share-resp','resp-teacher-sel');
    if(shared && !sharedWith?.teacherId) return toast('Please pick which teacher to send this to.');
    logs.push({ id:'w'+uid8(), studentId:CU.id, type:'resp', text, shared, sharedWith, date:today() });
    document.getElementById('w-resp').value = '';
    toast(shared ? `Responsibility sent to ${getTeacherName(sharedWith.teacherId)} 📤` : 'Responsibility logged.');
  } else if(type === 'energy'){
    const energy = document.getElementById('w-energy').value;
    const water  = document.getElementById('w-water').value;
    const { shared, sharedWith } = getShareTarget('share-energy','energy-teacher-sel');
    if(shared && !sharedWith?.teacherId) return toast('Please pick which teacher to send this to.');
    logs.push({ id:'w'+uid8(), studentId:CU.id, type:'energy', energy, water, shared, sharedWith, date:today() });
    toast(shared ? `Energy data sent to ${getTeacherName(sharedWith.teacherId)} 📤` : 'Logged! ⚡');
  }
  S.set('wellness', logs);
  renderWellnessSection();
}

function getTeacherName(teacherId){
  const t = gt().find(x => x.id === teacherId);
  return t ? t.name : 'your teacher';
}

function saveJournal(){
  const text=document.getElementById('w-journal').value.trim();
  if(!text)return;
  const journals=gj();
  journals.push({studentId:CU.id,text,date:today(),time:new Date().toLocaleTimeString()});
  S.set('journals',journals);
  document.getElementById('journal-saved').classList.remove('hidden');
  setTimeout(()=>document.getElementById('journal-saved').classList.add('hidden'),3000);
}

// HELP
function renderHelpSection(){
  let province = 'Ontario';
  if(hasClasses()){
    const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
    if(myClasses.length > 0){
      const teacher = gt().find(t => t.id === myClasses[0].teacherId);
      if(teacher?.province) province = teacher.province;
    }
  }
  const el = document.getElementById('help-content');
  el.innerHTML = buildHelplinesHTML(province, !hasClasses());
}

function buildHelplinesHTML(province, hideProvinceLabel=false){
  const data = HELPLINES[province] || HELPLINES.default;
  const provinceNote = hideProvinceLabel ? '' : `<p style="font-size:.85rem;color:var(--muted);margin-bottom:20px">Showing resources for: <strong>${province}</strong></p>`;
  return `
    <div class="emergency-banner">🚨 If someone is in immediate danger, call 911 now.</div>
    ${provinceNote}
    <div class="helpline-section">
      <h3>📞 Phone & Text Support</h3>
      ${data.phone.map(h=>`
        <div class="helpline-card">
          <h4>${h.name}</h4>
          <p style="font-size:.85rem;color:var(--text-2);margin-bottom:6px">${h.desc}</p>
          <div class="contact-row">${h.contact||''}</div>
          <div class="contact-row" style="margin-top:4px"><a href="${h.url}" target="_blank">🌐 ${h.url}</a></div>
        </div>
      `).join('')}
    </div>
    ${data.online?`
    <div class="helpline-section">
      <h3>🌐 Online Resources & Websites</h3>
      ${data.online.map(h=>`
        <div class="helpline-card">
          <h4>${h.name}</h4>
          <p style="font-size:.85rem;color:var(--text-2);margin-bottom:6px">${h.desc}</p>
          <a href="${h.url}" target="_blank">🌐 ${h.url}</a>
        </div>
      `).join('')}
    </div>`:''}
  `;
}

function showHelplines(){
  document.getElementById('quick-helpline-content').innerHTML=buildHelplinesHTML('Ontario');
  showScreen('quick-helplines');
}

function buildClassBannerHTML(c, isTeacher=false){
  const color    = c.color || '#1d5fa6';
  const textColor = getContrastColor(color);
  // BUGFIX: this used to only render the subject name when c.logo or
  // c.emoji was set. If a teacher created a class with just a banner
  // color (the normal case - logo/emoji is optional), it fell through
  // to `<div class="cls-banner" style="background:${color}"></div>` -
  // a bare colored strip with no text anywhere in it. That's why banners
  // showed only a color and never the class name. Now the subject name
  // always renders on the banner; the logo/emoji is just an optional
  // icon alongside it.
  const iconHtml = c.logo
    ? `<img class="cls-banner-logo" src="${escapeHtml(c.logo)}" alt="logo"/>`
    : (c.emoji ? `<span class="cls-banner-emoji">${escapeHtml(c.emoji)}</span>` : '');
  return `<div class="cls-banner-header" style="background:${color};color:${textColor}">
    ${iconHtml}
    <div class="cls-banner-text"><h4 style="color:${textColor}">${escapeHtml(c.subject)}</h4></div>
  </div>`;
}

function getContrastColor(hex){
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

// CLASSES (student)
function renderClassesSection(){
  const myClasses=gc().filter(c=>CU.classIds&&CU.classIds.includes(c.id));
  const list=document.getElementById('s-classes-list');
  if(myClasses.length===0){
    list.innerHTML=`<p style="color:var(--muted);padding:20px 0">No classes joined yet. Enter a class code above from your teacher.</p>`;
  } else {
    const order = CU.periodOrder?.length ? CU.periodOrder : myClasses.map(c=>c.id);
    const ordered = order.map(id=>myClasses.find(c=>c.id===id)).filter(Boolean);
    myClasses.forEach(c=>{ if(!ordered.find(x=>x.id===c.id)) ordered.push(c); });
    list.innerHTML=ordered.map((c,i)=>{
      const bannerHtml = buildClassBannerHTML(c, false);
      return `
        <div class="s-class-card">
          ${bannerHtml}
          <div class="s-class-card-body">
            <div class="s-class-meta">Period ${i+1} · ${escapeHtml(c.startTime)} - ${escapeHtml(c.endTime)} · ${escapeHtml(c.days?.join(', ')||'-')}</div>
            <span class="cls-code-badge">${escapeHtml(c.code)}</span>
         ${c.bannerMsg?`<div class="cls-banner-msg" style="margin-top:10px">${escapeHtml(c.bannerMsg)}</div>`:''}
            <button class="btn-danger small" style="margin-top:10px" onclick="leaveClass('${c.id}','${escQ(c.subject)}')">Leave Class</button>
          </div>
        </div>`;
    }).join('');
  }
  if(myClasses.length>1){
    document.getElementById('period-order-wrap').classList.remove('hidden');
    const order=CU.periodOrder?.length?CU.periodOrder:myClasses.map(c=>c.id);
    const orderedClasses=order.map(id=>myClasses.find(c=>c.id===id)).filter(Boolean);
    myClasses.forEach(c=>{ if(!orderedClasses.find(x=>x.id===c.id)) orderedClasses.push(c); });
    periodOrder=[...orderedClasses.map(c=>c.id)];
    document.getElementById('period-order-list').innerHTML=orderedClasses.map((c,i)=>`
      <div class="period-row" id="pr-${c.id}" data-id="${c.id}">
        <span class="period-handle">⠿</span>
        <span style="flex:1">${i+1}. ${escapeHtml(c.subject)} <span style="color:var(--muted);font-size:.8rem">${escapeHtml(c.startTime)} - ${escapeHtml(c.endTime)}</span></span>
        <div class="period-arrows">
          <button onclick="movePeriod('${c.id}',-1)" title="Move up">▲</button>
          <button onclick="movePeriod('${c.id}',1)" title="Move down">▼</button>
        </div>
      </div>
    `).join('');
  } else {
    document.getElementById('period-order-wrap').classList.add('hidden');
  }
}

function movePeriod(id,dir){
  const idx=periodOrder.indexOf(id);
  if(idx<0)return;
  const newIdx=idx+dir;
  if(newIdx<0||newIdx>=periodOrder.length)return;
  [periodOrder[idx],periodOrder[newIdx]]=[periodOrder[newIdx],periodOrder[idx]];
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.periodOrder=periodOrder; S.set('students',students); CU.periodOrder=periodOrder; }
  renderClassesSection();
}

function savePeriodOrder(){
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.periodOrder=periodOrder; S.set('students',students); CU.periodOrder=periodOrder; }
  toast('Period order saved! ✓');
}

// ─────────────────────────────────────────────
// CLASSES (student) - JOIN A CLASS BY CODE
// Single, correct version. Updates:
//   - student's local 'students' cache entry
//   - /profiles/{uid}  (so teacher queries find this student)
//   - /users/{uid}     (so loadStudentData can rebuild the student row)
// Then invalidates the teacher cache so the teacher sees it on next load.
// ─────────────────────────────────────────────
async function joinClass(){
  const inp  = document.getElementById('join-code');
  const code = (inp?.value || '').trim().toUpperCase();
  if(!code) return toast('Please enter a class code.');

  const classes = await fsGetAllClasses();
  cSet('classes', classes);
  const cls = classes.find(c => c.code === code);
  if(!cls) return toast(`Class code "${code}" not found. Double-check with your teacher.`);
  if(CU.classIds?.includes(cls.id)) return toast("You're already in this class!");

  // Update local student list entry
  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if(s){
    s.classIds = [...(s.classIds || []), cls.id];
    S.set('students', students);
    CU.classIds = s.classIds;
  } else {
    CU.classIds = [...(CU.classIds || []), cls.id];
  }

  // Track which teacher(s) this student is now connected to, as a plain
  // array of teacher UIDs on their own profile. Security rules can check
  // this single, direct field to grant a teacher read access to this
  // student's private /users/{uid} doc - far simpler than cross-referencing
  // classIds arrays across two different documents inside a rule.
  const existingTeacherUids = new Set(CU.teacherUids || []);
  existingTeacherUids.add(cls.teacherUid || cls.teacherId); // teacherUid is the auth uid; fall back if not present
  CU.teacherUids = [...existingTeacherUids];

  if(fbAuth?.currentUser){
    // Update /profiles/{uid} - this is what the teacher's query reads,
    // and now also carries teacherUids for the security rule check.
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds, teacherUids: CU.teacherUids }, { merge: true });

    // Update /users/{uid} so loadStudentData() can find/rebuild this student's row
    const userDoc = await fbDb.collection('users').doc(fbAuth.currentUser.uid).get();
    let existingStudents = [];
    if(userDoc.exists){
      try{ existingStudents = JSON.parse(userDoc.data().students || '[]'); }catch{}
    }
    let myEntry = existingStudents.find(x => x.id === CU.id);
    if(!myEntry){
      myEntry = {
        id: CU.id, name: CU.name, email: CU.email, grade: CU.grade,
        periodOrder: CU.periodOrder || [], joined: CU.joined || today()
      };
      existingStudents.push(myEntry);
    }
    myEntry.classIds = CU.classIds;
    await fbDb.collection('users').doc(fbAuth.currentUser.uid).set({
      students: JSON.stringify(existingStudents)
    }, { merge: true });
  }

  if(inp) inp.value = '';
  toast(`Joined ${cls.subject}! 🎉`);
  updateStudentNav();

  // Refresh whichever screen is visible
  if(document.getElementById('s-sec-classes')?.classList.contains('active')) renderClassesSection();
  else renderHome();

  // So the teacher's next dashboard load picks up the new student immediately
  invalidateTeacherCache();
}

// ─────────────────────────────────────────────
// TEACHER DASHBOARD
// ─────────────────────────────────────────────
function loadTeacherDash(){
  showScreen('screen-teacher');
  const el=document.getElementById('screen-teacher');
  el.style.display='flex'; el.classList.add('active');
  document.getElementById('t-greet').textContent=`Welcome, ${CU.name}! 📋`;
  document.getElementById('t-date').textContent=new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('t-av').textContent=CU.name[0].toUpperCase();
  // Load student data in background
  loadTeacherStudents().then(()=>{ if(document.getElementById('t-sec-students')?.classList.contains('active')) renderStudentTable(); });
  tSection('overview');
}

function tSection(name){
  document.querySelectorAll('#t-sidebar .sn').forEach(n=>n.classList.remove('active'));
  const navMap=['overview','classes','students','moods','wellness','goals','alerts','summary','help','settings','profile'];
  const idx=navMap.indexOf(name);
  const navItems=document.querySelectorAll('#t-sidebar .sn');
  if(navItems[idx]) navItems[idx].classList.add('active');
  document.querySelectorAll('#t-main .dsec').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('t-sec-'+name);
  if(sec) sec.classList.add('active');

  if(name==='overview')  { loadTeacherStudents().then(renderTeacherOverview); }
  if(name==='classes')   { loadTeacherStudents().then(renderTeacherClasses); }
  if(name==='students')  { loadTeacherStudents().then(renderStudentTable); }
  if(name==='moods')     { loadTeacherStudents().then(renderMoodReports); }
  if(name==='wellness')  { loadTeacherStudents().then(renderWellnessTable); }
  if(name==='goals')     { loadTeacherStudents().then(renderTeacherGoals); }
  if(name==='alerts')    { loadTeacherStudents().then(renderAlerts); }
   if(name==='summary')   { loadTeacherStudents().then(renderWeeklySummary); }
  if(name==='help')      renderTeacherHelp();
  if(name==='settings')  renderSettings();
  if(name==='profile')   renderTeacherProfile();
}

function getMyClasses(){ return gc().filter(c=>c.teacherId===CU.id); }
function getMyStudents(){
  const myIds = getMyClasses().map(c=>c.id);
  if(!myIds.length) return [];

  const cached = gs().filter(s=>s.classIds?.some(id=>myIds.includes(id)));

  if(cached.length === 0 && myIds.length > 0){
    console.warn('⚠️ getMyStudents: Cache is empty but teacher has classes. Data may not be loaded yet.');
  }

  return cached;
}

// OVERVIEW
function renderTeacherOverview(){
  const students=getMyStudents();
  const classes=getMyClasses();
  const myClassIds=classes.map(c=>c.id);
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared&&myClassIds.includes(m.classId));
  const alerts=moods.filter(m=>NEGATIVE_MOODS.includes(m.mood));
  document.getElementById('t-stats-row').innerHTML=`
    <div class="tstat blue"><div class="tstat-n">${students.length}</div><div class="tstat-l">Students</div></div>
    <div class="tstat green"><div class="tstat-n">${classes.length}</div><div class="tstat-l">Classes</div></div>
    <div class="tstat amber"><div class="tstat-n">${moods.length}</div><div class="tstat-l">Mood Check-ins</div></div>
    <div class="tstat red"><div class="tstat-n">${alerts.length}</div><div class="tstat-l">Need Support</div></div>
  `;
  document.getElementById('t-alert-badge').textContent=alerts.length;
  const prev=document.getElementById('t-alerts-preview');
  if(alerts.length===0){ prev.innerHTML=''; return; }
  prev.innerHTML=`
    <div style="background:var(--red-lt);border:1px solid #fca5a5;border-radius:var(--r-md);padding:16px 20px;margin-top:4px">
      <h4 style="color:var(--red);margin-bottom:10px">⚠️ ${alerts.length} student${alerts.length>1?'s need':'needs'} support today</h4>
      ${alerts.slice(0,4).map(a=>{ const s=students.find(x=>x.id===a.studentId); return `<p style="font-size:.88rem;margin-bottom:4px">• <strong>${escapeHtml(s?.name||'Student')}</strong> - feeling <em>${escapeHtml(a.mood)}</em></p>`; }).join('')}
    </div>`;
}

function renderTeacherClasses(){
  const classes = getMyClasses();
  const students = getMyStudents();
  const grid = document.getElementById('t-classes-grid');
  if(classes.length === 0){
    grid.innerHTML = '<p style="color:var(--muted);padding:20px 0">No classes yet. Create one above!</p>'; return;
  }
  grid.innerHTML = classes.map(c => {
    const count = students.filter(s => s.classIds?.includes(c.id)).length;
    const bannerHtml = buildClassBannerHTML(c, true);
    return `
      <div class="t-class-card">
        ${bannerHtml}
        <div class="t-class-card-body">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span class="cls-code-badge">${escapeHtml(c.code)}</span>
            <span style="font-size:.8rem;color:var(--muted)">${count} student${count!==1?'s':''}</span>
          </div>
          <span class="cls-time">🕐 ${escapeHtml(c.startTime)} - ${escapeHtml(c.endTime)} · ${escapeHtml(c.days?.join(', ')||'-')}</span>
          ${c.bannerMsg ? `<div class="cls-banner-msg">${escapeHtml(c.bannerMsg)}</div>` : ''}
          <div class="t-class-actions">
            <button class="btn-outline small" onclick="copyCode('${c.code}')">📋 Copy Code</button>
            <button class="btn-outline small" onclick="deleteClass('${c.id}')" style="padding:7px 10px">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// STUDENTS TABLE
function renderStudentTable(){
  const myClasses = getMyClasses();
  const students  = getMyStudents();
  const filterSel = document.getElementById('t-cls-filter');
  filterSel.innerHTML = '<option value="">All Classes</option>' + myClasses.map(c=>`<option value="${c.id}">${escapeHtml(c.subject)}</option>`).join('');

  const search    = (document.getElementById('t-search')?.value||'').toLowerCase();
  const clsFilter = document.getElementById('t-cls-filter')?.value||'';
  let filtered    = students;
  if(clsFilter) filtered = filtered.filter(s=>s.classIds?.includes(clsFilter));
  if(search)    filtered = filtered.filter(s=>s.name.toLowerCase().includes(search)||s.email.includes(search));

  const moods = gm().filter(m=>m.shared);
  const wrap  = document.getElementById('t-student-table');
  if(filtered.length===0){ wrap.innerHTML='<p style="color:var(--muted);padding:24px 0">No students found.</p>'; return; }

  wrap.innerHTML = `<div class="table-scroll">
    <table>
      <thead><tr>
        <th>Name</th><th>Grade</th><th>Classes</th>
        <th>Today's Mood</th><th>Sleep</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${filtered.map(s=>{
          const todayMoods = moods.filter(m=>m.studentId===s.id&&m.date===today());
          const isAlert    = todayMoods.some(m=>NEGATIVE_MOODS.includes(m.mood));
          const cls        = myClasses.filter(c=>s.classIds?.includes(c.id));
          const sleepLog   = gw().filter(w=>w.studentId===s.id&&w.type==='sleep'&&w.shared&&w.date===today())[0];
          const moodDisplay= todayMoods.length
            ? todayMoods.map(m=>`<span class="mood-tag-sm ${m.mood}">${MOOD_CFG[m.mood]?.icon} ${escapeHtml(m.mood)}</span>`).join('')
            : '<span style="color:var(--muted);font-size:.82rem">Not logged</span>';
          const clsNames   = cls.map(c=>{
            const short = c.subject.length > 20 ? c.subject.slice(0,18)+'…' : c.subject;
            return `<span title="${escapeHtml(c.subject)}" style="display:inline-block;background:var(--blue-pale);color:var(--blue);border-radius:5px;padding:1px 6px;font-size:.72rem;font-weight:700;margin:1px">${escapeHtml(short)}</span>`;
          }).join('');
          return `<tr class="${isAlert?'alert-row':''}">
            <td><strong>${escapeHtml(s.name)}</strong><br><span style="font-size:.75rem;color:var(--muted)">${escapeHtml(s.email)}</span></td>
            <td style="white-space:nowrap">${escapeHtml(s.grade||'-')}</td>
            <td>${clsNames||'-'}</td>
            <td style="min-width:120px">${moodDisplay}</td>
            <td style="white-space:nowrap">${sleepLog?`<strong>${escapeHtml(sleepLog.hours)}h</strong> · ${escapeHtml(sleepLog.quality)}`:'<span style="color:var(--muted)"> - </span>'}</td>
            <td style="white-space:nowrap">${isAlert?'<span style="color:var(--red);font-weight:700;font-size:.85rem">⚠️ Needs support</span>':'<span style="color:var(--green);font-size:.85rem">✅ OK</span>'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

// MOOD REPORTS
function renderMoodReports(){
  const students=getMyStudents();
  const myClassIds = getMyClasses().map(c => c.id);
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared&&myClassIds.includes(m.classId));
  const grid=document.getElementById('t-mood-grid');
  if(students.length===0){ grid.innerHTML='<p style="color:var(--muted)">No students yet.</p>'; return; }
  const activeStudents = students.filter(s => s.classIds?.some(id => myClassIds.includes(id)));
  grid.innerHTML=activeStudents.map(s=>{
    const sm=moods.filter(m=>m.studentId===s.id);
    const counts={};
    sm.forEach(m=>{ counts[m.mood]=(counts[m.mood]||0)+1; });
    const total=sm.length||1;
    const isAlert=sm.some(m=>NEGATIVE_MOODS.includes(m.mood)&&m.date===today());
    const studentClasses = getMyClasses().filter(c => s.classIds?.includes(c.id));
    const classBadges = studentClasses.map(c => {
      const textColor = getContrastColor(c.color || '#1d5fa6');
      return `<span style="display:inline-block;background:${c.color||'#1d5fa6'};color:${textColor};border-radius:5px;padding:2px 8px;font-size:.72rem;font-weight:700;margin:2px 2px 6px 0">${escapeHtml(c.subject)}</span>`;
    }).join('');
    return `
      <div class="t-mood-card" ${isAlert?'style="border:2px solid var(--red)"':''}>
        <h4>${escapeHtml(s.name)} ${isAlert?'⚠️':''}</h4>
        <div style="margin-bottom:8px">${classBadges}</div>
        ${Object.entries(counts).map(([mood,n])=>`
          <div class="mbar-row">
            <span style="width:80px;font-size:.78rem">${MOOD_CFG[mood]?.icon} ${escapeHtml(mood)}</span>
            <div class="mbar-track"><div class="mbar-fill" style="width:${(n/total*100).toFixed(0)}%;background:${NEGATIVE_MOODS.includes(mood)?'var(--red)':'var(--blue)'}"></div></div>
            <span style="font-size:.78rem">${n}</span>
          </div>`).join('')||'<p style="color:var(--muted);font-size:.82rem">No shared moods yet</p>'}
      </div>`;
  }).join('');
}
// WELLNESS TABLE
function renderWellnessTable(){
  const students = getMyStudents();
  const myClassIds = getMyClasses().map(c => c.id);
const allW = gw().filter(w =>
    w.shared &&
    myClassIds.includes(w.sharedWith?.classId)
  );
  const allR = S.get('responsibilities',[]).filter(r =>
    r.shared &&
    students.some(s => s.id === r.studentId) &&
    myClassIds.includes(r.sharedWith?.classId)
  );
  const wrap = document.getElementById('t-wellness-table');
  const classes = getMyClasses();
  let html = '';
  if(allR.length > 0){
    const grouped = {};
    allR.forEach(r => { if(!grouped[r.studentId]) grouped[r.studentId]=[]; grouped[r.studentId].push(r); });
    html += `<h4 style="color:var(--navy);margin-bottom:14px">📋 Student Responsibilities (Shared)</h4>`;
    html += Object.entries(grouped).map(([sid,resps]) => {
      const s = students.find(x => x.id === sid);
      const totalHours = resps.reduce((acc,r) => acc+(parseFloat(r.hours)||0), 0);
      return `<div class="t-goals-student" style="margin-bottom:12px">
        <h4>${escapeHtml(s?.name||'Student')} <span style="font-weight:400;color:var(--muted);font-size:.8rem">${totalHours>0?'~'+totalHours+'h/week outside school':''}</span></h4>
        ${resps.map(r=>`<div class="t-goal-row">
          <span>📌</span>
          <div><strong>${escapeHtml(r.text)}</strong>${r.when?` <span style="color:var(--muted)">(${escapeHtml(r.when)})</span>`:''}</div>
          ${r.hours?`<span style="margin-left:auto;color:var(--muted);font-size:.8rem">~${escapeHtml(r.hours)}h/wk</span>`:''}
        </div>`).join('')}
      </div>`;
    }).join('');
  }
  if(allW.length > 0){
    html += `<h4 style="color:var(--navy);margin:22px 0 14px">🌱 Wellness Logs Sent to You</h4>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>Student</th><th>Type</th><th>Data</th><th>Period</th><th>Date</th></tr></thead>
      <tbody>
        ${allW.map(w => {
          const s = students.find(x => x.id === w.studentId);
          const cls = classes.find(c => c.id === w.sharedWith?.classId);
          const data = w.type==='sleep' ? `${escapeHtml(w.hours)}h · ${escapeHtml(w.quality)}`
                     : w.type==='energy' ? `Energy: ${escapeHtml(w.energy)}/10 · 💧${escapeHtml(w.water)} glasses`
                     : escapeHtml(w.text||'-');
          return `<tr>
            <td><strong>${escapeHtml(s?.name||'-')}</strong></td>
            <td style="text-transform:capitalize">${escapeHtml(w.type)}</td>
            <td>${data}</td>
            <td style="font-size:.82rem;color:var(--muted)">${escapeHtml(cls?.subject||'-')}</td>
            <td>${escapeHtml(w.date)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`;
  }
  if(!html) html = '<p style="color:var(--muted);padding:20px 0">No shared wellness data yet.</p>';
  wrap.innerHTML = html;
}

// GOALS
function renderTeacherGoals(){
  const students=getMyStudents();
  const el=document.getElementById('t-goals-list');
  el.innerHTML=students.map(s=>{
    const gs_=ggo().filter(g=>g.studentId===s.id);
    return `<div class="t-goals-student">
      <h4>${escapeHtml(s.name)} <span style="font-weight:400;color:var(--muted);font-size:.82rem">${gs_.length} task${gs_.length!==1?'s':''}</span></h4>
      ${gs_.slice(0,6).map(g=>`
        <div class="t-goal-row">${g.done?'✅':'⬜'} <strong>${escapeHtml(g.day)}</strong> ${escapeHtml(g.time)} - ${escapeHtml(g.task)} (${escapeHtml(g.duration)})</div>`).join('')
      || '<p style="font-size:.82rem;color:var(--muted)">No goals entered yet.</p>'}
      ${gs_.length>6?`<p style="font-size:.78rem;color:var(--muted);margin-top:4px">+${gs_.length-6} more</p>`:''}
    </div>`;
  }).join('')||'<p style="color:var(--muted)">No students yet.</p>';
}

// ALERTS
function renderAlerts(){
  const students=getMyStudents();
  const myClassIds=getMyClasses().map(c=>c.id);
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared&&NEGATIVE_MOODS.includes(m.mood)&&myClassIds.includes(m.classId));
  const el=document.getElementById('t-alerts-list');
  if(moods.length===0){ el.innerHTML='<p style="color:var(--muted);text-align:center;padding:40px 0">🎉 No alerts - all students seem to be doing well!</p>'; return; }
  const grouped={};
  moods.forEach(m=>{ if(!grouped[m.studentId])grouped[m.studentId]=[]; grouped[m.studentId].push(m); });
  el.innerHTML=Object.entries(grouped).map(([sid,ms])=>{
    const s=students.find(x=>x.id===sid);
    const recent=ms.sort((a,b)=>b.date.localeCompare(a.date))[0];
    const cls=gc().find(c=>c.id===recent.classId);
    return `<div class="alert-card-t">
      <span style="font-size:1.5rem">⚠️</span>
      <div><h5>${escapeHtml(s?.name||'Student')}</h5>
      <p style="font-size:.85rem;color:var(--text-2)">Feeling <strong>${escapeHtml(recent.mood)}</strong> in ${escapeHtml(cls?.subject||recent.classLabel||'class')} on ${escapeHtml(recent.date)}</p></div>
      <span class="alert-abadge">${ms.length} alert${ms.length>1?'s':''}</span>
    </div>`;
  }).join('');
}
// ─────────────────────────────────────────────
// WEEKLY CLASS SUMMARY
// Reads entirely from already-loaded cache - no new Firestore reads.
// Groups mood, wellness, goal, and alert data by class for the past 7 days.
// ─────────────────────────────────────────────
function renderWeeklySummary(){
  const classes  = getMyClasses();
  const students = getMyStudents();
  const sel      = document.getElementById('summary-class-sel');
  const wrap     = document.getElementById('summary-content');
  if(!sel || !wrap) return;

  // Populate the class filter dropdown
  sel.innerHTML = '<option value="">All Classes</option>' +
    classes.map(c => `<option value="${c.id}">${escapeHtml(c.subject)}</option>`).join('');

  const filterClassId = sel.value;
  const activeClasses = filterClassId
    ? classes.filter(c => c.id === filterClassId)
    : classes;

  if(activeClasses.length === 0){
    wrap.innerHTML = '<p style="color:var(--muted);padding:20px 0">No classes yet. Create a class first.</p>';
    return;
  }

  // Build a set of dates for the past 7 days (YYYY-MM-DD strings)
  const past7 = [];
  for(let i = 0; i < 7; i++){
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7.push(d.toISOString().split('T')[0]);
  }
  const past7Set = new Set(past7);

  const allMoods    = gm().filter(m => m.shared && past7Set.has(m.date));
  const allWellness = gw().filter(w => w.shared && past7Set.has(w.date));
  const allGoals    = ggo();

  // Date range label
  const newest = past7[0];
  const oldest = past7[past7.length - 1];
  const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });

  let html = `<div style="font-size:.82rem;color:var(--muted);margin-bottom:20px">
    Period: <strong>${fmtDate(oldest)} – ${fmtDate(newest)}</strong>
  </div>`;

  activeClasses.forEach(cls => {
    const classStudents = students.filter(s => s.classIds?.includes(cls.id));
    if(classStudents.length === 0){
      html += `<div class="summary-class-block">
        <div class="cls-banner-header" style="background:${cls.color||'#1d5fa6'};color:${getContrastColor(cls.color||'#1d5fa6')};border-radius:var(--r-md) var(--r-md) 0 0;padding:14px 18px">
          <h4 style="color:${getContrastColor(cls.color||'#1d5fa6')};margin:0">${escapeHtml(cls.subject)}</h4>
        </div>
        <div style="padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-top:none;border-radius:0 0 var(--r-md) var(--r-md)">
          <p style="color:var(--muted);font-size:.88rem">No students in this class yet.</p>
        </div>
      </div>`;
      return;
    }

    // ── Mood summary for this class ──
    const classMoods = allMoods.filter(m =>
      classStudents.some(s => s.id === m.studentId) && m.classId === cls.id
    );
    const moodCounts = {};
    classMoods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    const totalMoods = classMoods.length;
    const alertMoods = classMoods.filter(m => NEGATIVE_MOODS.includes(m.mood));
    const uniqueAlertStudents = [...new Set(alertMoods.map(m => m.studentId))];

    // Mood participation rate
    const studentsWhoLoggedMood = new Set(classMoods.map(m => m.studentId)).size;
    const moodParticipation = classStudents.length > 0
      ? Math.round((studentsWhoLoggedMood / classStudents.length) * 100)
      : 0;

    // ── Sleep summary for this class ──
    const classSleep = allWellness.filter(w =>
      w.type === 'sleep' &&
      classStudents.some(s => s.id === w.studentId) &&
      (w.sharedWith?.classId === cls.id || w.sharedWith?.teacherId === CU.id)
    );
    const avgSleep = classSleep.length > 0
      ? (classSleep.reduce((sum, w) => sum + (parseFloat(w.hours) || 0), 0) / classSleep.length).toFixed(1)
      : null;

    // ── Goal completion for this class ──
    const classGoals = allGoals.filter(g =>
      g.classId === cls.id && classStudents.some(s => s.id === g.studentId)
    );
    const doneGoals  = classGoals.filter(g => g.done).length;
    const goalRate   = classGoals.length > 0
      ? Math.round((doneGoals / classGoals.length) * 100)
      : null;

    // ── Students needing support ──
    const supportStudents = uniqueAlertStudents.map(sid => {
      const s = classStudents.find(x => x.id === sid);
      const recentMoods = alertMoods.filter(m => m.studentId === sid)
        .sort((a, b) => b.date.localeCompare(a.date));
      return { name: s?.name || 'Student', mood: recentMoods[0]?.mood || '' };
    });

    // ── Mood bar ──
    const moodBarHtml = totalMoods > 0
      ? Object.entries(moodCounts).map(([mood, n]) => `
          <div class="mbar-row" style="align-items:center;gap:8px;margin-bottom:6px">
            <span style="width:90px;font-size:.78rem;white-space:nowrap">${MOOD_CFG[mood]?.icon || ''} ${escapeHtml(mood)}</span>
            <div class="mbar-track" style="flex:1"><div class="mbar-fill" style="width:${Math.round(n/totalMoods*100)}%;background:${NEGATIVE_MOODS.includes(mood)?'var(--red)':'var(--blue)'}"></div></div>
            <span style="font-size:.78rem;color:var(--muted);min-width:24px;text-align:right">${n}</span>
          </div>`).join('')
      : '<p style="color:var(--muted);font-size:.85rem">No mood check-ins shared this week.</p>';

    const bannerColor  = cls.color || '#1d5fa6';
    const bannerText   = getContrastColor(bannerColor);

    html += `
    <div class="summary-class-block" style="margin-bottom:28px;border-radius:var(--r-md);overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.07)">

      <!-- Class header banner -->
      <div style="background:${bannerColor};color:${bannerText};padding:14px 18px;display:flex;align-items:center;gap:10px">
        ${cls.emoji ? `<span style="font-size:1.4rem">${escapeHtml(cls.emoji)}</span>` : ''}
        <div>
          <h4 style="color:${bannerText};margin:0;font-size:1rem">${escapeHtml(cls.subject)}</h4>
          <span style="font-size:.78rem;opacity:.85">${classStudents.length} student${classStudents.length!==1?'s':''} · ${escapeHtml(cls.startTime)} – ${escapeHtml(cls.endTime)} · ${escapeHtml(cls.days?.join(', ')||'–')}</span>
        </div>
      </div>

      <!-- Stats row -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;background:var(--border)">
        <div style="background:var(--surface);padding:14px 16px;text-align:center">
          <div style="font-size:1.5rem;font-weight:700;color:var(--blue)">${moodParticipation}%</div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">Mood Participation</div>
        </div>
        <div style="background:var(--surface);padding:14px 16px;text-align:center">
          <div style="font-size:1.5rem;font-weight:700;color:${supportStudents.length > 0 ? 'var(--red)' : 'var(--green)'}">
            ${supportStudents.length > 0 ? '⚠️ ' + supportStudents.length : '✅ 0'}
          </div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">Need Support</div>
        </div>
        <div style="background:var(--surface);padding:14px 16px;text-align:center">
          <div style="font-size:1.5rem;font-weight:700;color:var(--navy)">
            ${avgSleep !== null ? avgSleep + 'h' : '–'}
          </div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">Avg Sleep</div>
        </div>
        <div style="background:var(--surface);padding:14px 16px;text-align:center">
          <div style="font-size:1.5rem;font-weight:700;color:var(--navy)">
            ${goalRate !== null ? goalRate + '%' : '–'}
          </div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">Goal Completion</div>
        </div>
      </div>

      <!-- Body -->
      <div style="background:var(--surface);border:1px solid var(--border);border-top:none;border-radius:0 0 var(--r-md) var(--r-md);padding:18px">

        <!-- Mood breakdown -->
        <h5 style="color:var(--navy);margin:0 0 10px;font-size:.88rem">😊 Mood Breakdown (${totalMoods} check-in${totalMoods!==1?'s':''})</h5>
        ${moodBarHtml}

        ${supportStudents.length > 0 ? `
        <!-- Students needing support -->
        <div style="background:var(--red-lt);border:1px solid #fca5a5;border-radius:var(--r-sm);padding:12px 14px;margin-top:14px">
          <h5 style="color:var(--red);margin:0 0 8px;font-size:.85rem">⚠️ Students who may need support</h5>
          ${supportStudents.map(ss => `
            <div style="font-size:.85rem;margin-bottom:4px">
              • <strong>${escapeHtml(ss.name)}</strong>
              <span style="color:var(--muted)">– logged <em>${escapeHtml(ss.mood)}</em></span>
            </div>`).join('')}
        </div>` : `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--r-sm);padding:10px 14px;margin-top:14px;font-size:.85rem;color:#166534">
          ✅ No alerts this week — class is doing well!
        </div>`}

        ${classSleep.length > 0 ? `
        <!-- Sleep notes -->
        <div style="margin-top:14px">
          <h5 style="color:var(--navy);margin:0 0 8px;font-size:.88rem">😴 Sleep Log (${classSleep.length} entr${classSleep.length!==1?'ies':'y'} shared)</h5>
          ${[...classSleep].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(w=>{
            const s = classStudents.find(x => x.id === w.studentId);
            return `<div style="font-size:.83rem;color:var(--text-2);margin-bottom:4px">
              <strong>${escapeHtml(s?.name||'Student')}</strong> · ${escapeHtml(w.hours)}h · ${escapeHtml(w.quality)} · <span style="color:var(--muted)">${w.date}</span>
            </div>`;
          }).join('')}
        </div>` : ''}

        ${classGoals.length > 0 ? `
        <!-- Goal activity -->
        <div style="margin-top:14px">
          <h5 style="color:var(--navy);margin:0 0 8px;font-size:.88rem">🎯 Goal Activity (${doneGoals}/${classGoals.length} completed)</h5>
          <div style="background:var(--bg);border-radius:var(--r-sm);padding:8px 12px">
            <div class="mbar-track" style="height:10px;border-radius:99px;overflow:hidden;background:var(--border)">
              <div class="mbar-fill" style="width:${goalRate}%;background:var(--blue);height:100%"></div>
            </div>
            <p style="font-size:.78rem;color:var(--muted);margin-top:6px">${goalRate}% of tasks in this class marked complete</p>
          </div>
        </div>` : ''}

      </div>
    </div>`;
  });

  wrap.innerHTML = html;
}

function printSummary(){
  window.print();
}
// TEACHER HELP
function renderTeacherHelp(){
  const province=CU.province||'Ontario';
  document.getElementById('t-help-content').innerHTML=buildHelplinesHTML(province);
}

// SETTINGS
function renderSettings(){
  const sel=document.getElementById('t-province-setting');
  sel.innerHTML=PROVINCES.map(p=>`<option ${p===CU.province?'selected':''}>${p}</option>`).join('');
  if(CU.socialWorker){
    document.getElementById('sw-name').value=CU.socialWorker.name||'';
    document.getElementById('sw-email').value=CU.socialWorker.email||'';
  }
  document.getElementById('t-account-info').innerHTML=`
    <p><strong>Name:</strong> ${escapeHtml(CU.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(CU.email)}</p>
    <p><strong>School:</strong> ${escapeHtml(CU.school||'-')}</p>
    <p><strong>Province:</strong> ${escapeHtml(CU.province||'-')}</p>
    <p><strong>Joined:</strong> ${escapeHtml(CU.joined||'-')}</p>
  `;
}

function saveSocialWorker(){
  const name=document.getElementById('sw-name').value.trim();
  const email=document.getElementById('sw-email').value.trim();
  if(!name||!email)return toast('Please fill in name and email.');
  if(!validEmail(email))return toast('Please enter a valid email address.');
  const teachers=gt(); const t=teachers.find(x=>x.id===CU.id);
  if(t){ t.socialWorker={name,email}; S.set('teachers',teachers); CU.socialWorker={name,email}; }
  document.getElementById('sw-saved').classList.remove('hidden');
  setTimeout(()=>document.getElementById('sw-saved').classList.add('hidden'),3000);
  toast('Social worker contact saved! ✓');
}

function saveProvince(){
  const p=document.getElementById('t-province-setting').value;
  const teachers=gt(); const t=teachers.find(x=>x.id===CU.id);
  if(t){ t.province=p; S.set('teachers',teachers); CU.province=p; }
  toast(`Province updated to ${p}`);
}

// CLASS CRUD
function openClassModal(){ openModal('class-modal'); }

function genCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code=''; for(let i=0;i<8;i++) code+=chars[Math.floor(Math.random()*chars.length)];
  document.getElementById('cm-code').value=code;
}

let pendingLogoDataUrl = null;

function previewLogo(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    pendingLogoDataUrl = e.target.result;
    document.getElementById('logo-preview-img').src = pendingLogoDataUrl;
    document.getElementById('logo-preview-wrap').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearLogo(){
  pendingLogoDataUrl = null;
  document.getElementById('logo-preview-wrap').classList.add('hidden');
  document.getElementById('cm-logo-file').value = '';
}

// ─────────────────────────────────────────────
// CLASSES (teacher) - CREATE / DELETE
// Classes are stored as individual Firestore docs in 'shared_classes'
// (one doc per class) so this scales past the old single-blob approach.
// ─────────────────────────────────────────────
async function fsSetClass(cls){
  if(!fbDb) return;
  try {
    await fbDb.collection('shared_classes').doc(cls.id).set(cls);
  } catch(e){ console.error('fsSetClass', e); }
}

async function fsDeleteClass(classId){
  if(!fbDb) return;
  try {
    await fbDb.collection('shared_classes').doc(classId).delete();
  } catch(e){
    console.error('fsDeleteClass failed', e);
    toast('⚠️ Could not delete class - check your connection and try again.');
  }
}

async function fsGetAllClasses(){
  if(!fbDb) return [];
  try {
    const snap = await fbDb.collection('shared_classes').get();
    return snap.docs.map(d => d.data());
  } catch(e){ return []; }
}

async function createClass(){
  const subject  = document.getElementById('cm-subject').value.trim();
  const start    = document.getElementById('cm-start').value;
  const end      = document.getElementById('cm-end').value;
  const code     = document.getElementById('cm-code').value.trim().toUpperCase();
  const days     = [...document.querySelectorAll('input[name="cm-day"]:checked')].map(x=>x.value);
  const color    = document.querySelector('input[name="cm-color"]:checked')?.value||'#1d5fa6';
  const emoji    = document.getElementById('cm-emoji').value.trim();
  const bannerMsg= document.getElementById('cm-banner-msg').value.trim();
  const logo     = pendingLogoDataUrl||null;

  if(!subject||!code)return toast('Please fill in subject and code.');
  if(!/^[A-Z0-9]{3,12}$/.test(code)) return toast('Class code must be 3-12 letters/numbers only.');

  // Fast, non-authoritative check for quick feedback - this alone is a
  // race (read-then-write), so the transaction below is what actually
  // guarantees uniqueness.
  const existingClasses = await fsGetAllClasses();
  if(existingClasses.find(c=>c.code===code)) return toast('That code already exists - try generating a new one.');

  // teacherId is the short display id (used everywhere else in the UI).
  // teacherUid is the real Firebase Auth uid - needed so students who join
  // can record which teacher's auth uid to grant read-access to, since
  // security rules can only check request.auth.uid, not the short id.
  const newClass = {id:'c'+uid8(),teacherId:CU.id,teacherUid:CU.uid,subject,startTime:start,endTime:end,days,code,color,emoji,logo,bannerMsg};

  // ATOMIC CODE RESERVATION: class_codes/{code} - one doc per code, ID is
  // the code itself. Firestore create() inside a transaction fails outright
  // if the doc already exists, so if two teachers submit the same code at
  // the same moment, only one transaction commits; the other gets a clean
  // "CODE_TAKEN" instead of silently colliding.
  try {
    await fbDb.runTransaction(async (tx) => {
      const codeRef = fbDb.collection('class_codes').doc(code);
      const codeSnap = await tx.get(codeRef);
      if(codeSnap.exists) throw new Error('CODE_TAKEN');
      tx.set(codeRef, { teacherUid: CU.uid, classId: newClass.id, createdAt: today() });
    });
  } catch(e){
    if(e.message === 'CODE_TAKEN') return toast('That code already exists - try generating a new one.');
    console.error('class code reservation failed', e);
    return toast('⚠️ Could not create class - check your connection and try again.');
  }

  await fsSetClass(newClass);

  const updated = [...existingClasses, newClass];
  cSet('classes', updated);

  closeModal('class-modal');
  document.getElementById('cm-subject').value='';
  document.getElementById('cm-start').value='09:00';
  document.getElementById('cm-end').value='09:45';
  document.getElementById('cm-code').value='';
  document.getElementById('cm-emoji').value='';
  document.getElementById('cm-banner-msg').value='';
  document.querySelectorAll('input[name="cm-day"]').forEach(x=>x.checked=false);
  clearLogo();
  pendingLogoDataUrl=null;
  toast('Class created! 🎉');
  renderTeacherClasses();
  invalidateTeacherCache();
}

async function deleteClass(id){
  if(!confirm('Delete this class? Students will lose access.'))return;
  const cls = cGet('classes', []).find(c=>c.id===id);
  await fsDeleteClass(id);
  if(cls?.code){
    try { await fbDb.collection('class_codes').doc(cls.code).delete(); }
    catch(e){ console.error('class_codes cleanup failed', e); }
  }
  const updated = cGet('classes', []).filter(c=>c.id!==id);
  cSet('classes', updated);
  toast('Class deleted.');
  renderTeacherClasses();
  invalidateTeacherCache();
}

function copyCode(code){
  navigator.clipboard?.writeText(code).catch(()=>{});
  toast(`Code "${code}" copied to clipboard!`);
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function openModal(id){
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  // Accessibility: move focus into the dialog and let Escape close it.
  el._lastFocused = document.activeElement;
  const dialog = el.querySelector('[role="dialog"]') || el;
  const focusable = dialog.querySelector('input, select, textarea, button, a[href]');
  (focusable || dialog).focus?.();
  el._escHandler = (e) => { if(e.key === 'Escape') closeModal(id); };
  document.addEventListener('keydown', el._escHandler);
}
function closeModal(id){
  const el = document.getElementById(id);
  el.classList.add('hidden');
  if(el._escHandler){ document.removeEventListener('keydown', el._escHandler); el._escHandler = null; }
  if(el._lastFocused){ el._lastFocused.focus?.(); el._lastFocused = null; }
}
function showErr(el,msg){ if(!el)return toast(msg); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),5000); }
function showPrivacy(){ openModal('privacy-modal'); }
function showCookiePolicy(){ openModal('cookie-policy-modal'); }

function toggleCookieConsent(){
  const current = localStorage.getItem('wellspace_cookie_consent');
  const wasAccepted = current === 'accepted';
  const newValue = !wasAccepted;
  if(typeof window.setCookieConsent === 'function') window.setCookieConsent(newValue);
  if(wasAccepted && !newValue){
    toast('Analytics cookies declined - reloading to apply');
    setTimeout(()=>location.reload(), 900);
  } else {
    toast(newValue ? 'Analytics cookies accepted 🍪' : 'Analytics cookies declined');
  }
}

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._to); t._to=setTimeout(()=>t.classList.add('hidden'),3000);
}

function toggleSB(id){
  document.getElementById(id)?.classList.toggle('open');
}

function today(){ return new Date().toISOString().split('T')[0]; }
function uid8(){ return Math.random().toString(36).substr(2,8); }
// keep old uid name working too
function uid(){ return uid8(); }

document.addEventListener('click',e=>{
  ['s-sidebar','t-sidebar'].forEach(id=>{
    const sb=document.getElementById(id);
    if(sb&&sb.classList.contains('open')&&!sb.contains(e.target)&&!e.target.classList.contains('ham'))
      sb.classList.remove('open');
  });
});

// ─────────────────────────────────────────────
// STUDENT PROFILE
// ─────────────────────────────────────────────
function renderStudentProfile(){
  document.getElementById('s-profile-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('s-profile-name').textContent = CU.name;
  document.getElementById('s-profile-email').textContent = CU.email;
  document.getElementById('s-profile-grade').textContent = CU.grade || 'No grade set';
  document.getElementById('s-edit-name').value = CU.name;
  const respShareRow = document.querySelector('label[for="resp-share"]')?.closest('.share-toggle');
  if(respShareRow) respShareRow.style.display = hasClasses() ? '' : 'none';
  renderRespList();
}

function saveStudentProfile(){
  const name    = document.getElementById('s-edit-name').value.trim();
  const oldPass = document.getElementById('s-old-pass').value;
  const newPass = document.getElementById('s-new-pass').value;
  const errEl   = document.getElementById('s-profile-err');
  const okEl    = document.getElementById('s-profile-ok');

  if(!name) return showErr(errEl, 'Name cannot be empty.');

  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if(!s) return;

  if(oldPass || newPass){
    if(!oldPass) return showErr(errEl, 'Enter your current password to change it.');
    if(!validPw(newPass)) return showErr(errEl, 'New password needs 8+ chars, uppercase, number & special character.');
    // Update Firebase Auth password
    fbAuth.currentUser?.updatePassword(newPass).catch(e=>{
      showErr(errEl, 'Could not update password. Please log out and back in first.');
    });
  }

  s.name = name;
  CU.name = name;
  S.set('students', students);
  // Update profile
  if(fbAuth?.currentUser) saveProfile(fbAuth.currentUser.uid, { name });

  document.getElementById('s-greet').textContent = `${getGreeting()}, ${CU.name}! 👋`;
  document.getElementById('s-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('s-profile-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('s-profile-name').textContent = CU.name;

  errEl.classList.add('hidden');
  okEl.classList.remove('hidden');
  setTimeout(() => okEl.classList.add('hidden'), 3000);
  document.getElementById('s-old-pass').value = '';
  document.getElementById('s-new-pass').value = '';
  toast('Profile updated! ✓');
}

function getGreeting(){
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// ─────────────────────────────────────────────
// RESPONSIBILITIES
// ─────────────────────────────────────────────
function addResponsibility(){
  const text  = document.getElementById('resp-text').value.trim();
  const when  = document.getElementById('resp-when').value.trim();
  const hours = document.getElementById('resp-hours').value;
  const shared= document.getElementById('resp-share').checked;

  if(!text) return toast('Please describe the responsibility.');

  const all = S.get('responsibilities', []);
  all.push({ id: 'r'+uid8(), studentId: CU.id, text, when, hours, shared, date: today() });
  S.set('responsibilities', all);

  document.getElementById('resp-text').value = '';
  document.getElementById('resp-when').value = '';
  document.getElementById('resp-hours').value = '';
  document.getElementById('resp-share').checked = false;
  toast('Responsibility added!');
  renderRespList();
}

function renderRespList(){
  const all = S.get('responsibilities', []).filter(r => r.studentId === CU.id);
  const el  = document.getElementById('resp-list');
  if(!el) return;
  if(all.length === 0){
    el.innerHTML = '<p style="color:var(--muted);font-size:.85rem">No responsibilities added yet.</p>';
    return;
  }
  el.innerHTML = all.map(r => `
    <div class="resp-item">
      <div class="resp-item-info">
        <strong>${escapeHtml(r.text)}</strong>
        <span>${r.when ? '🕐 '+escapeHtml(r.when) : ''} ${r.hours ? '· ~'+escapeHtml(r.hours)+'h/week' : ''}</span>
      </div>
      <span class="${r.shared ? 'resp-shared-badge' : 'resp-private-badge'}">${r.shared ? '👁 Shared' : '🔒 Private'}</span>
      <button onclick="deleteResp('${r.id}')" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:.9rem;padding:2px 6px;transition:color var(--t)" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--muted)'">✕</button>
    </div>
  `).join('');
}

function deleteResp(id){
  S.set('responsibilities', S.get('responsibilities',[]).filter(r => r.id !== id));
  toast('Removed.');
  renderRespList();
}

async function leaveClass(classId, subject){
  if(!confirm(`Leave ${subject}? You'll need the class code to rejoin.`)) return;

  CU.classIds = (CU.classIds || []).filter(id => id !== classId);

  const remainingClasses = gc().filter(c => CU.classIds.includes(c.id));
  const remainingTeacherUids = new Set(remainingClasses.map(c => c.teacherUid || c.teacherId).filter(Boolean));
  CU.teacherUids = [...remainingTeacherUids];

  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if(s){ s.classIds = CU.classIds; S.set('students', students); }

  if(fbAuth?.currentUser){
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds, teacherUids: CU.teacherUids }, { merge: true });

    const userDoc = await fbDb.collection('users').doc(fbAuth.currentUser.uid).get();
    let existingStudents = [];
    if(userDoc.exists){ try{ existingStudents = JSON.parse(userDoc.data().students || '[]'); }catch{} }
    const myEntry = existingStudents.find(x => x.id === CU.id);
    if(myEntry){ myEntry.classIds = CU.classIds; }
    await fbDb.collection('users').doc(fbAuth.currentUser.uid)
      .set({ students: JSON.stringify(existingStudents) }, { merge: true });
  }

  invalidateTeacherCache();
  toast(`Left ${subject}.`);
  renderClassesSection();
}

// ─────────────────────────────────────────────
// TEACHER PROFILE
// ─────────────────────────────────────────────
function renderTeacherProfile(){
  document.getElementById('t-profile-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('t-profile-name').textContent = CU.name;
  document.getElementById('t-profile-email').textContent = CU.email;
  document.getElementById('t-profile-school').textContent = CU.school || '';
  document.getElementById('t-edit-name').value = CU.name;
  document.getElementById('t-edit-school').value = CU.school || '';

  const myStudents = getMyStudents();
  const allResp = S.get('responsibilities', []).filter(r =>
    r.shared && myStudents.some(s => s.id === r.studentId)
  );
  const el = document.getElementById('t-resp-view');
  if(allResp.length === 0){
    el.innerHTML = '<p style="color:var(--muted);font-size:.85rem">No students have shared responsibilities yet.</p>';
    return;
  }
  const grouped = {};
  allResp.forEach(r => {
    if(!grouped[r.studentId]) grouped[r.studentId] = [];
    grouped[r.studentId].push(r);
  });
  el.innerHTML = Object.entries(grouped).map(([sid, resps]) => {
    const student = myStudents.find(s => s.id === sid);
    return `
      <div style="margin-bottom:14px">
        <p style="font-weight:700;font-size:.9rem;color:var(--navy);margin-bottom:6px">${escapeHtml(student?.name || 'Student')}</p>
        ${resps.map(r => `
          <div class="resp-item" style="margin-bottom:6px">
            <div class="resp-item-info">
              <strong>${escapeHtml(r.text)}</strong>
              <span>${r.when ? '🕐 '+escapeHtml(r.when) : ''} ${r.hours ? '· ~'+escapeHtml(r.hours)+'h/week' : ''}</span>
            </div>
          </div>`).join('')}
      </div>`;
  }).join('');
}

function saveTeacherProfile(){
  const name   = document.getElementById('t-edit-name').value.trim();
  const school = document.getElementById('t-edit-school').value.trim();
  const oldPass= document.getElementById('t-old-pass').value;
  const newPass= document.getElementById('t-new-pass').value;
  const errEl  = document.getElementById('t-profile-err');
  const okEl   = document.getElementById('t-profile-ok');

  if(!name) return showErr(errEl, 'Name cannot be empty.');

  const teachers = gt();
  const t = teachers.find(x => x.id === CU.id);
  if(!t) return;

  if(oldPass || newPass){
    if(!oldPass) return showErr(errEl, 'Enter your current password to change it.');
    if(!validPw(newPass)) return showErr(errEl, 'New password needs 8+ chars, uppercase, number & special character.');
    fbAuth.currentUser?.updatePassword(newPass).catch(()=>{
      showErr(errEl, 'Could not update password. Please log out and back in first.');
    });
  }

  t.name   = name;
  t.school = school;
  CU.name  = name;
  CU.school= school;
  S.set('teachers', teachers);
  if(fbAuth?.currentUser) saveProfile(fbAuth.currentUser.uid, { name, school });

  document.getElementById('t-greet').textContent  = `Welcome, ${CU.name}! 📋`;
  document.getElementById('t-av').textContent      = CU.name[0].toUpperCase();
  document.getElementById('t-profile-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('t-profile-name').textContent = CU.name;
  document.getElementById('t-profile-school').textContent = CU.school;

  errEl.classList.add('hidden');
  okEl.classList.remove('hidden');
  setTimeout(() => okEl.classList.add('hidden'), 3000);
  document.getElementById('t-old-pass').value = '';
  document.getElementById('t-new-pass').value = '';
  toast('Profile updated! ✓');
}

// ─────────────────────────────────────────────
// DELETE ACCOUNT
// ─────────────────────────────────────────────
let deleteRole = null;

function confirmDeleteAccount(role){
  deleteRole = role;
  document.getElementById('delete-confirm-input').value = '';
  document.getElementById('delete-pass-input').value = '';
  document.getElementById('delete-err').classList.add('hidden');
  openModal('delete-modal');
}

async function executeDeleteAccount(){
  const confirm = document.getElementById('delete-confirm-input').value.trim();
  const pass    = document.getElementById('delete-pass-input').value;
  const errEl   = document.getElementById('delete-err');

  if(confirm !== 'DELETE') return showErr(errEl, 'Please type DELETE exactly to confirm.');

  try {
    // Re-authenticate then delete
    const cred = firebase.auth.EmailAuthProvider.credential(CU.email, pass);
    await fbAuth.currentUser.reauthenticateWithCredential(cred);

    // Delete Firestore data
    if(fbDb && fbAuth.currentUser){
      await fbDb.collection('users').doc(fbAuth.currentUser.uid).delete().catch(()=>{});
      await fbDb.collection('profiles').doc(fbAuth.currentUser.uid).delete().catch(()=>{});
    }

    await fbAuth.currentUser.delete();
    closeModal('delete-modal');
    CU = null;
    toast('Account deleted. Goodbye 👋');
    setTimeout(() => showScreen('screen-entry'), 1500);
  } catch(e){
    showErr(errEl, 'Incorrect password or session expired. Please log out and back in.');
  }
}

// ─────────────────────────────────────────────
// EMAIL VERIFICATION & FORGOT PASSWORD
// ─────────────────────────────────────────────
const EMAILJS_SERVICE  = 'service_jm737lr';
const EMAILJS_TEMPLATE = 'template_6w1574v';

let pendingVerify = null;
let pendingReset  = null;

function generateCode(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function startSignupVerification(){
  const name      = document.getElementById('su-name').value.trim();
  const email     = document.getElementById('su-email').value.trim().toLowerCase();
  const pass      = document.getElementById('su-pass').value;
  const privacyOk = document.getElementById('su-privacy').checked;
  const errEl     = document.getElementById('signup-err');

  if(!name||!email||!pass) return showErr(errEl,'Please fill in all required fields.');
  if(!validEmail(email))   return showErr(errEl,'Please enter a valid email address.');
  if(!validPw(pass))       return showErr(errEl,'Password must be 8+ chars with uppercase, number & special character.');
  if(!privacyOk)           return showErr(errEl,'Please accept the privacy policy to continue.');

  if(authRole==='student'){
    const grade = document.getElementById('su-grade').value;
    const classCode = document.getElementById('su-code').value.trim().toUpperCase();
    if(!grade) return showErr(errEl,'Please select your grade.');
    pendingVerify = { name, email, pass, grade, code_class: classCode, role:'student' };
  } else {
    const province = document.getElementById('su-province').value;
    const school   = document.getElementById('su-school').value.trim();
    if(!province) return showErr(errEl,'Please select your province.');
    pendingVerify = { name, email, pass, province, school, role:'teacher' };
  }

  const verifyCode = generateCode();
  pendingVerify.code    = verifyCode;
  pendingVerify.expires = Date.now() + 10*60*1000;

  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_name:  name,
    to_email: email,
    code:     verifyCode,
  }).then(()=>{
    document.getElementById('verify-email-display').textContent = email;
    document.getElementById('verify-code-input').value = '';
    document.getElementById('verify-err').classList.add('hidden');
    document.getElementById('verify-ok').classList.add('hidden');
    openModal('verify-modal');
    toast('Verification code sent to your email! 📧');
  }).catch(err=>{
    console.error('EmailJS error:', err);
    showErr(errEl, 'Could not send verification email. Please check your email address and try again.');
  });
}

async function confirmVerifyCode(){
  const input = document.getElementById('verify-code-input').value.trim();
  const errEl = document.getElementById('verify-err');
  const okEl  = document.getElementById('verify-ok');

  if(!pendingVerify) return showErr(errEl,'Something went wrong. Please try signing up again.');
  if(Date.now() > pendingVerify.expires) return showErr(errEl,'Code expired. Please request a new one.');
  if(input !== pendingVerify.code) return showErr(errEl,'Incorrect code. Please check your email and try again.');

  okEl.classList.remove('hidden');

  setTimeout(async ()=>{
    // Now create the Firebase Auth account
    const { name, email, pass, role } = pendingVerify;
    try {
     if(role === 'student'){
        const grade = pendingVerify.grade;
        const classCode = pendingVerify.code_class || '';
        const classes = await fsGetAllClasses();
        cSet('classes', classes);
        let classIds = [];
        let teacherUids = [];
        if(classCode){
          const cls = classes.find(c=>c.code===classCode);
          if(cls){
            classIds = [cls.id];
            teacherUids = [cls.teacherUid || cls.teacherId];
          }
        }
        const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
        const uid  = cred.user.uid;
        const localId = 's'+uid8();
        const profile = { role:'student', name, email, grade, classIds, teacherUids, periodOrder:[], joined:today(), localId, uid };
        // BUGFIX: this save was missing, so students who signed up through
        // email verification never got a /profiles/{uid} doc written to
        // Firestore. Without it, a teacher's "My Students" query (which
        // searches the profiles collection for teacherUids array-contains
        // their uid) can never find them - the student's own screen still
        // looked fine because it was running entirely off the in-memory
        // session, masking the missing Firestore doc until next login.
        await saveProfile(uid, profile);
        const studentEntry = { id:localId, name, email, grade, classIds, periodOrder:[], joined:today() };
        cSet('students', [studentEntry]);
        await fsSet('students', [studentEntry]);
        CU = { ...profile, id: localId };
      } else {
        const { province, school } = pendingVerify;
        const cred = await fbAuth.createUserWithEmailAndPassword(email, pass);
        const uid  = cred.user.uid;
        const localId = 't'+uid8();
        const profile = { role:'teacher', name, email, province, school, socialWorker:null, joined:today(), localId, uid };
        await saveProfile(uid, profile);
        const teacherEntry = { id:localId, name, email, province, school, socialWorker:null, joined:today() };
        cSet('teachers', [teacherEntry]);
        await fsSet('teachers', [teacherEntry]);
        CU = { ...profile, id: localId };
      }
      pendingVerify = null;
      closeModal('verify-modal');
      if(CU.role==='student') await ensureTeacherLinks();
      toast(`Account created! Welcome, ${name} 🎉`);
      syncCookieConsentAfterLogin(CU.uid);
      if(CU.role==='student') loadStudentDash(); else loadTeacherDash();
    } catch(e){
      showErr(errEl, e.code==='auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : 'Could not create account. Please try again.');
    }
  }, 1200);
}

// ─────────────────────────────────────────────
// Simple client-side cooldown to stop spam-clicking "Resend" from
// burning through the EmailJS free-tier quota or being used to
// email-bomb someone else's address. This is a UX-level speed bump,
// not a real security boundary - the actual fix is restricting
// allowed origins + enabling rate limiting in the EmailJS dashboard,
// since a determined attacker can call emailjs.send() directly from
// the browser console and skip the UI/button entirely.
// ─────────────────────────────────────────────
const _emailCooldowns = {};
function emailOnCooldown(key, seconds, btnEl){
  const now = Date.now();
  if(_emailCooldowns[key] && now < _emailCooldowns[key]) return true;
  _emailCooldowns[key] = now + seconds*1000;
  if(btnEl){
    const original = btnEl.textContent;
    btnEl.disabled = true;
    let remaining = seconds;
    btnEl.textContent = `Wait ${remaining}s`;
    const iv = setInterval(()=>{
      remaining--;
      if(remaining <= 0){
        clearInterval(iv);
        btnEl.disabled = false;
        btnEl.textContent = original;
      } else {
        btnEl.textContent = `Wait ${remaining}s`;
      }
    }, 1000);
  }
  return false;
}

function resendVerifyCode(){
  if(!pendingVerify) return;
  if(emailOnCooldown('verify', 30, event?.currentTarget)) return toast('Please wait before requesting another code.');
  const newCode = generateCode();
  pendingVerify.code    = newCode;
  pendingVerify.expires = Date.now() + 10*60*1000;
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_name:  pendingVerify.name,
    to_email: pendingVerify.email,
    code:     newCode,
  }).then(()=>toast('New code sent! 📧')).catch(()=>toast('Could not resend. Try again.'));
}

// FORGOT PASSWORD - sends reset email that opens on YOUR site
function sendResetCode(){
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl = document.getElementById('forgot-err');
  if(!email||!validEmail(email)) return showErr(errEl,'Please enter a valid email address.');
  if(emailOnCooldown('reset:'+email, 30, event?.currentTarget)) return showErr(errEl,'Please wait before requesting another email.');
  if(!fbAuth) initFirebase();

  fbAuth.sendPasswordResetEmail(email, {
    url: window.location.origin + window.location.pathname,
    handleCodeInApp: true
  }).then(()=>{
    toast('If that account exists, a reset email has been sent 📧');
    closeModal('forgot-modal');
  }).catch(e=>{
    // Deliberately generic regardless of the real error (including
    // auth/user-not-found) - confirming or denying an email exists
    // is an account-enumeration leak, so both outcomes look the same
    // to whoever is submitting the form.
    toast('If that account exists, a reset email has been sent 📧');
    closeModal('forgot-modal');
  });
}
function confirmResetPassword(){ toast('Please check your email for the reset link.'); }
function resendResetCode(){ sendResetCode(); }

// ─────────────────────────────────────────────
// ACCESSIBILITY PREFERENCES - text size, high contrast, reduced motion
// These are DISPLAY preferences, not account/wellbeing data, so they live
// in localStorage (same pattern already used for cookie consent) rather
// than Firestore - they apply instantly on load, before auth resolves,
// and don't need to sync across devices the way mood/goal data does.
// Purely additive: only adds classes to <html>, never removes or
// overrides existing markup, so it can't break any other feature.
// ─────────────────────────────────────────────
const A11Y_TEXT_STEPS = ['a11y-text-sm', '', 'a11y-text-lg', 'a11y-text-xl']; // index 1 ("") = default

function applyA11yTextClass(idx){
  A11Y_TEXT_STEPS.forEach(c=>{ if(c) document.documentElement.classList.remove(c); });
  const cls = A11Y_TEXT_STEPS[idx];
  if(cls) document.documentElement.classList.add(cls);
}

function setA11yTextSize(delta){
  let idx = parseInt(localStorage.getItem('wellspace_a11y_text_idx') || '1', 10);
  idx = delta === 0 ? 1 : Math.min(A11Y_TEXT_STEPS.length - 1, Math.max(0, idx + delta));
  localStorage.setItem('wellspace_a11y_text_idx', String(idx));
  applyA11yTextClass(idx);
}

function toggleA11yContrast(on){
  document.documentElement.classList.toggle('a11y-contrast', !!on);
  localStorage.setItem('wellspace_a11y_contrast', on ? '1' : '0');
}

function toggleA11yReducedMotion(on){
  document.documentElement.classList.toggle('a11y-reduced-motion', !!on);
  localStorage.setItem('wellspace_a11y_motion', on ? '1' : '0');
}

function initA11yPrefs(){
  try {
    applyA11yTextClass(parseInt(localStorage.getItem('wellspace_a11y_text_idx') || '1', 10));

    const contrastOn = localStorage.getItem('wellspace_a11y_contrast') === '1';
    document.documentElement.classList.toggle('a11y-contrast', contrastOn);
    ['a11y-contrast-toggle','t-a11y-contrast-toggle'].forEach(id=>{
      const el = document.getElementById(id); if(el) el.checked = contrastOn;
    });

    const motionOn = localStorage.getItem('wellspace_a11y_motion') === '1';
    document.documentElement.classList.toggle('a11y-reduced-motion', motionOn);
    ['a11y-motion-toggle','t-a11y-motion-toggle'].forEach(id=>{
      const el = document.getElementById(id); if(el) el.checked = motionOn;
    });
  } catch(e){ console.error('initA11yPrefs failed', e); }
}

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async ()=>{
  initA11yPrefs();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  // Init Firebase
  try { initFirebase(); } catch(e){ console.error('initFirebase failed', e); }

  // Wait for Firebase Auth to restore session
  if(fbAuth){
    fbAuth.onAuthStateChanged(async (user)=>{
      if(user && !CU){
        // User was logged in - restore session
        const profile = await getProfile(user.uid);
        if(profile){
          CU = { ...profile, id: profile.localId || user.uid, uid: user.uid };
          await loadUserData();
          if(profile.role==='student') await ensureTeacherLinks();
          syncCookieConsentAfterLogin(user.uid);
          if(profile.role==='student') loadStudentDash();
          else { await loadTeacherStudents(); loadTeacherDash(); }
        } else {
          showScreen('screen-entry');
        }
      } else if(!user && !CU){
        showScreen('screen-entry');
      }
    });
  } else {
    showScreen('screen-entry');
  }
});
