(function(){
  "use strict";
  const active=[
    {id:"acetaminophen",name:"Acetaminophen",nameKo:"아세트아미노펜",route:"경구",routeKey:"po",tool:"경구용 주사기",concentrationMgMl:32,concentration:"160 mg/5 mL (32 mg/mL)",doseType:"weight",doseMgKg:15,maxDoseMg:1000,interval:"4–6시간",minAgeMonths:3,monitor:"복용 여부, 체온과 통증 정도를 확인했습니다."},
    {id:"ibuprofen",name:"Ibuprofen",nameKo:"이부프로펜",route:"경구",routeKey:"po",tool:"경구용 주사기",concentrationMgMl:20,concentration:"100 mg/5 mL (20 mg/mL)",doseType:"weight",doseMgKg:10,maxDoseMg:400,dailyMaxMgKg:30,interval:"6–8시간",minAgeMonths:4,exclusions:["탈수","신장질환","NSAID 중복"],monitor:"복용 여부, 탈수 징후와 위장관 불편감을 확인했습니다."},
    {id:"salbutamol",name:"Salbutamol",nameKo:"살부타몰",route:"네뷸라이저 흡입",routeKey:"neb",tool:"네뷸라이저와 마스크",concentrationMgMl:1,concentration:"2.5 mg/2.5 mL (1 mg/mL)",doseType:"fixed",fixedDoseMg:2.5,maxDoseMg:5,interval:"4–6시간",minAgeMonths:48,maxAgeMonths:144,monitor:"호흡수, 심박수와 산소포화도를 확인했습니다."},
    {id:"ondansetron",name:"Ondansetron",nameKo:"온단세트론",route:"정맥주입",routeKey:"iv",tool:"주사기·정맥세트·주입펌프",concentrationMgMl:2,concentration:"4 mg/2 mL (2 mg/mL)",doseType:"weight",doseMgKg:.15,maxDoseMg:8,interval:"4시간",minAgeMonths:6,minInfusionMinutes:15,exclusions:["QT 연장","전해질 이상"],monitor:"심전도 위험요인, 오심·구토와 주입 부위를 확인했습니다."}
  ];
  const needsReview=["Amoxicillin","Ceftriaxone","Dexamethasone","Metoclopramide","Midazolam","Vancomycin"].map(name=>({name,reviewStatus:"needs_review",enabled:false}));
  window.DoseverseDrugDB={version:"2026.11-edu-v1",active,needsReview,all:[...active,...needsReview],get:id=>active.find(d=>d.id===id)};
})();
