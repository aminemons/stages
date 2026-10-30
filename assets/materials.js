'use strict';
// Materials Fonctionnels & Applications: a conservative, non-computational
// selection from the same canonical job IDs. No simulated listings or pay.
const MAT_TOPIC_LABELS = {
  nano:'Nanomatériaux / couches minces',
  characterization:'Caractérisation et laboratoire',
  polymer:'Polymères / composites / biomatériaux',
  energy:'Batteries / photovoltaïque',
  optics:'Optique / semi-conducteurs',
  surface:'Métaux / surfaces / verres'
};
const matNorm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let materialsShown=24;

function materialCategory(j) {
  if(j.materials_exclude || retired(j) || j.duplicate_of || j.cat==='m2' || Number(j.materials_priority)<0) return '';
  const t=matNorm(j.title), full=matNorm([j.title,j.tech,j.materials_focus].join(' '));
  // No programming-/simulation-led internships in this dedicated area.
  if(/modelis|simulat|jumeau numerique|machine learning|programm|developpement logiciel|intelligence artificielle|\bdata\b|donnees|cout de batterie|base de donnees|rationalisation|digitalis|\bplm\b|cfd|calcul scientifique|numerique|algorithm|python|metamodel|ia pour|ia appliquee/.test(t))return '';
  if(/marketing|commercial|supply chain|erp|web|logiciel|business manager|communication|finance|achats|cybersecurite|informatique|management de projet/.test(t))return '';
  // A functional-materials section should not silently recommend jobs demanding code.
  const requirements=matNorm([j.tech,j.eligibility_note].join(' '));
  // Optional Python/Matlab or Excel-based analysis is NOT a software internship.
  // Exclude explicit essential programming; do not infer it from a tool name alone.
  if(j.materials_programming==='essential'||j.materials_programming==='required')return '';
  if(j.materials_programming!=='optional' && /programmation (?:python|matlab|c\+\+|obligatoire|requise)|developpement de code (?:obligatoire|exige)|maitrise de (?:python|c\+\+) exigee/.test(requirements))return '';
  if(!j.materials_focus && !/(materiau|nanomat|polym|rheolog|composite|caracteris|spectros|microstruct|metallurg|cerami|verre|vitr|optiqu|photon|couche mince|microfabri|lithograph|photovolta|batterie|electrochim|corrosion|revetement|traitement de surface|synthese|formul|biomateriau|frittage|polissage|semiconduct|semi-conduct|mesure physico|microstructure|adhesion|chimie du solide|microscop)/.test(t))return '';
  if(/hydrogel|biomateriau|polym|rheolog|composite|formul|adhesif|caoutchouc|elastom|thermoplast/.test(full))return 'polymer';
  if(/nanomat|couche mince|nanopart|depot sous vide|lithograph|microfabri/.test(full))return 'nano';
  if(/batterie|photovolta|electrochim|stockage energie|pile a combustible/.test(full))return 'energy';
  if(/optiqu|photon|semiconduct|semi-conduct|laser|cristal|imageur/.test(full))return 'optics';
  if(/metall|soud|verre|cerami|corrosion|revetement|traitement de surface|polissage|alliage/.test(full))return 'surface';
  return 'characterization';
}

function materialM1Status(j) {
  if(j.materials_eligibility==='confirmed')return 'confirmed';
  if(j.materials_eligibility==='uncertain')return 'uncertain';
  if(j.cat==='m2')return 'excluded';
  const info=matNorm([j.level,j.eligibility_note].join(' '));
  // A broad catalog category or a simple successful HTTP request is not proof.
  if(/a confirmer|non confirme|non explicite|contradictoire|m1 incertain|m1 pas explicitement|en-tete contradictoire/.test(info))return 'uncertain';
  const body=j.audit_evidence_type==='body';
  const accepts=/bac\s*\+\s*4|master\s*1|\bm1\b|quatrieme annee|4eme annee|2eme annee de cycle ingenieur/.test(info);
  const onlyFinal=/(?:exclusivement|uniquement|obligatoirement).{0,25}(?:m2|bac\s*\+\s*5|derniere annee)/.test(info);
  return body && accepts && !onlyFinal ? 'confirmed':'uncertain';
}

