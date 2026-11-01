(() => {
  "use strict";

  const PATIENTS = [
    {
      id: "P-2401", initials: "김○아", dob: "2024-03-18", bed: "1번 침상", age: "2세",
      weight: 10.2, measured: "오늘 07:30", medication: "교육용 흡입약 A", route: "네뷸라이저 흡입",
      routeKey: "neb", time: "09:00", adultDose: 100, dose: 15, maxDose: 15, unit: "mg",
      tool: "네뷸라이저", concentration: "교육용 단일 용량", doses: [0.5, 15, 150],
      monitor: "호흡수와 산소포화도를 확인했습니다."
    },
    {
      id: "P-2402", initials: "이○준", dob: "2022-11-04", bed: "2번 침상", age: "4세",
      weight: 17, measured: "오늘 07:40", medication: "교육용 주사약 B", route: "근육주사",
      routeKey: "im", time: "09:30", adultDose: 100, dose: 25, maxDose: 25, unit: "mg",
      tool: "근육주사용 주사기", concentration: "10 mg/mL (교육용)", doses: [2.5, 25, 250],
      monitor: "주사 부위와 전신 반응을 확인했습니다."
    },
    {
      id: "P-2403", initials: "박○서", dob: "2020-08-22", bed: "3번 침상", age: "6세",
      weight: 20.4, measured: "오늘 07:50", medication: "교육용 경구약 C", route: "경구",
      routeKey: "po", time: "10:00", adultDose: 100, dose: 30, maxDose: 30, unit: "mg",
      tool: "경구용 약컵", concentration: "10 mg/mL (교육용)", doses: [3, 30, 300],
      monitor: "복용 여부와 삼킴 상태를 확인했습니다."
    }
  ];

  const TOOLS = ["네뷸라이저", "근육주사용 주사기", "경구용 약컵"];
  const MEDS = PATIENTS.map(p => p.medication);

  const state = {
    started: false, paused: false, score: 100, completed: new Set(),
    selectedPatient: 0, cardsViewed: new Set(), wristChecked: new Set(), handHygiene: new Set(),
    weightChecked: new Set(), compared: new Set(), prepared: new Map(),
    routeErrors: 0, doseErrors: 0, wrongChoices: 0,
    player: { x: 610, y: 790, speed: 3.7, direction: "up", moving: false },
    keys: {}, lastTime: 0, nearby: null
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const wardMap = new Image();
  wardMap.src = "assets/ward-map.jpg";
  const playerSprite = new Image();
  playerSprite.src = "assets/player-nurse.png";
  const modalRoot = document.getElementById("modalRoot");
  const hint = document.getElementById("interactionHint");
  const toastEl = document.getElementById("toast");
  const scoreValue = document.getElementById("scoreValue");
  const progressValue = document.getElementById("progressValue");

  const obstacles = [
    {x: 0, y: 0, w: 960, h: 82}, {x: 0, y: 0, w: 62, h: 960}, {x: 898, y: 0, w: 62, h: 960},
    {x: 72, y: 475, w: 405, h: 220},
    {x: 555, y: 405, w: 328, h: 245}
  ];

  const hotspots = [
    { type: "patient", index: 0, x: 145, y: 740, radius: 78, label: "1번 침상" },
    { type: "patient", index: 1, x: 292, y: 740, radius: 78, label: "2번 침상" },
    { type: "patient", index: 2, x: 425, y: 740, radius: 78, label: "3번 침상" },
    { type: "computer", x: 675, y: 690, radius: 90, label: "투약카드 컴퓨터" },
    { type: "cabinet", x: 825, y: 690, radius: 90, label: "약품 준비대" }
  ];

  function resetState() {
    state.score = 100; state.completed.clear(); state.cardsViewed.clear(); state.wristChecked.clear(); state.handHygiene.clear();
    state.weightChecked.clear(); state.compared.clear(); state.prepared.clear();
    state.routeErrors = 0; state.doseErrors = 0; state.wrongChoices = 0;
    state.player.x = 610; state.player.y = 790; state.player.direction = "up";
    updateHUD(); updateTasks(); closeModal();
  }

  function updateHUD() {
    scoreValue.textContent = state.score;
    progressValue.textContent = `${state.completed.size} / 3`;
  }

  function deduct(points, type, message) {
    state.score = Math.max(0, state.score - points);
    state.wrongChoices += 1;
    if (type === "route") state.routeErrors += 1;
    if (type === "dose") state.doseErrors += 1;
    updateHUD(); showToast(message, true);
  }

  let toastTimer;
  function showToast(message, warning = false) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = `toast${warning ? " warning" : ""}`;
    toastEl.hidden = false;
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800);
  }

  function updateTasks() {
    const p = PATIENTS[state.selectedPatient];
    const i = state.selectedPatient;
    let active = "cards";
    let title = `${p.bed} 투약카드를 확인하세요`;
    let desc = "간호사실 컴퓨터에서 처방 내용을 먼저 확인합니다.";
    if (state.cardsViewed.has(i)) { active = "identity"; title = `${p.bed} 환자를 확인하세요`; desc = "환자에게 말을 걸고 입원팔찌를 확인합니다."; }
    if (state.wristChecked.has(i)) { active = "weight"; title = "Clark 공식으로 용량을 계산하세요"; desc = "아동 체중과 성인 용량 100mg을 이용해 적정 용량을 계산합니다."; }
    if (state.weightChecked.has(i) && state.compared.has(i)) { active = "prepare"; title = "약물과 투약기구를 준비하세요"; desc = "약품 준비대에서 처방에 맞는 약물, 기구와 용량을 고릅니다."; }
    if (state.prepared.has(i)) { active = "admin"; title = `${p.bed}에서 최종 확인하세요`; desc = "환자 앞에서 다섯 항목을 대조한 뒤 투약합니다."; }
    if (state.completed.has(i)) {
      const next = PATIENTS.findIndex((_, idx) => !state.completed.has(idx));
      if (next >= 0) { state.selectedPatient = next; return updateTasks(); }
      title = "모든 투약을 완료했습니다"; desc = "결과 화면에서 수행 결과를 확인하세요."; active = "admin";
    }
    document.getElementById("taskTitle").textContent = title;
    document.getElementById("taskDescription").textContent = desc;
    document.querySelectorAll(".task-list li").forEach(li => {
      const key = li.dataset.task;
      li.classList.toggle("active", key === active);
      const order = ["cards","identity","weight","prepare","admin"];
      li.classList.toggle("done", order.indexOf(key) < order.indexOf(active));
    });
  }

  function pxRect(x,y,w,h,fill,stroke="#30555b",line=3) {
    ctx.fillStyle = fill; ctx.fillRect(x,y,w,h);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.strokeRect(x,y,w,h); }
  }

  function drawFloor() {
    ctx.fillStyle = "#ccebe3"; ctx.fillRect(0,0,960,640);
    const size = 40;
    for (let y=0;y<640;y+=size) for (let x=0;x<960;x+=size) {
      ctx.fillStyle = ((x/size+y/size)%2===0) ? "#d8f1ea" : "#c5e6dd";
      ctx.fillRect(x,y,size,size);
      ctx.strokeStyle = "rgba(56,123,113,.12)"; ctx.strokeRect(x,y,size,size);
    }
    pxRect(35,20,890,38,"#f8f4df"); pxRect(35,20,30,590,"#f8f4df"); pxRect(895,20,30,590,"#f8f4df");
    pxRect(430,18,100,42,"#a8d7d1");
    ctx.fillStyle="#4e7c7b"; ctx.fillRect(462,32,36,6);
  }

  function drawBed(x,y,index) {
    pxRect(x,y,210,112,"#7b9dac");
    pxRect(x+13,y+9,184,94,"#f7fbfb","#456670",3);
    pxRect(x+22,y+13,166,28,"#fffdf4","#76959d",2);
    pxRect(x+21,y+42,168,53,"#9fc8e5","#4b7794",2);
    ctx.fillStyle="#f0c6a5"; ctx.fillRect(x+86,y+20,38,28);
    ctx.fillStyle=["#65453a","#313b4a","#8b6d45"][index]; ctx.fillRect(x+83,y+15,44,12);
    ctx.fillStyle="#263d46"; ctx.fillRect(x+94,y+31,4,4); ctx.fillRect(x+112,y+31,4,4);
    pxRect(x+158,y+4,38,26,"#ffffff","#4b8491",2);
    ctx.fillStyle="#db5d5d"; ctx.fillRect(x+174,y+9,6,16); ctx.fillRect(x+169,y+14,16,6);
    ctx.fillStyle="#315f64"; ctx.font="bold 12px monospace"; ctx.fillText(`${index+1}`,x+174,y+50);
  }

  function drawNurseStation() {
    pxRect(65,405,250,120,"#d3e2dc"); pxRect(73,413,234,36,"#f8fbf7");
    pxRect(94,460,88,54,"#63808a"); pxRect(103,468,70,35,"#162f3a");
    ctx.fillStyle="#55d2b2"; ctx.fillRect(116,483,35,4);
    pxRect(212,458,76,55,"#ecf4f1");
    ctx.fillStyle="#718c92"; for(let i=0;i<4;i++) ctx.fillRect(222,469+i*9,56,4);
    ctx.fillStyle="#315f64"; ctx.font="bold 13px 'Malgun Gothic'"; ctx.fillText("간호사실",155,438);
  }

  function drawCabinet() {
    pxRect(650,400,235,125,"#d7e1dd"); pxRect(660,410,215,34,"#f9fbf8");
    ctx.fillStyle="#db5d5d"; ctx.fillRect(758,414,9,24); ctx.fillRect(750,422,25,8);
    pxRect(666,455,66,58,"#96b0a9"); pxRect(738,455,66,58,"#96b0a9"); pxRect(810,455,58,58,"#d55b60");
    ctx.fillStyle="#315f64"; ctx.font="bold 12px 'Malgun Gothic'"; ctx.fillText("약품 준비대",728,438);
  }

  function drawSink() {
    pxRect(370,286,220,64,"#e9f1ef"); pxRect(390,300,80,38,"#9bcbd0"); pxRect(490,298,72,40,"#ffffff");
    ctx.fillStyle="#4d7779"; ctx.fillRect(425,290,10,18); ctx.fillRect(425,290,32,7);
    ctx.fillStyle="#315f64"; ctx.font="bold 11px 'Malgun Gothic'"; ctx.fillText("손 위생",500,323);
  }

  function drawPatientLabel(x,y,p,index) {
    const done=state.completed.has(index);
    ctx.fillStyle=done?"#14745f":"#315f64"; ctx.fillRect(x,y,120,25);
    ctx.fillStyle="#fff"; ctx.font="bold 11px 'Malgun Gothic'"; ctx.textAlign="center";
    ctx.fillText(done?`${p.bed} 완료`:p.bed,x+60,y+17); ctx.textAlign="left";
  }

  function drawPlayer() {
    const {x,y,moving}=state.player;
    const bob=moving?Math.sin(performance.now()/80)*2:0;
    ctx.save(); ctx.translate(Math.round(x),Math.round(y+bob));
    ctx.fillStyle="rgba(25,58,69,.18)"; ctx.fillRect(-15,17,30,8);
    if(playerSprite.complete&&playerSprite.naturalWidth){
      ctx.drawImage(playerSprite,-29,-43,58,60);
    }
    ctx.restore();
  }

  function drawScene() {
    if (wardMap.complete && wardMap.naturalWidth) {
      ctx.drawImage(wardMap, 0, 0, 960, 960);
      // 원본 배경에 포함된 의사 캐릭터 영역을 같은 위상의 빈 바닥 타일로 복원한다.
      ctx.drawImage(ctx.canvas, 437, 690, 82, 94, 565, 690, 82, 94);
    } else {
      ctx.fillStyle = "#ccebe3";
      ctx.fillRect(0, 0, 960, 960);
    }
    hotspots.forEach(h => {
      const completed = h.type === "patient" && state.completed.has(h.index);
      ctx.fillStyle = completed ? "rgba(20,116,95,.82)" : "rgba(22,118,197,.76)";
      ctx.fillRect(h.x - 7, h.y - 7, 14, 14);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(h.x - 7, h.y - 7, 14, 14);
    });
    drawPlayer();
  }

  function collides(x,y) {
    const r={x:x-13,y:y-28,w:26,h:52};
    return obstacles.some(o=>r.x<o.x+o.w&&r.x+r.w>o.x&&r.y<o.y+o.h&&r.y+r.h>o.y);
  }

  function updateMovement(dt) {
    if (!state.started||state.paused||!modalRoot.hidden) { state.player.moving=false; return; }
    let dx=0,dy=0;
    if(state.keys.ArrowLeft||state.keys.KeyA)dx=-1;
    if(state.keys.ArrowRight||state.keys.KeyD)dx=1;
    if(state.keys.ArrowUp||state.keys.KeyW)dy=-1;
    if(state.keys.ArrowDown||state.keys.KeyS)dy=1;
    if(dx&&dy){dx*=.707;dy*=.707;}
    state.player.moving=!!(dx||dy);
    if(dx<0)state.player.direction="left"; if(dx>0)state.player.direction="right"; if(dy<0)state.player.direction="up"; if(dy>0)state.player.direction="down";
    const speed=state.player.speed*Math.min(dt/16.67,2);
    const nx=Math.max(78,Math.min(882,state.player.x+dx*speed));
    const ny=Math.max(105,Math.min(890,state.player.y+dy*speed));
    if(!collides(nx,state.player.y))state.player.x=nx;
    if(!collides(state.player.x,ny))state.player.y=ny;
    findNearby();
  }

  function findNearby() {
    let best=null,bestD=Infinity;
    hotspots.forEach(h=>{const d=Math.hypot(state.player.x-h.x,state.player.y-h.y);if(d<h.radius&&d<bestD){best=h;bestD=d;}});
    state.nearby=best;
    hint.hidden=!best;
    if(best)hint.textContent=`E ${best.label}`;
  }

  function loop(time) {
    const dt=time-state.lastTime||16.67; state.lastTime=time;
    updateMovement(dt); drawScene(); requestAnimationFrame(loop);
  }

  function interact() {
    if(!state.started||state.paused||!modalRoot.hidden||!state.nearby)return;
    const h=state.nearby;
    if(h.type==="computer")openMedicationCards();
    if(h.type==="cabinet")openPreparation();
    if(h.type==="patient")openPatientMenu(h.index);
  }

  function makeDialog(kicker,title,body,footer="",wide=false) {
    const tpl=document.getElementById("dialogTemplate").content.cloneNode(true);
    tpl.getElementById("dialogKicker").textContent=kicker;
    tpl.getElementById("dialogTitle").textContent=title;
    tpl.getElementById("dialogBody").innerHTML=body;
    tpl.getElementById("dialogFooter").innerHTML=footer;
    if(wide)tpl.querySelector(".dialog").classList.add("wide");
    modalRoot.innerHTML=""; modalRoot.appendChild(tpl); modalRoot.hidden=false;
    modalRoot.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",closeModal));
    modalRoot.querySelector(".dialog")?.focus();
  }

  let bedsideTypeTimer;
  let bedsideActionTimer;

  function closeModal(){
    clearInterval(bedsideTypeTimer);
    clearTimeout(bedsideActionTimer);
    modalRoot.hidden=true;
    modalRoot.innerHTML="";
    updateTasks();
  }

  function escapeHTML(value){
    return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[char]);
  }

  function highlightMessage(value,keywords=[]){
    let result=escapeHTML(value);
    keywords.forEach(keyword=>{
      const safe=escapeHTML(keyword);
      result=result.replace(safe,`<span class="key-term">${safe}</span>`);
    });
    return result;
  }

  function typeBedsideMessage(message,keywords=[]){
    const target=modalRoot.querySelector("#bedsideMessage");
    if(!target)return;
    clearInterval(bedsideTypeTimer);
    let index=0;
    target.innerHTML="";
    bedsideTypeTimer=setInterval(()=>{
      index+=1;
      target.innerHTML=highlightMessage(message.slice(0,index),keywords);
      if(index>=message.length)clearInterval(bedsideTypeTimer);
    },32);
  }

  function medCardHTML(p) {
    return `<div class="med-card"><h3>${p.bed} 투약카드</h3><div class="data-grid">
      ${dataItem("환자번호",p.id)}${dataItem("환자",p.initials)}${dataItem("약물명",p.medication)}${dataItem("처방 용량",`${p.dose} ${p.unit}`)}
      ${dataItem("투여경로",p.route)}${dataItem("투약시간",p.time)}${dataItem("최신 체중",`${p.weight} kg · ${p.measured}`)}${dataItem("성인 용량",`${p.adultDose} mg`)}
      ${dataItem("1회 최대용량",`${p.maxDose} ${p.unit}`)}${dataItem("제형·농도",p.concentration)}
    </div><div class="clark-rule"><span class="key-term">Clark's rule</span><br>(${p.weight}kg ÷ 68kg) × ${p.adultDose}mg = <span class="key-term">${p.dose}mg</span></div><span class="education-tag">교육용 가상 처방 · 실제 임상 사용 금지</span></div>`;
  }
  function dataItem(label,value){
    const important=["약물명","처방 용량","투여경로","투약시간","최신 체중","성인 용량"].includes(label);
    return `<div class="data-item"><span>${label}</span><b class="${important?"key-term":""}">${value}</b></div>`;
  }

  function openMedicationCards() {
    const tabs=PATIENTS.map((p,i)=>`<button class="tab-button ${i===state.selectedPatient?"active":""}" data-patient-tab="${i}">${p.bed}</button>`).join("");
    makeDialog("NURSES' STATION","투약카드 확인",`<div class="patient-tabs">${tabs}</div><div id="cardArea">${medCardHTML(PATIENTS[state.selectedPatient])}</div>`,
      `<button class="secondary-button" data-close>닫기</button><button class="primary-button" id="confirmCard">이 처방을 확인했습니다</button>`,true);
    bindCardDialog();
  }

  function bindCardDialog(){
    modalRoot.querySelectorAll("[data-patient-tab]").forEach(btn=>btn.addEventListener("click",()=>{
      state.selectedPatient=Number(btn.dataset.patientTab);
      modalRoot.querySelectorAll("[data-patient-tab]").forEach(b=>b.classList.toggle("active",b===btn));
      modalRoot.querySelector("#cardArea").innerHTML=medCardHTML(PATIENTS[state.selectedPatient]);
    }));
    modalRoot.querySelector("#confirmCard").addEventListener("click",()=>{
      state.cardsViewed.add(state.selectedPatient); showToast(`${PATIENTS[state.selectedPatient].bed} 투약카드를 확인했습니다.`); closeModal();
    });
  }

  function openPatientMenu(index) {
    state.selectedPatient=index; const p=PATIENTS[index];
    const prepared=state.prepared.has(index)?"준비 완료":"아직 준비하지 않음";
    modalRoot.innerHTML=`<div class="bedside-backdrop">
      <section class="bedside-dialog" role="dialog" aria-modal="true" aria-labelledby="bedsideTitle">
        <div class="bedside-scene" role="img" aria-label="간호사가 침상에 있는 대상자와 대화하는 장면">
          <div class="bedside-message" id="bedsideMessage" aria-live="polite">대상자에게&nbsp;<span class="key-term">투약 전 안전 확인</span>을 시행한다!</div>
        </div>
        <div class="bedside-menu">
          <header class="bedside-menu-header">
            <div><h2 id="bedsideTitle">${p.bed} · ${p.initials}</h2><p>시행할 간호 활동을 선택하세요.</p></div>
            <button class="bedside-close" data-close type="button" aria-label="침상 대화 닫기">×</button>
          </header>
          <div class="bedside-actions">
            <button class="bedside-action ${state.handHygiene.has(index)?"completed":""}" data-action="hand" type="button"><strong>손 위생</strong> 시행하기</button>
            <button class="bedside-action" data-action="greet" type="button">환자에게 인사하기</button>
            <button class="bedside-action" data-action="wrist" type="button"><strong>입원팔찌</strong> 확인하기</button>
            <button class="bedside-action" data-action="card" type="button"><strong>투약카드</strong> 확인하기</button>
            <button class="bedside-action" data-action="weight" type="button"><strong>체중·용량</strong> 확인하기</button>
            <button class="bedside-action" data-action="compare" type="button"><strong>투약정보</strong> 대조하기</button>
            <button class="bedside-action" data-action="admin" type="button"><strong>투약</strong>하기</button>
            <button class="bedside-action cancel" data-action="cancel" type="button">취소하기</button>
          </div>
          <div class="bedside-status" id="bedsideStatus">손 위생: <strong>${state.handHygiene.has(index)?"시행함":"미시행"}</strong> · 투약카드: <strong>${state.cardsViewed.has(index)?"확인함":"미확인"}</strong> · 약물 준비: <strong>${prepared}</strong></div>
        </div>
      </section>
    </div>`;
    modalRoot.hidden=false;
    modalRoot.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",closeModal));
    const actionMessages={
      hand:{text:"손 위생을 시행한다!",keys:["손 위생"]},
      greet:{text:"안녕하세요. 투약 전 안전 확인을 시행하겠습니다!",keys:["투약 전 안전 확인"]},
      wrist:{text:"입원팔찌를 확인한다!",keys:["입원팔찌"]},
      card:{text:"투약카드를 확인한다!",keys:["투약카드"]},
      weight:{text:"체중과 약물 용량을 확인한다!",keys:["체중","약물 용량"]},
      compare:{text:"입원팔찌와 투약카드의 정보를 대조한다!",keys:["입원팔찌","투약카드"]},
      admin:{text:"최종 안전 확인 후 투약한다!",keys:["최종 안전 확인","투약"]},
      cancel:{text:"침상 확인을 취소하고 병실로 돌아간다!",keys:["취소"]}
    };
    modalRoot.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click",()=>{
      clearTimeout(bedsideActionTimer);
      modalRoot.querySelectorAll("[data-action]").forEach(item=>item.classList.toggle("selected",item===btn));
      const action=btn.dataset.action;
      const content=actionMessages[action];
      typeBedsideMessage(content.text,content.keys);
      if(action==="hand"){
        state.handHygiene.add(index);
        btn.classList.add("completed");
        const status=modalRoot.querySelector("#bedsideStatus");
        if(status)status.innerHTML=`손 위생: <strong>시행함</strong> · 투약카드: <strong>${state.cardsViewed.has(index)?"확인함":"미확인"}</strong> · 약물 준비: <strong>${prepared}</strong>`;
        return;
      }
      if(action==="greet")return;
      if(action==="cancel"){bedsideActionTimer=setTimeout(closeModal,700);return;}
      bedsideActionTimer=setTimeout(()=>patientAction(index,action),900);
    }));
  }

  function patientAction(index,action){
    const p=PATIENTS[index];
    if(action==="greet") { showToast("안녕하세요. 투약 전 환자 정보와 처방을 확인하겠습니다."); }
    if(action==="wrist") openWristband(index);
    if(action==="card") openCarriedCard(index);
    if(action==="weight") openDoseCheck(index);
    if(action==="compare") openComparison(index);
    if(action==="admin") attemptAdministration(index);
  }

  function openCarriedCard(index){
    const p=PATIENTS[index];
    if(!state.cardsViewed.has(index)){showToast("먼저 간호사실 컴퓨터에서 이 환자의 투약카드를 확인하고 가져오세요.",true);closeModal();return;}
    makeDialog("MEDICATION CARD","가지고 온 투약카드",medCardHTML(p),`<button class="primary-button" data-close>확인 완료</button>`,true);
  }

  function openWristband(index){
    const p=PATIENTS[index];
    makeDialog("PATIENT IDENTIFICATION","입원팔찌 확인",`<div class="id-card"><h3>입원팔찌</h3><div class="data-grid">${dataItem("환자번호",p.id)}${dataItem("환자",p.initials)}${dataItem("생년월일",p.dob)}${dataItem("병상",p.bed)}</div></div>`,
      `<button class="secondary-button" data-close>취소</button><button class="primary-button" id="confirmWrist">두 가지 정보로 확인했습니다</button>`);
    modalRoot.querySelector("#confirmWrist").addEventListener("click",()=>{state.wristChecked.add(index);showToast(`${p.bed} 입원팔찌를 확인했습니다.`);closeModal();});
  }

  function openDoseCheck(index){
    const p=PATIENTS[index];
    if(!state.cardsViewed.has(index)){showToast("먼저 간호사실에서 이 환자의 투약카드를 확인하세요.",true);closeModal();return;}
    const options=p.doses.map(d=>`<button class="answer-button" data-dose="${d}">${d} ${p.unit}</button>`).join("");
    makeDialog("CLARK'S RULE","Clark 공식으로 아동 용량 계산",`<div class="calc-card">
      <div class="data-grid">${dataItem("최신 체중",`${p.weight} kg`)}${dataItem("측정 시각",p.measured)}${dataItem("성인 평균 체중","68 kg")}${dataItem("성인 용량",`${p.adultDose} mg`)}</div>
      <div class="clark-rule"><span class="key-term">아동 용량</span> = (아동 체중 ÷ 68kg) × 성인 용량<br>(${p.weight}kg ÷ 68kg) × ${p.adultDose}mg = ?</div>
      <p>계산된 <span class="key-term">적정 1회 용량</span>을 선택하세요.</p><div class="answer-grid">${options}</div>
    </div>`);
    modalRoot.querySelectorAll("[data-dose]").forEach(btn=>btn.addEventListener("click",()=>{
      const answer=Number(btn.dataset.dose);
      if(answer===p.dose){state.weightChecked.add(index);showToast(`정답입니다. 적정 용량은 ${p.dose} ${p.unit}입니다.`);closeModal();}
      else {const tenfold=answer>=p.dose*10;deduct(tenfold?10:3,"dose",tenfold?"10배 용량 오류 위험! 소수점과 단위를 다시 확인하세요.":"Clark 공식을 이용해 다시 계산하세요.");}
    }));
  }

  function openComparison(index){
    const p=PATIENTS[index];
    if(!state.cardsViewed.has(index)||!state.wristChecked.has(index)){showToast("투약카드와 입원팔찌를 먼저 각각 확인하세요.",true);closeModal();return;}
    const labels=["대상자가 일치한다","약물명이 일치한다","용량이 일치한다","투여경로가 일치한다","투약시간이 일치한다"];
    makeDialog("FIVE RIGHTS","입원팔찌와 투약카드 대조",`<div class="compare-layout"><div class="id-card"><h3>입원팔찌</h3>${dataItem("환자번호",p.id)}${dataItem("환자",p.initials)}${dataItem("생년월일",p.dob)}${dataItem("병상",p.bed)}</div>${medCardHTML(p)}</div>
      <div class="check-list">${labels.map((l,i)=>`<label class="check-row"><input type="checkbox" data-check="${i}"><span>${l}</span></label>`).join("")}</div>`,
      `<button class="secondary-button" data-close>취소</button><button class="primary-button" id="confirmCompare">5가지 항목 대조 완료</button>`,true);
    modalRoot.querySelector("#confirmCompare").addEventListener("click",()=>{
      const checks=[...modalRoot.querySelectorAll("[data-check]")];
      if(checks.every(c=>c.checked)){state.compared.add(index);showToast("대상자, 약물, 용량, 경로와 시간을 모두 대조했습니다.");closeModal();}
      else showToast("다섯 항목을 모두 직접 확인하고 체크하세요.",true);
    });
  }

  function openPreparation(){
    const i=state.selectedPatient,p=PATIENTS[i];
    if(!state.cardsViewed.has(i)||!state.weightChecked.has(i)||!state.compared.has(i)){showToast("투약카드, 팔찌, 체중·용량 대조를 먼저 완료하세요.",true);return;}
    const medOpts=MEDS.map(v=>`<button class="option-card" data-kind="med" data-value="${v}"><b>${v}</b><span>교육용 약물</span></button>`).join("");
    const toolOpts=TOOLS.map(v=>`<button class="option-card" data-kind="tool" data-value="${v}"><b>${v}</b><span>투약기구</span></button>`).join("");
    const doseOpts=p.doses.map(v=>`<button class="option-card" data-kind="dose" data-value="${v}"><b>${v} ${p.unit}</b><span>준비 용량</span></button>`).join("");
    makeDialog("MEDICATION PREPARATION",`${p.bed} 약물 준비`, `<div class="prepare-grid">
      <div class="prepare-section"><h3>1. 약물을 선택하세요</h3><div class="option-grid">${medOpts}</div></div>
      <div class="prepare-section"><h3>2. 투약기구를 선택하세요</h3><div class="option-grid">${toolOpts}</div></div>
      <div class="prepare-section"><h3>3. 준비할 용량을 선택하세요</h3><div class="option-grid">${doseOpts}</div></div>
      <div id="prepFeedback"></div></div>`,
      `<button class="secondary-button" data-close>취소</button><button class="primary-button" id="confirmPrep">선택한 내용으로 준비</button>`,true);
    const selection={med:null,tool:null,dose:null};
    modalRoot.querySelectorAll("[data-kind]").forEach(btn=>btn.addEventListener("click",()=>{
      selection[btn.dataset.kind]=btn.dataset.kind==="dose"?Number(btn.dataset.value):btn.dataset.value;
      modalRoot.querySelectorAll(`[data-kind="${btn.dataset.kind}"]`).forEach(b=>b.classList.toggle("selected",b===btn));
    }));
    modalRoot.querySelector("#confirmPrep").addEventListener("click",()=>validatePreparation(i,selection));
  }

  function validatePreparation(index,selection){
    const p=PATIENTS[index],feedback=modalRoot.querySelector("#prepFeedback");
    if(selection.med===null||selection.tool===null||selection.dose===null){feedback.innerHTML=`<div class="warning-box"><strong>선택이 필요합니다</strong><p>약물, 투약기구와 용량을 모두 선택하세요.</p></div>`;return;}
    if(selection.med!==p.medication){deduct(3,"other","다른 환자의 약물입니다. 투약카드를 다시 확인하세요.");feedback.innerHTML=`<div class="warning-box"><strong>약물 불일치</strong><p>처방된 약물명과 선택한 약물이 다릅니다.</p></div>`;return;}
    if(selection.tool!==p.tool){deduct(10,"route",`투여경로 오류 위험! ${p.route} 처방에 맞는 기구를 다시 선택하세요.`);feedback.innerHTML=`<div class="warning-box"><strong>중대 경고: 투여경로 불일치</strong><p>처방은 ${p.route}이지만 선택한 기구는 ${selection.tool}입니다. 투약을 진행할 수 없습니다.</p></div>`;return;}
    if(selection.dose!==p.dose){const tenfold=selection.dose>=p.dose*10;deduct(tenfold?10:3,"dose",tenfold?"10배 용량 오류 위험! 소수점과 단위를 확인하세요.":"처방 용량과 다릅니다. 다시 계산하세요.");feedback.innerHTML=`<div class="warning-box"><strong>${tenfold?"중대 경고: 10배 용량 오류":"용량 불일치"}</strong><p>체중 기준 적정 용량은 ${p.dose} ${p.unit}입니다.</p></div>`;return;}
    state.prepared.set(index,{...selection}); showToast(`${p.medication} ${p.dose} ${p.unit} 준비를 완료했습니다.`); closeModal();
  }

  function attemptAdministration(index){
    const p=PATIENTS[index];
    const missing=[];
    if(!state.handHygiene.has(index))missing.push("손 위생");
    if(!state.cardsViewed.has(index))missing.push("투약카드");
    if(!state.wristChecked.has(index))missing.push("입원팔찌");
    if(!state.weightChecked.has(index))missing.push("체중·용량 계산");
    if(!state.compared.has(index))missing.push("5가지 항목 대조");
    if(!state.prepared.has(index))missing.push("약물·기구 준비");
    if(missing.length){showToast(`아직 완료하지 않은 항목: ${missing.join(", ")}`,true);closeModal();return;}
    const prep=state.prepared.get(index);
    makeDialog("FINAL SAFETY CHECK","투약 직전 최종 확인",`<div class="success-box"><strong>${p.bed} · ${p.initials}</strong><p>${p.medication} ${prep.dose} ${p.unit} · ${p.route} · ${p.time}</p></div>
      <div class="check-list">
        ${["정확한 환자","정확한 약물","정확한 용량","정확한 투여경로","정확한 투약시간"].map((l,i)=>`<label class="check-row"><input type="checkbox" data-final="${i}"><span>${l}</span></label>`).join("")}
      </div>`,
      `<button class="secondary-button" data-close>한 번 더 확인</button><button class="primary-button" id="giveMedication">안전하게 투약하기</button>`);
    modalRoot.querySelector("#giveMedication").addEventListener("click",()=>{
      const checks=[...modalRoot.querySelectorAll("[data-final]")];
      if(!checks.every(c=>c.checked)){showToast("투약 직전 다섯 항목을 모두 확인하세요.",true);return;}
      state.completed.add(index); state.prepared.delete(index); updateHUD();
      makeDialog("ADMINISTRATION COMPLETE","투약 완료",`<div class="success-box"><strong>안전하게 투약했습니다</strong><p>${p.monitor}</p></div><div class="calc-equation">${p.initials} · ${p.medication} · ${p.dose} ${p.unit} · ${p.route}</div>`,
        `<button class="primary-button" id="finishAdmin">확인</button>`);
      modalRoot.querySelector("#finishAdmin").addEventListener("click",()=>{closeModal(); if(state.completed.size===3)setTimeout(showResults,350); else {const n=PATIENTS.findIndex((_,idx)=>!state.completed.has(idx));state.selectedPatient=n;updateTasks();showToast(`${PATIENTS[n].bed} 투약을 계속하세요.`);}});
    });
  }

  function showResults(){
    const grade=state.score>=90?"투약안전 우수":state.score>=70?"투약안전 양호":"재도전이 필요합니다";
    const message=state.score>=90?"경로와 체중 기반 용량을 정확하게 확인했습니다.":state.score>=70?"놓친 확인 항목을 다시 살펴보세요.":"환자, 약물, 용량, 경로, 시간과 체중을 반드시 확인하세요.";
    makeDialog("SIMULATION RESULT",grade,`<div class="result-score"><strong>${state.score}</strong><span>최종 점수</span></div>
      <div class="result-grid"><div class="result-metric"><b>3</b><span>완료한 투약</span></div><div class="result-metric"><b>${state.routeErrors}</b><span>경로 오류 시도</span></div><div class="result-metric"><b>${state.doseErrors}</b><span>용량 오류 시도</span></div></div>
      <div class="result-message ${state.score>=70?"success-box":"warning-box"}"><strong>${message}</strong><p>경로가 바뀌면 적정 용량도 달라질 수 있습니다. 확실하지 않으면 투약하지 말고 처방을 다시 확인하세요.</p></div>`,
      `<button class="secondary-button" id="resultReset">다시 도전하기</button><button class="primary-button" data-close>결과 확인</button>`);
    modalRoot.querySelector("#resultReset").addEventListener("click",()=>{resetState();showToast("새로운 시뮬레이션을 시작합니다.");});
  }

  document.addEventListener("keydown",e=>{
    state.keys[e.code]=true;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
    if((e.code==="KeyE"||e.code==="Space")&&!e.repeat)interact();
    if(e.code==="Escape"&&!modalRoot.hidden)closeModal();
  });
  document.addEventListener("keyup",e=>{state.keys[e.code]=false;});
  window.addEventListener("blur",()=>{state.keys={};});

  document.querySelectorAll("[data-move-key]").forEach(button=>{
    const key=button.dataset.moveKey;
    const press=event=>{
      event.preventDefault();
      state.keys[key]=true;
      if(button.setPointerCapture&&event.pointerId!==undefined)button.setPointerCapture(event.pointerId);
    };
    const release=event=>{
      event.preventDefault();
      state.keys[key]=false;
    };
    button.addEventListener("pointerdown",press);
    button.addEventListener("pointerup",release);
    button.addEventListener("pointercancel",release);
    button.addEventListener("lostpointercapture",release);
    button.addEventListener("contextmenu",event=>event.preventDefault());
  });
  document.getElementById("mobileInteract").addEventListener("pointerdown",event=>{
    event.preventDefault();
    interact();
  });

  document.getElementById("startBtn").addEventListener("click",()=>{
    state.started=true; document.getElementById("startScreen").hidden=true;
    showToast("간호사실 컴퓨터에서 투약카드를 확인하세요.");
  });
  document.getElementById("pauseBtn").addEventListener("click",()=>{
    if(!state.started)return; state.paused=true; document.getElementById("pauseScreen").hidden=false;
  });
  document.getElementById("resumeBtn").addEventListener("click",()=>{state.paused=false;document.getElementById("pauseScreen").hidden=true;});
  document.getElementById("resetBtn").addEventListener("click",()=>{if(confirm("진행 상황을 초기화할까요?")){resetState();state.started=true;document.getElementById("startScreen").hidden=true;}});

  updateHUD(); updateTasks(); requestAnimationFrame(loop);
})();
