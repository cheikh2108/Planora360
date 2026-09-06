import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script pour uploader les assets email (logo) sur Backblaze B2
 * Usage: npx ts-node scripts/upload-email-assets.ts
 */

async function uploadEmailAssets() {
  const s3 = new S3Client({
    endpoint: 'https://s3.us-east-005.backblazeb2.com',
    region: 'us-east-005',
    credentials: {
      accessKeyId: '0050d9227f9a5a90000000001',
      secretAccessKey: 'K0053EMuWse5tV1zQqa69M9CtqkgpMg',
    },
  });

  const bucket = 'ataaba-pilot';
  const logoPath = path.join(__dirname, '../../frontend/public/logo-light.svg');

  console.log('📤 Upload du logo email vers B2...');

  const logoContent = fs.readFileSync(logoPath);

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: 'email-assets/logo-light.svg',
    Body: logoContent,
    ContentType: 'image/svg+xml',
    CacheControl: 'public, max-age=31536000', // Cache 1 an
  }));

  const publicUrl = 'https://f005.backblazeb2.com/file/ataaba-pilot/email-assets/logo-light.svg';

  console.log('✅ Logo uploadé avec succès !');
  console.log(`📍 URL publique : ${publicUrl}`);
  console.log('\n💡 Mettez à jour email-templates.ts avec cette URL');
}

uploadEmailAssets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
