import { createClient } from "@supabase/supabase-js";
import "./style.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const defaultRates={cement:420,sand:1800,gsb:1100,wmm:1400,dbm:7500,bc:9500,brick:10,mason:900,helper:600,equip:12000,oh:5,cont:3};
let state={project:{name:"My Civil Project",type:"Road Construction",location:"",client:""},rates:{...defaultRates},estimate:null};

const app=document.querySelector("#root");
const money=n=>"₹"+Math.round(n||0).toLocaleString("en-IN");
const num=v=>Number(v)||0;

function render(){
app.innerHTML=`<header><div class="nav"><b>Civi<span>Calc</span></b><small>PRODUCTION EDITION</small></div><div class="hero"><h1>Civil Engineering Estimation Platform</h1><p>Project quantities, BOQ, rate analysis, resources and preliminary timelines in one workspace.</p></div></header>
<main><nav class="tabs">${["Dashboard","Road","Building","Rates","BOQ","Resources","Timeline","Report"].map((x,i)=>`<button data-tab="${x}" class="${i===0?"active":""}">${x}</button>`).join("")}</nav>
<section id="content"></section></main><footer>Preliminary engineering estimation software. Verify drawings, specifications, applicable standards, local rates and site conditions before tender or construction use.</footer>`;
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>show(b.dataset.tab));
show("Dashboard");
}
function show(tab){
document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
const c=document.querySelector("#content");
if(tab==="Dashboard") c.innerHTML=dashboard();
if(tab==="Road") c.innerHTML=roadForm();
if(tab==="Building") c.innerHTML=buildingForm();
if(tab==="Rates") c.innerHTML=ratesForm();
if(tab==="BOQ") c.innerHTML=boq();
if(tab==="Resources") c.innerHTML=resources();
if(tab==="Timeline") c.innerHTML=timeline();
if(tab==="Report") c.innerHTML=report();
bind(tab);
}
function dashboard(){return `<div class="grid2"><div class="card"><h2>New / Edit Project</h2><div class="form">
<label>Project name<input id="pname" value="${state.project.name}"></label><label>Type<select id="ptype"><option>Road Construction</option><option>Residential Building</option><option>Commercial Building</option><option>Drainage Work</option></select></label>
<label>Location<input id="ploc" value="${state.project.location}"></label><label>Client<input id="pclient" value="${state.project.client}"></label>
<button class="primary full" id="saveProject">Save Project</button></div></div>
<div class="card"><h2>Project Snapshot</h2><div class="stats"><div><small>Status</small><b>${state.estimate?"Calculated":"Ready"}</b></div><div><small>Estimate</small><b>${state.estimate?money(state.estimate.total):"—"}</b></div><div><small>Duration</small><b>${state.estimate?state.estimate.days+" days":"—"}</b></div></div><p class="note">Use the Road or Building module to create a calculation. Your project data is kept in the browser unless Supabase is configured.</p></div></div>`}
function roadForm(){return `<div class="grid2"><div class="card"><h2>Road Estimator</h2><div class="form">${input("L","Length (m)",2000)}${input("W","Carriageway (m)",7)}${input("gsb","GSB (mm)",200)}${input("wmm","WMM (mm)",250)}${input("dbm","DBM (mm)",50)}${input("bc","BC (mm)",40)}${input("sh","Shoulder each side (m)",1.5)}${input("rw","Wastage (%)",3)}${input("prod","Productivity (m/day)",60)}<button class="primary full" id="calcRoad">Calculate Road</button></div></div><div class="card"><h2>Calculation</h2><div id="calcOut">${state.estimate?.type==="Road Construction"?summary():empty()}</div></div></div>`}
function buildingForm(){return `<div class="grid2"><div class="card"><h2>Wall / Masonry Estimator</h2><div class="form">${input("bl","Length (m)",20)}${input("bh","Height (m)",3)}${input("bt","Thickness (mm)",230)}${input("bo","Openings (m²)",2)}${input("xl","Brick length (mm)",190)}${input("xh","Brick height (mm)",90)}${input("xw","Brick width (mm)",90)}${input("mr","Mortar ratio 1:",6)}${input("bw","Wastage (%)",5)}${input("bp","Productivity (m³/day)",1.5)}<button class="primary full" id="calcBuilding">Calculate Building</button></div></div><div class="card"><h2>Calculation</h2><div>${state.estimate?.type==="Building Masonry"?summary():empty()}</div></div></div>`}
function input(id,label,value){return `<label>${label}<input id="${id}" type="number" value="${value}"></label>`}
function ratesForm(){let r=state.rates;return `<div class="card"><h2>Rate Database</h2><p class="muted">Example rates only. Replace with current project/local rates.</p><div class="form">${Object.entries({cement:"Cement ₹/bag",sand:"Sand ₹/m³",gsb:"GSB ₹/m³",wmm:"WMM ₹/m³",dbm:"DBM ₹/m³",bc:"BC ₹/m³",brick:"Brick ₹/No",mason:"Mason ₹/day",helper:"Helper ₹/day",equip:"Equipment ₹/day",oh:"Overheads %",cont:"Contingency %"}).map(([k,l])=>input(k,l,r[k])).join("")}<button class="primary full" id="saveRates">Save Rates</button></div></div>`}
function empty(){return `<div class="empty">Enter project values and calculate.</div>`}
function calculateRoad(){
const L=num(document.querySelector("#L").value),W=num(document.querySelector("#W").value),A=L*W,f=1+num(document.querySelector("#rw").value)/100;
const g=A*num(document.querySelector("#gsb").value)/1000*f,w=A*num(document.querySelector("#wmm").value)/1000*f,d=A*num(document.querySelector("#dbm").value)/1000*f,b=A*num(document.querySelector("#bc").value)/1000*f;
const days=Math.max(1,Math.ceil(L/num(document.querySelector("#prod").value))),R=state.rates;
const mat=g*R.gsb+w*R.wmm+d*R.dbm+b*R.bc,crew=4,lab=days*(crew*R.mason+crew*2*R.helper),eq=days*R.equip,oh=(mat+lab+eq)*R.oh/100,ct=(mat+lab+eq+oh)*R.cont/100;
state.estimate={type:"Road Construction",days,crew,material:mat,labour:lab,equipment:eq,overhead:oh,contingency:ct,total:mat+lab+eq+oh+ct,items:[["GSB","m³",g,R.gsb],["WMM","m³",w,R.wmm],["DBM","m³",d,R.dbm],["BC","m³",b,R.bc],["Shoulder","m²",L*num(document.querySelector("#sh").value)*2,0]]};
show("Road");
}
function calculateBuilding(){
const V=Math.max(0,num(document.querySelector("#bl").value)*num(document.querySelector("#bh").value)-num(document.querySelector("#bo").value))*num(document.querySelector("#bt").value)/1000;
const bv=num(document.querySelector("#xl").value)*num(document.querySelector("#xh").value)*num(document.querySelector("#xw").value)/1e9,br=V/(bv*1.18)*(1+num(document.querySelector("#bw").value)/100),mort=Math.max(0,V-br*bv),dry=mort*1.33,cv=dry/(1+num(document.querySelector("#mr").value)),bags=cv/.0347,sand=dry-cv,days=Math.max(1,Math.ceil(V/num(document.querySelector("#bp").value))),R=state.rates,mat=br*R.brick+bags*R.cement+sand*R.sand,crew=2,lab=days*(crew*R.mason+crew*2*R.helper),eq=days*R.equip*.15,oh=(mat+lab+eq)*R.oh/100,ct=(mat+lab+eq+oh)*R.cont/100;
state.estimate={type:"Building Masonry",days,crew,material:mat,labour:lab,equipment:eq,overhead:oh,contingency:ct,total:mat+lab+eq+oh+ct,items:[["Brickwork","m³",V,0],["Bricks","Nos",br,R.brick],["Cement","bags",bags,R.cement],["Sand","m³",sand,R.sand]]};
show("Building");
}
function summary(){let e=state.estimate;return `<div class="stats"><div><small>Type</small><b>${e.type}</b></div><div><small>Duration</small><b>${e.days} days</b></div><div><small>Total</small><b class="green">${money(e.total)}</b></div></div><table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${e.items.map(x=>`<tr><td>${x[0]}</td><td>${x[2].toFixed(2)} ${x[1]}</td><td>${money(x[3])}</td><td>${money(x[2]*x[3])}</td></tr>`).join("")}</table>`}
function boq(){let e=state.estimate;if(!e)return `<div class="card">${empty()}</div>`;return `<div class="card"><h2>BOQ</h2>${summary()}<div class="stats cost"><div>Materials<b>${money(e.material)}</b></div><div>Labour<b>${money(e.labour)}</b></div><div>Equipment<b>${money(e.equipment)}</b></div><div>Overheads<b>${money(e.overhead)}</b></div><div>Contingency<b>${money(e.contingency)}</b></div><div>Total<b class="green">${money(e.total)}</b></div></div><button class="secondary" id="csv">Export CSV</button></div>`}
function resources(){let e=state.estimate;if(!e)return `<div class="card">${empty()}</div>`;return `<div class="card"><h2>Resources & Manpower</h2><table><tr><th>Resource</th><th>Quantity</th><th>Basis</th></tr><tr><td>Core crew</td><td>${e.crew}</td><td>Planning teams</td></tr><tr><td>Helpers</td><td>${e.crew*2}</td><td>Planning allowance</td></tr><tr><td>Supervisor</td><td>1</td><td>Project</td></tr><tr><td>Equipment</td><td>Method dependent</td><td>Site-specific</td></tr></table><p class="note">Productivity and crew assumptions must be reviewed against the actual construction method and site conditions.</p></div>`}
function timeline(){let e=state.estimate;if(!e)return `<div class="card">${empty()}</div>`;return `<div class="card"><h2>Preliminary Timeline</h2><div class="timeline">${["Mobilization","Preparation","Main construction","Finishing / testing","Cleanup"].map(x=>`<div><b>${x}</b><span>${Math.max(1,Math.ceil(e.days/5))} days</span></div>`).join("")}</div><p class="note">Estimated working duration: ${e.days} days. Actual calendar duration depends on dependencies, weather, approvals, resources and working calendar.</p></div>`}
function report(){let e=state.estimate;if(!e)return `<div class="card">${empty()}</div>`;return `<div class="card"><h2>Professional Estimate Report</h2><h3>${state.project.name}</h3><p>${state.project.type} • ${state.project.location||"Location not set"} • ${state.project.client||"Client not set"}</p><h2 class="green">${money(e.total)}</h2><p>Materials: ${money(e.material)} • Labour: ${money(e.labour)} • Equipment: ${money(e.equipment)} • Overheads: ${money(e.overhead)} • Contingency: ${money(e.contingency)}</p><button class="primary" onclick="window.print()">Print / Save PDF</button><p class="note warning">Preliminary estimate. Verify drawings, specifications, rates, taxes, standards, quantities and site conditions before tender/contract use.</p></div>`}
function bind(tab){
if(tab==="Dashboard")document.querySelector("#saveProject").onclick=()=>{state.project={name:document.querySelector("#pname").value,type:document.querySelector("#ptype").value,location:document.querySelector("#ploc").value,client:document.querySelector("#pclient").value};localStorage.setItem("civiProject",JSON.stringify(state.project));render();};
if(tab==="Road")document.querySelector("#calcRoad").onclick=calculateRoad;
if(tab==="Building")document.querySelector("#calcBuilding").onclick=calculateBuilding;
if(tab==="Rates")document.querySelector("#saveRates").onclick=()=>{for(const k of Object.keys(state.rates)){const el=document.querySelector("#"+k);if(el)state.rates[k]=num(el.value)}localStorage.setItem("civiRates",JSON.stringify(state.rates));alert("Rates saved");};
if(tab==="BOQ"&&document.querySelector("#csv"))document.querySelector("#csv").onclick=()=>{const e=state.estimate;const s="Description,Unit,Quantity,Rate,Amount\\n"+e.items.map(x=>`${x[0]},${x[1]},${x[2]},${x[3]},${x[2]*x[3]}`).join("\\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([s],{type:"text/csv"}));a.download="civicalc_boq.csv";a.click()};
}
const savedP=JSON.parse(localStorage.getItem("civiProject")||"null"),savedR=JSON.parse(localStorage.getItem("civiRates")||"null");if(savedP)state.project=savedP;if(savedR)state.rates=savedR;
render();