function materialScore(j){
  const t=matNorm([j.title,j.tech].join(' '));
  let score=(Number(j.materials_priority)||0)+(materialM1Status(j)==='confirmed'?25:0)+(j.audit_evidence_type==='body'?14:0);
  if(/synthese|caracteris|rheolog|microscop|spectros|couche mince|lithograph|laboratoire|physico|formulation|formul|nanomat/.test(t))score+=12;
  if(j.salary_verified && Number(j.paymin)>0)score+=Math.min(14,Number(j.paymin)/150);
  return score;
}
function filteredMaterials(){
  const term=matNorm($('materials-search').value), topic=$('materials-topic').value;
  const level=$('materials-level').value, pay=$('materials-pay').value;
  const days=$('materials-added').value;
  const result=JOBS.filter(j=>{
    const cat=materialCategory(j);if(!cat)return false;
    if(topic && topic!==cat)return false;
    const eligibility=materialM1Status(j);
    if(level==='confirmed'&&eligibility!=='confirmed')return false;
    if(level==='uncertain'&&eligibility!=='uncertain')return false;
    if(days && (!addedOn(j)||addedOn(j)<recentCutoff(Number(days))))return false;
    if(pay && (!j.salary_verified||!Number(j.paymin) || (pay!=='documented' && Number(j.paymin)<Number(pay))))return false;
    if(term && !matNorm([j.company,j.title,j.city,j.tech,j.materials_focus].join(' ')).includes(term))return false;
    return true;
  });
  const sort=$('materials-sort').value;
  result.sort((a,b)=>sort==='pay'?(Number(b.salary_verified?b.paymin:0)-Number(a.salary_verified?a.paymin:0)||materialScore(b)-materialScore(a)):sort==='recent'?addedOn(b).localeCompare(addedOn(a))||materialScore(b)-materialScore(a):materialScore(b)-materialScore(a)||addedOn(b).localeCompare(addedOn(a)));
  return result;
}
function renderMaterials(){
  if(!$('materialsPanel'))return;
  const pool=JOBS.filter(j=>!!materialCategory(j));
  const matches=filteredMaterials();
  $('material-total').textContent=pool.length;
  $('materials-metric-count').textContent=pool.length+' sujets matériaux présélectionnés';
  const historicallyMaterial=j=>!!materialCategory({...j,closed:false,human_review:'posting_reviewed',availability_state:'listing_visible'});
  const documented=JOBS.filter(j=>historicallyMaterial(j)&&j.audit_evidence_type==='body'&&(j.research_source||j.official_url||j.url));
  const visible=pool.filter(j=>j.audit_evidence_type==='body'&&j.availability_state==='listing_visible').length;
  const m1=pool.filter(j=>materialM1Status(j)==='confirmed').length;
  $('materials-target-progress').textContent=documented.length+' / 400 fiches matériaux relues cumulées · '+visible+' fiches actuellement visibles · '+m1+' Bac+4 étayés · objectif 400';
  $('materials-metric-m1').textContent=pool.filter(j=>materialM1Status(j)==='confirmed').length+' avec Bac+4 étayé';
  $('materials-metric-salary').textContent=pool.filter(j=>j.salary_verified&&Number(j.paymin)>0).length+' rémunérations documentées';
  $('materials-count').textContent=matches.length+' résultat'+(matches.length>1?'s':'');
  $('materials-joblist').innerHTML=matches.slice(0,materialsShown).map(j=>{
    const status=materialM1Status(j)==='confirmed'?'Bac+4 / M1 documenté':'Niveau M1 à confirmer';
    const programming=j.materials_programming==='not_required_in_listing'?'Programmation non demandée dans la fiche':null;
    return '<div class="material-entry"><div class="material-qualifiers"><span>'+esc(j.materials_focus||MAT_TOPIC_LABELS[materialCategory(j)])+'</span><span>'+esc(status)+'</span>'+(programming?'<span>'+esc(programming)+'</span>':'')+'</div>'+row(j)+'</div>';
  }).join('');
  $('materials-empty').hidden=!!matches.length;
  $('materials-more').hidden=matches.length<=materialsShown;
}
['materials-search','materials-topic','materials-level','materials-pay','materials-added','materials-sort'].forEach(id=>{
  $(id).addEventListener('input',()=>{materialsShown=24;renderMaterials()});
});
$('materials-more').addEventListener('click',()=>{materialsShown+=24;renderMaterials()});
renderMaterials();
