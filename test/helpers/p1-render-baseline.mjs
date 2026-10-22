import {createHash} from 'node:crypto';
import {load} from 'cheerio';
// A narrow presentation whitelist independent of the production copy module.
// Facts, captions, galleries, all other paragraphs and enquiry/layout wrappers stay hashed.
export function p1BodyHash(html,file){
 const d=load(html),body=d('body').clone();
 if(file.includes('/case-studies/')||file.startsWith('case-studies/')){
  const preparation=body.find('section').filter((_,n)=>d(n).children('h2').text().includes('Details for Another Property')||d(n).children('h2').text().includes('其他房'));
  if(preparation.length!==1)throw Error('Unexpected case preparation section '+preparation.length);
  preparation.children('p').last().text('P1_ENQUIRY_PARAGRAPH');
  body.find('details p').text('P1_REVIEWED_ANSWER');
  body.find('.article-date time').last().attr('datetime','P1_DATE').text('P1_DATE');
 }else{
  const localSection=body.find('main section').filter((_,n)=>['Modbury Fence Damage: Assessment-Only Record','Modbury 围栏损坏：仅评估记录'].includes(d(n).children('h2').text()));
  if(localSection.length!==1)throw Error('Unexpected Modbury decision section '+localSection.length);
  localSection.children('p').text('P1_MODBURY_SCOPE');localSection.children('ul.plain-list').remove();
  body.find('details').first().find('p').text('P1_MODBURY_SCOPE');
 }
 return createHash('sha256').update(body.toString()).digest('hex');
}
