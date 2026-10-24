const test=require('node:test'),assert=require('node:assert/strict');
const {immutableImagesMatch}=require('../scripts/check-audit-media-grid.cjs');
test('reviewed UI icon additions never approve changes to original photographs or arbitrary assets',()=>{
  const original={'src/assets/images/cases/example.png':'original-photo-hash'};
  const approved={...original,
    'src/assets/icons/arrow-right.svg':'edcfe1180dcc2afb750f1cb4b45524a5cdf6622a862b2e75320b4e4f057fc28c',
    'src/assets/icons/slash.svg':'3c8a15d148c06af5356a20d5d301cc38fc5711737411d01d34e49b24d4e047c0',
    'src/assets/images/advisors/ella.webp':'3b00d1381e799bedde5e5df8dd6412bd45190b84f362382cfb3e004d756779fb',
    'src/assets/images/advisors/felix.webp':'673f67016757fbc614573c2db1190999aa4f7c15ea369ed9e7b4ec2c5ca675f4',
    'src/assets/images/advisors/riley.webp':'830e489b45f4e766a8fc43ab3bb5dfccc01f436f35760455537e5ecff6225783'};
  assert.equal(immutableImagesMatch(approved,original),true);
  assert.equal(immutableImagesMatch({...approved,'src/assets/images/cases/example.png':'changed'},original),false);
  assert.equal(immutableImagesMatch({...approved,'src/assets/icons/arrow-right.svg':'changed'},original),false);
  assert.equal(immutableImagesMatch({...approved,'src/assets/images/advisors/riley.webp':'changed'},original),false);
  assert.equal(immutableImagesMatch({...approved,'src/assets/icons/other.svg':'new'},original),false);
  const missing={...approved};delete missing['src/assets/images/cases/example.png'];
  assert.equal(immutableImagesMatch(missing,original),false);
});
