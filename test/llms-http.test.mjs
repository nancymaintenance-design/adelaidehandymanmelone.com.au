import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('GET llms serves the exact UTF-8 Markdown without cookies, scripts or language redirects', {timeout:20000}, async()=>{
  const child=spawn(process.execPath,['serve.cjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  try{
    const [output]=await once(child.stdout,'data');
    const base=String(output).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
    for(const route of ['/llms.txt','/zh/llms.txt'])for(const language of ['en-AU','zh-CN']){
      const r=await fetch(base+route,{headers:{'Accept-Language':language},redirect:'manual'});
      assert.equal(r.status,200);
      assert.match(r.headers.get('content-type'),/^text\/plain;\s*charset=utf-8$/i);
      assert.equal(r.headers.get('location'),null);
      const text=await r.text();
      assert.equal(text,fs.readFileSync('public'+route,'utf8'));
      assert.match(text,/^# MEL ONE\n/);
      assert.doesNotMatch(text,/<html|<!doctype|captcha|access denied/i);
      assert.ok(text.includes('简体中文'));
    }
  }finally{child.kill();}
});
