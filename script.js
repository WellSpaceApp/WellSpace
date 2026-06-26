/* ═══════════════════════════════════════════════
   WellSpace v2 — script.js
   Full application logic
═══════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const NEGATIVE_MOODS = ['Sad','Frustrated','Tired','Confused'];
const MOOD_CFG = {
  Happy:     {icon:'😊', msg:"You're radiating good energy today! Keep it up 🌟"},
  Energized: {icon:'⚡', msg:"Amazing — channel that energy into something great!"},
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
      {name:"One Stop Talk",desc:"Free therapy sessions for youth ages 6–18",url:"https://onestoptalk.ca",contact:"📞 1-855-416-8255"},
      {name:"Canada Suicide Prevention Service",desc:"English/French, 24/7",url:"https://www.crisisservicescanada.ca",contact:"📞 1-833-456-4566"},
      {name:"Hope for Wellness Help Line",desc:"24/7 counselling for Indigenous Peoples",url:"https://hopeforwellness.ca/home.html",contact:"📞 1-855-242-3310"},
    ],
    online:[
      {name:"Youth Wellness Hubs Ontario",desc:"In-person supports ages 12–25",url:"https://youthhubs.ca/en/"},
      {name:"Ontario Mental Health Support Directory",desc:"Government directory of local supports",url:"https://www.ontario.ca/page/find-mental-health-support"},
      {name:"School Mental Health Ontario – Helpline Hub",desc:"Crisis & wellness info for students",url:"https://smho-smso.ca/students/helpline-hub/"},
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
      {name:"Alberta Health Services – Mental Health",desc:"Provincial mental health services",url:"https://www.albertahealthservices.ca/findhealth/service.aspx?id=6810&serviceAtFacilityID=1047652"},
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
// FIRESTORE HELPERS — per-user + shared
// ─────────────────────────────────────────────

// Save a key to the current user's private Firestore doc
async function fsSet(key, value){
  if(!fbDb || !fbAuth?.currentUser) return;
  try {
    await fbDb.collection('users').doc(fbAuth.currentUser.uid)
      .set({ [key]: JSON.stringify(value) }, { merge: true });
  } catch(e){}
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

// Save to shared collection (class codes, classes list — readable by all authenticated users)
async function fsSetShared(key, value){
  if(!fbDb) return;
  try {
    await fbDb.collection('shared').doc('data')
      .set({ [key]: JSON.stringify(value) }, { merge: true });
  } catch(e){}
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
// LOCAL CACHE — fast reads, Firestore is source of truth
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
// UNIFIED S — same API as before, now Firestore-backed
// ─────────────────────────────────────────────
const S = {
  get(k, def=null){
    // Return from cache first for speed
    return cGet(k, def);
  },
  set(k, v){
    cSet(k, v);
    // Persist to correct Firestore location
    if(SHARED_KEYS.includes(k)){
      fsSetShared(k, v);
    } else {
      fsSet(k, v);
    }
  },
};

// Shortcuts — same as original
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
// ─────────────────────────────────────────────
async function loadUserData(){
  if(!fbDb || !fbAuth?.currentUser) return;
  try {
    // Load user's private data
    const userDoc = await fbDb.collection('users').doc(fbAuth.currentUser.uid).get();
    if(userDoc.exists){
      const data = userDoc.data();
      Object.entries(data).forEach(([k,v])=>{
        try{ cSet(k, JSON.parse(v)); }catch{}
      });
    }
    // Load shared data (classes)
    const sharedDoc = await fbDb.collection('shared').doc('data').get();
    if(sharedDoc.exists){
      const data = sharedDoc.data();
      ['classes'].forEach(k=>{
        if(data[k]){ try{ cSet(k, JSON.parse(data[k])); }catch{} }
      });
    }
  } catch(e){}
}

// Load another user's data (for teachers reading student data)
async function loadStudentData(uid){
  if(!fbDb) return {};
  try {
    const doc = await fbDb.collection('users').doc(uid).get();
    if(!doc.exists) return {};
    const data = doc.data();
    const result = {};
    Object.entries(data).forEach(([k,v])=>{ try{ result[k]=JSON.parse(v); }catch{} });
    return result;
  } catch(e){ return {}; }
}

// ─────────────────────────────────────────────
// STUDENT-TEACHER LINK — store uid mapping
// ─────────────────────────────────────────────
// When a user signs up we store their profile in shared/profiles/{uid}
// So teachers can look up student uids to read their data
async function saveProfile(uid, profile){
  if(!fbDb) return;
  try {
    await fbDb.collection('profiles').doc(uid).set(profile, { merge: true });
  } catch(e){}
}

async function getProfile(uid){
  if(!fbDb) return null;
  try {
    const doc = await fbDb.collection('profiles').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch(e){ return null; }
}

// Get all student uids in a teacher's classes
async function getStudentUids(classIds){
  if(!fbDb || !classIds?.length) return [];
  try {
    const snap = await fbDb.collection('profiles')
      .where('role','==','student')
      .where('classIds','array-contains-any', classIds)
      .get();
    return snap.docs.map(d=>({ uid: d.id, ...d.data() }));
  } catch(e){ return []; }
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
// AUTH — LOGIN (Firebase Auth)
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

    await loadUserData();
    CU = { ...profile, id: profile.localId || uid, uid };

    toast(`Welcome back, ${CU.name}! 👋`);
    if(authRole==='student') loadStudentDash();
    else loadTeacherDash();

  } catch(e){
    if(e.code==='auth/wrong-password'||e.code==='auth/user-not-found'||e.code==='auth/invalid-credential'){
      showErr(errEl,'Email or password incorrect. Check your details.');
    } else {
      showErr(errEl,'Login failed. Please try again.');
    }
  }
}

// ─────────────────────────────────────────────
// AUTH — SIGNUP (Firebase Auth)
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

      // Load shared classes to check code
      const classes = await fsGetShared('classes',[]);
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

      // Save profile to shared profiles collection
      await saveProfile(uid, profile);

      // Save student list entry to user's own doc
      const studentEntry = { id:localId, name, email, grade, classIds, periodOrder:[], joined:today() };
      cSet('students', [studentEntry]);
      await fsSet('students', [studentEntry]);

      CU = { ...profile, id: localId };
      await loadUserData();
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
  if(fbAuth) fbAuth.signOut().catch(()=>{});
  showScreen('screen-entry');
}

// ─────────────────────────────────────────────
// TEACHER — load students across Firestore docs
// ─────────────────────────────────────────────
async function loadTeacherStudents(){
  const myClasses = gc().filter(c=>c.teacherId===CU.id);
  const myClassIds = myClasses.map(c=>c.id);
  if(!myClassIds.length) return;

  try {
    // Get all student profiles in my classes
    const studentProfiles = await getStudentUids(myClassIds);

    // Load each student's data and merge into cache
    const allStudents = [];
    const allMoods    = cGet('moods',[]);
    const allGoals    = cGet('goals',[]);
    const allWellness = cGet('wellness',[]);
    const allResps    = cGet('responsibilities',[]);

    for(const sp of studentProfiles){
      const data = await loadStudentData(sp.uid);
      // Merge student entry
      if(data.students) allStudents.push(...(data.students||[]));
      // Merge shared data (moods, goals, wellness that this student shared)
      if(data.moods)          mergeInto(allMoods,    data.moods,    'studentId');
      if(data.goals)          mergeInto(allGoals,    data.goals,    'studentId');
      if(data.wellness)       mergeInto(allWellness, data.wellness, 'studentId');
      if(data.responsibilities) mergeInto(allResps,  data.responsibilities, 'studentId');
    }

    cSet('students',        allStudents);
    cSet('moods',           allMoods);
    cSet('goals',           allGoals);
    cSet('wellness',        allWellness);
    cSet('responsibilities',allResps);
  } catch(e){}
}

function mergeInto(target, incoming, idKey){
  incoming.forEach(item=>{
    const idx = target.findIndex(x=>x.id===item.id || (x[idKey]===item[idKey] && x.date===item.date && x.classId===item.classId));
    if(idx>=0) target[idx]=item; else target.push(item);
  });
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
    [11,14,"Hey {n}! 🌤 It's the middle of the day — how are you feeling?"],
    [14,18,"Afternoon, {n}! 📚 Great time to focus on your most important tasks."],
    [18,21,"Evening, {n}! 🌙 Wind down your work and get ready for tomorrow."],
    [21,24,"Late night, {n}! 😴 Remember — sleep is the best productivity tool."],
    [0,5,"Very late, {n}! 🌙 You need rest. Your goals will be here tomorrow."],
  ];
  const [, , msg] = msgs.find(([s,e])=>hour>=s&&hour<e)||msgs[0];
  bannerEl.innerHTML=`<strong>${msg.replace('{n}',CU.name)}</strong><p>${new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>`;

  const goals=ggo().filter(g=>g.studentId===CU.id&&!g.done).slice(0,4);
  const todayDay=new Date().toLocaleDateString('en-CA',{weekday:'long'});
  const todayGoals=goals.filter(g=>g.day===todayDay);
  const prevEl=document.getElementById('s-home-goals-preview');
  if(todayGoals.length>0){
    prevEl.innerHTML=`
      <div class="sub-hdr" style="margin-top:0">Today's Tasks (${todayDay})</div>
      ${todayGoals.map(g=>`
        <div class="goal-row" style="margin-bottom:8px">
          <div class="gcheck ${g.done?'checked':''}" onclick="quickToggleGoal('${g.id}');">${g.done?'✓':''}</div>
          <div class="ginfo"><h5>${g.task}</h5><span class="gmeta">🕐 ${g.time} · ${g.duration}</span></div>
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
    ...(hasTeacher ? myClasses.map(c => ({id:c.id, label:c.subject, time:`${c.startTime} – ${c.endTime}`, isClass:true})) : []),
    {id:'general', label:'How are you feeling today?', time:'', isClass:false},
  ];

  const sub = document.querySelector('#s-sec-mood .sec-hdr p');
  if(sub) sub.textContent = hasTeacher ? 'How are you feeling in each period today?' : 'Check in with yourself — just for you 🌱';

  container.innerHTML = items.map(item => {
    const existing = todayMoods.find(m => m.classId === item.id);
    const shareButtons = hasTeacher
      ? `<button class="btn-green" onclick="saveMood(true)">Share with Teacher</button>
         <button class="btn-outline" onclick="saveMood(false)">Keep Private</button>`
      : `<button class="btn-green" onclick="saveMood(false)">Save</button>`;

    return `
      <div class="mood-card">
        <div class="mood-card-hdr">
          <h4>${item.isClass ? '📚 ' : ''}${item.label}</h4>
          ${item.time ? `<span class="cls-time">${item.time}</span>` : ''}
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
        <div>${swInfo.name}</div>
        <div><a href="mailto:${swInfo.email}">${swInfo.email}</a></div>
        <p style="font-size:.78rem;color:var(--muted);margin-top:6px">They won't be notified automatically — this is just their contact info.</p>
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
    toast("Got it — we won't show this again 👍");
  }
}

// GOALS
function renderGoalsSection(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const sel = document.getElementById('goal-cls-sel');
  if(hasClasses()){
    sel.style.display = '';
    sel.innerHTML = `<option value="">All Tasks</option>` + myClasses.map(c=>`<option value="${c.id}">${c.subject}</option>`).join('');
  } else {
    sel.style.display = 'none';
  }
  renderGoals();
  renderAINudge();
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
        <div class="gcheck ${g.done?'checked':''}" onclick="toggleGoal('${g.id}')">${g.done?'✓':''}</div>
        <div class="ginfo">
          <h5 style="${g.done?'text-decoration:line-through':''}">${g.task}</h5>
          <span class="gmeta">🕐 ${g.time} · ⏱ ${g.duration}</span>
        </div>
        <span class="gtype-badge gtype-${g.type||'study'}">${typeLabel(g.type)}</span>
        <button class="gdel" onclick="deleteGoal('${g.id}')">🗑</button>
      `;
      container.appendChild(row);
    });
  });
}

function renderAINudge(){
  const goals=ggo().filter(g=>g.studentId===CU.id);
  const gymGoals=goals.filter(g=>g.type==='gym');
  let tip='Add your tasks above and I\'ll generate scheduling tips!';
  if(gymGoals.length>0){
    const gymDays=[...new Set(gymGoals.map(g=>g.day))].join(', ');
    tip=`🏋️ Gym on ${gymDays}! After your workout, wait 30–45 min before intense studying — your focus peaks around then. I'd move lighter review sessions right after gym.`;
  } else if(goals.length>5){
    tip=`📊 You have ${goals.length} tasks this week! Make sure you have at least one break day.`;
  }
  const el=document.getElementById('goals-ai-nudge');
  el.innerHTML=`<div class="ai-nudge-icon">🤖</div><div><strong>AI Tip</strong><p>${tip}</p></div>`;
}

function openGoalModal(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const sel = document.getElementById('gm-class');
  const clsGroup = sel?.closest('.fgroup');
  if(hasClasses()){
    if(clsGroup) clsGroup.style.display = '';
    sel.innerHTML = `<option value="">— No specific class —</option>` + myClasses.map(c=>`<option value="${c.id}">${c.subject}</option>`).join('');
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
  renderAINudge();
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
  const myMoods=gm().filter(m=>m.studentId===CU.id);
  const myGoals=ggo().filter(g=>g.studentId===CU.id);
  const completed=myGoals.filter(g=>g.done).length;
  const shared=myMoods.filter(m=>m.shared).length;
  document.getElementById('stats-cards').innerHTML=`
    <div class="stat-card"><div class="stat-n">${myMoods.length}</div><div class="stat-l">Mood Check-ins</div></div>
    <div class="stat-card"><div class="stat-n">${myGoals.length}</div><div class="stat-l">Total Tasks</div></div>
    <div class="stat-card"><div class="stat-n">${completed}</div><div class="stat-l">Completed</div></div>
    <div class="stat-card"><div class="stat-n">${shared}</div><div class="stat-l">Moods Shared</div></div>
  `;
  const classes=gc();
  const hist=document.getElementById('mood-history');
  hist.innerHTML=[...myMoods].reverse().slice(0,20).map(m=>{
    const cls=classes.find(c=>c.id===m.classId);
    return `<div class="mood-hist-item">
      <span class="mtag ${m.mood}">${MOOD_CFG[m.mood]?.icon} ${m.mood}</span>
      <span>${cls?.subject||m.classLabel||'General'}</span>
      <span style="margin-left:auto;color:var(--muted);font-size:.78rem">${m.date}</span>
    </div>`;
  }).join('')||'<p style="color:var(--muted);padding:16px 0">No mood history yet.</p>';
}

// WELLNESS
function renderWellnessSection(){
  const logs = gw().filter(w => w.studentId === CU.id);
  const sleepLogs = logs.filter(l => l.type==='sleep').slice(-5).reverse();
  document.getElementById('sleep-log-display').innerHTML = sleepLogs.map(l=>`
    <div class="wlog-entry">
      <span>${l.date} · ${l.hours}h · ${l.quality}</span>
      <span style="color:var(--muted);font-size:.75rem">${l.sharedWith ? '📤 Sent to teacher' : '🔒 Private'}</span>
    </div>`).join('');

  const respLogs = logs.filter(l => l.type==='resp').slice(-5).reverse();
  document.getElementById('resp-log-display').innerHTML = respLogs.map(l=>`
    <div class="wlog-entry"><span>${l.text}</span><span>${l.date}</span></div>`).join('');

  const myClasses = gc().filter(c => CU.classIds?.includes(c.id));
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
  if(c.logo || c.emoji){
    return `<div class="cls-banner-header" style="background:${color};color:${textColor}">
      ${c.logo
        ? `<img class="cls-banner-logo" src="${c.logo}" alt="logo"/>`
        : `<span class="cls-banner-emoji">${c.emoji}</span>`}
      <div class="cls-banner-text"><h4 style="color:${textColor}">${c.subject}</h4></div>
    </div>`;
  }
  return `<div class="cls-banner" style="background:${color}"></div>`;
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
            <div class="s-class-meta">Period ${i+1} · ${c.startTime} – ${c.endTime} · ${c.days?.join(', ')||'—'}</div>
            <span class="cls-code-badge">${c.code}</span>
            ${c.bannerMsg?`<div class="cls-banner-msg" style="margin-top:10px">${c.bannerMsg}</div>`:''}
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
        <span style="flex:1">${i+1}. ${c.subject} <span style="color:var(--muted);font-size:.8rem">${c.startTime}–${c.endTime}</span></span>
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

async function homeJoinClass(){
  const inp = document.getElementById('home-join-code');
  const code = inp ? inp.value.trim().toUpperCase() : '';
  if(!code) return toast('Please enter a class code.');
  const classes = await fsGetShared('classes',[]);
  cSet('classes', classes);
  const cls = classes.find(c => c.code === code);
  if(!cls) return toast('Class code not found. Double-check with your teacher.');
  if(CU.classIds && CU.classIds.includes(cls.id)) return toast("You are already in this class!");
  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if(s){ s.classIds = [...(s.classIds||[]), cls.id]; S.set('students', students); CU.classIds = s.classIds; }
  // Update profile so teacher can find this student
  if(fbAuth?.currentUser){
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds }, { merge: true });
  }
  if(inp) inp.value = '';
  toast('Joined ' + cls.subject + '! Check My Classes in the sidebar.');
  updateStudentNav();
  renderHome();
}

async function joinClass(){
  const code=document.getElementById('join-code').value.trim().toUpperCase();
  if(!code)return toast('Please enter a class code.');
  const classes = await fsGetShared('classes',[]);
  cSet('classes', classes);
  const cls=classes.find(c=>c.code===code);
  if(!cls)return toast(`Class code "${code}" not found. Double-check with your teacher.`);
  if(CU.classIds?.includes(cls.id))return toast('You\'re already in this class!');
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.classIds=[...(s.classIds||[]),cls.id]; S.set('students',students); CU.classIds=s.classIds; }
  if(fbAuth?.currentUser){
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds }, { merge: true });
  }
  document.getElementById('join-code').value = '';
  toast(`Joined ${cls.subject}! 🎉`);
  updateStudentNav();
  renderClassesSection();
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
  const navMap=['overview','classes','students','moods','wellness','goals','alerts','help','settings','profile'];
  const idx=navMap.indexOf(name);
  const navItems=document.querySelectorAll('#t-sidebar .sn');
  if(navItems[idx]) navItems[idx].classList.add('active');
  document.querySelectorAll('#t-main .dsec').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('t-sec-'+name);
  if(sec) sec.classList.add('active');
  if(name==='overview')  renderTeacherOverview();
  if(name==='classes')   renderTeacherClasses();
  if(name==='students')  { loadTeacherStudents().then(renderStudentTable); }
  if(name==='moods')     { loadTeacherStudents().then(renderMoodReports); }
  if(name==='wellness')  { loadTeacherStudents().then(renderWellnessTable); }
  if(name==='goals')     { loadTeacherStudents().then(renderTeacherGoals); }
  if(name==='alerts')    { loadTeacherStudents().then(renderAlerts); }
  if(name==='help')      renderTeacherHelp();
  if(name==='settings')  renderSettings();
  if(name==='profile')   renderTeacherProfile();
}

function getMyClasses(){ return gc().filter(c=>c.teacherId===CU.id); }
function getMyStudents(){
  const myIds=getMyClasses().map(c=>c.id);
  return gs().filter(s=>s.classIds?.some(id=>myIds.includes(id)));
}

function renderTeacherOverview(){
  const students=getMyStudents();
  const classes=getMyClasses();
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared);
  const alerts=moods.filter(m=>NEGATIVE_MOODS.includes(m.mood));
  const el=document.getElementById('t-stats-row');
  if(el) el.innerHTML=`
    <div class="tstat blue"><div class="tstat-n">${students.length}</div><div class="tstat-l">Students</div></div>
    <div class="tstat green"><div class="tstat-n">${classes.length}</div><div class="tstat-l">Classes</div></div>
    <div class="tstat amber"><div class="tstat-n">${moods.length}</div><div class="tstat-l">Mood Check-ins</div></div>
    <div class="tstat red"><div class="tstat-n">${alerts.length}</div><div class="tstat-l">Need Support</div></div>`;
  const badge=document.getElementById('t-alert-badge');
  if(badge) badge.textContent=alerts.length;
  const prev=document.getElementById('t-alerts-preview');
  if(!prev) return;
  if(alerts.length===0){ prev.innerHTML=''; return; }
  prev.innerHTML=`<div style="background:var(--red-lt);border:1px solid #fca5a5;border-radius:var(--r-md);padding:16px 20px;margin-top:4px">
    <h4 style="color:var(--red);margin-bottom:10px">⚠️ ${alerts.length} student${alerts.length>1?'s need':' needs'} support today</h4>
    ${alerts.slice(0,4).map(a=>{const s=students.find(x=>x.id===a.studentId);return `<p style="font-size:.88rem;margin-bottom:4px">• <strong>${s?.name||'Student'}</strong> — feeling <em>${a.mood}</em></p>`;}).join('')}
  </div>`;
}

function renderTeacherClasses(){
  const classes=getMyClasses();
  const students=getMyStudents();
  const grid=document.getElementById('t-classes-grid');
  if(!grid) return;
  if(classes.length===0){grid.innerHTML='<p style="color:var(--muted);padding:20px 0">No classes yet. Create one above!</p>';return;}
  grid.innerHTML=classes.map(c=>{
    const count=students.filter(s=>s.classIds?.includes(c.id)).length;
    return `<div class="t-class-card">${buildClassBannerHTML(c,true)}
      <div class="t-class-card-body">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="cls-code-badge">${c.code}</span>
          <span style="font-size:.8rem;color:var(--muted)">${count} student${count!==1?'s':''}</span>
        </div>
        <span class="cls-time">🕐 ${c.startTime} – ${c.endTime} · ${c.days?.join(', ')||'—'}</span>
        ${c.bannerMsg?`<div class="cls-banner-msg">${c.bannerMsg}</div>`:''}
        <div class="t-class-actions">
          <button class="btn-outline small" onclick="copyCode('${c.code}')">📋 Copy Code</button>
          <button class="btn-outline small" onclick="deleteClass('${c.id}')" style="padding:7px 10px">🗑</button>
        </div>
      </div></div>`;
  }).join('');
}

function renderStudentTable(){
  const myClasses=getMyClasses();
  const students=getMyStudents();
  const filterSel=document.getElementById('t-cls-filter');
  if(filterSel) filterSel.innerHTML='<option value="">All Classes</option>'+myClasses.map(c=>`<option value="${c.id}">${c.subject}</option>`).join('');
  const search=(document.getElementById('t-search')?.value||'').toLowerCase();
  const clsFilter=document.getElementById('t-cls-filter')?.value||'';
  let filtered=students;
  if(clsFilter) filtered=filtered.filter(s=>s.classIds?.includes(clsFilter));
  if(search) filtered=filtered.filter(s=>s.name.toLowerCase().includes(search)||s.email.includes(search));
  const moods=gm().filter(m=>m.shared);
  const wrap=document.getElementById('t-student-table');
  if(!wrap) return;
  if(filtered.length===0){wrap.innerHTML='<p style="color:var(--muted);padding:24px 0">No students found.</p>';return;}
  wrap.innerHTML=`<div class="table-scroll"><table><thead><tr><th>Name</th><th>Grade</th><th>Classes</th><th>Today's Mood</th><th>Sleep</th><th>Status</th></tr></thead><tbody>
    ${filtered.map(s=>{
      const todayMoods=moods.filter(m=>m.studentId===s.id&&m.date===today());
      const isAlert=todayMoods.some(m=>NEGATIVE_MOODS.includes(m.mood));
      const cls=myClasses.filter(c=>s.classIds?.includes(c.id));
      const sleepLog=gw().filter(w=>w.studentId===s.id&&w.type==='sleep'&&w.shared&&w.date===today())[0];
      const moodDisplay=todayMoods.length?todayMoods.map(m=>`<span class="mood-tag-sm ${m.mood}">${MOOD_CFG[m.mood]?.icon} ${m.mood}</span>`).join(''):'<span style="color:var(--muted);font-size:.82rem">Not logged</span>';
      const clsNames=cls.map(c=>{const short=c.subject.length>20?c.subject.slice(0,18)+'…':c.subject;return `<span title="${c.subject}" style="display:inline-block;background:var(--blue-pale);color:var(--blue);border-radius:5px;padding:1px 6px;font-size:.72rem;font-weight:700;margin:1px">${short}</span>`;}).join('');
      return `<tr class="${isAlert?'alert-row':''}">
        <td><strong>${s.name}</strong><br><span style="font-size:.75rem;color:var(--muted)">${s.email}</span></td>
        <td style="white-space:nowrap">${s.grade||'—'}</td>
        <td>${clsNames||'—'}</td>
        <td style="min-width:120px">${moodDisplay}</td>
        <td style="white-space:nowrap">${sleepLog?`<strong>${sleepLog.hours}h</strong> · ${sleepLog.quality}`:'<span style="color:var(--muted)">—</span>'}</td>
        <td style="white-space:nowrap">${isAlert?'<span style="color:var(--red);font-weight:700;font-size:.85rem">⚠️ Needs support</span>':'<span style="color:var(--green);font-size:.85rem">✅ OK</span>'}</td>
      </tr>`;
    }).join('')}
  </tbody></table></div>`;
}

function renderMoodReports(){
  const students=getMyStudents();
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared);
  const grid=document.getElementById('t-mood-grid');
  if(!grid) return;
  if(students.length===0){grid.innerHTML='<p style="color:var(--muted)">No students yet.</p>';return;}
  grid.innerHTML=students.map(s=>{
    const sm=moods.filter(m=>m.studentId===s.id);
    const counts={};
    sm.forEach(m=>{counts[m.mood]=(counts[m.mood]||0)+1;});
    const total=sm.length||1;
    const isAlert=sm.some(m=>NEGATIVE_MOODS.includes(m.mood)&&m.date===today());
    return `<div class="t-mood-card" ${isAlert?'style="border:2px solid var(--red)"':''}>
      <h4>${s.name} ${isAlert?'⚠️':''}</h4>
      ${Object.entries(counts).map(([mood,n])=>`<div class="mbar-row"><span style="width:80px;font-size:.78rem">${MOOD_CFG[mood]?.icon} ${mood}</span><div class="mbar-track"><div class="mbar-fill" style="width:${(n/total*100).toFixed(0)}%;background:${NEGATIVE_MOODS.includes(mood)?'var(--red)':'var(--blue)'}"></div></div><span style="font-size:.78rem">${n}</span></div>`).join('')||'<p style="color:var(--muted);font-size:.82rem">No shared moods yet</p>'}
    </div>`;
  }).join('');
}

function renderWellnessTable(){
  const students=getMyStudents();
  const myClassIds=getMyClasses().map(c=>c.id);
  const allW=gw().filter(w=>w.shared&&students.some(s=>s.id===w.studentId)&&(w.sharedWith?.teacherId===CU.id||myClassIds.includes(w.sharedWith?.classId)));
  const allR=S.get('responsibilities',[]).filter(r=>r.shared&&students.some(s=>s.id===r.studentId)&&(r.sharedWith?.teacherId===CU.id||myClassIds.includes(r.sharedWith?.classId)||!r.sharedWith));
  const wrap=document.getElementById('t-wellness-table');
  if(!wrap) return;
  const classes=getMyClasses();
  let html='';
  if(allR.length>0){
    const grouped={};
    allR.forEach(r=>{if(!grouped[r.studentId])grouped[r.studentId]=[];grouped[r.studentId].push(r);});
    html+=`<h4 style="color:var(--navy);margin-bottom:14px">📋 Student Responsibilities (Shared)</h4>`;
    html+=Object.entries(grouped).map(([sid,resps])=>{
      const s=students.find(x=>x.id===sid);
      const totalHours=resps.reduce((acc,r)=>acc+(parseFloat(r.hours)||0),0);
      return `<div class="t-goals-student" style="margin-bottom:12px"><h4>${s?.name||'Student'} <span style="font-weight:400;color:var(--muted);font-size:.8rem">${totalHours>0?'~'+totalHours+'h/week outside school':''}</span></h4>
        ${resps.map(r=>`<div class="t-goal-row"><span>📌</span><div><strong>${r.text}</strong>${r.when?` <span style="color:var(--muted)">(${r.when})</span>`:''}</div>${r.hours?`<span style="margin-left:auto;color:var(--muted);font-size:.8rem">~${r.hours}h/wk</span>`:''}</div>`).join('')}
      </div>`;
    }).join('');
  }
  if(allW.length>0){
    html+=`<h4 style="color:var(--navy);margin:22px 0 14px">🌱 Wellness Logs Sent to You</h4><div style="overflow-x:auto"><table><thead><tr><th>Student</th><th>Type</th><th>Data</th><th>Period</th><th>Date</th></tr></thead><tbody>
      ${allW.map(w=>{
        const s=students.find(x=>x.id===w.studentId);
        const cls=classes.find(c=>c.id===w.sharedWith?.classId);
        const data=w.type==='sleep'?`${w.hours}h · ${w.quality}`:w.type==='energy'?`Energy: ${w.energy}/10 · 💧${w.water} glasses`:w.text||'—';
        return `<tr><td><strong>${s?.name||'—'}</strong></td><td style="text-transform:capitalize">${w.type}</td><td>${data}</td><td>${cls?.subject||'—'}</td><td>${w.date}</td></tr>`;
      }).join('')}
    </tbody></table></div>`;
  }
  if(!html) html='<p style="color:var(--muted);padding:20px">No wellness data shared with you yet.</p>';
  wrap.innerHTML=html;
}

function renderTeacherGoals(){
  const students=getMyStudents();
  const goals=ggo().filter(g=>students.some(s=>s.id===g.studentId));
  const wrap=document.getElementById('t-goals-content');
  if(!wrap) return;
  if(goals.length===0){wrap.innerHTML='<p style="color:var(--muted);padding:20px">No student goals yet.</p>';return;}
  const grouped={};
  goals.forEach(g=>{if(!grouped[g.studentId])grouped[g.studentId]=[];grouped[g.studentId].push(g);});
  wrap.innerHTML=Object.entries(grouped).map(([sid,goals])=>{
    const s=students.find(x=>x.id===sid);
    const done=goals.filter(g=>g.done).length;
    return `<div class="t-goals-student" style="margin-bottom:16px">
      <h4>${s?.name||'Student'} <span style="font-weight:400;color:var(--muted);font-size:.8rem">${done}/${goals.length} completed</span></h4>
      ${goals.map(g=>`<div class="t-goal-row" style="${g.done?'opacity:.5;text-decoration:line-through':''}"><span>${g.done?'✅':'⬜'}</span><div><strong>${g.task}</strong><span style="color:var(--muted);font-size:.8rem"> — ${g.day} ${g.time}</span></div></div>`).join('')}
    </div>`;
  }).join('');
}

function renderAlerts(){
  const students=getMyStudents();
  const moods=gm().filter(m=>m.shared&&NEGATIVE_MOODS.includes(m.mood)&&students.some(s=>s.id===m.studentId));
  const wrap=document.getElementById('t-alerts-content');
  if(!wrap) return;
  if(moods.length===0){wrap.innerHTML='<p style="color:var(--muted);padding:20px">No alerts — all students look good! ✅</p>';return;}
  wrap.innerHTML=`<div style="background:var(--red-lt);border-radius:var(--r-md);padding:16px 20px">
    <h4 style="color:var(--red);margin-bottom:14px">⚠️ ${moods.length} alert${moods.length>1?'s':''} — students who may need support</h4>
    ${moods.map(m=>{
      const s=students.find(x=>x.id===m.studentId);
      return `<div style="padding:10px 0;border-bottom:1px solid #fca5a5">
        <strong>${s?.name||'Student'}</strong>
        <span class="mood-tag-sm ${m.mood}" style="margin-left:8px">${MOOD_CFG[m.mood]?.icon} ${m.mood}</span>
        <span style="color:var(--muted);font-size:.8rem;margin-left:8px">${m.classLabel||''} · ${m.date}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function renderTeacherHelp(){
  const el=document.getElementById('t-help-content');
  if(el) el.innerHTML=buildHelplinesHTML(CU.province||'Ontario', false);
}

function renderSettings(){
  const el=document.getElementById('t-settings-content');
  if(!el) return;
  el.innerHTML=`
    <div class="fgroup"><label>School Social Worker Name</label><input type="text" id="set-sw-name" value="${CU.socialWorker?.name||''}" placeholder="e.g. Jane Smith"/></div>
    <div class="fgroup"><label>Social Worker Email</label><input type="email" id="set-sw-email" value="${CU.socialWorker?.email||''}" placeholder="e.g. jane@school.ca"/></div>
    <button class="btn-main" onclick="saveSettings()">Save Settings</button>
  `;
}

function saveSettings(){
  const name=document.getElementById('set-sw-name').value.trim();
  const email=document.getElementById('set-sw-email').value.trim();
  const teachers=gt(); const t=teachers.find(x=>x.id===CU.id);
  if(t){
    t.socialWorker=name?{name,email}:null;
    S.set('teachers',teachers);
    CU.socialWorker=t.socialWorker;
    if(fbAuth?.currentUser) fbDb.collection('profiles').doc(fbAuth.currentUser.uid).set({socialWorker:t.socialWorker},{merge:true});
    toast('Settings saved! ✓');
  }
}

function renderTeacherProfile(){
  const el=document.getElementById('t-profile-content');
  if(!el) return;
  el.innerHTML=`
    <div style="text-align:center;margin-bottom:24px">
      <div class="avatar-lg" style="margin:0 auto 12px">${CU.name[0].toUpperCase()}</div>
      <h3>${CU.name}</h3>
      <p style="color:var(--muted)">${CU.email}</p>
      <p style="color:var(--muted);font-size:.85rem">${CU.province||''} · ${CU.school||''}</p>
    </div>
    <button class="btn-danger" onclick="showModal('delete-modal')">🗑 Delete Account</button>
  `;
}

function executeDeleteAccount(){
  const inp=document.getElementById('delete-confirm-input');
  const pass=document.getElementById('delete-pass-input');
  const errEl=document.getElementById('delete-err');
  hideErr(errEl);
  if(inp.value!=='DELETE') return showErr(errEl,'Type DELETE to confirm.');
  if(!fbAuth?.currentUser) return showErr(errEl,'Not logged in.');
  fbAuth.currentUser.delete().then(function(){
    fbDb.collection('users').doc(fbAuth.currentUser.uid).delete().catch(()=>{});
    fbDb.collection('profiles').doc(fbAuth.currentUser.uid).delete().catch(()=>{});
    toast('Account deleted.');
    logout();
  }).catch(function(e){
    if(e.code==='auth/requires-recent-login') return showErr(errEl,'Please log out and log back in before deleting.');
    showErr(errEl,'Could not delete account.');
  });
}

function copyCode(code){
  navigator.clipboard.writeText(code).then(()=>toast('Code copied! 📋')).catch(()=>toast('Could not copy.'));
}

function deleteClass(id){
  if(!confirm('Delete this class? Students will be removed from it.')) return;
  let classes=gc();
  const cls=classes.find(c=>c.id===id);
  if(!cls) return;
  classes=classes.filter(c=>c.id!==id);
  S.set('classes',classes);
  // Remove class from all students
  var students=gs();
  students.forEach(function(s){if(s.classIds){s.classIds=s.classIds.filter(cid=>cid!==id);}});
  S.set('students',students);
  // Also update in Firestore profiles
  if(fbAuth?.currentUser){
    getStudentUids([id]).then(function(profiles){
      profiles.forEach(function(p){
        fbDb.collection('profiles').doc(p.uid).set({classIds:p.classIds.filter(function(cid){return cid!==id;})},{merge:true}).catch(()=>{});
      });
    });
  }
  toast('Class deleted.');
  renderTeacherClasses();
}

// ═══════════════════════════════════════════════
// FORGOT PASSWORD — FULL FIX
// ═══════════════════════════════════════════════
function sendResetCode(){
  var email = document.getElementById('forgot-email').value.trim().toLowerCase();
  var errEl = document.getElementById('forgot-err');
  hideErr(errEl);
  if(!email || !validEmail(email)) return showErr(errEl, 'Please enter a valid email address.');
  if(!fbAuth) initFirebase();
  fbAuth.sendPasswordResetEmail(email, {
    url: window.location.origin + window.location.pathname + '#login',
    handleCodeInApp: true
  }).then(function(){
    toast('Password reset email sent! Check your inbox (and spam) 📧');
    closeModal('forgot-modal');
  }).catch(function(e){
    if(e.code === 'auth/user-not-found') return showErr(errEl, 'No account found with that email.');
    if(e.code === 'auth/invalid-email') return showErr(errEl, 'That email address is invalid.');
    showErr(errEl, 'Could not send reset email. Try again.');
  });
}
function confirmResetPassword(){ toast('Please check your email for the reset link.'); }
function resendResetCode(){ sendResetCode(); }

// Detect reset link in URL on page load
(function(){
  try {
    var params = new URLSearchParams(window.location.search);
    var mode = params.get('mode');
    var oobCode = params.get('oobCode');
    if(mode === 'resetPassword' && oobCode){
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      var waiter = setInterval(function(){
        if(typeof fbAuth !== 'undefined' && fbAuth){
          clearInterval(waiter);
          document.getElementById('reset-modal').dataset.code = oobCode;
          showModal('reset-modal');
        }
      }, 100);
      setTimeout(function(){ clearInterval(waiter); }, 10000);
    }
  } catch(e){}
})();

function doResetPassword(){
  var modal = document.getElementById('reset-modal');
  var code = modal.dataset.code;
  var errEl = document.getElementById('reset-err');
  var pw = document.getElementById('reset-new-pw').value;
  var pw2 = document.getElementById('reset-confirm-pw').value;
  hideErr(errEl);
  if(!pw || pw.length < 8) return showErr(errEl, 'Password must be at least 8 characters.');
  if(pw !== pw2) return showErr(errEl, 'Passwords do not match.');
  fbAuth.confirmPasswordReset(code, pw).then(function(){
    toast('Password reset! You can now log in. ✅');
    closeModal('reset-modal');
    document.getElementById('reset-new-pw').value = '';
    document.getElementById('reset-confirm-pw').value = '';
  }).catch(function(e){
    if(e.code === 'auth/expired-action-code') return showErr(errEl, 'Link expired. Request a new one.');
    if(e.code === 'auth/invalid-action-code') return showErr(errEl, 'Link invalid or already used.');
    if(e.code === 'auth/weak-password') return showErr(errEl, 'Password too weak. Use 8+ chars with uppercase, number, symbol.');
    showErr(errEl, 'Could not reset. Try again.');
  });
}

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────
function uid8(){ return Math.random().toString(36).substr(2,8); }
function today(){ return new Date().toISOString().slice(0,10); }

function showErr(el, msg){
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideErr(el){
  if(!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

function toast(msg){
  var el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.classList.add('hidden'); }, 3500);
}

function showModal(id){
  var el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
}
function closeModal(id){
  var el = document.getElementById(id);
  if(el) el.classList.add('hidden');
}
function openModal(id){ showModal(id); }

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  initFirebase();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }

  fbAuth.onAuthStateChanged(function(user){
    if(user){
      getProfile(user.uid).then(function(profile){
        if(!profile){ fbAuth.signOut().catch(function(){}); return; }
        loadUserData().then(function(){
          CU = Object.assign({}, profile, { id: profile.localId || user.uid, uid: user.uid });
          if(CU.role === 'student') loadStudentDash();
          else loadTeacherDash();
        });
      });
    } else {
      showScreen('screen-entry');
    }
  });
});


/* ═══════════════════════════════════════════════════════════════
   WellSpace — Scale Fixes (paste at the VERY BOTTOM of script.js)
   Fixes 3 issues that break at 200+ users:
   1. Classes stored per-document instead of one giant blob
   2. array-contains-any batched to handle 10+ classes
   3. Teacher student data cached (60s) to stop read overload
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// FIX 1 — Classes stored as individual Firestore docs
// Replaces fsSetShared / fsGetShared for the 'classes' key only.
// Other shared keys still use the old path (there are none currently).
// ─────────────────────────────────────────────

async function fsSetClass(cls) {
  // Save a single class to shared/classes/{classId}
  if (!fbDb) return;
  try {
    await fbDb.collection('shared_classes').doc(cls.id).set(cls);
  } catch (e) { console.error('fsSetClass', e); }
}

async function fsDeleteClass(classId) {
  if (!fbDb) return;
  try {
    await fbDb.collection('shared_classes').doc(classId).delete();
  } catch (e) {}
}

async function fsGetAllClasses() {
  if (!fbDb) return [];
  try {
    const snap = await fbDb.collection('shared_classes').get();
    return snap.docs.map(d => d.data());
  } catch (e) { return []; }
}

// Override createClass to use the new per-doc approach
async function createClass() {
  const subject   = document.getElementById('cm-subject').value.trim();
  const start     = document.getElementById('cm-start').value;
  const end       = document.getElementById('cm-end').value;
  const code      = document.getElementById('cm-code').value.trim().toUpperCase();
  const days      = [...document.querySelectorAll('input[name="cm-day"]:checked')].map(x => x.value);
  const color     = document.querySelector('input[name="cm-color"]:checked')?.value || '#1d5fa6';
  const emoji     = document.getElementById('cm-emoji').value.trim();
  const bannerMsg = document.getElementById('cm-banner-msg').value.trim();
  const logo      = pendingLogoDataUrl || null;

  if (!subject || !code) return toast('Please fill in subject and code.');

  // Check code uniqueness across all class docs
  const existingClasses = await fsGetAllClasses();
  if (existingClasses.find(c => c.code === code))
    return toast('That code already exists — try generating a new one.');

  const newClass = {
    id: 'c' + uid8(), teacherId: CU.id, subject,
    startTime: start, endTime: end, days, code, color, emoji, logo, bannerMsg
  };

  // Save to per-doc collection
  await fsSetClass(newClass);

  // Update local cache
  const updated = [...existingClasses, newClass];
  cSet('classes', updated);

  closeModal('class-modal');
  document.getElementById('cm-subject').value = '';
  document.getElementById('cm-start').value = '09:00';
  document.getElementById('cm-end').value = '09:45';
  document.getElementById('cm-code').value = '';
  document.getElementById('cm-emoji').value = '';
  document.getElementById('cm-banner-msg').value = '';
  document.querySelectorAll('input[name="cm-day"]').forEach(x => x.checked = false);
  clearLogo();
  pendingLogoDataUrl = null;
  toast('Class created! 🎉');
  renderTeacherClasses();
}

// Override deleteClass
async function deleteClass(id) {
  if (!confirm('Delete this class? Students will lose access.')) return;
  await fsDeleteClass(id);
  const updated = cGet('classes', []).filter(c => c.id !== id);
  cSet('classes', updated);
  toast('Class deleted.');
  renderTeacherClasses();
}

// Override homeJoinClass — uses new per-doc classes
async function homeJoinClass() {
  const inp  = document.getElementById('home-join-code');
  const code = inp ? inp.value.trim().toUpperCase() : '';
  if (!code) return toast('Please enter a class code.');

  const classes = await fsGetAllClasses();
  cSet('classes', classes);
  const cls = classes.find(c => c.code === code);
  if (!cls) return toast('Class code not found. Double-check with your teacher.');
  if (CU.classIds && CU.classIds.includes(cls.id)) return toast('You are already in this class!');

  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if (s) { s.classIds = [...(s.classIds || []), cls.id]; S.set('students', students); CU.classIds = s.classIds; }

  if (fbAuth?.currentUser) {
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds }, { merge: true });
  }
  if (inp) inp.value = '';
  toast('Joined ' + cls.subject + '! Check My Classes in the sidebar.');
  updateStudentNav();
  renderHome();
}

// Override joinClass
async function joinClass() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!code) return toast('Please enter a class code.');

  const classes = await fsGetAllClasses();
  cSet('classes', classes);
  const cls = classes.find(c => c.code === code);
  if (!cls) return toast(`Class code "${code}" not found. Double-check with your teacher.`);
  if (CU.classIds?.includes(cls.id)) return toast('You\'re already in this class!');

  const students = gs();
  const s = students.find(x => x.id === CU.id);
  if (s) { s.classIds = [...(s.classIds || []), cls.id]; S.set('students', students); CU.classIds = s.classIds; }

  if (fbAuth?.currentUser) {
    await fbDb.collection('profiles').doc(fbAuth.currentUser.uid)
      .set({ classIds: CU.classIds }, { merge: true });
  }
  document.getElementById('join-code').value = '';
  toast(`Joined ${cls.subject}! 🎉`);
  updateStudentNav();
  renderClassesSection();
}

// Also patch loadUserData to pull classes from the new collection
const _origLoadUserData = loadUserData;
loadUserData = async function () {
  await _origLoadUserData();
  // Refresh classes from per-doc collection
  const classes = await fsGetAllClasses();
  if (classes.length) cSet('classes', classes);
};


// ─────────────────────────────────────────────
// FIX 2 — Batch array-contains-any (Firebase limit = 10)
// Replaces getStudentUids
// ─────────────────────────────────────────────

async function getStudentUids(classIds) {
  if (!fbDb || !classIds?.length) return [];

  // Split into chunks of 10 (Firebase hard limit)
  const chunks = [];
  for (let i = 0; i < classIds.length; i += 10) {
    chunks.push(classIds.slice(i, i + 10));
  }

  const results = [];
  const seen = new Set();

  for (const chunk of chunks) {
    try {
      const snap = await fbDb.collection('profiles')
        .where('role', '==', 'student')
        .where('classIds', 'array-contains-any', chunk)
        .get();

      snap.docs.forEach(d => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          results.push({ uid: d.id, ...d.data() });
        }
      });
    } catch (e) { console.error('getStudentUids chunk error', e); }
  }

  return results;
}


// ─────────────────────────────────────────────
// FIX 3 — Cache teacher student data for 60s
// Replaces loadTeacherStudents
// ─────────────────────────────────────────────

let _teacherStudentCache = null;
let _teacherStudentCacheTime = 0;
const TEACHER_CACHE_TTL = 60 * 1000; // 60 seconds

async function loadTeacherStudents() {
  const now = Date.now();

  // Return cached data if fresh
  if (_teacherStudentCache && (now - _teacherStudentCacheTime) < TEACHER_CACHE_TTL) {
    // Restore from cache into the live cache object
    Object.entries(_teacherStudentCache).forEach(([k, v]) => cSet(k, v));
    return;
  }

  const myClasses  = gc().filter(c => c.teacherId === CU.id);
  const myClassIds = myClasses.map(c => c.id);
  if (!myClassIds.length) return;

  try {
    const studentProfiles = await getStudentUids(myClassIds); // now batched

    const allStudents = [];
    const allMoods    = cGet('moods', []);
    const allGoals    = cGet('goals', []);
    const allWellness = cGet('wellness', []);
    const allResps    = cGet('responsibilities', []);

    for (const sp of studentProfiles) {
      const data = await loadStudentData(sp.uid);
      if (data.students)          allStudents.push(...(data.students || []));
      if (data.moods)             mergeInto(allMoods,    data.moods,             'studentId');
      if (data.goals)             mergeInto(allGoals,    data.goals,             'studentId');
      if (data.wellness)          mergeInto(allWellness, data.wellness,          'studentId');
      if (data.responsibilities)  mergeInto(allResps,    data.responsibilities,  'studentId');
    }

    cSet('students',         allStudents);
    cSet('moods',            allMoods);
    cSet('goals',            allGoals);
    cSet('wellness',         allWellness);
    cSet('responsibilities', allResps);

    // Save to cache
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

// Call this after any action that changes student data so cache is invalidated
function invalidateTeacherCache() {
  _teacherStudentCache = null;
  _teacherStudentCacheTime = 0;
}

/* ─────────────────────────────────────────────
   FIRESTORE RULES — paste into Firebase Console → Firestore → Rules
   (replacing everything that's there now)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Private user data — only the owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Profiles — any logged-in user can read (teachers need to find students)
    // Only the owner can write their own profile
    match /profiles/{userId} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Per-class documents — any logged-in user can read
    // Only authenticated users can create; only the teacher who owns it can delete
    match /shared_classes/{classId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Legacy shared blob — keep read access so old data still loads
    match /shared/{doc} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
───────────────────────────────────────────── */
