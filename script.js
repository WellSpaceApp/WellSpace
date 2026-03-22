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

// AI response logic
const AI_RESPONSES = [
  {
    keywords:['gym','workout','exercise','sport','tired after gym','just did gym'],
    response:`💪 Great job getting that workout in! Here's what I'd suggest after gym:\n\n• **Right now (0–30 min):** Protein snack + water. Your body needs fuel.\n• **30–60 min:** Light review or easy reading — your brain works well right after exercise.\n• **2–3 hours later:** This is actually your peak focus window. Schedule your hardest studying here.\n• **Evening:** Wind down. No heavy screens 1 hour before bed.\n\nTired is temporary — the cognitive boost from exercise lasts 2–3 hours! 🧠`
  },
  {
    keywords:['test tomorrow','exam tomorrow','quiz tomorrow','haven\'t studied','haven\'t started'],
    response:`📝 Okay, let's not panic — you've got this. Here's an emergency study plan:\n\n• **Right now:** Brain dump everything you already know on paper.\n• **Next 25 min:** Review notes/textbook — just read, no re-writing.\n• **5 min break:** Walk around, drink water.\n• **Next 25 min:** Practice questions or past papers only.\n• **5 min break.**\n• **Final 20 min:** Focus only on topics you got wrong.\n• **Night before:** Stop studying 1 hour before bed. Sleep is more valuable than cramming.\n\nOne decent sleep = better recall than 3 more hours of tired studying. 🌙`
  },
  {
    keywords:['4 hours','3 hours','2 hours','no sleep','sleep deprived','only slept','low on sleep'],
    response:`😴 Low sleep is tough — here's how to protect what energy you have:\n\n• **Morning classes:** Sit near the front. Natural light + movement help alertness.\n• **Lunch:** A 10–20 min nap (set an alarm!) can restore focus significantly.\n• **Avoid sugar/energy drinks** — they cause crashes that make it worse.\n• **Prioritise tonight:** Skip optional activities and get to bed by 9–10pm.\n• **One task at a time** — sleep deprivation hurts multitasking most.\n\n⚠️ If this is a pattern, check in with the Wellness section — sleep logs help track this.`
  },
  {
    keywords:['overwhelmed','too much','stressed','anxious','can\'t handle','too many'],
    response:`🌬️ I hear you. Let's slow down and sort this out:\n\n**Step 1 — Brain dump:** Write every single thing you're worried about on paper. Get it OUT of your head.\n\n**Step 2 — Sort it:** Circle only things that MUST happen today. Everything else can wait.\n\n**Step 3 — One thing at a time:** Pick the smallest item on your "today" list and do ONLY that for 25 minutes.\n\n**Step 4 — Breathe:** Inhale 4 seconds → hold 4 → exhale 4. Repeat 3 times.\n\nYou don't have to do everything today. You just have to do the next right thing. 💙`
  },
  {
    keywords:['plan my week','schedule','weekly plan','organize','time management'],
    response:`📅 Let's build a weekly plan! Here's a framework that works for high school:\n\n**Morning (6–8am):** Wake routine, breakfast. Avoid phone first thing.\n**School hours:** Full focus — phones away in class.\n**3–5pm (After school):** Best time for extracurriculars, gym, or chores.\n**5–7pm:** Study block #1 — hardest subject first (highest priority homework).\n**7–8pm:** Dinner + real break (no studying).\n**8–9:30pm:** Study block #2 — lighter review, reading, assignments.\n**9:30–10pm:** Wind down — no screens, prep for next day.\n**Lights out by 10–10:30pm**\n\nTip: Add your tasks in the Goals section and they'll appear on your calendar! 🗓️`
  },
  {
    keywords:['motivation','don\'t want to','unmotivated','procrastinating','can\'t start'],
    response:`🔥 Starting is the hardest part. Here's the trick:\n\n**The 2-minute rule:** Just open your textbook and read ONE sentence. That's it. Once you start, momentum takes over.\n\n**Make it easier than easier:** Instead of "study chemistry" → "read page 47 only."\n\n**Remove friction:** Sit at a clean desk, phone in another room (not face down — another room).\n\n**Promise yourself a reward:** After 25 minutes → a 5-minute YouTube break, a snack, something you actually want.\n\nMotivation follows action — not the other way around. Start tiny. 🌱`
  },
];

const AI_FALLBACK = `🤖 I hear you! Here's my general advice:\n\n• **Break it down:** Whatever the challenge, split it into smaller pieces.\n• **Prioritise sleep** — it affects everything: mood, memory, focus.\n• **Use the calendar** to see your week at a glance.\n• **Talk to someone** — your teacher, a friend, or the crisis lines in the Help section.\n\nWhat specifically is going on? Tell me more and I'll give you a personalised plan! 💬`;

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let CU = null;          // current user object
let authRole = null;    // 'student' | 'teacher'
let pendingMoodSel = null; // { classId, classLabel, mood }
let periodOrder = [];    // student's class order

// ─────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────
const S = {
  get:(k,d=null)=>{ try{ const v=localStorage.getItem('ws_'+k); return v?JSON.parse(v):d; }catch{return d;} },
  set:(k,v)=>{ try{ localStorage.setItem('ws_'+k,JSON.stringify(v)); }catch{} },
};
const gs = ()=>S.get('students',[]);
const gt = ()=>S.get('teachers',[]);
const gc = ()=>S.get('classes',[]);
const gm = ()=>S.get('moods',[]);
const ggo= ()=>S.get('goals',[]);
const gw = ()=>S.get('wellness',[]);
const gmsg=()=>S.get('messages',[]);
const gj = ()=>S.get('journals',[]);

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
  // Dashboard screens stack vertically (sidebar + main are inside)
  if(id==='screen-student'||id==='screen-teacher') el.style.flexDirection='column';
  el.classList.add('active','fade');
}

function gotoAuth(role){
  authRole=role;
  const brand=document.getElementById('auth-brand-label');
  brand.textContent = role==='student' ? '🎒 Student Login' : '📋 Teacher Login';
  // Show/hide signup fields
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
// AUTH — LOGIN
// ─────────────────────────────────────────────
function doLogin(){
  const email=document.getElementById('login-email').value.trim().toLowerCase();
  const pass =document.getElementById('login-pass').value;
  const errEl=document.getElementById('login-err');

  if(!email||!pass){ return showErr(errEl,'Please enter your email and password.'); }
  if(!validEmail(email)){ return showErr(errEl,'Please enter a valid email address.'); }

  if(authRole==='student'){
    const u=gs().find(s=>s.email===email&&s.password===pass);
    if(!u)return showErr(errEl,'Email or password incorrect. Check your details.');
    CU={role:'student',...u};
    // Save session so they don't need to log in again
    S.set('session',{role:'student',id:u.id});
    toast(`Welcome back, ${u.name}! 👋`);
    loadStudentDash();
  } else {
    const u=gt().find(t=>t.email===email&&t.password===pass);
    if(!u)return showErr(errEl,'Email or password incorrect.');
    CU={role:'teacher',...u};
    S.set('session',{role:'teacher',id:u.id});
    toast(`Welcome back, ${u.name}! 📋`);
    loadTeacherDash();
  }
}

// ─────────────────────────────────────────────
// AUTH — SIGNUP
// ─────────────────────────────────────────────
function doSignup(){
  const name =document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim().toLowerCase();
  const pass =document.getElementById('su-pass').value;
  const privacyOk=document.getElementById('su-privacy').checked;
  const errEl=document.getElementById('signup-err');

  if(!name||!email||!pass) return showErr(errEl,'Please fill in all required fields.');
  if(!validEmail(email))   return showErr(errEl,'Please enter a valid email address (e.g. name@domain.com).');
  if(!validPw(pass))       return showErr(errEl,'Password must be 8+ chars with an uppercase letter, number, and special character.');
  if(!privacyOk)           return showErr(errEl,'Please accept the privacy policy to continue.');

  if(authRole==='student'){
    const grade=document.getElementById('su-grade').value;
    const code =document.getElementById('su-code').value.trim().toUpperCase();
    if(!grade) return showErr(errEl,'Please select your grade.');
    if(gs().find(s=>s.email===email)) return showErr(errEl,'An account with this email already exists.');

    let classIds=[];
    if(code){
      const cls=gc().find(c=>c.code===code);
      if(!cls) return showErr(errEl,`Class code "${code}" not found. Ask your teacher for the correct code.`);
      classIds=[cls.id];
    }
    const u={id:'s'+uid(),name,email,password:pass,grade,classIds,periodOrder:[],joined:today()};
    const students=gs(); students.push(u); S.set('students',students);
    CU={role:'student',...u};
    S.set('session',{role:'student',id:u.id});
    toast(`Account created! Welcome, ${name} 🎉`);
    loadStudentDash();

  } else {
    const province=document.getElementById('su-province').value;
    const school  =document.getElementById('su-school').value.trim();
    if(!province) return showErr(errEl,'Please select your province.');
    if(gt().find(t=>t.email===email)) return showErr(errEl,'An account with this email already exists.');
    const u={id:'t'+uid(),name,email,password:pass,province,school,socialWorker:null,joined:today()};
    const teachers=gt(); teachers.push(u); S.set('teachers',teachers);
    CU={role:'teacher',...u};
    S.set('session',{role:'teacher',id:u.id});
    toast(`Account created! Welcome, ${name} 📋`);
    loadTeacherDash();
  }
}

function logout(){
  CU=null; authRole=null;
  aiHistory=[]; aiConversation=[]; pendingSuggestion=null;
  S.set('session', null);
  showScreen('screen-entry');
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

  // Show/hide class-related sidebar items depending on whether student has any classes
  updateStudentNav();
  sSection('home');
}

function hasClasses(){
  return CU.classIds && CU.classIds.length > 0;
}

// Show or hide the "My Classes" nav item dynamically
function updateStudentNav(){
  const navItems = document.querySelectorAll('#s-sidebar .sn');
  // navMap index 8 = classes
  if(navItems[8]){
    navItems[8].style.display = hasClasses() ? '' : 'none';
  }
}

function sSection(name){
  document.querySelectorAll('#s-sidebar .sn').forEach(n=>n.classList.remove('active'));
  const navMap=['home','mood','goals','calendar','ai','stats','wellness','help','classes','profile'];
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
  if(name==='ai')       initAI();
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

  // Goals preview
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
    prevEl.innerHTML=`<div class="ai-nudge" style="margin-top:16px"><div class="ai-nudge-icon">🎯</div><div><strong>No tasks for today yet</strong><p>Head to Goals to plan your day, or ask the AI Coach for schedule help!</p></div></div>`;
  }
}

