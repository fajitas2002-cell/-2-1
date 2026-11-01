const drugs = [
  { id: "643900710", name: "슈다페드정(슈도에페드린염산염)_(60mg/1정)", short: "슈다페드정 60mg", ingredient: "슈도에페드린염산염", ingredientCode: "220902ATB", maker: "삼일제약(주)", tags: ["슈다페드", "에페드린", "코막힘"] },
  { id: "645700960", name: "슈다펜정(슈도에페드린염산염)_(60mg/1정)", short: "슈다펜정 60mg", ingredient: "슈도에페드린염산염", ingredientCode: "220902ATB", maker: "삼아제약(주)", tags: ["슈다펜", "에페드린", "코막힘"] },
  { id: "650900010", name: "타이레놀정500밀리그람(아세트아미노펜)", short: "타이레놀정 500mg", ingredient: "아세트아미노펜", ingredientCode: "101430ATB", maker: "한국얀센(주)", tags: ["타이레놀", "해열", "진통"] },
  { id: "643500900", name: "코푸정", short: "코푸정", ingredient: "아세트아미노펜 외 복합성분", ingredientCode: "MIX-COUGH-01", maker: "유한양행(주)", tags: ["코푸", "감기", "기침", "아세트아미노펜"] },
  { id: "648600520", name: "록소프로펜나트륨정 60mg", short: "록소프로펜정 60mg", ingredient: "록소프로펜나트륨수화물", ingredientCode: "183101ATB", maker: "대웅바이오(주)", tags: ["록소프로펜", "소염", "진통"] },
  { id: "640000650", name: "아스피린프로텍트정100밀리그람", short: "아스피린프로텍트정 100mg", ingredient: "아스피린", ingredientCode: "111001ATR", maker: "바이엘코리아(주)", tags: ["아스피린", "혈전", "진통"] },
  { id: "648100560", name: "페니라민정2밀리그람", short: "페니라민정 2mg", ingredient: "클로르페니라민말레산염", ingredientCode: "131801ATB", maker: "유한양행(주)", tags: ["페니라민", "알레르기", "항히스타민"] },
  { id: "646900120", name: "졸피뎀정10밀리그람", short: "졸피뎀정 10mg", ingredient: "졸피뎀타르타르산염", ingredientCode: "250501ATB", maker: "제이더블유신약(주)", tags: ["졸피뎀", "수면"] }
];

const categories = [
  { key: "combination", label: "병용금기", description: "두 가지 이상 약물을 함께 사용할 때 피해야 하는 조합입니다." },
  { key: "age", label: "연령금기", description: "특정 연령에서 안전성이 확보되지 않았거나 위험이 큰 약물입니다." },
  { key: "pregnancy", label: "임부금기", description: "임신 중 사용 시 태아 또는 임부에게 위험할 수 있는 약물입니다." },
  { key: "dose", label: "용량주의", description: "허가된 최대 투여량과 복용 횟수를 확인해야 하는 약물입니다." },
  { key: "route", label: "투여경로", description: "처방된 투여경로와 준비 기구가 일치하는지 확인합니다." },
  { key: "duration", label: "투여기간주의", description: "장기간 사용 시 위험이 커질 수 있어 권장 기간을 확인해야 합니다." },
  { key: "elderly", label: "노인주의", description: "고령 환자에서 이상반응 위험이 증가할 수 있는 약물입니다." },
  { key: "duplicate", label: "동일성분중복", description: "서로 다른 제품에 같은 성분이 포함되어 중복 복용 위험이 있습니다." },
  { key: "efficacy", label: "효능군중복", description: "작용이 비슷한 약이 겹쳐 이상반응 위험이 커질 수 있습니다." },
  { key: "split", label: "분할주의", description: "제형 특성상 쪼개거나 갈아서 복용하면 안 되는 약물입니다." }
];

