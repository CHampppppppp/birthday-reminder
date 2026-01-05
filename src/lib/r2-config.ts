// Cloudflare R2 Configuration
export const r2Config = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  accountId: process.env.R2_ACCOUNT_ID!,
  bucketName: process.env.R2_BUCKET_NAME || 'birthday-reminder-avatars',
  publicUrl: process.env.R2_PUBLIC_URL || 'https://pub-your-account-id.r2.dev',
  region: 'auto', // Cloudflare R2 uses 'auto' as region
}

// Validate required environment variables
if (!r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.accountId) {
  throw new Error('Missing required Cloudflare R2 environment variables')
}
