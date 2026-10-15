// One-time exact delta record from the already reviewed Task 2 commit.
// This never updates either independent historical/immutable baseline.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {run}=require('./check-desktop-layout.cjs');
const {digest,protectedImages,imageGuards}=require('./local-audit-semantic-deltas.cjs');
const root=path.resolve(__dirname,'..');
const approved='bc3ca95cce85199af3ae359de23e470d530f3d89';
async function record(){
  const output=path.join(root,'tests/fixtures/local-audit-approved-deltas.json');
  assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),approved,'Only the reviewed Task 2 commit can author the delta record');
  assert.equal(execFileSync('git',['diff','HEAD','--','build.mjs','src'],{cwd:root,encoding:'utf8'}),'','Reviewed production source must be untouched');
  assert.ok(!fs.existsSync(output),'Refusing to regenerate approved deltas');
  execFileSync(process.execPath,['build.mjs'],{cwd:root,stdio:'pipe'});
  await run({snapshotOnly:true});
  const historical=JSON.parse(fs.readFileSync(path.resolve(root,'../reports/desktop-layout-repair-2026-10-14/before/semantics.json')));
  const current=JSON.parse(fs.readFileSync(path.resolve(root,'../reports/local-audit-remediation-2026-10-15/task-3/approved-reference/semantics.json')));
  const deltas={},detail=[];
  for(let index=0;index<current.length;index++){
    const now=current[index],before=historical[index];
    for(const field of ['title','meta','canonical','controls']) assert.deepEqual(now[field],before[field],now.route+': protected '+field);
    assert.deepEqual(protectedImages(now.images),protectedImages(before.images),now.route+': image identity');
    for(const field of ['schema','text','headings','links','ids'])if(digest(now[field])!==digest(before[field])){
      deltas[now.route+':'+field]={before:digest(before[field]),approved:digest(now[field])};
      detail.push({route:now.route,field,before:before[field],approved:now[field]});
    }
  }
  const files=['src/content-pack/mel-one-site-content.json','src/content-pack/business-facts.json'];
  const protectedSourceHashes=Object.fromEntries(files.filter(file=>fs.existsSync(path.join(root,file))).map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
  const manifest={approvedCommit:approved,historicalDigest:digest(historical),reason:'Task 1 compact media/card slots; Task 2 individually reviewed body/FAQ/H2/card labels, approved bc3ca95. Seven single service slots receive the separately tested Task 3 size correction; every other image attribute is checked exactly.',protectedSourceHashes,...imageGuards(current),deltas};
  fs.writeFileSync(output,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  fs.writeFileSync(path.resolve(root,'../reports/local-audit-remediation-2026-10-15/task-3/approved-delta-details.json'),JSON.stringify(detail,null,2)+'\n');
  console.log(JSON.stringify({approvedCommit:approved,changedFields:detail.length,changedRoutes:new Set(detail.map(x=>x.route)).size,protectedSourceHashes},null,2));
}
record().catch(error=>{console.error(error);process.exitCode=1;});