const singleRules = {
  "643900710": [
    { category: "pregnancy", text: "임부에 대한 안전성이 확립되어 있지 않습니다. 치료상의 유익성이 위험성을 상회한다고 판단되는 경우에만 전문가 지시에 따라 사용합니다." },
    { category: "dose", text: "성인은 통상 1회 30~60mg을 1일 3~4회 복용합니다. 연령과 증상에 따라 용량 조절이 필요합니다." }
  ],
  "645700960": [
    { category: "pregnancy", text: "임신 중 투여에 대한 충분한 안전성 자료가 없으므로 전문가의 판단이 필요합니다." },
    { category: "dose", text: "슈도에페드린 함유량과 1일 총 투여량을 확인해야 합니다." }
  ],
  "650900010": [
    { category: "dose", text: "아세트아미노펜의 1일 총 복용량을 확인하세요. 다른 감기약과 성분이 중복될 수 있습니다." }
  ],
  "643500900": [
    { category: "dose", text: "복합제에 포함된 아세트아미노펜 등 각 성분의 1일 총량을 다른 약과 함께 계산해야 합니다." },
    { category: "elderly", text: "진정 및 항콜린성 이상반응이 나타날 수 있어 고령자는 주의가 필요합니다." }
  ],
  "648600520": [
    { category: "pregnancy", text: "임신 후기에는 태아 순환계와 분만에 영향을 줄 수 있어 사용 전 전문가 확인이 필요합니다." },
    { category: "elderly", text: "고령자는 위장관 출혈과 신기능 저하 위험을 고려해 최소 유효용량을 사용합니다." },
    { category: "duration", text: "진통 목적으로 장기간 연속 사용하지 말고 증상 지속 시 진료가 필요합니다." }
  ],
  "640000650": [
    { category: "age", text: "소아·청소년의 바이러스성 질환에서 사용 시 라이 증후군 위험을 고려해야 합니다." },
    { category: "pregnancy", text: "임신 후기에는 출혈 및 태아 순환 영향 위험이 있어 전문가의 판단 없이 사용하지 않습니다." },
    { category: "elderly", text: "위장관 출혈 위험이 증가할 수 있어 출혈 징후를 주의 깊게 관찰합니다." }
  ],
  "648100560": [
    { category: "elderly", text: "고령자는 졸림, 입마름, 배뇨곤란 등 항콜린성 이상반응에 더 민감할 수 있습니다." }
  ],
  "646900120": [
    { category: "duration", text: "불면증 치료는 가능한 한 짧게 시행하며 장기간 연속 사용은 의존성 위험을 높일 수 있습니다." },
    { category: "elderly", text: "고령자는 다음 날 졸림과 낙상 위험이 증가할 수 있어 감량이 필요할 수 있습니다." }
  ]
};

const pairRules = [
  { ids: ["650900010", "643500900"], category: "duplicate", text: "두 제품 모두 아세트아미노펜을 포함할 수 있습니다. 성분별 1일 총 복용량을 반드시 합산해 확인하세요." },
  { ids: ["648600520", "640000650"], category: "efficacy", text: "두 약 모두 비스테로이드성 소염진통제 계열 작용이 있어 위장관 출혈과 신장 이상반응 위험이 증가할 수 있습니다." },
  { ids: ["648100560", "646900120"], category: "combination", text: "중추신경 억제와 졸림이 더 심해질 수 있습니다. 운전이나 위험한 기계 조작을 피하고 전문가에게 병용 여부를 확인하세요." },
  { ids: ["643900710", "645700960"], category: "duplicate", text: "두 제품의 주성분이 슈도에페드린으로 동일합니다. 중복 복용 시 심계항진, 혈압 상승 등의 위험이 커질 수 있습니다." }
];

const fallbackPatients = [
  { id:"P-2401", initials:"김○아", bed:"1번 침상", age:"2세", dob:"2024-03-18", weight:10.2, measured:"오늘 07:30", medication:"교육용 흡입약 A", dose:15, unit:"mg", maxDose:15, adultDose:100, route:"네뷸라이저 흡입", routeKey:"neb", time:"09:00", tool:"네뷸라이저", concentration:"교육용 단일 용량", checks:{} },
  { id:"P-2402", initials:"이○준", bed:"2번 침상", age:"4세", dob:"2022-11-04", weight:17, measured:"오늘 07:40", medication:"교육용 주사약 B", dose:25, unit:"mg", maxDose:25, adultDose:100, route:"근육주사", routeKey:"im", time:"09:30", tool:"근육주사용 주사기", concentration:"10 mg/mL (교육용)", checks:{} },
  { id:"P-2403", initials:"박○서", bed:"3번 침상", age:"6세", dob:"2020-08-22", weight:20.4, measured:"오늘 07:50", medication:"교육용 경구약 C", dose:30, unit:"mg", maxDose:30, adultDose:100, route:"경구", routeKey:"po", time:"10:00", tool:"경구용 약컵", concentration:"10 mg/mL (교육용)", checks:{} }
];

