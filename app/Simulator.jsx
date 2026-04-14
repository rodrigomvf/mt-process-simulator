"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ═══ i18n ═══ */
var T={
  pt:{
    login:"Entrar",user:"Usuario",pass:"Senha",loginErr:"Usuario ou senha incorretos",
    title:"MINERAL TECHNOLOGIES",sub:"PROCESS SIMULATOR",stages:"Etapas",params:"Parametros",
    reset:"Reset",clear:"Limpar",steps:"etapas",equip:"equip",connx:"conex",
    addClick:"Clique para adicionar",selStage:"Selecione uma etapa para editar",
    input:"ENTRADA",output:"SAIDA CALCULADA",paramTitle:"PARAMETROS",eqTitle:"EQUIPAMENTOS",
    catalog:"CATALOGO",remove:"Remover",connectMsg:"Clique na entrada de outra etapa",
    buildLine:"Monte sua linha de producao",buildSub:"Adicione etapas ou clique Reset",
    logout:"Sair",lang:"EN",
    feed:"Alimentacao",crushing:"Britagem",screening:"Peneiramento",grinding:"Moagem",
    classification:"Classificacao",gravity:"Conc.Gravitica",magnetic:"Sep.Magnetica",
    flotation:"Flotacao",thickening:"Espessamento",filtration:"Filtragem",tailings:"Disp.Rejeitos",
    tph:"Vazao",pctSol:"%Solidos",fe:"Fe",sio2:"SiO2",al2o3:"Al2O3",p80:"P80",h2o:"Agua",
    capLim:"Cap.Limite",efic:"Eficiencia",energia:"Energia",recMass:"Rec.Massica",
    recMet:"Rec.Metalurg",cutSize:"Malha Corte",splitU:"Split Under",p80out:"P80 Prod",
    pctSolOp:"%Sol Oper",d50:"d50 Corte",splitUF:"Split UF",pctSolOF:"%Sol OF",
    feConc:"Fe Conc",sio2Conc:"SiO2 Conc",pctSolC:"%Sol Conc",pctSolUF:"%Sol UF",
    recH2O:"Rec.Agua",flocDose:"Floculante",umid:"Umid.Torta",pctSolD:"%Sol Disp",
    umidF:"Umid.Final",recMetLabel:"Rec.Metalurg",
    scalping:"Scalping",britPrim:"Britagem Primaria",britSec:"Britagem Secundaria",
    penUmido:"Peneir. Umido",moagSAG:"Moagem SAG",classPrim:"Classif. Primaria",
    remoagem:"Remoagem",classFinos:"Classif. Finos",espRougher:"Espirais Rougher",
    espCleaner:"Espirais Cleaner",sepMag:"Sep. Magnetica",flotRoug:"Flotacao Rougher",
    flotClean:"Flotacao Cleaner",espConc:"Espes. Concentrado",filtFinal:"Filtragem Final",
    espRej:"Espes. Rejeitos",empSeco:"Empilhamento Seco",recROM:"Recebimento ROM"
  },
  en:{
    login:"Login",user:"Username",pass:"Password",loginErr:"Invalid username or password",
    title:"MINERAL TECHNOLOGIES",sub:"PROCESS SIMULATOR",stages:"Stages",params:"Parameters",
    reset:"Reset",clear:"Clear",steps:"stages",equip:"equip",connx:"conn",
    addClick:"Click to add",selStage:"Select a stage to edit",
    input:"INPUT",output:"CALCULATED OUTPUT",paramTitle:"PARAMETERS",eqTitle:"EQUIPMENT",
    catalog:"CATALOG",remove:"Remove",connectMsg:"Click the input port of another stage",
    buildLine:"Build your production line",buildSub:"Add stages or click Reset",
    logout:"Logout",lang:"PT",
    feed:"Feed",crushing:"Crushing",screening:"Screening",grinding:"Grinding",
    classification:"Classification",gravity:"Gravity Conc.",magnetic:"Magnetic Sep.",
    flotation:"Flotation",thickening:"Thickening",filtration:"Filtration",tailings:"Tailings",
    tph:"Flow",pctSol:"%Solids",fe:"Fe",sio2:"SiO2",al2o3:"Al2O3",p80:"P80",h2o:"Water",
    capLim:"Max Cap.",efic:"Efficiency",energia:"Energy",recMass:"Mass Rec.",
    recMet:"Metal Rec.",cutSize:"Cut Size",splitU:"Split Under",p80out:"P80 Prod",
    pctSolOp:"%Sol Oper",d50:"d50 Cut",splitUF:"Split UF",pctSolOF:"%Sol OF",
    feConc:"Fe Conc",sio2Conc:"SiO2 Conc",pctSolC:"%Sol Conc",pctSolUF:"%Sol UF",
    recH2O:"Water Rec.",flocDose:"Flocculant",umid:"Cake Moist.",pctSolD:"%Sol Disp",
    umidF:"Final Moist.",recMetLabel:"Metal Rec.",
    scalping:"Scalping",britPrim:"Primary Crushing",britSec:"Secondary Crushing",
    penUmido:"Wet Screening",moagSAG:"SAG Milling",classPrim:"Primary Classification",
    remoagem:"Regrinding",classFinos:"Fines Classification",espRougher:"Rougher Spirals",
    espCleaner:"Cleaner Spirals",sepMag:"Magnetic Separation",flotRoug:"Rougher Flotation",
    flotClean:"Cleaner Flotation",espConc:"Conc. Thickening",filtFinal:"Final Filtration",
    espRej:"Tailings Thickening",empSeco:"Dry Stacking",recROM:"ROM Receiving"
  }
};

