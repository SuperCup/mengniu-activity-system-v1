
/* ---------- 模型扩展：版本 / 审批快照 / 驳回留痕 ---------- */
PROJECTS.forEach(function(p){
  if(p.version == null) p.version = 1;
  if(p.rejectLog == null) p.rejectLog = [];
  if(p.snapshot === undefined) p.snapshot = null;
});

/* 执行中的项目补一份审批快照，用于「补参页顶部只读方案」 */
(function(){
  var proj = PROJECTS.filter(function(x){ return x.id === 'MN-WX-202612-0041'; })[0];
  if(!proj) return;
  proj.snapshot = {
    version: 1,
    at: '2026-10-18 15:10',
    project: { name:proj.name, budget:proj.budget, vendor:proj.vendor },
    plans: (proj.planBrief || []).map(function(b){
      var hit = (window.PLANS || []).filter(function(x){ return x.name === b.name; })[0] || {};
      return { id:hit.id || '', name:b.name, mech:b.mech, s:hit.s || '', e:hit.e || '', budget:hit.budget || 0 };
    })
  };
})();
