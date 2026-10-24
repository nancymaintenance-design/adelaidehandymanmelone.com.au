import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const reviewed=JSON.parse(fs.readFileSync(new URL('../fixtures/service-decision-20261024.json',import.meta.url),'utf8'));
const advisors=JSON.parse(fs.readFileSync(new URL('../fixtures/advisor-contacts-20261024.json',import.meta.url),'utf8'));
// Six service-path pages plus four additive home/About contacts (two overlap).
// Earlier fixtures stay unchanged; all other pages retain their old checks.
export const serviceDecisionFiles=new Set([...Object.keys(reviewed.pages), ...Object.keys(advisors.pages)]);
export function assertServiceDecisionProtected(html,file){
  assert.ok(serviceDecisionFiles.has(file),'Unreviewed service-path page: '+file);
  assert.equal(createHash('sha256').update(html.replaceAll('\r\n','\n')).digest('hex'),(advisors.pages[file] || reviewed.pages[file]).after,file+' exact reviewed service-path/advisor HTML');
}
