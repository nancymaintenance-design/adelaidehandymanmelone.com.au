import {pageRevisions} from './page-revisions.mjs';

// Only enquiry guidance changes. Original case facts, photos and outcomes stay intact.
export function applyP1LocalEntries(content, localCopy) {
  const edits={
    'goodwood-wall-repair': {
      paragraphs:[
        'Describe the patch, not a whole-room renovation. Give the room, approximate damaged area and whether the concern is a hole, damaged edge or changing crack. Mention known moisture and the finish you want; patching and paint blending need an agreed scope. Compare ',
        {url:'/services/wall-patching-repair/',label:'Plasterboard Repairs & Wall Patching'},
        ', then ',{url:'/contact/?suburb=goodwood',label:'request a Goodwood wall-patch assessment'},
        '. Safe existing photos are optional; a description is enough. Email photos to admin@melonemaintenance.com.au if useful, and mention access or owner approval. Do not open the wall to investigate.',
      ],
      answer:'Give the room, approximate patch size, visible damage and any known moisture or changing cracks. Say whether you want only the patch assessed or also paint finishing. The completed Goodwood patch does not establish the cause or scope of damage at another property; those details are assessed separately.',
    },
    'modbury-timber-fence-repair-assessment': {
      paragraphs:[
        'For a fence enquiry, identify broken palings, visible lean and the affected section. List a dragging garden gate or latch concern separately. This fence assessment does not document a gate repair. Compare ',
        {url:'/services/fence-gate-repair/#timber-fence-gate-scope',label:'Fence & Gate Repairs'},
        ', then ',{url:'/contact/?suburb=modbury',label:'request a Modbury fence or garden-gate assessment'},
        '. Mention boundary permission and safe access. Do not pull on loose fencing or enter another property for photos; a description and any safe existing images are enough.',
      ],
      answer:'Identify the affected fence section, broken palings or visible lean, and any boundary or access permissions. Describe a garden gate that drags or does not latch as a separate task. The Modbury record documents fence assessment only, with no completed fence or gate repair recorded; the proposed work at your property needs its own assessment.',
    },
  };
  for(const [slug,edit]of Object.entries(edits)){
    const study=content.caseStudies.find(x=>x.slug===slug);
    const preparation=study?.sections[2];
    if(!preparation?.paragraphs?.at(-1)?.startsWith(`For a similar `)||study.faqs.length!==1)throw Error(`P1 case preparation drift: ${slug}`);
    preparation.paragraphs[preparation.paragraphs.length-1]=edit.paragraphs;
    study.faqs[0].answer=edit.answer;
    pageRevisions[`/case-studies/${slug}/`]='2026-10-22';
  }
  if(!localCopy.Modbury?.explanation?.startsWith('The Modbury fence record documents'))throw Error('P1 Modbury local context drift');
  localCopy.Modbury.explanation='The Modbury fence record documents broken palings and visible lean for assessment only, not completed repairs. List fence damage, an ordinary garden-gate problem and garden pruning as separate tasks. For a gate, describe dragging or latch contact. This fence assessment does not document a gate repair. Note boundary permission, access, retained plants and green-waste handling as relevant; the work at your property is assessed separately.';
  localCopy.Modbury.entryLinks=[{url:'/services/fence-gate-repair/#timber-fence-gate-scope',label:'Fence & Gate Repairs'}];
  pageRevisions['/service-areas/north-north-east/modbury/']='2026-10-22';
}
