const test=require('node:test'),assert=require('node:assert/strict');
const {immutableImagesMatch}=require('../scripts/check-audit-media-grid.cjs');
test('reviewed UI icon additions never approve changes to original photographs or arbitrary assets',()=>{
  const original={'src/assets/images/cases/example.png':'original-photo-hash'};
  const approved={...original,
    'src/assets/icons/arrow-right.svg':'edcfe1180dcc2afb750f1cb4b45524a5cdf6622a862b2e75320b4e4f057fc28c',
    'src/assets/icons/slash.svg':'3c8a15d148c06af5356a20d5d301cc38fc5711737411d01d34e49b24d4e047c0'};
  assert.equal(immutableImagesMatch(approved,original),true);
  assert.equal(immutableImagesMatch({...approved,'src/assets/images/cases/example.png':'changed'},original),false);
  assert.equal(immutableImagesMatch({...approved,'src/assets/icons/arrow-right.svg':'changed'},original),false);
  assert.equal(immutableImagesMatch({...approved,'src/assets/icons/other.svg':'new'},original),false);
  const missing={...approved};delete missing['src/assets/images/cases/example.png'];
  assert.equal(immutableImagesMatch(missing,original),false);
});
