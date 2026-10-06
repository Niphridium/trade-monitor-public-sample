const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../model.js');
test('fixture is deterministic, valid and explicitly fictitious',()=>{
 const candles=M.createCandles();assert.deepEqual(candles,M.createCandles());assert.notDeepEqual(candles,M.createCandles(7));assert.equal(candles.length,96);
 for(const[c,i]of candles.map((c,i)=>[c,i])){assert.equal(c.symbol,'DEMO/USDT');assert.equal(c.index,i);assert.ok(c.low<=Math.min(c.open,c.close));assert.ok(c.high>=Math.max(c.open,c.close));assert.ok(c.buyQuoteVolume>=0&&c.buyQuoteVolume<=c.quoteVolume);if(i)assert.equal(Date.parse(c.time)-Date.parse(candles[i-1].time),60000);}
});
test('default review has three events and five signals with correct membership',()=>{
 const alerts=M.analyze(M.createCandles()),groups=M.groupAlerts(alerts);assert.equal(alerts.length,5);assert.deepEqual(groups.map(g=>[g.minute,g.alerts.map(a=>a.rule)]),[[36,['R04','R05']],[64,['R04','R05']],[84,['R05']]]);assert.equal(new Set(alerts.map(a=>a.id)).size,5);assert.ok(alerts.every(a=>a.synthetic));
});
test('baseline excludes current minute and needs twenty preceding minutes',()=>{
 const rows=M.createCandles().slice(0,21).map(c=>({...c,quoteVolume:100,buyQuoteVolume:50}));rows[19].quoteVolume=10000;rows[20].quoteVolume=500;rows[20].buyQuoteVolume=250;
 const alerts=M.analyze(rows);assert.deepEqual(alerts.map(a=>a.id),['demo-r04-20']);assert.equal(alerts[0].value,5);assert.equal(alerts[0].evidence.baseline,100);
});
test('side threshold equality, buy and sell are handled without mutation',()=>{
 const rows=M.createCandles().slice(0,23).map(c=>({...c,quoteVolume:1000,buyQuoteVolume:500}));rows[20].buyQuoteVolume=800;rows[21].buyQuoteVolume=200;rows[22].buyQuoteVolume=799;
 const before=JSON.stringify(rows),alerts=M.analyze(rows);assert.deepEqual(alerts.map(a=>[a.minute,a.evidence.side]),[[20,'buy'],[21,'sell']]);assert.equal(JSON.stringify(rows),before);
});
test('stricter thresholds remove events; invalid thresholds reject',()=>{
 assert.equal(M.analyze(M.createCandles(),{volumeMultiple:15,sidePercent:100}).length,0);assert.throws(()=>M.analyze([],{sidePercent:49}));assert.throws(()=>M.analyze([],{volumeMultiple:0}));assert.throws(()=>M.analyze([],{sidePercent:NaN}));
});
test('export contains generated context and can reproduce both selected rules',()=>{
 const candles=M.createCandles(),group=M.groupAlerts(M.analyze(candles))[0],bundle=M.evidenceBundle(candles,group,{volumeMultiple:5,sidePercent:80});assert.equal(bundle.synthetic,true);assert.equal(bundle.candles.length,21);assert.deepEqual(M.analyze(bundle.candles),group.alerts);bundle.candles[0].close=0;assert.notEqual(candles[16].close,0);
});
