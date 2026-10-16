// Mechanical configuration update only. Does not contact Vercel or deploy.
import fs from 'node:fs';
const file = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const original = config.redirects.filter(rule => !rule.source.startsWith('/zh'));
const domain = 'https://www.adelaidehandymanmelone.com.au';
const chinese = original.filter(rule => !rule.has).map(rule => ({ ...rule, source: '/zh' + rule.source, destination: rule.destination.replace(domain, domain + '/zh') }));
chinese.unshift({ source: '/zh', destination: domain + '/zh/', permanent: true });
config.redirects = [...original.filter(rule => !rule.has), ...chinese, ...original.filter(rule => rule.has)];
fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
console.log(`${chinese.length} exact Chinese route redirects prepared locally; nothing deployed.`);
