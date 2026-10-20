import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

test('breadcrumb tracking fires once, uses localized paths only and does not become a lead',()=>{
  for(const chinese of [false,true]){
    const listeners={},calls=[];
    const link={dataset:{breadcrumbPosition:'2',breadcrumbOwner:'/services/door-repair/'},href:'https://www.adelaidehandymanmelone.com.au/'+(chinese?'zh/':'')+'services/door-repair/?email=private#private',addEventListener:(name,fn)=>{(listeners[name]||=[]).push(fn);},getAttribute:()=>null};
    const document={documentElement:{lang:chinese?'zh-Hans':'en-AU'},querySelectorAll:selector=>selector==='.breadcrumbs a'?[link]:[],querySelector:()=>null,getElementById:()=>null};
    const window={location:{href:'https://www.adelaidehandymanmelone.com.au/'+(chinese?'zh/':'')+'case-studies/north-adelaide-door-repair/?name=private#private',pathname:'/'+(chinese?'zh/':'')+'case-studies/north-adelaide-door-repair/',hash:'',search:'?name=private'},addEventListener:()=>{},matchMedia:()=>({matches:false}),gtag:(...args)=>calls.push(args)};
    const context={document,window,URL,URLSearchParams};
    const script=fs.readFileSync('src/assets/js/site.js','utf8');
    vm.runInNewContext(script,context);vm.runInNewContext(script,context);
    for(const fn of listeners.click||[])fn();
    assert.equal(calls.length,1);
    assert.equal(calls[0][1],'breadcrumb_click');
    const params=calls[0][2];
    assert.equal(params.target_path,'/'+(chinese?'zh/':'')+'services/door-repair/');
    assert.equal(params.owner_id,params.target_path);
    assert.equal(params.position,2);assert.equal(params.locale,chinese?'zh-Hans':'en-AU');
    assert.equal(params.source_path,window.location.pathname);
    assert.ok(!JSON.stringify(params).includes('private'));
  }
});
