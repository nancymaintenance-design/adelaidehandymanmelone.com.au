import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import {load} from 'cheerio';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);

test('unmatched Chinese paths reach a real 404 handler, not a 200 static rewrite',()=>{
  const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
  assert.equal(config.rewrites?.find(r=>r.source==='/zh/:path*')?.destination,'/api/not-found');
  assert.equal(config.rewrites?.find(r=>r.source==='/zh/:path*/')?.destination,'/api/not-found','Vercel requires an explicit trailing-slash fallback as well');
  assert.equal(config.functions?.['api/not-found.js']?.includeFiles,'public/zh/404.html');
});

test('local Chinese 404 retains preview isolation even when launched outside the project directory',async()=>{
  const child=spawn(process.execPath,[fileURLToPath(new URL('../serve.cjs',import.meta.url))],{cwd:tmpdir(),env:{...process.env,PORT:'0'},windowsHide:true});
  try{
    const base=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('preview startup timeout')),10000);
      child.stdout.on('data',data=>{const m=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});
      child.on('error',reject);
      child.on('exit',code=>{clearTimeout(timer);reject(Error('preview exited: '+code));});
    });
    for(const [route,lang,status]of [['/zh/no-such-page/','zh-Hans',404],['/no-such-page/','en-AU',404],['/zh/services/','zh-Hans',200]]){
      const r=await fetch(base+route),html=await r.text(),$=load(html);
      assert.equal(r.status,status);assert.equal($('html').attr('lang'),lang);
      assert.ok(!$('script[src]').toArray().some(e=>/googletagmanager/.test($(e).attr('src'))),'local review must not load production analytics');
    }
  }finally{child.kill();}
});

test('Chinese missing-page response preserves 404 status, noindex, Chinese navigation and English recovery',async()=>{
  assert.ok(fs.existsSync('api/not-found.js'),'production Chinese 404 handler is missing');
  const server=http.createServer(require('../api/not-found.js'));
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try{
    const base=`http://127.0.0.1:${server.address().port}`;
    for(const pathname of ['/zh/not-present/','/zh/services/not-present/?from=guide']){
      const r=await fetch(base+pathname),$=load(await r.text());
      assert.equal(r.status,404);assert.equal(r.headers.get('location'),null);
      assert.equal($('html').attr('lang'),'zh-Hans');
      assert.match($('meta[name=robots]').attr('content'),/noindex/);
      assert.equal($('h1').text(),'返回首页继续浏览。');
      assert.equal($('#primary-nav [data-language-switch]').attr('href'),'/404.html');
      assert.ok($('main a[href="/zh/"]').length);
      assert.ok($('a[href="/zh/contact/"]').length);
    }
    const head=await fetch(base+'/zh/not-present/',{method:'HEAD'});
    assert.equal(head.status,404);assert.equal(await head.text(),'');
  }finally{await new Promise(r=>server.close(r));}
});