/* ═══ Process Params ═══ */
var PDEFS={
  feed:{p:["tph","pctSol","p80","fe","sio2","al2o3","h2o"],u:["t/h","%","mm","%","%","%","m3/h"],d:[500,95,300,45,25,5,50],
    calc:function(p){return{tph:p[0],pctSol:p[1],p80:p[2],fe:p[3],sio2:p[4],al2o3:p[5],h2o:p[6]};}},
  crushing:{p:["capLim","p80out","efic","energia","recMass"],u:["t/h","mm","%","kWh/t","%"],d:[600,50,92,1.8,98],
    calc:function(p,i){return{tph:Math.min(i.tph||0,p[0])*(p[4]/100),pctSol:i.pctSol||95,p80:p[1],fe:i.fe||0,sio2:i.sio2||0,al2o3:i.al2o3||0,h2o:i.h2o||0};}},
  screening:{p:["capLim","cutSize","efic","splitU","h2o"],u:["t/h","mm","%","%","m3/h"],d:[500,10,90,65,30],
    calc:function(p,i){return{tph:(i.tph||0)*(p[3]/100),pctSol:(i.pctSol||90)-5,p80:p[1]*0.8,fe:(i.fe||0)+1.5,sio2:(i.sio2||0)-1,al2o3:i.al2o3||0,h2o:(i.h2o||0)+p[4]};}},
  grinding:{p:["capLim","p80out","pctSolOp","energia","recMass","h2o"],u:["t/h","um","%","kWh/t","%","m3/h"],d:[300,150,72,12,99,120],
    calc:function(p,i){return{tph:Math.min(i.tph||0,p[0])*(p[4]/100),pctSol:p[2],p80:p[1]/1000,fe:i.fe||0,sio2:i.sio2||0,al2o3:i.al2o3||0,h2o:(i.h2o||0)+p[5]};}},
  classification:{p:["capLim","d50","splitUF","pctSolOF","recMass"],u:["m3/h","um","%","%","%"],d:[400,75,60,15,95],
    calc:function(p,i){return{tph:(i.tph||0)*(1-p[2]/100)*(p[4]/100),pctSol:p[3],p80:(p[1]*0.6)/1000,fe:(i.fe||0)+0.8,sio2:(i.sio2||0)-0.5,al2o3:i.al2o3||0,h2o:i.h2o||0};}},
  gravity:{p:["capLim","recMass","recMet","feConc","sio2Conc","pctSolC","h2o"],u:["t/h","%","%","%","%","%","m3/h"],d:[50,45,78,62,8,55,40],
    calc:function(p,i){return{tph:(i.tph||0)*(p[1]/100),pctSol:p[5],p80:i.p80||0.15,fe:p[3],sio2:p[4],al2o3:(i.al2o3||0)*0.4,h2o:(i.h2o||0)+p[6]};}},
  magnetic:{p:["capLim","recMass","recMet","feConc","sio2Conc","energia"],u:["t/h","%","%","%","%","kWh/t"],d:[100,55,85,65,4,3.5],
    calc:function(p,i){return{tph:(i.tph||0)*(p[1]/100),pctSol:i.pctSol||60,p80:i.p80||0.15,fe:p[3],sio2:p[4],al2o3:(i.al2o3||0)*0.3,h2o:i.h2o||0};}},
  flotation:{p:["capLim","recMass","recMet","feConc","sio2Conc","pctSolC","h2o"],u:["m3","%","%","%","%","%","m3/h"],d:[60,35,88,66,2.5,35,80],
    calc:function(p,i){return{tph:(i.tph||0)*(p[1]/100),pctSol:p[5],p80:i.p80||0.15,fe:p[3],sio2:p[4],al2o3:(i.al2o3||0)*0.2,h2o:(i.h2o||0)+p[6]};}},
  thickening:{p:["capLim","pctSolUF","recH2O","flocDose","recMass"],u:["m3/h","%","%","g/t","%"],d:[500,65,85,25,99],
    calc:function(p,i){return{tph:(i.tph||0)*(p[4]/100),pctSol:p[1],p80:i.p80||0.15,fe:i.fe||0,sio2:i.sio2||0,al2o3:i.al2o3||0,h2o:(i.h2o||0)*(1-p[2]/100)};}},
  filtration:{p:["capLim","umid","energia","recMass"],u:["t/h","%","kWh/t","%"],d:[120,9,2.5,99.5],
    calc:function(p,i){return{tph:(i.tph||0)*(p[3]/100),pctSol:100-p[1],p80:i.p80||0.15,fe:i.fe||0,sio2:i.sio2||0,al2o3:i.al2o3||0,h2o:0};}},
  tailings:{p:["capLim","pctSolD","umidF","recH2O"],u:["t/h","%","%","%"],d:[200,72,15,75],
    calc:function(p,i){return{tph:i.tph||0,pctSol:p[1],p80:i.p80||0.15,fe:i.fe||0,sio2:i.sio2||0,al2o3:i.al2o3||0,h2o:(i.h2o||0)*(1-p[3]/100)};}}
};

