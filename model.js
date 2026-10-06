/* Independent synthetic demonstration. No market data or production code. */
(function(root,factory){const model=factory();if(typeof module==='object'&&module.exports)module.exports=model;else root.DemoModel=model;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const SYMBOL='DEMO/USDT',START=Date.UTC(2026,0,15,12,0),WINDOW=20;
 const round=(n,d=2)=>Number(n.toFixed(d));
 function createCandles(seed=20260115){
  let state=seed>>>0,close=100;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  return Array.from({length:96},(_,i)=>{
   const open=close,change=(random()-.48)*.24+(i===36?.85:i===64?-.92:0);
   close=round(open+change,4);
   const quote=round((108000+random()*24000)*(i===36?8:i===64?11:1));
   const share=i===36?.94:i===64?.09:i===84?.95:.40+random()*.20;
   return {index:i,time:new Date(START+i*60000).toISOString(),symbol:SYMBOL,open,high:round(Math.max(open,close)+.04+random()*.10,4),low:round(Math.min(open,close)-.04-random()*.10,4),close,quoteVolume:quote,buyQuoteVolume:round(quote*share)};
  });
 }
 function median(values){if(!values.length)throw new Error('Median needs values');const sorted=[...values].sort((a,b)=>a-b),m=Math.floor(sorted.length/2);return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;}
 function analyze(candles,{volumeMultiple=5,sidePercent=80}={}){
  if(!Number.isFinite(volumeMultiple)||volumeMultiple<=0||!Number.isFinite(sidePercent)||sidePercent<50||sidePercent>100)throw new Error('Invalid thresholds');
  const alerts=[];
  candles.forEach((c,i)=>{
   if(i<WINDOW)return;
   const baseline=median(candles.slice(i-WINDOW,i).map(x=>x.quoteVolume));
   const multiple=c.quoteVolume/baseline,buyShare=c.buyQuoteVolume/c.quoteVolume*100,side=buyShare>=50?'buy':'sell',dominantShare=Math.max(buyShare,100-buyShare);
   const common={minute:c.index,time:c.time,symbol:SYMBOL,synthetic:true};
   if(multiple>=volumeMultiple)alerts.push({...common,id:`demo-r04-${c.index}`,rule:'R04',value:multiple,threshold:volumeMultiple,evidence:{quoteVolume:c.quoteVolume,baseline,previousMinutes:WINDOW,multiple}});
   if(dominantShare>=sidePercent)alerts.push({...common,id:`demo-r05-${c.index}`,rule:'R05',value:dominantShare,threshold:sidePercent,evidence:{quoteVolume:c.quoteVolume,buyQuoteVolume:c.buyQuoteVolume,sellQuoteVolume:round(c.quoteVolume-c.buyQuoteVolume),dominantShare,side}});
  });
  return alerts;
 }
 function groupAlerts(alerts){const groups=new Map();for(const a of alerts){if(!groups.has(a.minute))groups.set(a.minute,{id:`demo-event-${a.minute}`,minute:a.minute,time:a.time,alerts:[]});groups.get(a.minute).alerts.push(a);}return [...groups.values()].sort((a,b)=>a.minute-b.minute);}
 function evidenceBundle(candles,group,thresholds){return {format:'trade-monitor-synthetic-sample-v1',synthetic:true,source:'Deterministic generated fixture; no exchange data',symbol:SYMBOL,thresholds:{...thresholds},event:JSON.parse(JSON.stringify(group)),candles:JSON.parse(JSON.stringify(candles.slice(Math.max(0,group.minute-WINDOW),group.minute+1)))};}
 return {SYMBOL,WINDOW,createCandles,median,analyze,groupAlerts,evidenceBundle};
});
