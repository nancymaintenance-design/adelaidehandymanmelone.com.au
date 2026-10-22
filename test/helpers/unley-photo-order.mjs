// Undo only the user-approved first/fourth gallery source swap for older
// released-baseline checks. The dedicated test verifies the actual new order.
export function restoreUnleyPhotoOrder(html,file){
 if(!/^(?:zh\/)?case-studies\/unley-kitchen-cabinet-repair\/index\.html$/.test(file))return html;
 return html.replace(/<section class="service-visual-gallery case-photo-grid"[^]*?<\/section>/,gallery=>gallery.replace(/unley-kitchen-cabinet-repair-0([14])(?=[-.])/g,(_,n)=>`unley-kitchen-cabinet-repair-0${n==='1'?'4':'1'}`))
  // The existing share-image policy derives these two tags from the first photo.
  .replace(/<meta\b[^>]*(?:property="og:image"|name="twitter:image")[^>]*>/g,tag=>tag.replace('unley-kitchen-cabinet-repair-04.png','unley-kitchen-cabinet-repair-01.png'))
  .replace(/"primaryImageOfPage":\{"@type":"ImageObject","url":"[^"]+"\}/g,tag=>tag.replace('unley-kitchen-cabinet-repair-04.png','unley-kitchen-cabinet-repair-01.png'));
}