// MOOD CHECK
function renderMoodCheck(){
  const myClasses = gc().filter(c => CU.classIds && CU.classIds.includes(c.id));
  const todayMoods = gm().filter(m => m.studentId === CU.id && m.date === today());
  const container = document.getElementById('s-mood-list');
  const hasTeacher = hasClasses();

  // Build items: class items only if they have classes, always include personal
  const items = [
    ...(hasTeacher ? myClasses.map(c => ({id:c.id, label:c.subject, time:`${c.startTime} – ${c.endTime}`, isClass:true})) : []),
    {id:'general', label:'How are you feeling today?', time:'', isClass:false},
  ];

  // Update section subtitle
  const sub = document.querySelector('#s-sec-mood .sec-hdr p');
  if(sub) sub.textContent = hasTeacher ? 'How are you feeling in each period today?' : 'Check in with yourself — just for you 🌱';

  container.innerHTML = items.map(item => {
    const existing = todayMoods.find(m => m.classId === item.id);
    // Only show share/private buttons if student has a teacher
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

// escape single quotes for inline onclick
function escQ(s){ return s.replace(/'/g,"\\'"); }

function selectMood(classId, classLabel, mood){
  // Close any open popups first
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
    // Don't show if user permanently dismissed it
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
  // Close all popups
  document.querySelectorAll('.support-popup').forEach(p => p.classList.add('hidden'));
  toast('Mood saved! ' + (shared && hasClasses() ? 'Shared with teacher.' : 'Saved privately.'));
  renderMoodCheck();
}

function showSWPopup(mood){
  // Only show once per session
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
    // Store in localStorage so it never shows again for this user
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
    container.innerHTML=`<div class="ai-nudge"><div class="ai-nudge-icon">🎯</div><div><strong>No tasks yet</strong><p>Add your first task above, or ask the AI Coach to plan your week!</p></div></div>`;
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
  let tip='Add your tasks above and I\'ll generate scheduling tips! Or visit the AI Coach for personalized advice.';
  if(gymGoals.length>0){
    const gymDays=[...new Set(gymGoals.map(g=>g.day))].join(', ');
    tip=`🏋️ Gym on ${gymDays}! After your workout, wait 30–45 min before intense studying — your focus peaks around then. I'd move lighter review sessions right after gym.`;
  } else if(goals.length>5){
    tip=`📊 You have ${goals.length} tasks this week! Make sure you have at least one break day. The AI Coach can help you redistribute if things feel unbalanced.`;
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
  goals.push({id:'g'+uid(),studentId:CU.id,classId:cls,task,day,time,duration:dur,type,done:false,created:today()});
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

    // Show class times
    myClasses.filter(c=>c.days?.includes(day)).forEach(c=>{
      const ev=document.createElement('div'); ev.className='cal-event';
      ev.textContent=`${c.startTime} ${c.subject}`;
      col.appendChild(ev);
    });

    // Show goals
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

  // Show/hide share rows and populate teacher dropdowns
  const myClasses = gc().filter(c => CU.classIds?.includes(c.id));
  const shareRows = ['sleep-share-row','resp-share-row','energy-share-row'];
  shareRows.forEach(id => {
    const row = document.getElementById(id);
    if(row) row.style.display = hasClasses() ? '' : 'none';
  });

  if(hasClasses()){
    // Build teacher options — one option per class (period label)
    const teacherOpts = myClasses.map(c => {
      const teacher = gt().find(t => t.id === c.teacherId);
      return `<option value="${c.teacherId}|${c.id}">${c.subject} (${teacher?.name || 'Teacher'})</option>`;
    }).join('');
    const optHtml = `<option value="">Pick a period…</option>` + teacherOpts;

    ['sleep-teacher-sel','resp-teacher-sel','energy-teacher-sel'].forEach(id => {
      const sel = document.getElementById(id);
      if(sel) sel.innerHTML = optHtml;
    });

    // Wire checkboxes to show/hide the dropdown
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
    logs.push({ id:'w'+uid(), studentId:CU.id, type:'sleep', hours, quality, shared, sharedWith, date:today() });
    toast(shared ? `Sleep sent to ${getTeacherName(sharedWith.teacherId)} 📤` : 'Sleep logged privately 😴');

  } else if(type === 'resp'){
    const text = document.getElementById('w-resp').value.trim();
    if(!text) return toast('Please describe your responsibility.');
    const { shared, sharedWith } = getShareTarget('share-resp','resp-teacher-sel');
    if(shared && !sharedWith?.teacherId) return toast('Please pick which teacher to send this to.');
    logs.push({ id:'w'+uid(), studentId:CU.id, type:'resp', text, shared, sharedWith, date:today() });
    document.getElementById('w-resp').value = '';
    toast(shared ? `Responsibility sent to ${getTeacherName(sharedWith.teacherId)} 📤` : 'Responsibility logged.');

  } else if(type === 'energy'){
    const energy = document.getElementById('w-energy').value;
    const water  = document.getElementById('w-water').value;
    const { shared, sharedWith } = getShareTarget('share-energy','energy-teacher-sel');
    if(shared && !sharedWith?.teacherId) return toast('Please pick which teacher to send this to.');
    logs.push({ id:'w'+uid(), studentId:CU.id, type:'energy', energy, water, shared, sharedWith, date:today() });
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
  let province = 'Ontario'; // sensible default
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
  // No logo/emoji — coloured strip only, subject shown in card body
  return `<div class="cls-banner" style="background:${color}"></div>`;
}

// Returns '#fff' for dark backgrounds, '#1e293b' for light ones
function getContrastColor(hex){
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  // Perceived luminance formula
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

// CLASSES (teacher)
function renderClassesSection(){
  const myClasses=gc().filter(c=>CU.classIds&&CU.classIds.includes(c.id));
  const list=document.getElementById('s-classes-list');
  if(myClasses.length===0){
    list.innerHTML=`<p style="color:var(--muted);padding:20px 0">No classes joined yet. Enter a class code above from your teacher.</p>`;
  } else {
    // Use period order if set
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
  // Period order
  if(myClasses.length>1){
    document.getElementById('period-order-wrap').classList.remove('hidden');
    const order=CU.periodOrder?.length?CU.periodOrder:myClasses.map(c=>c.id);
    const orderedClasses=order.map(id=>myClasses.find(c=>c.id===id)).filter(Boolean);
    // Add any classes not yet in order
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
  // Update student
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.periodOrder=periodOrder; S.set('students',students); CU.periodOrder=periodOrder; }
  renderClassesSection();
}

function savePeriodOrder(){
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.periodOrder=periodOrder; S.set('students',students); CU.periodOrder=periodOrder; }
  toast('Period order saved! ✓');
}

function joinClass(){
  const code=document.getElementById('join-code').value.trim().toUpperCase();
  if(!code)return toast('Please enter a class code.');
  const cls=gc().find(c=>c.code===code);
  if(!cls)return toast(`Class code "${code}" not found. Double-check with your teacher.`);
  if(CU.classIds?.includes(cls.id))return toast('You\'re already in this class!');
  const students=gs(); const s=students.find(x=>x.id===CU.id);
  if(s){ s.classIds=[...(s.classIds||[]),cls.id]; S.set('students',students); CU.classIds=s.classIds; }
  document.getElementById('join-code').value = '';
  toast(`Joined ${cls.subject}! 🎉`);
  updateStudentNav();
  renderClassesSection();
}


// ─────────────────────────────────────────────
// AI COACH — Persistent memory + personalisation
// ─────────────────────────────────────────────
let aiHistory      = [];
let aiConversation = []; // session [{role,text}]
let pendingSuggestion = null;
const AI_MEM = 14;

// ── Persistent AI profile saved per user in localStorage ──
function getAIProfile(){
  return S.get('ai_profile_'+CU.id, {
    city:           null,
    busArrival:     null,
    preferredRun:   null,
    preferredStudy: null,
    interests:      [],
    likedSubjects:  [],
    sleepGoal:      8,
    avgSleep:       null,
    gymDays:        [],
    totalChats:     0,
    lastSeen:       null,
    recentTopics:   [],
    learnedFacts:   []
  });
}
function saveAIProfile(updates){
  const p = {...getAIProfile(), ...updates};
  if(p.recentTopics?.length > 10) p.recentTopics = p.recentTopics.slice(-10);
  if(p.learnedFacts?.length > 20) p.learnedFacts = p.learnedFacts.slice(-20);
  S.set('ai_profile_'+CU.id, p);
  return p;
}

// Learn facts from what the user types — called on every message
function learnFromMessage(text){
  const lc = text.toLowerCase();
  const p  = getAIProfile();
  const u  = {};

  // City
  const cityM = text.match(/\b(st\.?\s*catharines?|toronto|mississauga|hamilton|ottawa|london|brampton|windsor|kingston|waterloo|guelph|barrie|niagara|scarborough|markham|vaughan|richmond hill|oakville|burlington|oshawa)\b/i);
  if(cityM) u.city = cityM[1];

  // Bus/home arrival time
  const busM = text.match(/(?:back|arrive|get home|home|return|bus|come back)[^\d]*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i);
  if(busM) u.busArrival = normaliseTime(busM[1]);

  // Preferred run time
  if(lc.includes('run')||lc.includes('jog')||lc.includes('5k')){
    const t = extractTimeFromText(text); if(t) u.preferredRun = t;
    if(!p.interests.includes('running')) u.interests = [...(p.interests||[]),'running'];
  }

  // Preferred study time
  if(lc.includes('study')||lc.includes('homework')){
    const t = extractTimeFromText(text); if(t) u.preferredStudy = t;
  }

  // Interests
  ['basketball','soccer','football','swimming','tennis','hockey','volleyball','music','gaming','art','coding','reading','gym','yoga','dance'].forEach(w=>{
    if(lc.includes(w)&&!p.interests?.includes(w)) u.interests=[...(p.interests||[]),w];
  });

  // Topic tracking
  let topic=null;
  if(lc.includes('run')||lc.includes('jog')||lc.includes('5k')) topic='running';
  else if(lc.includes('gym')||lc.includes('workout')) topic='gym';
  else if(lc.includes('study')||lc.includes('test')||lc.includes('exam')) topic='studying';
  else if(lc.includes('sleep')||lc.includes('tired')) topic='sleep';
  else if(lc.includes('weather')) topic='weather';
  else if(lc.includes('stress')||lc.includes('overwhelm')) topic='stress';
  else if(lc.includes('motivation')||lc.includes('procrastin')) topic='motivation';
  if(topic) u.recentTopics=[...(p.recentTopics||[]).filter(t=>t!==topic),topic];

  u.totalChats = (p.totalChats||0)+1;
  u.lastSeen   = today();
  if(Object.keys(u).length) saveAIProfile(u);
}

// Build opening message — personalised for returning users
function buildPersonalisedGreeting(ctx){
  const p    = getAIProfile();
  const name = CU.name.split(' ')[0];
  const isReturn = (p.totalChats||0) > 0 && p.lastSeen;
  const sameDay  = p.lastSeen === today();

  // Refresh gym days from actual goals
  const gymDays=[...new Set(ggo().filter(g=>g.studentId===CU.id&&g.type==='gym').map(g=>g.day))];
  if(gymDays.length) saveAIProfile({gymDays});

  // Calc avg sleep
  const sleepLogs=gw().filter(w=>w.studentId===CU.id&&w.type==='sleep').slice(-7);
  if(sleepLogs.length){
    const avg=sleepLogs.reduce((a,b)=>a+parseFloat(b.hours||0),0)/sleepLogs.length;
    saveAIProfile({avgSleep:Math.round(avg*10)/10});
  }

  let msg='';

  if(isReturn && sameDay){
    msg=`Hey ${name}! Still here — what else do you need? 👋`;
  } else if(isReturn){
    msg=`Welcome back, ${name}! 👋 `;
    const topicMap={running:'running',gym:'the gym',studying:'studying',sleep:'sleep',weather:'weather',stress:'stress',motivation:'staying motivated'};
    const lastT=p.recentTopics?.[p.recentTopics.length-1];
    if(lastT) msg+=`Last time we talked about **${topicMap[lastT]||lastT}**. `;
    if(p.city) msg+=`I remember you're in **${p.city}**`;
    if(p.busArrival) msg+=`${p.city?', and ':''} you get home around **${formatTime(p.busArrival)}**`;
    if(p.city||p.busArrival) msg+=`. `;
    msg+=`\n\n${ctx.summary}\n\nWhat's on your mind today?`;
  } else {
    msg=`Hey ${name}! 👋 I'm your AI Coach — I can see your real schedule, goals, classes and wellness data.\n\n`;
    msg+=`**What I can do:**\n• 📅 Plan your week from your actual schedule\n• 🏋️ Find free gym/run slots\n• 📝 Test prep plans\n• 😴 Sleep-adjusted daily plans\n• 🌤️ Real weather checks for any city\n• ✅ Suggest + add tasks with one click\n\n`;
    msg+=`${ctx.summary}\n\nWhat do you need?`;
  }

  return msg;
}

function initAI(){
  if(aiHistory.length>0) return;
  aiHistory=['init'];
  aiConversation=[];
  const ctx=buildUserContext();
  const welcome=buildPersonalisedGreeting(ctx);
  aiConversation.push({role:'ai',text:welcome});
  addAIMsg('ai',welcome);
}

function sendAI(){
  const inp=document.getElementById('ai-input');
  const text=inp.value.trim();
  if(!text) return;
  learnFromMessage(text); // learn before responding
  aiConversation.push({role:'user',text});
  if(aiConversation.length>AI_MEM) aiConversation=aiConversation.slice(-AI_MEM);
  addAIMsg('user',text);
  inp.value='';
  respondAI(text); // no artificial delay
}

function aiChip(text){
  document.getElementById('ai-input').value=text;
  sendAI();
}

// Memory: combines session convo + persistent profile
function getMemory(){
  const p=getAIProfile();
  const userTexts=aiConversation.filter(m=>m.role==='user').map(m=>m.text);
  const allText=userTexts.join(' ');
  const allLower=allText.toLowerCase();

  const cityM=allText.match(/\b(st\.?\s*catharines?|toronto|mississauga|hamilton|ottawa|london|brampton|windsor|kingston|waterloo|guelph|barrie|niagara|scarborough|markham|vaughan|richmond hill|oakville|burlington|oshawa)\b/i);
  const location=cityM?.[1]||p.city;

  let activity=null;
  if(allLower.includes('5k')||allLower.includes('run')||allLower.includes('jog')) activity='🏃 Run';
  else if(allLower.includes('walk')) activity='🚶 Walk';
  else if(allLower.includes('bike')||allLower.includes('cycling')) activity='🚴 Bike ride';
  else if(allLower.includes('gym')||allLower.includes('workout')) activity='🏋️ Gym';
  else if(allLower.includes('swim')) activity='🏊 Swim';

  const day=extractDayFromText(allText);
  const tcM=allText.match(/(?:back|arrive|get home|home|return|bus|come back)[^\d]*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i);
  const timeConstraint=tcM?normaliseTime(tcM[1]):(p.busArrival||null);

  return {location,activity,day,timeConstraint,userTexts,allLower,profile:p};
}

function normaliseTime(t){
  if(!t) return null;
  if(/^\d{1,2}:\d{2}$/.test(t.trim())){
    const h=parseInt(t.split(':')[0]);
    if(h<8) return `${h+12}:${t.split(':')[1]}`;
    return t.length===4?'0'+t:t;
  }
  return extractTimeFromText(t)||null;
}

async function respondAI(text){
  const msgs = document.getElementById('ai-messages');
  const typing = document.createElement('div');
  typing.className='msg-ai'; typing.id='ai-typing';
  typing.innerHTML=`<div class="msg-ai-icon">AI</div><div class="ai-typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  msgs.appendChild(typing); msgs.scrollTop=msgs.scrollHeight;

  const ctx = buildUserContext();
  const mem = getMemory();
  const lc  = text.toLowerCase();
  let response='', suggestion=null;

  // ── Follow-up / correction using memory ──────────────────
  const isCorrection = lc.includes('but ') || lc.includes('actually') || lc.includes('no,') ||
    lc.includes('come back') || lc.includes('arrive') || lc.includes('get home') ||
    lc.includes('back by') || lc.includes('back at') || lc.includes('return') ||
    lc.includes('instead') || (lc.includes("don't") && !lc.includes("don't want")) || lc.includes('not that');

  if(isCorrection && (mem.activity || pendingSuggestion)){
    const activity  = mem.activity || pendingSuggestion?.task || 'activity';
    const targetDay = mem.day || pendingSuggestion?.day || new Date().toLocaleDateString('en-CA',{weekday:'long'});
    const rawTime   = extractTimeFromText(text);
    const constraintT = rawTime || mem.timeConstraint;

    if(constraintT){
      const minMins   = timeToMins(constraintT) + 30;
      const freeAfter = ctx.freeSlots.filter(s => s.day===targetDay && timeToMins(s.time)>=minMins);
      const oldCard   = document.getElementById('ai-suggest-card'); if(oldCard) oldCard.remove();
      if(freeAfter.length){
        const best = freeAfter[0];
        response = `Got it — you're back by ${formatTime(constraintT)} on ${targetDay}. Here's the adjusted slot:\n\nBest time for your **${activity}**: **${formatTime(best.time)}** on ${targetDay} (${getDayDate(targetDay)}) — gives you 30 min to get home and change. Want me to add it?`;
        suggestion = {type:'other', day:targetDay, time:best.time, duration:'1 hour', task:activity};
      } else {
        response = `Got it — you're back by ${formatTime(constraintT)} on ${targetDay} and the rest looks busy. How about a different day?\n\n${ctx.freeSlots.filter(s=>s.day!==targetDay).slice(0,3).map(s=>`• **${s.day} (${getDayDate(s.day)}) at ${formatTime(s.time)}**`).join('\n')}`;
      }
    } else {
      response = `Got it! When do you get back on ${targetDay}? (e.g. "I get home at 4:30pm")`;
    }
  }

  // ── Just a city name as reply ──────────────────────────────
  else if(text.trim().split(/\s+/).length <= 5 && !lc.includes('?') && mem.activity && (extractLocation(text)||text.match(/st\.?\s*cath/i))){
    const loc     = extractLocation(text) || text.trim();
    const dayName = mem.day || new Date().toLocaleDateString('en-CA',{weekday:'long'});
    const dateStr = extractDateFromText(dayName);
    const weatherPart = await fetchWeatherResponse(`${mem.activity} in ${loc} on ${dayName}`, loc, dateStr, ctx);
    const slotResult  = suggestActivitySlot(mem.activity, ctx, mem.activity);
    response  = weatherPart+(slotResult.message?`\n\n---\n${slotResult.message}`:'');
    suggestion = slotResult.suggestion;
  }

  // ── WEATHER ───────────────────────────────────────────────
  else if(lc.includes('weather')||lc.includes('temperature')||lc.includes('rain')||lc.includes('snow')||lc.includes('forecast')){
    const loc  = extractLocation(text)||mem.location||'Ontario';
    const date = extractDateFromText(text)||(mem.day?extractDateFromText(mem.day):null);
    response = await fetchWeatherResponse(text, loc, date, ctx);
  }

  // ── RUN / OUTDOOR ─────────────────────────────────────────
  else if(lc.includes('run')||lc.includes('5k')||lc.includes('jog')||lc.includes('walk')||lc.includes('bike')||lc.includes('outdoor')){
    const actLabel = lc.includes('run')||lc.includes('5k')||lc.includes('jog')?'🏃 Run':lc.includes('walk')?'🚶 Walk':'🚴 Bike ride';
    const loc = extractLocation(text)||mem.location;
    const dayTarget = extractDayFromText(text)||mem.day;
    if(loc && loc.length>2){
      const dateStr = dayTarget?extractDateFromText(dayTarget):null;
      const wp = await fetchWeatherResponse(text, loc, dateStr, ctx);
      const sr = suggestActivitySlot(text, ctx, actLabel);
      response = wp+(sr.message?`\n\n---\n${sr.message}`:'');
      suggestion = sr.suggestion;
    } else {
      const result = suggestActivitySlot(text, ctx, actLabel);
      response = result.message+`\n\nAlso — want me to check the weather? Just tell me your city!`;
      suggestion = result.suggestion;
    }
  }

  // ── GYM ───────────────────────────────────────────────────
  else if(lc.includes('gym')&&(lc.includes('when')||lc.includes('slot')||lc.includes('time')||lc.includes('schedule')||lc.includes('best'))){
    const result = suggestActivitySlot(text, ctx,'🏋️ Gym session');
    response=result.message; suggestion=result.suggestion;
  }

  // ── PLAN WEEK ─────────────────────────────────────────────
  else if(lc.includes('plan')&&(lc.includes('week')||lc.includes('schedule'))){
    response = buildWeekPlan(ctx);
  }

  // ── TEST / EXAM ───────────────────────────────────────────
  else if(lc.includes('test')||lc.includes('exam')||lc.includes('quiz')){
    response = buildTestPrepPlan(text, ctx);
  }

  // ── JUST DID GYM ─────────────────────────────────────────
  else if(lc.includes('just')&&(lc.includes('gym')||lc.includes('workout')||lc.includes('exercis'))){
    response=`💪 Great work!\n\n**Next 30 min:** Protein + water.\n**30–60 min:** Light review — re-read notes only.\n**2–3 hrs from now:** Peak focus window — schedule hardest task here.\n**Tonight:** Wind down by 9:30pm.${ctx.recentSleep&&parseFloat(ctx.recentSleep.hours)<7?`\n\n⚠️ Only ${ctx.recentSleep.hours}h sleep — be extra gentle today.`:''}`;
  }

  // ── SLEEP / TIRED ─────────────────────────────────────────
  else if(lc.includes('sleep')||lc.includes('tired')||lc.includes('exhausted')||lc.match(/\d+ hours? (of )?sleep/)){
    const h=text.match(/(\d+\.?\d*)\s*h/i);
    response=buildSleepResponse(h?parseFloat(h[1]):ctx.recentSleep?parseFloat(ctx.recentSleep.hours):null, ctx);
  }

  // ── OVERWHELMED ───────────────────────────────────────────
  else if(lc.includes('overwhelm')||lc.includes('stress')||lc.includes('too much')||lc.includes('anxious')){
    response=buildOverwhelmedResponse(ctx);
    if(ctx.burnout) response=`💙 I noticed you've been having a rough time — your mood logs show that.\n\n`+response;
  }

  // ── MOTIVATION ────────────────────────────────────────────
  else if(lc.includes('motivat')||lc.includes('procrastinat')||lc.includes("can't start")||lc.includes("don't want")){
    response=`🔥 Starting is the hardest part.\n\n**2-minute rule:** Open your notebook. Read one sentence. Momentum kicks in.\n**Shrink it:** "Study math" → "Look at question 1 only."\n**Phone in another room** — having it visible cuts focus 20%.\n**Reward after 25 min** → something you actually want.\n\nWant me to pick your most urgent task?`;
  }

  // ── SPECIFIC TIME + ACTIVITY ──────────────────────────────
  else if(extractTimeFromText(text)&&(extractActivity(text)||mem.activity)){
    const result=suggestSpecificSlot(extractActivity(text)||mem.activity, extractTimeFromText(text), ctx);
    response=result.message; suggestion=result.suggestion;
  }

  // ── DAY QUERY ─────────────────────────────────────────────
  else if(extractDayFromText(text)){
    const day=extractDayFromText(text);
    const classes=ctx.myClasses.filter(c=>c.days?.includes(day));
    const tasks=ggo().filter(g=>g.studentId===CU.id&&g.day===day);
    const free=ctx.freeSlots.filter(s=>s.day===day);
    response=`Here's your **${day} (${getDayDate(day)})**:\n\n${classes.length?`🏫 ${classes.map(c=>`${c.subject} ${c.startTime}–${c.endTime}`).join(', ')}\n`:'📭 No classes\n'}${tasks.length?`📌 ${tasks.map(t=>t.task).join(', ')}\n`:''}${free.length?`\n✅ Free: ${free.slice(0,3).map(s=>formatTime(s.time)).join(', ')}`:'\n⚠️ Busy day!'}\n\nWhat do you want to do on ${day}?`;
  }

  // ── DEFAULT ───────────────────────────────────────────────
  else {
    // If we have context from memory, use it
    if(mem.activity && mem.day){
      response=`I remember you wanted to do **${mem.activity}** on **${mem.day}**. ${mem.location?`And you mentioned ${mem.location} for the weather check.`:''}\n\nJust to confirm — do you still want me to find you a time for that? Or has something changed?`;
    } else {
      response=buildGeneralResponse(text, ctx, mem);
    }
  }

  // Save to memory
  aiConversation.push({role:'ai',text:response});
  if(aiConversation.length > AI_MEM) aiConversation=aiConversation.slice(-AI_MEM);

  setTimeout(()=>{
    const t=document.getElementById('ai-typing'); if(t) t.remove();
    addAIMsg('ai', response);
    if(suggestion) showAISuggestion(suggestion);
    msgs.scrollTop=msgs.scrollHeight;
  }, 800);
}


// ── Build a real week plan based on actual data ──
function buildWeekPlan(ctx){
  const todayName = new Date().toLocaleDateString('en-CA',{weekday:'long'});
  const upcoming  = DAYS.slice(DAYS.indexOf(todayName));
  const name = CU.name.split(' ')[0];

  let plan = `📅 **Here's your personalised week plan, ${name}:**\n\n`;

  upcoming.forEach(day => {
    const classes  = ctx.myClasses.filter(c => c.days?.includes(day));
    const tasks    = ggo().filter(g => g.studentId===CU.id && g.day===day && !g.done);
    const gymDay   = tasks.some(t => t.type==='gym');
    const freeEvening = ctx.freeSlots.filter(s => s.day===day && s.time >= '15:00').slice(0,2);

    plan += `**${day}:**\n`;
    if(classes.length) plan += `  🏫 ${classes.map(c=>`${c.subject} ${c.startTime}–${c.endTime}`).join(', ')}\n`;
    if(tasks.length)   plan += `  📌 ${tasks.map(t=>t.task).join(', ')}\n`;
    if(gymDay)         plan += `  🏋️ Gym day — study lightly after, harder tasks tomorrow\n`;
    else if(freeEvening.length) plan += `  ✅ Free at ${freeEvening[0].time} — good slot for focused study\n`;
    plan += '\n';
  });

  const sleepHours = ctx.recentSleep ? parseFloat(ctx.recentSleep.hours) : 7.5;
  if(sleepHours < 7) plan += `⚠️ You've been sleeping ${sleepHours}h — try to hit 8h tonight.\n\n`;
  plan += `💡 Tip: Your best focus window is usually 2–3h after waking. Protect that time for your hardest work.`;
  return plan;
}

// ── Suggest a free activity slot ──
function suggestActivitySlot(text, ctx, activityLabel){
  const requestedTime = extractTimeFromText(text);
  const requestedDay  = extractDayFromText(text);

  // Find the best slot
  let candidates = ctx.freeSlots;
  if(requestedTime) candidates = candidates.filter(s => s.time === requestedTime || Math.abs(timeToMins(s.time) - timeToMins(requestedTime)) <= 60);
  if(requestedDay)  candidates = candidates.filter(s => s.day === requestedDay);

  // Prefer non-gym days, prefer afternoon for outdoor
  candidates.sort((a,b) => {
    const aGym = ggo().filter(g=>g.studentId===CU.id&&g.day===a.day&&g.type==='gym').length;
    const bGym = ggo().filter(g=>g.studentId===CU.id&&g.day===b.day&&g.type==='gym').length;
    return aGym - bGym;
  });

  if(candidates.length === 0){
    return { message: `I looked through your schedule and every time slot you mentioned is already busy. Here are your completely free evenings this week:\n\n${ctx.freeSlots.slice(0,4).map(s=>`• **${s.day} at ${formatTime(s.time)}**`).join('\n')}\n\nWant me to schedule one of these?`, suggestion: null };
  }

  const best = candidates[0];
  const dayDate = getDayDate(best.day);

  return {
    message: `Looking at your schedule, the best slot for a **${activityLabel}** is:\n\n📅 **${best.day} (${dayDate}) at ${formatTime(best.time)}**\n\nYou have no classes or tasks at that time. Want me to add it?`,
    suggestion: { type: activityLabel, day: best.day, time: best.time, duration: '1 hour', task: activityLabel }
  };
}

// ── Suggest a specific requested time ──
function suggestSpecificSlot(activity, requestedTime, ctx){
  const requestedDay = extractDayFromText(activity) || 'today';
  const todayName = new Date().toLocaleDateString('en-CA',{weekday:'long'});
  const targetDay = requestedDay === 'today' ? todayName : requestedDay;

  const busy = ctx.busyMap[targetDay] || [];
  const conflict = busy.find(b => Math.abs(timeToMins(b.time) - timeToMins(requestedTime)) < 60);

  if(conflict){
    // Find nearby free slot
    const free = ctx.freeSlots.filter(s => s.day === targetDay).slice(0,1)[0];
    return {
      message: `You have **${conflict.label}** around ${formatTime(conflict.time)} on ${targetDay}, so ${formatTime(requestedTime)} might be tight.\n\n${free ? `The nearest free slot is **${formatTime(free.time)}** on ${free.day} (${getDayDate(free.day)}). Want me to schedule it there instead?` : 'Your whole day looks pretty full — want me to find another day?'}`,
      suggestion: free ? { type: activity, day: free.day, time: free.time, duration: '1 hour', task: activity } : null
    };
  }

  const dayDate = getDayDate(targetDay);
  return {
    message: `✅ ${formatTime(requestedTime)} on **${targetDay} (${dayDate})** looks free! Nothing is scheduled then. Want me to add **${activity}** at that time?`,
    suggestion: { type: 'other', day: targetDay, time: requestedTime, duration: '1 hour', task: activity }
  };
}

// ── Test prep ──
function buildTestPrepPlan(text, ctx){
  const tomorrow = lc_testTomorrow(text);
  const studyGoals = ctx.studyGoals.slice(0,5);

  if(tomorrow){
    return `📝 Emergency study mode — let's go:\n\n**Right now (0–25 min):** Brain dump everything you already know. Don't look at notes yet.\n\n**25 min block 1:** Read notes/textbook — just read, don't re-copy.\n**5 min break:** Walk around, drink water.\n**25 min block 2:** Practice questions or past papers only.\n**5 min break.**\n**25 min block 3:** Focus only on topics you got wrong.\n\n**Tonight:** Hard stop 1 hour before bed. Sleep beats cramming — memory consolidates while you sleep.\n\n**Morning:** 10-min review of key points only. No new material.\n\n${ctx.recentSleep && parseFloat(ctx.recentSleep.hours) < 6 ? '⚠️ You\'re already low on sleep — the best thing you can do tonight is sleep 7–8h. Tired cramming barely sticks.' : ''}`;
  }

  const free = ctx.freeSlots.slice(0,3);
  return `📚 Let's build your study plan!\n\nYour free slots this week:\n${free.map(s=>`• **${s.day} (${getDayDate(s.day)}) at ${formatTime(s.time)}**`).join('\n')}\n\n${studyGoals.length ? `You already have these study tasks:\n${studyGoals.map(g=>`• ${g.task} (${g.day})`).join('\n')}\n\n` : ''}**Study tip:** Spread sessions across multiple days. 3× 45-min sessions beats 1× 3-hour cram by a lot.\n\nWant me to schedule specific study blocks for you?`;
}

function lc_testTomorrow(text){
  const lc = text.toLowerCase();
  return lc.includes('tomorrow') || lc.includes("haven't started") || lc.includes('haven\'t studied');
}

// ── Sleep response ──
function buildSleepResponse(hours, ctx){
  if(!hours || hours >= 7) return `😴 Sleep looks okay! If you're still tired, try:\n\n• A 10–20 min nap at lunch (set an alarm — over 20 min causes grogginess)\n• No screens 1h before bed\n• Same wake time on weekends\n\nWant me to plan your day around your energy?`;

  return `😴 ${hours}h is rough. Here's how to protect your energy today:\n\n**Morning classes:** Sit near the front — natural light and engagement help alertness.\n\n**Lunch:** A 10–20 min nap (set an alarm!) can restore 1–2 hours of focus.\n\n**Avoid:** Sugar, energy drinks — they cause crashes 1–2h later when you need focus most.\n\n**This evening:** Skip anything optional. Get to bed by 9:30pm tonight.\n\n**One task at a time** — sleep deprivation kills multitasking most.\n\n${ctx.freeSlots.slice(0,2).map(s=>`Free slot: ${s.day} ${formatTime(s.time)}`).join(' · ')}`;
}

// ── Overwhelmed ──
function buildOverwhelmedResponse(ctx){
  const pending = ggo().filter(g => g.studentId===CU.id && !g.done);
  const topTask = pending.sort((a,b)=>a.time.localeCompare(b.time))[0];

  return `🌬️ Let's slow this down.\n\n**Step 1 — Brain dump:** Write every worry on paper. Not in your head — on paper. This alone reduces anxiety significantly.\n\n**Step 2 — Sort ruthlessly:** What MUST happen today? Circle only those. Everything else can wait.\n\n**Step 3 — One thing:** ${topTask ? `Your next task right now: **${topTask.task}** (${topTask.day} ${formatTime(topTask.time)})` : 'Pick the smallest thing on your list and do ONLY that for 25 minutes.'}\n\n**Step 4 — Breathe:** Inhale 4s → hold 4s → exhale 4s. Repeat 3 times right now.\n\nYou don't need to do everything today. You just need to do the next right thing. 💙`;
}

// ── General response with context ──
function buildGeneralResponse(text, ctx){
  const name = CU.name.split(' ')[0];
  const lc = text.toLowerCase();

  // Specific activity at specific time
  const activity = extractActivity(text);
  const time = extractTimeFromText(text);
  if(activity && time){
    const result = suggestSpecificSlot(activity, time, ctx);
    if(result.suggestion){
      pendingSuggestion = result.suggestion;
      return result.message;
    }
  }

  // Day-specific question
  const day = extractDayFromText(text);
  if(day){
    const dayDate = getDayDate(day);
    const classes = ctx.myClasses.filter(c => c.days?.includes(day));
    const tasks   = ggo().filter(g => g.studentId===CU.id && g.day===day);
    const free    = ctx.freeSlots.filter(s => s.day===day);
    return `Here's your **${day} (${dayDate})**:\n\n${classes.length ? `🏫 Classes: ${classes.map(c=>`${c.subject} ${c.startTime}–${c.endTime}`).join(', ')}\n` : '📭 No classes\n'}${tasks.length ? `📌 Tasks: ${tasks.map(t=>t.task).join(', ')}\n` : ''}${free.length ? `\n✅ Free slots: ${free.slice(0,3).map(s=>formatTime(s.time)).join(', ')}` : '\n⚠️ Looks like a busy day!'}\n\nWhat do you want to do on ${day}?`;
  }

  return `I'm here to help, ${name}! I can:\n\n• 📅 **Find you a free slot** — tell me what activity and when\n• 🌤️ **Check weather** — say "weather in [city] on [day]"\n• 📝 **Build a study plan** — tell me what test or subject\n• 🏃 **Schedule a run/gym** — I'll find your free time\n• 📊 **Review your week** — say "plan my week"\n\nWhat specifically do you need?`;
}

// ── Weather fetcher ──
async function fetchWeatherResponse(text, location, date, ctx){
  try {
    // Use Open-Meteo geocoding + weather (free, no API key needed)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if(!geoData.results || !geoData.results.length){
      return `I couldn't find "${location}" — try being more specific (e.g. "St. Catharines, Ontario"). I can check weather for any city!`;
    }
    const { latitude, longitude, name: cityName, admin1 } = geoData.results[0];
    const dateStr = date || tomorrowStr();
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`);
    const weatherData = await weatherRes.json();
    const d = weatherData.daily;
    if(!d || !d.temperature_2m_max){
      return `Got the location (${cityName}) but couldn't load the forecast. Try again in a moment!`;
    }
    const maxT = Math.round(d.temperature_2m_max[0]);
    const minT = Math.round(d.temperature_2m_min[0]);
    const precip = d.precipitation_sum[0];
    const wind   = Math.round(d.windspeed_10m_max[0]);
    const code   = d.weathercode[0];
    const desc   = weatherCodeToDesc(code);
    const icon   = weatherCodeToIcon(code);
    const runOk  = precip < 5 && maxT > 5 && wind < 40;
    const lc     = text.toLowerCase();
    const forRun = lc.includes('run') || lc.includes('walk') || lc.includes('bike') || lc.includes('outside');

    const dateLabel = dateStr === tomorrowStr() ? 'Tomorrow' : new Date(dateStr+'T12:00:00').toLocaleDateString('en-CA',{weekday:'long',month:'short',day:'numeric'});

    let response = `${icon} **Weather for ${cityName}${admin1 ? ', '+admin1 : ''} — ${dateLabel}:**\n\n🌡️ High ${maxT}°C / Low ${minT}°C\n🌤️ ${desc}\n🌧️ Precipitation: ${precip}mm\n💨 Wind: ${wind} km/h\n\n`;

    if(forRun){
      response += runOk
        ? `✅ **Great conditions for a run!** ${maxT > 20 ? 'Bring water — it\'ll be warm.' : maxT < 5 ? 'Layer up — it\'s cold.' : 'Looks perfect.'}\n\n`
        : `⚠️ **Might be tough to run** — ${precip >= 5 ? 'rain expected. ' : ''}${wind >= 40 ? 'very windy. ' : ''}${maxT <= 5 ? 'quite cold. ' : ''}Consider an indoor workout instead.\n\n`;

      // Suggest a slot on that day
      const dayName = new Date(dateStr+'T12:00:00').toLocaleDateString('en-CA',{weekday:'long'});
      const result  = suggestActivitySlot('run', ctx, '🏃 Run');
      if(result.suggestion && result.suggestion.day === dayName){
        response += `Looking at your schedule that day — ${result.message.split('is:\n\n')[1]||''}`;
      }
    }
    return response;

  } catch(e) {
    return `I couldn't load the weather right now (network issue). Try:\n• **weather.gc.ca** for Canadian forecasts\n• **weather.com** for any city\n\nFor scheduling the run, I can still check your free slots — just ask!`;
  }
}

function weatherCodeToDesc(code){
  if(code===0) return 'Clear sky';
  if(code<=2)  return 'Partly cloudy';
  if(code===3) return 'Overcast';
  if(code<=48) return 'Foggy';
  if(code<=57) return 'Drizzle';
  if(code<=67) return 'Rain';
  if(code<=77) return 'Snow';
  if(code<=82) return 'Rain showers';
  if(code<=86) return 'Snow showers';
  if(code<=99) return 'Thunderstorm';
  return 'Variable';
}
function weatherCodeToIcon(code){
  if(code===0) return '☀️';
  if(code<=2)  return '⛅';
  if(code===3) return '☁️';
  if(code<=48) return '🌫️';
  if(code<=67) return '🌧️';
  if(code<=77) return '❄️';
  if(code<=82) return '🌦️';
  if(code<=99) return '⛈️';
  return '🌤️';
}

// ── Accept / Decline suggestion ──
function showAISuggestion(suggestion){
  pendingSuggestion = suggestion;
  const msgs = document.getElementById('ai-messages');
  const div  = document.createElement('div');
  div.className = 'ai-suggestion-card';
  div.id = 'ai-suggest-card';
  div.innerHTML = `
    <div class="ai-suggest-inner">
      <div class="ai-suggest-label">💡 AI Suggestion</div>
      <div class="ai-suggest-detail">
        <strong>${suggestion.task}</strong>
        <span>📅 ${suggestion.day} (${getDayDate(suggestion.day)}) · 🕐 ${formatTime(suggestion.time)} · ⏱ ${suggestion.duration}</span>
      </div>
      <div class="ai-suggest-btns">
        <button class="btn-green" onclick="acceptAISuggestion()">✓ Add to Schedule</button>
        <button class="btn-outline small" onclick="declineAISuggestion()">✗ Decline</button>
      </div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function acceptAISuggestion(){
  if(!pendingSuggestion) return;
  const s = pendingSuggestion;
  const goals = ggo();
  goals.push({ id:'g'+uid(), studentId:CU.id, classId:'', task:s.task, day:s.day, time:s.time, duration:s.duration, type: s.type||'other', done:false, created:today() });
  S.set('goals', goals);
  pendingSuggestion = null;
  const card = document.getElementById('ai-suggest-card');
  if(card) card.remove();
  addAIMsg('ai', `✅ Added **${s.task}** on ${s.day} (${getDayDate(s.day)}) at ${formatTime(s.time)} to your schedule! You can view it in Goals or Calendar. 🎉`);
  toast(`Added: ${s.task} — ${s.day} ${formatTime(s.time)}`);
}

function declineAISuggestion(){
  pendingSuggestion = null;
  const card = document.getElementById('ai-suggest-card');
  if(card) card.remove();
  addAIMsg('ai', `No problem! Want me to suggest a different time, or is there something else I can help with?`);
}

// ── Date helpers ──
function getDayDate(dayName){
  const today   = new Date();
  const todayDay = today.getDay(); // 0=Sun
  const map = {Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
  const target = map[dayName];
  if(target === undefined) return '';
  let diff = target - todayDay;
  if(diff < 0) diff += 7;
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  return d.toLocaleDateString('en-CA',{month:'short',day:'numeric'});
}

function tomorrowStr(){
  const d = new Date();
  d.setDate(d.getDate()+1);
  return d.toISOString().split('T')[0];
}

function extractDateFromText(text){
  const lc = text.toLowerCase();
  const today = new Date();
  if(lc.includes('tomorrow')){ const d=new Date(today); d.setDate(today.getDate()+1); return d.toISOString().split('T')[0]; }
  if(lc.includes('today')) return today.toISOString().split('T')[0];
  // match "march 23" or "23rd"
  const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  const dayMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?/);
  const monMatch = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if(dayMatch && monMatch){
    const mon = months[monMatch[1].toLowerCase()];
    const day = parseInt(dayMatch[1]);
    const yr  = today.getFullYear();
    return `${yr}-${String(mon).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  // Day of week
  const dayName = extractDayFromText(text);
  if(dayName){
    const map = {Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6};
    const target = map[dayName];
    const diff   = ((target - today.getDay()) + 7) % 7 || 7;
    const d      = new Date(today); d.setDate(today.getDate()+diff);
    return d.toISOString().split('T')[0];
  }
  return null;
}

function extractDayFromText(text){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const lc   = text.toLowerCase();
  if(lc.includes('tomorrow')){
    const d   = new Date(); d.setDate(d.getDate()+1);
    return d.toLocaleDateString('en-CA',{weekday:'long'});
  }
  if(lc.includes('today')) return new Date().toLocaleDateString('en-CA',{weekday:'long'});
  return days.find(d => lc.includes(d.toLowerCase())) || null;
}

function extractTimeFromText(text){
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if(!m) return null;
  let h = parseInt(m[1]);
  const mins = m[2] ? m[2] : '00';
  const ampm = m[3].toLowerCase();
  if(ampm==='pm' && h!==12) h+=12;
  if(ampm==='am' && h===12) h=0;
  return `${String(h).padStart(2,'0')}:${mins}`;
}

function extractLocation(text){
  // strip common question words and extract city
  const cleaned = text.replace(/what('s)?( is)?( the)?( weather| forecast| temperature| going to be like)?/gi,'')
                       .replace(/\b(on|in|at|for|of|the|tomorrow|today|this|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,' ')
                       .replace(/\d+(st|nd|rd|th)?/g,'')
                       .replace(/[?!,]/g,' ')
                       .trim().replace(/\s+/g,' ').trim();
  return cleaned || null;
}

function extractActivity(text){
  const acts = ['run','walk','bike','gym','swim','yoga','hike','workout','exercise','study','read'];
  const lc   = text.toLowerCase();
  const found = acts.find(a => lc.includes(a));
  if(found) return found.charAt(0).toUpperCase()+found.slice(1);
  return null;
}

function timeToMins(timeStr){
  if(!timeStr) return 0;
  const [h,m] = timeStr.split(':').map(Number);
  return h*60+(m||0);
}

function formatTime(t){
  if(!t) return '';
  const [h,m] = t.split(':').map(Number);
  const ampm  = h >= 12 ? 'pm' : 'am';
  const hr    = h % 12 || 12;
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
}

function addAIMsg(role, text){
  const msgs = document.getElementById('ai-messages');
  if(!msgs) return;
  const div = document.createElement('div');
  const formatted = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  if(role === 'ai'){
    div.className = 'msg-ai';
    div.innerHTML = `<div class="msg-ai-icon">AI</div><div class="msg-bubble">${formatted}</div>`;
  } else {
    div.className = 'msg-user';
    div.innerHTML = `<div class="msg-user-bubble">${formatted}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
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
  if(name==='students')  renderStudentTable();
  if(name==='moods')     renderMoodReports();
  if(name==='wellness')  renderWellnessTable();
  if(name==='goals')     renderTeacherGoals();
  if(name==='alerts')    renderAlerts();
  if(name==='help')      renderTeacherHelp();
  if(name==='settings')  renderSettings();
  if(name==='profile')   renderTeacherProfile();
}

function getMyClasses(){ return gc().filter(c=>c.teacherId===CU.id); }
function getMyStudents(){
  const myIds=getMyClasses().map(c=>c.id);
  return gs().filter(s=>s.classIds?.some(id=>myIds.includes(id)));
}

// OVERVIEW
function renderTeacherOverview(){
  const students=getMyStudents();
  const classes=getMyClasses();
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared);
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
      ${alerts.slice(0,4).map(a=>{ const s=students.find(x=>x.id===a.studentId); return `<p style="font-size:.88rem;margin-bottom:4px">• <strong>${s?.name||'Student'}</strong> — feeling <em>${a.mood}</em></p>`; }).join('')}
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
            <span class="cls-code-badge">${c.code}</span>
            <span style="font-size:.8rem;color:var(--muted)">${count} student${count!==1?'s':''}</span>
          </div>
          <span class="cls-time">🕐 ${c.startTime} – ${c.endTime} · ${c.days?.join(', ')||'—'}</span>
          ${c.bannerMsg ? `<div class="cls-banner-msg">${c.bannerMsg}</div>` : ''}
          <div class="t-class-actions">
            <button class="btn-outline small" onclick="copyCode('${c.code}')">📋 Copy Code</button>
            <button class="btn-green" onclick="openMsgModal('${c.id}')">💬 Message</button>
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
  filterSel.innerHTML = '<option value="">All Classes</option>' + myClasses.map(c=>`<option value="${c.id}">${c.subject}</option>`).join('');

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
            ? todayMoods.map(m=>`<span class="mood-tag-sm ${m.mood}">${MOOD_CFG[m.mood]?.icon} ${m.mood}</span>`).join('')
            : '<span style="color:var(--muted);font-size:.82rem">Not logged</span>';
          const clsNames   = cls.map(c=>{
            const short = c.subject.length > 20 ? c.subject.slice(0,18)+'…' : c.subject;
            return `<span title="${c.subject}" style="display:inline-block;background:var(--blue-pale);color:var(--blue);border-radius:5px;padding:1px 6px;font-size:.72rem;font-weight:700;margin:1px">${short}</span>`;
          }).join('');
          return `<tr class="${isAlert?'alert-row':''}">
            <td><strong>${s.name}</strong><br><span style="font-size:.75rem;color:var(--muted)">${s.email}</span></td>
            <td style="white-space:nowrap">${s.grade||'—'}</td>
            <td>${clsNames||'—'}</td>
            <td style="min-width:120px">${moodDisplay}</td>
            <td style="white-space:nowrap">${sleepLog?`<strong>${sleepLog.hours}h</strong> · ${sleepLog.quality}`:'<span style="color:var(--muted)">—</span>'}</td>
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
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared);
  const grid=document.getElementById('t-mood-grid');
  if(students.length===0){ grid.innerHTML='<p style="color:var(--muted)">No students yet.</p>'; return; }
  grid.innerHTML=students.map(s=>{
    const sm=moods.filter(m=>m.studentId===s.id);
    const counts={};
    sm.forEach(m=>{ counts[m.mood]=(counts[m.mood]||0)+1; });
    const total=sm.length||1;
    const isAlert=sm.some(m=>NEGATIVE_MOODS.includes(m.mood)&&m.date===today());
    return `
      <div class="t-mood-card" ${isAlert?'style="border:2px solid var(--red)"':''}>
        <h4>${s.name} ${isAlert?'⚠️':''}</h4>
        ${Object.entries(counts).map(([mood,n])=>`
          <div class="mbar-row">
            <span style="width:80px;font-size:.78rem">${MOOD_CFG[mood]?.icon} ${mood}</span>
            <div class="mbar-track"><div class="mbar-fill" style="width:${(n/total*100).toFixed(0)}%;background:${NEGATIVE_MOODS.includes(mood)?'var(--red)':'var(--blue)'}"></div></div>
            <span style="font-size:.78rem">${n}</span>
          </div>`).join('')||'<p style="color:var(--muted);font-size:.82rem">No shared moods yet</p>'}
      </div>`;
  }).join('');
}

// WELLNESS TABLE (teacher)
function renderWellnessTable(){
  const students = getMyStudents();
  const myClassIds = getMyClasses().map(c => c.id);

  // Only show wellness logs sent specifically to this teacher or their classes
  const allW = gw().filter(w =>
    w.shared &&
    students.some(s => s.id === w.studentId) &&
    (w.sharedWith?.teacherId === CU.id || myClassIds.includes(w.sharedWith?.classId))
  );

  // Responsibilities shared with this teacher's classes
  const allR = S.get('responsibilities',[]).filter(r =>
    r.shared &&
    students.some(s => s.id === r.studentId) &&
    (r.sharedWith?.teacherId === CU.id || myClassIds.includes(r.sharedWith?.classId) || !r.sharedWith)
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
        <h4>${s?.name||'Student'} <span style="font-weight:400;color:var(--muted);font-size:.8rem">${totalHours>0?'~'+totalHours+'h/week outside school':''}</span></h4>
        ${resps.map(r=>`<div class="t-goal-row">
          <span>📌</span>
          <div><strong>${r.text}</strong>${r.when?` <span style="color:var(--muted)">(${r.when})</span>`:''}</div>
          ${r.hours?`<span style="margin-left:auto;color:var(--muted);font-size:.8rem">~${r.hours}h/wk</span>`:''}
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
          const data = w.type==='sleep' ? `${w.hours}h · ${w.quality}`
                     : w.type==='energy' ? `Energy: ${w.energy}/10 · 💧${w.water} glasses`
                     : w.text||'—';
          return `<tr>
            <td><strong>${s?.name||'—'}</strong></td>
            <td style="text-transform:capitalize">${w.type}</td>
            <td>${data}</td>
            <td style="font-size:.82rem;color:var(--muted)">${cls?.subject||'—'}</td>
            <td>${w.date}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`;
  }

  if(!html) html = '<p style="color:var(--muted);padding:20px 0">No shared wellness data yet. Students can send sleep, energy, and responsibility info from their Wellness section — they choose which period/teacher to send it to.</p>';
  wrap.innerHTML = html;
}

// GOALS
function renderTeacherGoals(){
  const students=getMyStudents();
  const el=document.getElementById('t-goals-list');
  el.innerHTML=students.map(s=>{
    const gs_=ggo().filter(g=>g.studentId===s.id);
    return `<div class="t-goals-student">
      <h4>${s.name} <span style="font-weight:400;color:var(--muted);font-size:.82rem">${gs_.length} task${gs_.length!==1?'s':''}</span></h4>
      ${gs_.slice(0,6).map(g=>`
        <div class="t-goal-row">${g.done?'✅':'⬜'} <strong>${g.day}</strong> ${g.time} — ${g.task} (${g.duration})</div>`).join('')
      || '<p style="font-size:.82rem;color:var(--muted)">No goals entered yet.</p>'}
      ${gs_.length>6?`<p style="font-size:.78rem;color:var(--muted);margin-top:4px">+${gs_.length-6} more</p>`:''}
    </div>`;
  }).join('')||'<p style="color:var(--muted)">No students yet.</p>';
}

// ALERTS
function renderAlerts(){
  const students=getMyStudents();
  const moods=gm().filter(m=>students.some(s=>s.id===m.studentId)&&m.shared&&NEGATIVE_MOODS.includes(m.mood));
  const el=document.getElementById('t-alerts-list');
  if(moods.length===0){ el.innerHTML='<p style="color:var(--muted);text-align:center;padding:40px 0">🎉 No alerts — all students seem to be doing well!</p>'; return; }
  const grouped={};
  moods.forEach(m=>{ if(!grouped[m.studentId])grouped[m.studentId]=[]; grouped[m.studentId].push(m); });
  el.innerHTML=Object.entries(grouped).map(([sid,ms])=>{
    const s=students.find(x=>x.id===sid);
    const recent=ms.sort((a,b)=>b.date.localeCompare(a.date))[0];
    const cls=gc().find(c=>c.id===recent.classId);
    return `<div class="alert-card-t">
      <span style="font-size:1.5rem">⚠️</span>
      <div><h5>${s?.name||'Student'}</h5>
      <p style="font-size:.85rem;color:var(--text-2)">Feeling <strong>${recent.mood}</strong> in ${cls?.subject||recent.classLabel||'class'} on ${recent.date}</p></div>
      <span class="alert-abadge">${ms.length} alert${ms.length>1?'s':''}</span>
    </div>`;
  }).join('');
}

// TEACHER HELP
function renderTeacherHelp(){
  const province=CU.province||'Ontario';
  document.getElementById('t-help-content').innerHTML=buildHelplinesHTML(province);
}

// SETTINGS
function renderSettings(){
  const provinces=PROVINCES;
  const sel=document.getElementById('t-province-setting');
  sel.innerHTML=provinces.map(p=>`<option ${p===CU.province?'selected':''}>${p}</option>`).join('');
  // Pre-fill social worker
  if(CU.socialWorker){
    document.getElementById('sw-name').value=CU.socialWorker.name||'';
    document.getElementById('sw-email').value=CU.socialWorker.email||'';
  }
  document.getElementById('t-account-info').innerHTML=`
    <p><strong>Name:</strong> ${CU.name}</p>
    <p><strong>Email:</strong> ${CU.email}</p>
    <p><strong>School:</strong> ${CU.school||'—'}</p>
    <p><strong>Province:</strong> ${CU.province||'—'}</p>
    <p><strong>Joined:</strong> ${CU.joined||'—'}</p>
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

function createClass(){
  const subject=document.getElementById('cm-subject').value.trim();
  const start  =document.getElementById('cm-start').value;
  const end    =document.getElementById('cm-end').value;
  const code   =document.getElementById('cm-code').value.trim().toUpperCase();
  const days=[...document.querySelectorAll('input[name="cm-day"]:checked')].map(x=>x.value);
  const color  =document.querySelector('input[name="cm-color"]:checked')?.value||'#1d5fa6';
  const emoji  =document.getElementById('cm-emoji').value.trim();
  const bannerMsg=document.getElementById('cm-banner-msg').value.trim();
  const logo   =pendingLogoDataUrl||null;

  if(!subject||!code)return toast('Please fill in subject and code.');
  if(gc().find(c=>c.code===code))return toast('That code already exists — try generating a new one.');
  const classes=gc();
  classes.push({id:'c'+uid(),teacherId:CU.id,subject,startTime:start,endTime:end,days,code,color,emoji,logo,bannerMsg});
  S.set('classes',classes);
  closeModal('class-modal');
  // reset
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
}

function deleteClass(id){
  if(!confirm('Delete this class? Students will lose access.'))return;
  S.set('classes',gc().filter(c=>c.id!==id));
  toast('Class deleted.');
  renderTeacherClasses();
}

function copyCode(code){
  navigator.clipboard?.writeText(code).catch(()=>{});
  toast(`Code "${code}" copied to clipboard!`);
}

function openMsgModal(classId){
  const classes=getMyClasses();
  document.getElementById('mm-class').innerHTML=classes.map(c=>`<option value="${c.id}" ${c.id===classId?'selected':''}>${c.subject}</option>`).join('');
  openModal('msg-modal');
}

function sendMsg(){
  const classId=document.getElementById('mm-class').value;
  const content=document.getElementById('mm-msg').value.trim();
  if(!content)return toast('Please type a message.');
  const messages=gmsg();
  messages.push({id:'m'+uid(),teacherId:CU.id,classId,content,date:today()});
  S.set('messages',messages);
  document.getElementById('mm-msg').value='';
  closeModal('msg-modal');
  toast('Message sent to class! 📨');
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function openModal(id){ document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }
function showErr(el,msg){ if(!el)return toast(msg); el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),5000); }
function showPrivacy(){ openModal('privacy-modal'); }

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._to); t._to=setTimeout(()=>t.classList.add('hidden'),3000);
}

function toggleSB(id){
  document.getElementById(id)?.classList.toggle('open');
}

function today(){ return new Date().toISOString().split('T')[0]; }
function uid(){ return Math.random().toString(36).substr(2,8); }

// Close sidebar on outside click
document.addEventListener('click',e=>{
  ['s-sidebar','t-sidebar'].forEach(id=>{
    const sb=document.getElementById(id);
    if(sb&&sb.classList.contains('open')&&!sb.contains(e.target)&&!e.target.classList.contains('ham'))
      sb.classList.remove('open');
  });
});

// ─────────────────────────────────────────────
// SEED DEMO DATA
// ─────────────────────────────────────────────
function seedDemo(){
  if(gt().length>0)return;
  // Teacher
  S.set('teachers',[{id:'t1',name:'Ms. Rivera',email:'teacher@demo.com',password:'Demo@1234',province:'Ontario',school:'Westview Secondary',socialWorker:{name:'Mr. Thompson',email:'mthompson@westview.ca'},joined:today()}]);
  // Classes
  S.set('classes',[
    {id:'c1',teacherId:'t1',subject:'English — Grade 10 (ENG2D)',startTime:'09:00',endTime:'09:45',days:['Monday','Tuesday','Wednesday','Thursday','Friday'],code:'ENG2D-2024',color:'#1d5fa6',emoji:'📖',bannerMsg:'This week: Macbeth Act 2 — read pages 45–60!'},
    {id:'c2',teacherId:'t1',subject:'Mathematics (MPM2D)',startTime:'11:00',endTime:'11:45',days:['Monday','Wednesday','Friday'],code:'MATH2D-24',color:'#7c3aed',emoji:'📐',bannerMsg:''},
    {id:'c3',teacherId:'t1',subject:'Biology (SBI3U)',startTime:'13:00',endTime:'13:45',days:['Tuesday','Thursday'],code:'BIO3U-2024',color:'#2e9e6b',emoji:'🧬',bannerMsg:'Lab report due Friday!'},
  ]);
  // Student
  S.set('students',[{id:'s1',name:'Alex Johnson',email:'student@demo.com',password:'Demo@1234',grade:'Grade 10',classIds:['c1','c2','c3'],periodOrder:['c1','c2','c3'],joined:today()}]);
  // Moods
  S.set('moods',[
    {studentId:'s1',classId:'c1',classLabel:'English',mood:'Happy',date:today(),shared:true},
    {studentId:'s1',classId:'c2',classLabel:'Math',mood:'Confused',date:today(),shared:true},
    {studentId:'s1',classId:'general',classLabel:'General',mood:'Tired',date:today(),shared:false},
  ]);
  // Goals
  S.set('goals',[
    {id:'g1',studentId:'s1',classId:'c1',task:'Read Chapter 4 — Macbeth',day:'Monday',time:'15:00',duration:'1 hour',type:'study',done:false,created:today()},
    {id:'g2',studentId:'s1',classId:'c2',task:'Complete quadratic equations worksheet',day:'Tuesday',time:'16:30',duration:'1.5 hours',type:'study',done:false,created:today()},
    {id:'g3',studentId:'s1',classId:'',task:'Gym session',day:'Monday',time:'17:00',duration:'1 hour',type:'gym',done:true,created:today()},
    {id:'g4',studentId:'s1',classId:'c3',task:'Review cell division notes',day:'Wednesday',time:'14:00',duration:'45 min',type:'study',done:false,created:today()},
    {id:'g5',studentId:'s1',classId:'',task:'Gym + cardio',day:'Thursday',time:'16:00',duration:'1 hour',type:'gym',done:false,created:today()},
  ]);
  // Wellness
  S.set('wellness',[
    {id:'w1',studentId:'s1',type:'sleep',hours:'6.5',quality:'Okay',shared:true,date:today()},
  ]);
  // Responsibilities (demo — shared with teacher)
  S.set('responsibilities',[
    {id:'r1',studentId:'s1',text:'Part-time job at Tim Hortons',when:'Fri & Sat 4pm–10pm',hours:'12',shared:true,date:today()},
    {id:'r2',studentId:'s1',text:'Babysit younger siblings',when:'Every day 3–5pm',hours:'10',shared:true,date:today()},
  ]);
}

// ─────────────────────────────────────────────
// STUDENT PROFILE
// ─────────────────────────────────────────────
function renderStudentProfile(){
  document.getElementById('s-profile-av').textContent = CU.name[0].toUpperCase();
  document.getElementById('s-profile-name').textContent = CU.name;
  document.getElementById('s-profile-email').textContent = CU.email;
  document.getElementById('s-profile-grade').textContent = CU.grade || 'No grade set';
  document.getElementById('s-edit-name').value = CU.name;
  // Hide "share with teacher" toggle in responsibilities if no classes
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
    if(s.password !== oldPass) return showErr(errEl, 'Current password is incorrect.');
    if(!validPw(newPass)) return showErr(errEl, 'New password needs 8+ chars, uppercase, number & special character.');
    s.password = newPass;
    CU.password = newPass;
  }

  s.name = name;
  CU.name = name;
  S.set('students', students);

  // Update header greeting
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
  all.push({ id: 'r'+uid(), studentId: CU.id, text, when, hours, shared, date: today() });
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
        <strong>${r.text}</strong>
        <span>${r.when ? '🕐 '+r.when : ''} ${r.hours ? '· ~'+r.hours+'h/week' : ''}</span>
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

  // Show shared responsibilities from students
  const myStudents = getMyStudents();
  const allResp = S.get('responsibilities', []).filter(r =>
    r.shared && myStudents.some(s => s.id === r.studentId)
  );
  const el = document.getElementById('t-resp-view');
  if(allResp.length === 0){
    el.innerHTML = '<p style="color:var(--muted);font-size:.85rem">No students have shared responsibilities yet.</p>';
    return;
  }
  // Group by student
  const grouped = {};
  allResp.forEach(r => {
    if(!grouped[r.studentId]) grouped[r.studentId] = [];
    grouped[r.studentId].push(r);
  });
  el.innerHTML = Object.entries(grouped).map(([sid, resps]) => {
    const student = myStudents.find(s => s.id === sid);
    return `
      <div style="margin-bottom:14px">
        <p style="font-weight:700;font-size:.9rem;color:var(--navy);margin-bottom:6px">${student?.name || 'Student'}</p>
        ${resps.map(r => `
          <div class="resp-item" style="margin-bottom:6px">
            <div class="resp-item-info">
              <strong>${r.text}</strong>
              <span>${r.when ? '🕐 '+r.when : ''} ${r.hours ? '· ~'+r.hours+'h/week' : ''}</span>
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
    if(t.password !== oldPass) return showErr(errEl, 'Current password is incorrect.');
    if(!validPw(newPass)) return showErr(errEl, 'New password needs 8+ chars, uppercase, number & special character.');
    t.password = newPass;
    CU.password = newPass;
  }

  t.name   = name;
  t.school = school;
  CU.name  = name;
  CU.school= school;
  S.set('teachers', teachers);

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

function executeDeleteAccount(){
  const confirm = document.getElementById('delete-confirm-input').value.trim();
  const pass    = document.getElementById('delete-pass-input').value;
  const errEl   = document.getElementById('delete-err');

  if(confirm !== 'DELETE') return showErr(errEl, 'Please type DELETE exactly to confirm.');
  if(pass !== CU.password) return showErr(errEl, 'Incorrect password.');

  if(deleteRole === 'student'){
    // Remove student + all their data
    S.set('students',  gs().filter(s => s.id !== CU.id));
    S.set('moods',     gm().filter(m => m.studentId !== CU.id));
    S.set('goals',     ggo().filter(g => g.studentId !== CU.id));
    S.set('wellness',  gw().filter(w => w.studentId !== CU.id));
    S.set('responsibilities', S.get('responsibilities',[]).filter(r => r.studentId !== CU.id));
    S.set('journals',  S.get('journals',[]).filter(j => j.studentId !== CU.id));
  } else {
    // Remove teacher + their classes (students keep their own data but lose class links)
    const myClassIds = getMyClasses().map(c => c.id);
    // Remove students from those classes
    const students = gs();
    students.forEach(s => { s.classIds = (s.classIds||[]).filter(id => !myClassIds.includes(id)); });
    S.set('students', students);
    S.set('classes',  gc().filter(c => c.teacherId !== CU.id));
    S.set('teachers', gt().filter(t => t.id !== CU.id));
  }

  closeModal('delete-modal');
  CU = null;
  toast('Account deleted. Goodbye 👋');
  setTimeout(() => showScreen('screen-entry'), 1500);
}

// ─────────────────────────────────────────────
// EMAIL VERIFICATION & FORGOT PASSWORD
// ─────────────────────────────────────────────
const EMAILJS_SERVICE  = 'service_jm737lr';
const EMAILJS_TEMPLATE = 'template_6w1574v';

let pendingVerify = null; // stores signup data + code while waiting for verification
let pendingReset  = null; // stores email + code for password reset

function generateCode(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Called when user clicks "Create Account" — sends verification email first
function startSignupVerification(){
  const name     = document.getElementById('su-name').value.trim();
  const email    = document.getElementById('su-email').value.trim().toLowerCase();
  const pass     = document.getElementById('su-pass').value;
  const privacyOk= document.getElementById('su-privacy').checked;
  const errEl    = document.getElementById('signup-err');

  if(!name||!email||!pass) return showErr(errEl,'Please fill in all required fields.');
  if(!validEmail(email))   return showErr(errEl,'Please enter a valid email address.');
  if(!validPw(pass))       return showErr(errEl,'Password must be 8+ chars with uppercase, number & special character.');
  if(!privacyOk)           return showErr(errEl,'Please accept the privacy policy to continue.');

  if(authRole==='student'){
    const grade = document.getElementById('su-grade').value;
    const code  = document.getElementById('su-code').value.trim().toUpperCase();
    if(!grade) return showErr(errEl,'Please select your grade.');
    if(gs().find(s=>s.email===email)) return showErr(errEl,'An account with this email already exists.');
    let classIds=[];
    if(code){
      const cls=gc().find(c=>c.code===code);
      if(!cls) return showErr(errEl,`Class code "${code}" not found.`);
      classIds=[cls.id];
    }
    pendingVerify = { name, email, pass, grade, classIds, role:'student' };
  } else {
    const province = document.getElementById('su-province').value;
    const school   = document.getElementById('su-school').value.trim();
    if(!province) return showErr(errEl,'Please select your province.');
    if(gt().find(t=>t.email===email)) return showErr(errEl,'An account with this email already exists.');
    pendingVerify = { name, email, pass, province, school, role:'teacher' };
  }

  const verifyCode = generateCode();
  pendingVerify.code    = verifyCode;
  pendingVerify.expires = Date.now() + 10*60*1000; // 10 min

  // Send verification email via EmailJS
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

function confirmVerifyCode(){
  const input  = document.getElementById('verify-code-input').value.trim();
  const errEl  = document.getElementById('verify-err');
  const okEl   = document.getElementById('verify-ok');

  if(!pendingVerify) return showErr(errEl,'Something went wrong. Please try signing up again.');
  if(Date.now() > pendingVerify.expires) return showErr(errEl,'Code expired. Please request a new one.');
  if(input !== pendingVerify.code) return showErr(errEl,'Incorrect code. Please check your email and try again.');

  okEl.classList.remove('hidden');

  // Create the account
  setTimeout(()=>{
    const { name, email, pass, role } = pendingVerify;
    if(role === 'student'){
      const u = {id:'s'+uid(), name, email, password:pass, grade:pendingVerify.grade, classIds:pendingVerify.classIds, periodOrder:[], joined:today(), verified:true};
      const students=gs(); students.push(u); S.set('students',students);
      CU={role:'student',...u};
      S.set('session',{role:'student',id:u.id});
    } else {
      const u = {id:'t'+uid(), name, email, password:pass, province:pendingVerify.province, school:pendingVerify.school, socialWorker:null, joined:today(), verified:true};
      const teachers=gt(); teachers.push(u); S.set('teachers',teachers);
      CU={role:'teacher',...u};
      S.set('session',{role:'teacher',id:u.id});
    }
    pendingVerify = null;
    closeModal('verify-modal');
    toast(`Account created! Welcome, ${name} 🎉`);
    if(CU.role==='student') loadStudentDash(); else loadTeacherDash();
  }, 1200);
}

function resendVerifyCode(){
  if(!pendingVerify) return;
  const newCode = generateCode();
  pendingVerify.code    = newCode;
  pendingVerify.expires = Date.now() + 10*60*1000;
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_name:  pendingVerify.name,
    to_email: pendingVerify.email,
    code:     newCode,
  }).then(()=>toast('New code sent! 📧')).catch(()=>toast('Could not resend. Try again.'));
}

// FORGOT PASSWORD
function sendResetCode(){
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl = document.getElementById('forgot-err');
  if(!email||!validEmail(email)) return showErr(errEl,'Please enter a valid email address.');

  const student = gs().find(s=>s.email===email);
  const teacher = gt().find(t=>t.email===email);
  const user    = student || teacher;

  if(!user) return showErr(errEl,'No account found with that email address.');

  const code = generateCode();
  pendingReset = { email, code, role: student?'student':'teacher', expires: Date.now()+10*60*1000 };

  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_name:  user.name,
    to_email: email,
    code:     code,
  }).then(()=>{
    document.getElementById('forgot-email-display').textContent = email;
    document.getElementById('forgot-step-1').classList.add('hidden');
    document.getElementById('forgot-step-2').classList.remove('hidden');
    toast('Reset code sent to your email! 📧');
  }).catch(()=>showErr(errEl,'Could not send email. Please try again.'));
}

function confirmResetPassword(){
  const code    = document.getElementById('forgot-code-input').value.trim();
  const newPass = document.getElementById('forgot-new-pass').value;
  const errEl   = document.getElementById('forgot-reset-err');
  const okEl    = document.getElementById('forgot-reset-ok');

  if(!pendingReset) return showErr(errEl,'Session expired. Please start again.');
  if(Date.now() > pendingReset.expires) return showErr(errEl,'Code expired. Please request a new one.');
  if(code !== pendingReset.code) return showErr(errEl,'Incorrect code. Please check your email.');
  if(!validPw(newPass)) return showErr(errEl,'Password needs 8+ chars, uppercase, number & special character.');

  if(pendingReset.role === 'student'){
    const students = gs();
    const s = students.find(x=>x.email===pendingReset.email);
    if(s){ s.password=newPass; S.set('students',students); }
  } else {
    const teachers = gt();
    const t = teachers.find(x=>x.email===pendingReset.email);
    if(t){ t.password=newPass; S.set('teachers',teachers); }
  }

  pendingReset = null;
  okEl.classList.remove('hidden');
  setTimeout(()=>{
    closeModal('forgot-modal');
    // Reset modal state
    document.getElementById('forgot-step-1').classList.remove('hidden');
    document.getElementById('forgot-step-2').classList.add('hidden');
    document.getElementById('forgot-email').value='';
    document.getElementById('forgot-code-input').value='';
    document.getElementById('forgot-new-pass').value='';
    okEl.classList.add('hidden');
    toast('Password reset! You can now log in. 🎉');
  }, 2000);
}

function resendResetCode(){
  if(!pendingReset) return;
  const newCode = generateCode();
  pendingReset.code    = newCode;
  pendingReset.expires = Date.now()+10*60*1000;
  const user = pendingReset.role==='student'
    ? gs().find(s=>s.email===pendingReset.email)
    : gt().find(t=>t.email===pendingReset.email);
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
    to_name:  user?.name||'User',
    to_email: pendingReset.email,
    code:     newCode,
  }).then(()=>toast('New code sent! 📧')).catch(()=>toast('Could not resend. Try again.'));
}


document.addEventListener('DOMContentLoaded',()=>{
  seedDemo();
  // Auto-login if session exists
  const session = S.get('session');
  if(session){
    if(session.role==='student'){
      const u=gs().find(s=>s.id===session.id);
      if(u){ CU={role:'student',...u}; loadStudentDash(); return; }
    } else if(session.role==='teacher'){
      const u=gt().find(t=>t.id===session.id);
      if(u){ CU={role:'teacher',...u}; loadTeacherDash(); return; }
    }
  }
  showScreen('screen-entry');
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
});
