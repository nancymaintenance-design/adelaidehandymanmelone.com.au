// Layout-only composition of trusted, already escaped renderer markup.
// The scanner preserves every original byte except the added layout classes/wrappers.
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
function elements(html) {
  const roots=[], stack=[];
  for (const m of html.matchAll(/<!--[^]*?-->|<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
    if (!m[1]) continue;
    const tag=m[1].toLowerCase();
    if(m[0].startsWith('</')) {
      const node=stack.pop();
      if(!node || node.tag!==tag) throw new Error('Unbalanced generated layout markup: '+tag);
      node.close=m.index; node.end=m.index+m[0].length;
    } else {
      const node={tag,start:m.index,openEnd:m.index+m[0].length,end:m.index+m[0].length,children:[],opening:m[0]};
      (stack.length?stack.at(-1).children:roots).push(node);
      if(!voidTags.has(tag) && !m[0].endsWith('/>')) stack.push(node);
    }
  }
  if(stack.length) throw new Error('Unclosed generated layout markup');
  return roots;
}
const classes = node => (node.opening.match(/\bclass="([^"]*)"/)?.[1]||'').split(/\s+/);
const textLength = html => html.replace(/<[^>]*>/g,'').length;

function wideTopic(html) {
  const section=elements(html)[0];
  const nodes=section.children, heading=nodes.findIndex(n=>n.tag==='h2');
  const body=nodes.slice(heading+1);
  if(heading<0||body.length<2) return html;
  // A subsection heading travels with all its following prose. With no subheadings,
  // divide at a paragraph/list boundary near the midpoint, never inside text.
  let boundary=body.findIndex(n=>n.tag==='h3');
  if(boundary===0) {
    boundary=body.findIndex((n,i)=>i>0&&(n.tag==='h3'||n.tag==='section'));
    if(boundary<0) return html;
  } else if(boundary<0) {
    const total=body.reduce((sum,n)=>sum+textLength(html.slice(n.start,n.end)),0);
    let count=0;boundary=1;
    for(let i=0;i<body.length-1;i++){count+=textLength(html.slice(body[i].start,body[i].end));boundary=i+1;if(count>=total/2)break;}
  }
  const start=body[0].start, split=body[boundary].start;
  return html.slice(0,start)+`<div class="desktop-topic-body"><div class="desktop-topic-unit">`+html.slice(start,split)+`</div><div class="desktop-topic-unit">`+html.slice(split,section.close)+`</div></div>`+html.slice(section.close);
}

function topicRows(html) {
  const nodes=elements(html); let result='',cursor=0;
  for(let i=0;i<nodes.length;i++) {
    const a=nodes[i],b=nodes[i+1];
    result+=html.slice(cursor,a.start);
    const aHtml=html.slice(a.start,a.end), bHtml=b&&html.slice(b.start,b.end);
    // Whole neighboring topics only; FAQ/photography/navigation remain independent bands.
    const eligible = (n,s) => n?.tag==='section' && !/class="[^"]*faq-list/.test(s) && !classes(n).includes('guide-next');
    if(eligible(a,aHtml)&&eligible(b,bHtml)&&!/<h3\b/.test(aHtml+bHtml)&&Math.abs(textLength(aHtml)-textLength(bHtml))<=600) {
      result+=`<div class="desktop-topic-row">${aHtml}${html.slice(a.end,b.start)}${bHtml}</div>`;
      cursor=b.end;i++;
    } else {result+=eligible(a,aHtml)?wideTopic(aHtml):aHtml;cursor=a.end;}
  }
  return result+html.slice(cursor);
}
export function composeDesktopLayout(html, route) {
  function render(nodes, start, end) {
    let result='',cursor=start;
    for(const n of nodes) {
      result+=html.slice(cursor,n.start);
      const reading=classes(n).includes('reading');
      const opening=reading?n.opening.replace(/class="([^"]*)"/,`class="$1 desktop-reading${route==='/privacy/'?' desktop-prose':''}"`):n.opening;
      if(n.close!==undefined) {
        let inner=render(n.children,n.openEnd,n.close);
        if(reading&&route!=='/privacy/') inner=topicRows(inner);
        if(classes(n).includes('compact-enquiry')) inner=inner.replace(/(<label\b[^>]*for="(?:name|email|phone|suburb)"[^>]*>[^]*?<\/label>)(<p class="field-error"[^>]*><\/p>)/g,'<div class="desktop-field">$1$2</div>');
        result+=opening+inner+html.slice(n.close,n.end);
      } else result+=opening;
      cursor=n.end;
    }
    return result+html.slice(cursor,end);
  }
  return `<div class="desktop-layout">${render(elements(html),0,html.length)}</div>`;
}