function loadLinkedPatients() {
  try {
    const stored=JSON.parse(localStorage.getItem("doseverseYakAnsimPatients")||"null");
    if(Array.isArray(stored)&&stored.length)return stored;
  } catch(error) {
    console.warn("시뮬레이션 환자 연동 데이터를 읽지 못했습니다.",error);
  }
  return fallbackPatients;
}

const linkedPatients=loadLinkedPatients();
linkedPatients.forEach((patient)=>{
  const drugId=`SIM-${patient.id}`;
  drugs.push({
    id:drugId,
    name:`${patient.medication} (${patient.dose}${patient.unit}, ${patient.route})`,
    short:`${patient.medication} ${patient.dose}${patient.unit}`,
    ingredient:"교육용 가상 성분",
    ingredientCode:`EDU-${patient.routeKey.toUpperCase()}`,
    maker:"DOSEVERSE 교육용 처방",
    tags:[patient.medication,patient.route,patient.bed,patient.initials,"소아"]
  });
  const clarkDose=Math.round((patient.weight/68)*patient.adultDose*10)/10;
  singleRules[drugId]=[
    {category:"age",text:`${patient.age} 소아 환자입니다. 성인 기준 용량을 그대로 투여하지 말고 체중 기반 계산과 소아 최대용량을 확인해야 합니다.`},
    {category:"dose",text:`Clark's rule 계산값은 (${patient.weight}kg ÷ 68kg) × ${patient.adultDose}mg = ${clarkDose}mg입니다. 처방 ${patient.dose}${patient.unit}, 1회 최대 ${patient.maxDose}${patient.unit}와 대조하세요.`},
    {category:"route",text:`처방 경로는 ${patient.route}이며 준비 기구는 ${patient.tool}입니다. 약물·용량·경로·시간(${patient.time})을 모두 대조하세요.`}
  ];
});

let selected = [];
let activeCategory = "combination";
let lastIssues = [];
let activeLinkedPatient = -1;

const $ = (selector) => document.querySelector(selector);
const searchInput = $("#drug-search");
const resultsEl = $("#search-results");
const basketList = $("#basket-list");
const basketEmpty = $("#basket-empty");
const checkButton = $("#check-button");
const resultSection = $("#result-section");

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function normalize(value) { return value.toLowerCase().replace(/\s+/g, ""); }

function renderSearch(query = "") {
  const normalized = normalize(query);
  if (!normalized) {
    resultsEl.innerHTML = '<div class="result-placeholder">약 이름을 검색하면 제품명, 성분과 제조사를 확인할 수 있습니다.</div>';
    return;
  }
  const matches = drugs.filter((drug) => normalize([drug.name, drug.short, drug.ingredient, drug.maker, ...drug.tags].join(" ")).includes(normalized));
  $("#search-status").textContent = `${matches.length}개 제품을 찾았습니다.`;
  if (!matches.length) {
    resultsEl.innerHTML = '<div class="result-placeholder"><strong>검색 결과가 없습니다.</strong><br>제품명의 일부나 성분명으로 다시 검색해 보세요.</div>';
    return;
  }
  resultsEl.innerHTML = matches.map((drug) => {
    const isAdded = selected.some((item) => item.id === drug.id);
    return `<article class="drug-row">
      <div><p class="drug-name">${escapeHtml(drug.name)}</p><div class="drug-meta"><span>제품코드 ${drug.id}</span><span>성분 ${escapeHtml(drug.ingredient)}</span><span>${escapeHtml(drug.maker)}</span></div></div>
      <button class="add-button" type="button" data-add="${drug.id}" ${isAdded ? "disabled" : ""}>${isAdded ? "추가됨" : "+ 추가"}</button>
    </article>`;
  }).join("");
}

function renderBasket() {
  basketEmpty.hidden = selected.length > 0;
  basketList.hidden = selected.length === 0;
  $("#basket-count").textContent = `${selected.length}개 선택`;
  checkButton.disabled = selected.length === 0;
  basketList.innerHTML = selected.map((drug, index) => `<li class="basket-item"><div><strong>${index + 1}. ${escapeHtml(drug.short)}</strong><span>${escapeHtml(drug.ingredient)}</span></div><button class="remove-button" type="button" data-remove="${drug.id}" aria-label="${escapeHtml(drug.short)} 삭제">×</button></li>`).join("");
  renderSearch(searchInput.value);
}

