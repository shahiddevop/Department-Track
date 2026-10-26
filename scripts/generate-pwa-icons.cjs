const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'public', 'adt-logo-square.png');
const outDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  console.log('Generating PWA icons from:', srcPath);
  
  // 1. Standard 192x192 (purpose: any)
  await sharp(srcPath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png (192x192)');

  // 2. Standard 512x512 (purpose: any)
  await sharp(srcPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png (512x512)');

  // 3. Maskable 512x512 (purpose: maskable) - Safe zone is 80% of icon (410x410) centered on solid brand background #0f172a
  const logoInner512 = await sharp(srcPath)
    .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a slate-900
    }
  })
    .composite([{ input: logoInner512, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png (512x512)');

  // 4. Maskable 192x192 (purpose: maskable) - Safe zone is 80% of icon (154x154) centered on solid brand background #0f172a
  const logoInner192 = await sharp(srcPath)
    .resize(154, 154, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a slate-900
    }
  })
    .composite([{ input: logoInner192, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'pwa-maskable-192x192.png'));
  console.log('Created pwa-maskable-192x192.png (192x192)');

  // 5. Apple Touch Icon 180x180 (iOS)
  const logoInner180 = await sharp(srcPath)
    .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  })
    .composite([{ input: logoInner180, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png (180x180)');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