var CAT_IDS=["feed","crushing","screening","grinding","classification","gravity","magnetic","flotation","thickening","filtration","tailings"];
var CAT_IC=["A","B","P","M","C","G","S","F","E","L","R"];
var CAT_COL=["#D97706","#DC2626","#7C3AED","#2563EB","#0891B2","#059669","#E11D48","#6D28D9","#0284C7","#4338CA","#65A30D"];
var CAT_EQ=[
  [{id:"af01",model:"MT-AVF",cap:"800t/h"},{id:"af02",model:"MT-SRM",cap:"2000t"}],
  [{id:"br01",model:"MT-BMJ1200",cap:"600t/h"},{id:"br02",model:"MT-BCN800",cap:"400t/h"}],
  [{id:"pn01",model:"MT-PVB2400",cap:"500t/h"},{id:"pn02",model:"MT-PDS1800",cap:"300t/h"},{id:"pn03",model:"MT-GVB",cap:"1000t/h"}],
  [{id:"mo01",model:"MT-MBL3600",cap:"200t/h"},{id:"mo02",model:"MT-SAG5000",cap:"500t/h"},{id:"mo03",model:"MT-VRM2000",cap:"150t/h"}],
  [{id:"cl01",model:"MT-HCL650",cap:"250m3/h"},{id:"cl02",model:"MT-BHC12x250",cap:"600m3/h"}],
  [{id:"gv01",model:"MT-MD20",cap:"6t/h"},{id:"gv02",model:"MT-LD9",cap:"4t/h"},{id:"gv03",model:"MT-WW6",cap:"3t/h"}],
  [{id:"mg01",model:"MT-SMU1200",cap:"80t/h"},{id:"mg03",model:"MT-TMG750",cap:"120t/h"}],
  [{id:"fl01",model:"MT-CFL50",cap:"50m3"},{id:"fl02",model:"MT-COL3000",cap:"80m3"}],
  [{id:"es01",model:"MT-ECV30m",cap:"500m3/h"},{id:"es02",model:"MT-EAT15m",cap:"400m3/h"},{id:"es03",model:"MT-EPT20m",cap:"200m3/h"}],
  [{id:"ft01",model:"MT-FPR2000",cap:"100t/h"},{id:"ft02",model:"MT-FVC",cap:"60t/h"}],
  [{id:"rj01",model:"MT-FRJ2500",cap:"150t/h"},{id:"rj02",model:"MT-SPT",cap:"300m3/h"}]
];

var NW=300,PR=9,CR=12;
function gid(){return"n"+Math.random().toString(36).substr(2,9);}
function cidx(cid){return CAT_IDS.indexOf(cid);}
function fm(v){if(v==null||isNaN(v))return"-";if(Math.abs(v)>=100)return Math.round(v).toString();return Number(v.toFixed(1)).toString();}

function pp(n,s,nh){var h=nh||140;return s==="out"?{x:n.x+NW+PR,y:n.y+h/2}:{x:n.x-PR,y:n.y+h/2};}
function makeRoute(fN,tN,allN,nhM){
  var p1=pp(fN,"out",nhM[fN.id]),p2=pp(tN,"in",nhM[tN.id]);
  var dx=p2.x-p1.x,dy=p2.y-p1.y;
  if(dx>0&&Math.abs(dy)<10)return[p1,p2];
  if(dx>0&&Math.abs(dy)<100){var mx=p1.x+dx/2;return[p1,{x:mx,y:p1.y},{x:mx,y:p2.y},p2];}
  if(dx>0){var mx2=p1.x+dx*0.5;return[p1,{x:mx2,y:p1.y},{x:mx2,y:p2.y},p2];}
  var fH=nhM[fN.id]||140,tH=nhM[tN.id]||140;
  var cY=Math.max(fN.y+fH,tN.y+tH)+40;
  return[p1,{x:p1.x+35,y:p1.y},{x:p1.x+35,y:cY},{x:p2.x-35,y:cY},{x:p2.x-35,y:p2.y},p2];
}
function makePath(pts){
  if(pts.length<2)return"";if(pts.length===2)return"M"+pts[0].x+" "+pts[0].y+"L"+pts[1].x+" "+pts[1].y;
  var d="M"+pts[0].x+" "+pts[0].y;
  for(var i=1;i<pts.length-1;i++){
    var A=pts[i-1],B=pts[i],C=pts[i+1];
    var d1x=Math.sign(B.x-A.x),d1y=Math.sign(B.y-A.y),d2x=Math.sign(C.x-B.x),d2y=Math.sign(C.y-B.y);
    if(d1x===d2x&&d1y===d2y){d+="L"+B.x+" "+B.y;continue;}
    var l1=Math.abs(B.x-A.x)+Math.abs(B.y-A.y),l2=Math.abs(C.x-B.x)+Math.abs(C.y-B.y);
    var r=Math.min(CR,l1/2,l2/2);if(r<2){d+="L"+B.x+" "+B.y;continue;}
    var sw=(d1x*d2y-d1y*d2x)>0?1:0;
    d+="L"+(B.x-d1x*r)+" "+(B.y-d1y*r)+"A"+r+" "+r+" 0 0 "+sw+" "+(B.x+d2x*r)+" "+(B.y+d2y*r);
  }
  return d+"L"+pts[pts.length-1].x+" "+pts[pts.length-1].y;
}

function calcMB(nodes,conns){
  var out={},indeg={},adj={};
  for(var i=0;i<nodes.length;i++){indeg[nodes[i].id]=0;adj[nodes[i].id]=[];}
  for(var i=0;i<conns.length;i++){if(indeg[conns[i].to]!==undefined)indeg[conns[i].to]++;if(adj[conns[i].from])adj[conns[i].from].push(conns[i].to);}
  var q=[];for(var i=0;i<nodes.length;i++){if(indeg[nodes[i].id]===0)q.push(nodes[i].id);}
  var order=[],vis={},safe=0;
  while(q.length>0&&safe<500){safe++;var id=q.shift();if(vis[id])continue;vis[id]=true;order.push(id);var nb=adj[id]||[];for(var j=0;j<nb.length;j++){indeg[nb[j]]--;if(indeg[nb[j]]<=0&&!vis[nb[j]])q.push(nb[j]);}}
  for(var i=0;i<nodes.length;i++){if(!vis[nodes[i].id])order.push(nodes[i].id);}
  for(var oi=0;oi<order.length;oi++){
    var id=order[oi],n=null;for(var i=0;i<nodes.length;i++){if(nodes[i].id===id){n=nodes[i];break;}}
    if(!n)continue;var pd=PDEFS[n.categoryId];if(!pd)continue;
    var ups=[];for(var i=0;i<conns.length;i++){if(conns[i].to===id&&out[conns[i].from])ups.push(out[conns[i].from]);}
    var inp={tph:0,pctSol:0,p80:0,fe:0,sio2:0,al2o3:0,h2o:0};
    if(ups.length===1){inp={tph:ups[0].tph||0,pctSol:ups[0].pctSol||0,p80:ups[0].p80||0,fe:ups[0].fe||0,sio2:ups[0].sio2||0,al2o3:ups[0].al2o3||0,h2o:ups[0].h2o||0};}
    else if(ups.length>1){var tot=0;for(var j=0;j<ups.length;j++)tot+=(ups[j].tph||0);inp.tph=tot;if(tot>0){for(var j=0;j<ups.length;j++){var w=(ups[j].tph||0)/tot;inp.pctSol+=(ups[j].pctSol||0)*w;inp.fe+=(ups[j].fe||0)*w;inp.sio2+=(ups[j].sio2||0)*w;inp.al2o3+=(ups[j].al2o3||0)*w;}inp.p80=0;for(var j=0;j<ups.length;j++)inp.p80=Math.max(inp.p80,ups[j].p80||0);}for(var j=0;j<ups.length;j++)inp.h2o+=(ups[j].h2o||0);}
    try{var r=pd.calc(n.pv||pd.d,inp);r._inp=inp;out[id]=r;}catch(e){out[id]={tph:0,pctSol:0,p80:0,fe:0,sio2:0,al2o3:0,h2o:0,_inp:inp};}
  }
  return out;
}