function addDrug(id) {
  const drug = drugs.find((item) => item.id === id);
  if (!drug || selected.some((item) => item.id === id)) return;
  selected.push(drug);
  renderBasket();
  showToast(`${drug.short}을 선택했습니다.`);
}

function removeDrug(id) {
  selected = selected.filter((item) => item.id !== id);
  renderBasket();
}

function buildIssues() {
  const issues = [];
  selected.forEach((drug) => {
    (singleRules[drug.id] || []).forEach((rule) => issues.push({ ...rule, drugIds: [drug.id], drugNames: [drug.short] }));
  });
  pairRules.forEach((rule) => {
    if (rule.ids.every((id) => selected.some((drug) => drug.id === id))) {
      issues.push({ ...rule, drugIds: rule.ids, drugNames: rule.ids.map((id) => drugs.find((drug) => drug.id === id).short) });
    }
  });
  return issues;
}

function renderTabs() {
  const tabList = $("#category-tabs");
  tabList.innerHTML = categories.map((category) => {
    const count = lastIssues.filter((issue) => issue.category === category.key).length;
    return `<button id="tab-${category.key}" class="category-tab" type="button" role="tab" aria-selected="${activeCategory === category.key}" aria-controls="panel-${category.key}" data-category="${category.key}">${category.label}<span class="count">${count}</span></button>`;
  }).join("");
}

function renderDetail() {
  const category = categories.find((item) => item.key === activeCategory);
  const issues = lastIssues.filter((issue) => issue.category === activeCategory);
  const detail = $("#result-detail");
  detail.setAttribute("role", "tabpanel");
  detail.id = "result-detail";
  detail.setAttribute("aria-labelledby", `tab-${activeCategory}`);
  detail.innerHTML = `<div class="detail-intro"><h3>${category.label}</h3><p>${category.description}</p></div>` + (issues.length
    ? `<ul class="issue-list">${issues.map((issue) => `<li class="issue-item"><div class="issue-drugs"><strong>${issue.drugNames.map(escapeHtml).join(" + ")}</strong><small>${issue.drugIds.length > 1 ? "약물 조합 확인" : "제품별 주의 확인"}</small></div><div class="issue-explanation">${escapeHtml(issue.text)}</div></li>`).join("")}</ul>`
    : '<div class="no-issue">선택한 약에서 해당 항목이 확인되지 않았습니다.<span>미확인은 안전을 보장한다는 의미가 아닙니다.</span></div>');
}

