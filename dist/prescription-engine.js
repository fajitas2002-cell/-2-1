(function(){
  "use strict";
  const round=(n,d=2)=>Number(Number(n).toFixed(d));
  function calculate(drug,weight){
    const raw=drug.doseType==="fixed"?drug.fixedDoseMg:weight*drug.doseMgKg;
    const dose=round(Math.min(raw,drug.maxDoseMg),2);
    return {rawDoseMg:round(raw,2),doseMg:dose,volumeMl:round(dose/drug.concentrationMgMl,2),capped:raw>drug.maxDoseMg};
  }
  function eligible(drug,patient){
    if(patient.ageMonths<drug.minAgeMonths)return false;
    if(drug.maxAgeMonths&&patient.ageMonths>drug.maxAgeMonths)return false;
    return !(drug.exclusions||[]).some(x=>(patient.risks||[]).includes(x));
  }
  function build(drug,patient,time){
    const calc=calculate(drug,patient.weight);
    return {...calc,drugId:drug.id,medication:`${drug.nameKo} (${drug.name})`,route:drug.route,routeKey:drug.routeKey,tool:drug.tool,concentration:drug.concentration,concentrationMgMl:drug.concentrationMgMl,time,interval:drug.interval,maxDoseMg:drug.maxDoseMg,minInfusionMinutes:drug.minInfusionMinutes||null};
  }
  window.DoseversePrescription={calculate,eligible,build,round};
})();
