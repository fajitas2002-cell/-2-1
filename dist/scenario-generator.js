(function(){
  "use strict";
  function hashSeed(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){let a=hashSeed(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const errorTypes=["wrongDose","wrongConcentration","wrongVolume","wrongRoute","wrongDevice","wrongTime","decimalPoint","rapidInfusion"];
  function inject(correct,drug,random){
    if(random()>.72)return {displayed:{...correct},error:null};
    let type=errorTypes[Math.floor(random()*errorTypes.length)];
    if(type==="rapidInfusion"&&!drug.minInfusionMinutes)type="wrongDose";
    const displayed={...correct};
    if(type==="wrongDose")displayed.doseMg=Number((correct.doseMg*2).toFixed(2));
    if(type==="decimalPoint")displayed.doseMg=Number((correct.doseMg*10).toFixed(2));
    if(type==="wrongConcentration"){
      displayed.concentrationMgMl=Number((correct.concentrationMgMl*2).toFixed(2));
      displayed.concentration=`${displayed.concentrationMgMl} mg/mL (표시값)`;
    }
    if(type==="wrongVolume")displayed.volumeMl=Number((correct.volumeMl*2).toFixed(2));
    if(type==="wrongRoute")displayed.route=correct.routeKey==="po"?"근육주사":"경구";
    if(type==="wrongDevice")displayed.tool="근육주사용 주사기";
    if(type==="wrongTime")displayed.time="18:00";
    if(type==="rapidInfusion")displayed.infusionMinutes=5;
    return {displayed,error:{type,field:{wrongDose:"용량",wrongConcentration:"농도",wrongVolume:"부피",wrongRoute:"투여경로",wrongDevice:"투약기구",wrongTime:"투약시간",decimalPoint:"소수점",rapidInfusion:"주입시간"}[type]}};
  }
  function generate(basePatients,seed){
    const random=rng(seed),db=window.DoseverseDrugDB.active,engine=window.DoseversePrescription;
    return basePatients.map((base,index)=>{
      const eligible=db.filter(d=>engine.eligible(d,base));
      const drug=eligible[Math.floor(random()*eligible.length)];
      const correct=engine.build(drug,base,["09:00","09:30","10:00"][index]);
      const injected=inject(correct,drug,random);
      return {patient:base,drug,correctPrescription:correct,displayedPrescription:injected.displayed,injectedError:injected.error};
    });
  }
  window.DoseverseScenarios={generate};
})();
