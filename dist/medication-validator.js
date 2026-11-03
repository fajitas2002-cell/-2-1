(function(){
  "use strict";
  function compare(s){
    const c=s.correctPrescription,d=s.displayedPrescription;
    const fields=["drugId","doseMg","concentrationMgMl","volumeMl","route","tool","time"];
    if(c.minInfusionMinutes&&d.infusionMinutes&&d.infusionMinutes<c.minInfusionMinutes)return {safe:false,field:"주입시간"};
    const mismatch=fields.find(k=>String(c[k])!==String(d[k]));
    return mismatch?{safe:false,field:(s.injectedError&&s.injectedError.field)||mismatch}:{safe:true,field:null};
  }
  window.DoseverseValidator={compare};
})();