function runCheck() {
  lastIssues = buildIssues();
  const counts = categories.map((category) => ({ ...category, count: lastIssues.filter((issue) => issue.category === category.key).length }));
  const firstWithIssue = counts.find((category) => category.count > 0);
  activeCategory = firstWithIssue ? firstWithIssue.key : "combination";
  $("#result-total").textContent = lastIssues.length;
  const banner = $("#summary-banner");
  banner.className = `summary-banner ${lastIssues.length ? "warning" : "safe"}`;
  banner.innerHTML = lastIssues.length
    ? `<strong>전문가 확인 권장:</strong> 선택한 ${selected.length}개 제품에서 ${lastIssues.length}건의 금기·주의 정보를 찾았습니다. 임의로 복용을 중단하지 마세요.`
    : `<strong>현재 예시 기준에서 특이사항이 없습니다.</strong> 개인 상태와 실제 처방 용량에 따라 결과가 달라질 수 있습니다.`;
  renderTabs();
  renderDetail();
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetAll() {
  selected = [];
  lastIssues = [];
  searchInput.value = "";
  resultSection.hidden = true;
  renderBasket();
  searchInput.focus();
  window.scrollTo({ top: 250, behavior: "smooth" });
}

function renderLinkedPatients(){
  const list=$("#linked-patient-list");
  list.innerHTML=linkedPatients.map((patient,index)=>`<button class="linked-patient-button ${activeLinkedPatient===index?"active":""}" type="button" data-linked-patient="${index}">
    <strong>${escapeHtml(patient.bed)} · ${escapeHtml(patient.initials)}</strong>
    <span>${escapeHtml(patient.age)} · ${patient.weight}kg</span>
    <span>${escapeHtml(patient.medication)} ${patient.dose}${escapeHtml(patient.unit)}</span>
    <span>${escapeHtml(patient.route)} · ${escapeHtml(patient.time)}</span>
  </button>`).join("");
}

function selectLinkedPatient(index){
  const patient=linkedPatients[index];
  if(!patient)return;
  activeLinkedPatient=index;
  const drug=drugs.find((item)=>item.id===`SIM-${patient.id}`);
  selected=drug?[drug]:[];
  searchInput.value=patient.medication;
  renderLinkedPatients();
  renderBasket();
  const clarkDose=Math.round((patient.weight/68)*patient.adultDose*10)/10;
  const doseMatches=Math.abs(clarkDose-patient.dose)<0.11&&patient.dose<=patient.maxDose;
  const expectedTool={neb:"네뷸라이저",im:"근육주사용 주사기",po:"경구용 약컵"}[patient.routeKey];
  const routeMatches=expectedTool===patient.tool;
  const checks=patient.checks||{};
  const completedChecks=[checks.card,checks.wrist,checks.weight,checks.compared,checks.prepared].filter(Boolean).length;
  const detail=$("#linked-patient-detail");
  detail.hidden=false;
  detail.innerHTML=`<div class="patient-data-grid">
    <div><span>환자</span><b>${escapeHtml(patient.initials)} (${escapeHtml(patient.age)})</b></div>
    <div><span>체중</span><b>${patient.weight}kg · ${escapeHtml(patient.measured)}</b></div>
    <div><span>처방</span><b>${escapeHtml(patient.medication)} ${patient.dose}${escapeHtml(patient.unit)}</b></div>
    <div><span>경로·시간</span><b>${escapeHtml(patient.route)} · ${escapeHtml(patient.time)}</b></div>
    <div><span>Clark's rule</span><b>${clarkDose}mg</b></div>
    <div><span>1회 최대용량</span><b>${patient.maxDose}${escapeHtml(patient.unit)}</b></div>
    <div><span>준비 기구</span><b>${escapeHtml(patient.tool)}</b></div>
    <div><span>게임 안전확인</span><b>${completedChecks}/5 완료</b></div>
  </div>
  <ul class="linked-alerts">
    <li class="${doseMatches?"ok":""}">${doseMatches?"용량 일치":"용량 재확인 필요"}: 체중 기반 계산값 ${clarkDose}mg과 처방 ${patient.dose}${escapeHtml(patient.unit)}을 대조했습니다.</li>
    <li class="${routeMatches?"ok":""}">${routeMatches?"경로·기구 일치":"경로·기구 불일치"}: ${escapeHtml(patient.route)} 처방에 ${escapeHtml(patient.tool)}을 사용합니다.</li>
    <li>소아 환자는 성인 용량을 그대로 적용하지 않습니다. 투약 전 환자·약물·용량·경로·시간을 다시 확인하세요.</li>
  </ul>
  <p class="linked-source">교육용 시뮬레이션 데이터입니다. 실제 임상 판단이나 처방에 사용하지 마세요.</p>`;
  resultSection.hidden=true;
  showToast(`${patient.bed} 처방과 환자정보를 불러왔습니다.`);
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

$("#search-form").addEventListener("submit", (event) => { event.preventDefault(); renderSearch(searchInput.value); });
searchInput.addEventListener("input", () => renderSearch(searchInput.value));
resultsEl.addEventListener("click", (event) => { const button = event.target.closest("[data-add]"); if (button) addDrug(button.dataset.add); });
basketList.addEventListener("click", (event) => { const button = event.target.closest("[data-remove]"); if (button) removeDrug(button.dataset.remove); });
document.querySelectorAll("[data-query]").forEach((button) => button.addEventListener("click", () => { searchInput.value = button.dataset.query; renderSearch(searchInput.value); searchInput.focus(); }));
$("#category-tabs").addEventListener("click", (event) => { const button = event.target.closest("[data-category]"); if (!button) return; activeCategory = button.dataset.category; renderTabs(); renderDetail(); });
checkButton.addEventListener("click", runCheck);
$("#reset-button").addEventListener("click", resetAll);
$("#linked-patient-list").addEventListener("click",(event)=>{
  const button=event.target.closest("[data-linked-patient]");
  if(button)selectLinkedPatient(Number(button.dataset.linkedPatient));
});

renderSearch();
renderBasket();
renderLinkedPatients();
