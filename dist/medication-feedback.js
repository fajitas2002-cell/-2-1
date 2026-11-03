(function(){
  "use strict";
  window.DoseverseFeedback={
    safe:"처방·약물·환자 정보가 일치합니다. 다음 확인 단계로 진행하세요.",
    caught:field=>`${field} 불일치를 발견했습니다. 투약을 보류하고 처방을 재확인했습니다.`,
    missed:field=>`${field} 오류가 남아 있습니다. 오류를 해결하기 전에는 투약하지 마세요.`
  };
})();
