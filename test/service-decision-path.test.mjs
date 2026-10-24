import {titleThemePhotoFiles} from './helpers/title-theme-photos.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import {serviceDecisionFiles,assertServiceDecisionProtected} from './helpers/service-decision-baseline.mjs';
const page = route => load(fs.readFileSync('public'+route+'index.html','utf8'));
test('the scoped later contracts reject unrelated changes instead of weakening historical fixtures',()=>{
  assert.deepEqual([...serviceDecisionFiles].sort(),[...titleThemePhotoFiles,'index.html','about/index.html','services/doors-windows-screens/index.html','services/interior-repairs-assembly/index.html','zh/index.html','zh/about/index.html','zh/services/doors-windows-screens/index.html','zh/services/interior-repairs-assembly/index.html'].sort());
  for(const file of serviceDecisionFiles){
    const html=fs.readFileSync('public/'+file,'utf8');assertServiceDecisionProtected(html,file);
    assert.throws(()=>assertServiceDecisionProtected(html.replace('tel:+61416614281','tel:+61000000000'),file),/exact reviewed/);
    assert.throws(()=>assertServiceDecisionProtected(html.replace('<h1>','<h1>Unreviewed '),file),/exact reviewed/);
  }
  assert.throws(()=>assertServiceDecisionProtected('', 'case-studies/adelaide-cbd-wall-repair/index.html'),/Unreviewed/);
});
test('home repair finder precedes the service cards and has a working hero shortcut in each language',()=>{
  for(const prefix of ['/','/zh/']){
    const $=page(prefix),finder=$('#find-repair');
    assert.equal(finder.length,1);
    assert.equal($('.hero-copy a[href="#find-repair"]').length,1);
    const html=$('main').html();
    assert.ok(html.indexOf('id="find-repair"')<html.indexOf('class="task-wall"'));
    assert.equal(finder.find('ul a').length,9);
    assert.equal(finder.find(`a[href="${prefix}guides/field-notes-grouping-multiple-household-jobs/"]`).length,1);
    assert.ok($('.hero-copy a[href="tel:+61416614281"]').length);
    assert.ok($('.hero-copy a[href="'+prefix+'contact/"]').length);
  }
});
test('existing FAQ counts stay fixed and decision answers agree with FAQ schema in both languages',()=>{
  for(const prefix of ['/','/zh/'])for(const [slug,count] of [['interior-repairs-assembly',5],['doors-windows-screens',6]]){
    const $=page(prefix+'services/'+slug+'/');
    const faqs=$('details').toArray().map(e=>({q:$(e).find('summary').text(),a:$(e).find('p').text()}));
    assert.equal(faqs.length,count);
    assert.equal(new Set(faqs.map(x=>x.q)).size,count);
    const schema=JSON.parse($('script[type="application/ld+json"]').first().text())['@graph'].find(x=>x['@type']==='FAQPage');
    assert.deepEqual(schema.mainEntity.map(x=>({q:x.name,a:x.acceptedAnswer.text})),faqs);
    const text=faqs.map(x=>x.a).join(' ');
    assert.match(text,prefix==='/'?/written quote/:/书面报价/);
    const english = prefix === '/';
    const expected = slug === 'interior-repairs-assembly'
      ? (english ? /does not confirm.*one visit/ : /不代表.*一次上门/)
      : (english ? /licensed person/ : /持牌人员/);
    assert.match(text,expected);
  }
});
test('opening evidence names link to the actual recorded jobs and retain distinct service boundaries',()=>{
  for(const prefix of ['/','/zh/']){
    const interior=page(prefix+'services/interior-repairs-assembly/');
    for(const slug of ['kensington-furniture-assembly','unley-kitchen-cabinet-repair','kitchen-drawer-runner-repair']){
      assert.ok(interior(`main section p a[href="${prefix}case-studies/${slug}/"]`).length,slug);
      assert.ok(fs.existsSync('public'+prefix+'case-studies/'+slug+'/index.html'));
    }
    const doors=page(prefix+'services/doors-windows-screens/');
    assert.ok(doors(`main section p a[href="${prefix}case-studies/burnside-window-repair/"]`).length);
    assert.match(doors('main').text(),prefix==='/'?/Broken glass.*specialist/:/玻璃破损.*专业/);
  }
});