function mkTpl(t){
  var C=[40,390,740,1090],R=[50,280,510,740,970];
  var stg=[
    {c:"feed",col:0,row:0,lk:"recROM",eq:["af01","af02"]},
    {c:"screening",col:1,row:0,lk:"scalping",eq:["pn03"]},
    {c:"crushing",col:2,row:0,lk:"britPrim",eq:["br01"]},
    {c:"crushing",col:3,row:0,lk:"britSec",eq:["br02"]},
    {c:"screening",col:0,row:1,lk:"penUmido",eq:["pn01","pn02"]},
    {c:"grinding",col:1,row:1,lk:"moagSAG",eq:["mo02"]},
    {c:"classification",col:2,row:1,lk:"classPrim",eq:["cl02"]},
    {c:"grinding",col:3,row:1,lk:"remoagem",eq:["mo03"]},
    {c:"classification",col:0,row:2,lk:"classFinos",eq:["cl01"]},
    {c:"gravity",col:1,row:2,lk:"espRougher",eq:["gv01"]},
    {c:"gravity",col:2,row:2,lk:"espCleaner",eq:["gv02","gv03"]},
    {c:"magnetic",col:3,row:2,lk:"sepMag",eq:["mg01"]},
    {c:"flotation",col:0,row:3,lk:"flotRoug",eq:["fl01"]},
    {c:"flotation",col:1,row:3,lk:"flotClean",eq:["fl02"]},
    {c:"thickening",col:2,row:3,lk:"espConc",eq:["es02"]},
    {c:"filtration",col:3,row:3,lk:"filtFinal",eq:["ft01"]},
    {c:"thickening",col:1,row:4,lk:"espRej",eq:["es03"]},
    {c:"tailings",col:2,row:4,lk:"empSeco",eq:["rj01"]}
  ];
  var nodes=[];
  for(var i=0;i<stg.length;i++){
    var s=stg[i],ci=cidx(s.c),eqs=[];
    for(var j=0;j<s.eq.length;j++){for(var k=0;k<CAT_EQ[ci].length;k++){if(CAT_EQ[ci][k].id===s.eq[j])eqs.push({id:CAT_EQ[ci][k].id,model:CAT_EQ[ci][k].model,cap:CAT_EQ[ci][k].cap});}}
    nodes.push({id:gid(),categoryId:s.c,lk:s.lk,x:C[s.col],y:R[s.row],equipment:eqs,order:i+1,pv:PDEFS[s.c].d.slice()});
  }
  var cp=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,6],[6,8],[8,9],[9,10],[10,11],[9,12],[12,13],[13,14],[14,15],[11,14],[13,16],[16,17],[10,16]];
  var conns=[];for(var i=0;i<cp.length;i++)conns.push({from:nodes[cp[i][0]].id,to:nodes[cp[i][1]].id});
  return{nodes:nodes,conns:conns};
}

/* ═══ LOGIN SCREEN ═══ */
function LoginScreen(props){
  var _u=useState(""),user=_u[0],setUser=_u[1];
  var _p=useState(""),pass=_p[0],setPass=_p[1];
  var _e=useState(false),err=_e[0],setErr=_e[1];
  var t=props.t;
  function submit(){
    if(user==="admin"&&pass==="test2017"){props.onLogin();}
    else{setErr(true);setTimeout(function(){setErr(false);},2000);}
  }
  function kd(e){if(e.key==="Enter")submit();}
  return(
    <div style={{width:"100%",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0B0D11 0%,#0f1923 50%,#0B0D11 100%)"}}>
      <div style={{position:"absolute",top:16,right:16}}>
        <button onClick={props.toggleLang} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{t.lang}</button>
      </div>
      <div style={{width:360,padding:40,borderRadius:16,background:"rgba(20,22,30,0.95)",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#059669,#0891B2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",fontFamily:"monospace",margin:"0 auto 16px"}}>MT</div>
          <div style={{fontSize:16,fontWeight:700,color:"#fff",letterSpacing:"0.03em"}}>{t.title}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontFamily:"monospace",marginTop:4}}>{t.sub}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4,textTransform:"uppercase",fontFamily:"monospace"}}>{t.user}</div>
          <input value={user} onChange={function(e){setUser(e.target.value);}} onKeyDown={kd} autoFocus
            style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(0,0,0,0.3)",color:"#E2E8F0",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4,textTransform:"uppercase",fontFamily:"monospace"}}>{t.pass}</div>
          <input type="password" value={pass} onChange={function(e){setPass(e.target.value);}} onKeyDown={kd}
            style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(0,0,0,0.3)",color:"#E2E8F0",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {err&&<div style={{padding:"8px 12px",borderRadius:6,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#EF4444",fontSize:12,marginBottom:14,textAlign:"center"}}>{t.loginErr}</div>}
        <button onClick={submit} style={{width:"100%",padding:"11px",borderRadius:8,background:"linear-gradient(135deg,#059669,#0891B2)",border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"}}>{t.login}</button>
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function App(){
  var _lg=useState("pt"),lang=_lg[0],setLang=_lg[1];
  var _li=useState(false),loggedIn=_li[0],setLoggedIn=_li[1];
  var t=T[lang];
  function toggleLang(){setLang(lang==="pt"?"en":"pt");}

  if(!loggedIn)return <LoginScreen t={t} onLogin={function(){setLoggedIn(true);}} toggleLang={toggleLang}/>;

  return <Simulator t={t} lang={lang} toggleLang={toggleLang} onLogout={function(){setLoggedIn(false);}}/>;
}

function Simulator(props){
  var t=props.t;
  var initData=useMemo(function(){return mkTpl();},[]);
  var _n=useState(initData.nodes),nodes=_n[0],setNodes=_n[1];
  var _c=useState(initData.conns),conns=_c[0],setConns=_c[1];
  var _s=useState(null),selId=_s[0],setSelId=_s[1];
  var _p=useState("Planta Complexa"),projName=_p[0],setProjName=_p[1];
  var _d=useState(null),dragging=_d[0],setDragging=_d[1];
  var _cf=useState(null),cFrom=_cf[0],setCFrom=_cf[1];
  var _t=useState("stages"),tab=_t[0],setTab=_t[1];
  var _hc=useState(null),hovC=_hc[0],setHovC=_hc[1];
  var _nh=useState({}),nodeH=_nh[0],setNodeH=_nh[1];
  var canvasRef=useRef(null),dragOff=useRef({x:0,y:0}),nodeRefs=useRef({});

  var refreshH=useCallback(function(){var h={};var keys=Object.keys(nodeRefs.current);for(var i=0;i<keys.length;i++){var el=nodeRefs.current[keys[i]];if(el)h[keys[i]]=el.offsetHeight;}setNodeH(h);},[]);
  useEffect(function(){var tm=setTimeout(refreshH,120);return function(){clearTimeout(tm);};},[nodes,refreshH]);
  var mb=useMemo(function(){try{return calcMB(nodes,conns);}catch(e){return{};}},[nodes,conns]);
  var totEq=0;for(var i=0;i<nodes.length;i++)totEq+=nodes[i].equipment.length;
  var selN=null,ci=-1;for(var i=0;i<nodes.length;i++){if(nodes[i].id===selId){selN=nodes[i];break;}}
  if(selN)ci=cidx(selN.categoryId);
  var selMB=selN?mb[selN.id]:null;

  function addStage(cId){
    var cii=cidx(cId),cnt=0;for(var i=0;i<nodes.length;i++){if(nodes[i].categoryId===cId)cnt++;}
    var nn={id:gid(),categoryId:cId,lk:null,x:100+(nodes.length%3)*380,y:80+Math.floor(nodes.length/3)*240,equipment:[],order:nodes.length+1,pv:PDEFS[cId].d.slice()};
    setNodes(function(p){return p.concat([nn]);});setSelId(nn.id);setTab("details");
  }
  function rmNode(id){setNodes(function(p){return p.filter(function(n){return n.id!==id;});});setConns(function(p){return p.filter(function(c){return c.from!==id&&c.to!==id;});});if(selId===id){setSelId(null);setTab("stages");}}
  function delConn(i){setConns(function(p){return p.filter(function(_,j){return j!==i;});});setHovC(null);}
  function addEq(nid,eq){setNodes(function(p){return p.map(function(n){return n.id===nid?Object.assign({},n,{equipment:n.equipment.concat([eq])}):n;});});}
  function rmEq(nid,ei){setNodes(function(p){return p.map(function(n){return n.id===nid?Object.assign({},n,{equipment:n.equipment.filter(function(_,i){return i!==ei;})}):n;});});}
  function updPV(id,pi,v){setNodes(function(p){return p.map(function(n){if(n.id!==id)return n;var pv=n.pv.slice();pv[pi]=parseFloat(v)||0;return Object.assign({},n,{pv:pv});});});}

  function onDragStart(nid,cx,cy){
    var nd=null;for(var i=0;i<nodes.length;i++){if(nodes[i].id===nid){nd=nodes[i];break;}}
    if(!nd)return;var cr=canvasRef.current?canvasRef.current.getBoundingClientRect():{left:0,top:0};var se=canvasRef.current?canvasRef.current.parentElement:null;
    dragOff.current={x:cx+(se?se.scrollLeft:0)-cr.left-nd.x,y:cy+(se?se.scrollTop:0)-cr.top-nd.y};setDragging(nid);
  }
  useEffect(function(){
    function mv(e){if(!dragging)return;var cr=canvasRef.current?canvasRef.current.getBoundingClientRect():{left:0,top:0};var se=canvasRef.current?canvasRef.current.parentElement:null;
      var nx=e.clientX+(se?se.scrollLeft:0)-cr.left-dragOff.current.x,ny=e.clientY+(se?se.scrollTop:0)-cr.top-dragOff.current.y;
      setNodes(function(p){return p.map(function(n){return n.id===dragging?Object.assign({},n,{x:nx,y:ny}):n;});});}
    function up(){setDragging(null);setCFrom(null);}
    window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);
    return function(){window.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);};
  },[dragging]);
  function onCE(nid){if(cFrom&&cFrom!==nid){var exists=false;for(var i=0;i<conns.length;i++){if(conns[i].from===cFrom&&conns[i].to===nid){exists=true;break;}}if(!exists)setConns(function(p){return p.concat([{from:cFrom,to:nid}]);});}setCFrom(null);}
  function resetTpl(){var tt=mkTpl();setNodes(tt.nodes);setConns(tt.conns);setSelId(null);}

  function getLabel(n){return n.lk?t[n.lk]||n.lk:t[n.categoryId]||n.categoryId;}

  /* ═══ RENDER ═══ */
  var connEls=[];
  for(var ci2=0;ci2<conns.length;ci2++){
    var cn=conns[ci2],fn=null,tn=null;
    for(var j=0;j<nodes.length;j++){if(nodes[j].id===cn.from)fn=nodes[j];if(nodes[j].id===cn.to)tn=nodes[j];}
    if(!fn||!tn)continue;
    var pts=makeRoute(fn,tn,nodes,nodeH),path=makePath(pts),col=CAT_COL[cidx(fn.categoryId)],isH=hovC===ci2;
    var p2=pts[pts.length-1],prev=pts[pts.length-2],mid=pts[Math.floor(pts.length/2)];
    var ax=Math.atan2(p2.y-prev.y,p2.x-prev.x);
    connEls.push(
      <g key={ci2}>
        <path d={path} stroke="transparent" strokeWidth="22" fill="none" style={{pointerEvents:"stroke",cursor:"pointer"}}
          onMouseEnter={function(idx){return function(){setHovC(idx);};}(ci2)} onMouseLeave={function(){setHovC(null);}}
          onClick={function(idx){return function(e){e.stopPropagation();delConn(idx);};}(ci2)}/>
        <path d={path} stroke={isH?"#EF4444":col} strokeWidth={isH?3:1.8} fill="none" opacity={isH?0.95:0.6} strokeLinecap="round"/>
        {!isH&&<circle r="3" fill={col} opacity="0.7"><animateMotion dur="3s" repeatCount="indefinite" path={path}/></circle>}
        {!isH&&<polygon points={p2.x+","+p2.y+" "+(p2.x-7*Math.cos(ax-0.4))+","+(p2.y-7*Math.sin(ax-0.4))+" "+(p2.x-7*Math.cos(ax+0.4))+","+(p2.y-7*Math.sin(ax+0.4))} fill={col} opacity="0.5"/>}
        {isH&&<g><circle cx={mid.x} cy={mid.y} r="12" fill="#1E2026" stroke="#EF4444" strokeWidth="2"/><text x={mid.x} y={mid.y+1} textAnchor="middle" dominantBaseline="middle" fill="#EF4444" fontSize="11" fontWeight="bold">x</text></g>}
      </g>
    );
  }

  var nodeEls=nodes.map(function(node){
    var ci3=cidx(node.categoryId),col=CAT_COL[ci3],ic=CAT_IC[ci3];
    var o=mb[node.id]||{},overCap=o.tph&&node.pv&&node.pv[0]&&o.tph>node.pv[0],isSel=selId===node.id;
    var stats=[];
    if(o.tph!=null)stats.push({l:t.tph,v:fm(o.tph),u:"t/h",w:overCap});
    if(o.pctSol!=null)stats.push({l:t.pctSol,v:fm(o.pctSol),u:"%"});
    if(o.fe>0)stats.push({l:t.fe,v:fm(o.fe),u:"%"});
    if(o.sio2>0)stats.push({l:t.sio2,v:fm(o.sio2),u:"%"});
    if(o.p80>0)stats.push({l:t.p80,v:o.p80>=1?fm(o.p80)+"mm":fm(o.p80*1000)+"um",u:""});
    if(o.h2o>0)stats.push({l:t.h2o,v:fm(o.h2o),u:"m3/h"});
    return(
      <div key={node.id} ref={function(el){if(el)nodeRefs.current[node.id]=el;}}
        onMouseDown={function(e){if(e.button!==0)return;e.stopPropagation();setSelId(node.id);setTab("details");onDragStart(node.id,e.clientX,e.clientY);}}
        onClick={function(e){e.stopPropagation();setSelId(node.id);setTab("details");}}
        style={{position:"absolute",left:node.x,top:node.y,width:NW,
          background:isSel?"rgba(28,30,38,0.99)":"rgba(20,22,28,0.97)",
          border:"2px solid "+(isSel?col:overCap?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.07)"),
          borderRadius:12,cursor:"grab",zIndex:isSel?10:2,
          boxShadow:isSel?"0 0 20px "+col+"30":"0 3px 14px rgba(0,0,0,0.3)",userSelect:"none"}}>
        <div onMouseDown={function(e){e.stopPropagation();}} onMouseUp={function(){if(cFrom)onCE(node.id);}}
          style={{position:"absolute",left:-PR,top:"50%",transform:"translateY(-50%)",width:PR*2,height:PR*2,borderRadius:"50%",background:cFrom?col:"rgba(255,255,255,0.1)",border:"2px solid "+col,cursor:"pointer",zIndex:20}}/>
        <div onMouseDown={function(e){e.stopPropagation();setCFrom(node.id);}}
          style={{position:"absolute",right:-PR,top:"50%",transform:"translateY(-50%)",width:PR*2,height:PR*2,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"2px solid "+col,cursor:"crosshair",zIndex:20}}/>
        {isSel&&<button onMouseDown={function(e){e.stopPropagation();}} onClick={function(e){e.stopPropagation();rmNode(node.id);}}
          style={{position:"absolute",top:-9,right:-9,width:20,height:20,borderRadius:"50%",background:"#1E2026",border:"2px solid rgba(239,68,68,0.5)",color:"#EF4444",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,padding:0}}>x</button>}
        <div style={{padding:"9px 12px 5px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:7,background:col+"1A",border:"1px solid "+col+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:col,flexShrink:0,fontFamily:"monospace"}}>{ic}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.06em",color:col,textTransform:"uppercase",fontFamily:"monospace"}}>{t[node.categoryId]||node.categoryId}</div>
            <div style={{fontSize:11.5,fontWeight:600,color:"#E2E8F0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{getLabel(node)}</div>
          </div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.2)",fontFamily:"monospace",background:"rgba(255,255,255,0.03)",padding:"2px 5px",borderRadius:4}}>#{node.order}</div>
        </div>
        {node.equipment.length>0&&<div style={{padding:"4px 12px",display:"flex",flexWrap:"wrap",gap:3}}>
          {node.equipment.map(function(eq,i){return <span key={i} style={{fontSize:8.5,padding:"1px 6px",borderRadius:14,background:col+"12",color:col,border:"1px solid "+col+"28",fontFamily:"monospace"}}>{eq.model}</span>;})}
        </div>}
        {stats.length>0&&<div style={{padding:"3px 12px 7px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"2px 4px"}}>
          {stats.slice(0,6).map(function(s,i){return(
            <div key={i} style={{padding:"2px 4px",borderRadius:4,background:s.w?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.02)",border:s.w?"1px solid rgba(239,68,68,0.12)":"1px solid rgba(255,255,255,0.03)"}}>
              <div style={{fontSize:7,color:s.w?"#EF4444":"rgba(255,255,255,0.28)",fontFamily:"monospace",textTransform:"uppercase"}}>{s.l}</div>
              <div style={{fontSize:9.5,fontWeight:600,color:s.w?"#EF4444":"#E2E8F0",fontFamily:"monospace"}}>{s.v} <span style={{fontSize:7,color:"rgba(255,255,255,0.25)"}}>{s.u}</span></div>
            </div>
          );})}
        </div>}
      </div>
    );
  });

  /* sidebar details */
  var sideDetails=null;
  if(selN&&ci>=0){
    var pd=PDEFS[selN.categoryId];
    var paramRows=pd.p.map(function(pk,pi){
      var val=selN.pv?selN.pv[pi]:pd.d[pi];
      var isOver=pi===0&&selMB&&selMB.tph>val;
      return(<div key={pk} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 5px",borderRadius:5,background:isOver?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.02)",border:isOver?"1px solid rgba(239,68,68,0.12)":"1px solid rgba(255,255,255,0.04)",marginBottom:2}}>
        <div style={{flex:1,fontSize:9.5,color:isOver?"#EF4444":"rgba(255,255,255,0.5)"}}>{t[pk]||pk}</div>
        <input type="number" value={val} step={val>=100?10:val>=10?1:0.1} onChange={function(idx){return function(e){updPV(selId,idx,e.target.value);};}(pi)}
          style={{width:62,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"3px 5px",color:isOver?"#EF4444":"#E2E8F0",fontSize:10,outline:"none",fontFamily:"monospace",textAlign:"right"}}/>
        <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",fontFamily:"monospace",minWidth:28,textAlign:"right"}}>{pd.u[pi]}</span>
      </div>);
    });
    var col2=CAT_COL[ci];
    sideDetails=(
      <div>
        <div style={{padding:10,borderRadius:8,background:col2+"0A",border:"1px solid "+col2+"30",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:6,background:col2+"1A",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:col2,fontFamily:"monospace",fontSize:14}}>{CAT_IC[ci]}</div>
            <div style={{fontSize:9,color:col2,fontWeight:700,textTransform:"uppercase",fontFamily:"monospace"}}>{t[selN.categoryId]}</div>
          </div>
        </div>
        {selMB&&selMB._inp&&selN.categoryId!=="feed"&&(
          <div style={{padding:8,borderRadius:7,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",marginBottom:8}}>
            <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>{t.input}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 8px",fontSize:9,color:"rgba(255,255,255,0.45)",fontFamily:"monospace"}}>
              <div>{t.tph}: {fm(selMB._inp.tph)}</div><div>{t.pctSol}: {fm(selMB._inp.pctSol)}%</div>
              <div>{t.fe}: {fm(selMB._inp.fe)}%</div><div>{t.sio2}: {fm(selMB._inp.sio2)}%</div>
            </div>
          </div>
        )}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:8,fontWeight:700,color:col2,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>{t.paramTitle}</div>
          {paramRows}
        </div>
        {selMB&&(
          <div style={{padding:8,borderRadius:7,background:col2+"08",border:"1px solid "+col2+"20",marginBottom:8}}>
            <div style={{fontSize:8,fontWeight:700,color:col2,textTransform:"uppercase",marginBottom:4,fontFamily:"monospace"}}>{t.output}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 8px",fontSize:9.5,fontWeight:600,color:"#E2E8F0",fontFamily:"monospace"}}>
              <div><span style={{color:col2,fontSize:8}}>{t.tph}:</span> {fm(selMB.tph)}</div>
              <div><span style={{color:col2,fontSize:8}}>{t.pctSol}:</span> {fm(selMB.pctSol)}%</div>
              <div><span style={{color:col2,fontSize:8}}>{t.fe}:</span> {fm(selMB.fe)}%</div>
              <div><span style={{color:col2,fontSize:8}}>{t.sio2}:</span> {fm(selMB.sio2)}%</div>
            </div>
          </div>
        )}
        <div>
          <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>{t.eqTitle} ({selN.equipment.length})</div>
          {selN.equipment.map(function(eq,i){return(
            <div key={i} style={{padding:"4px 6px",marginBottom:2,borderRadius:5,background:"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",gap:5,border:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{flex:1,fontSize:10}}><span style={{color:col2,fontFamily:"monospace",fontSize:8.5}}>{eq.model}</span> {eq.cap}</div>
              <button onClick={function(){rmEq(selId,i);}} style={{background:"rgba(239,68,68,0.1)",border:"none",color:"#EF4444",borderRadius:4,padding:"1px 5px",cursor:"pointer",fontSize:9}}>x</button>
            </div>
          );})}
          <div style={{marginTop:4,fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>{t.catalog}</div>
          {CAT_EQ[ci].map(function(eq){return(
            <button key={eq.id} onClick={function(){addEq(selId,eq);}}
              style={{padding:"4px 7px",borderRadius:5,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"left",color:"#E2E8F0",fontSize:9.5,width:"100%",marginBottom:2}}>
              <span style={{color:col2,fontFamily:"monospace",fontSize:8.5}}>{eq.model}</span> {eq.cap}
            </button>
          );})}
        </div>
        <button onClick={function(){rmNode(selId);}} style={{marginTop:8,padding:"7px",borderRadius:6,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#EF4444",fontSize:10,fontWeight:600,cursor:"pointer",width:"100%"}}>{t.remove}</button>
      </div>
    );
  }

  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:"#0B0D11",color:"#E2E8F0",fontFamily:"system-ui,sans-serif"}}>
      <div style={{height:46,background:"rgba(15,17,23,0.97)",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",padding:"0 12px",gap:10,flexShrink:0}}>
        <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#059669,#0891B2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>MT</div>
        <div><div style={{fontSize:10.5,fontWeight:700,color:"#fff"}}>{t.title}</div><div style={{fontSize:7.5,color:"rgba(255,255,255,0.3)",fontFamily:"monospace"}}>{t.sub}</div></div>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
        <input value={projName} onChange={function(e){setProjName(e.target.value);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"4px 10px",color:"#E2E8F0",fontSize:12,fontWeight:600,outline:"none",width:200}}/>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:12,fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.4)"}}>
          <span><span style={{color:"#059669",fontWeight:700}}>{nodes.length}</span> {t.steps}</span>
          <span><span style={{color:"#0891B2",fontWeight:700}}>{totEq}</span> {t.equip}</span>
          <span><span style={{color:"#D97706",fontWeight:700}}>{conns.length}</span> {t.connx}</span>
        </div>
        <button onClick={props.toggleLang} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"4px 10px",color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>{t.lang}</button>
        <button onClick={resetTpl} style={{background:"linear-gradient(135deg,#059669,#0891B2)",border:"none",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer"}}>{t.reset}</button>
        <button onClick={function(){setNodes([]);setConns([]);setSelId(null);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"5px 8px",color:"#EF4444",fontSize:10,fontWeight:600,cursor:"pointer"}}>{t.clear}</button>
        <button onClick={props.onLogout} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"5px 10px",color:"rgba(255,255,255,0.5)",fontSize:10,cursor:"pointer"}}>{t.logout}</button>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{width:270,background:"rgba(13,15,21,0.97)",borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <button onClick={function(){setTab("stages");}} style={{flex:1,padding:"9px 0",background:"none",border:"none",color:tab==="stages"?"#fff":"rgba(255,255,255,0.3)",fontSize:10,fontWeight:600,cursor:"pointer",borderBottom:tab==="stages"?"2px solid #059669":"2px solid transparent",textTransform:"uppercase"}}>{t.stages}</button>
            <button onClick={function(){setTab("details");}} style={{flex:1,padding:"9px 0",background:"none",border:"none",color:tab==="details"?"#fff":"rgba(255,255,255,0.3)",fontSize:10,fontWeight:600,cursor:"pointer",borderBottom:tab==="details"?"2px solid #059669":"2px solid transparent",textTransform:"uppercase"}}>{t.params}</button>
          </div>
          <div style={{flex:1,overflow:"auto",padding:8}}>
            {tab==="stages"?(
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",marginBottom:6,fontFamily:"monospace",textTransform:"uppercase"}}>{t.addClick}</div>
                {CAT_IDS.map(function(cid,i){return(
                  <button key={cid} onClick={function(){addStage(cid);}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",textAlign:"left",color:"#E2E8F0",width:"100%",marginBottom:4}}>
                    <div style={{width:30,height:30,borderRadius:7,background:CAT_COL[i]+"1A",border:"1px solid "+CAT_COL[i]+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:CAT_COL[i],flexShrink:0,fontFamily:"monospace"}}>{CAT_IC[i]}</div>
                    <div style={{flex:1,fontSize:11,fontWeight:600}}>{t[cid]||cid}</div>
                    <div style={{fontSize:16,color:CAT_COL[i]}}>+</div>
                  </button>
                );})}
              </div>
            ):sideDetails?sideDetails:(
              <div style={{padding:18,textAlign:"center",color:"rgba(255,255,255,0.18)"}}>
                <div style={{fontSize:28,marginBottom:8}}>&#9881;</div>
                <div style={{fontSize:11}}>{t.selStage}</div>
              </div>
            )}
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",background:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",backgroundSize:"40px 40px"}}>
          <div ref={canvasRef} data-canvas="true" onClick={function(e){if(e.target===canvasRef.current||e.target.getAttribute("data-canvas"))setSelId(null);}}
            style={{width:1650,minHeight:1200,position:"relative",padding:20}}>
            {nodes.length===0&&<div style={{position:"absolute",top:"38%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",color:"rgba(255,255,255,0.16)",pointerEvents:"none"}}><div style={{fontSize:14,fontWeight:600}}>{t.buildLine}</div><div style={{fontSize:11,marginTop:6}}>{t.buildSub}</div></div>}
            <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:15}}>{connEls}</svg>
            {nodeEls}
            {cFrom&&<div style={{position:"fixed",top:8,left:"50%",transform:"translateX(-50%)",background:"rgba(5,150,105,0.9)",color:"#fff",padding:"6px 16px",borderRadius:16,fontSize:10.5,fontWeight:600,zIndex:100}}>{t.connectMsg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
