import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { r2Config } from './r2-config'

// Create R2 client using AWS SDK v3
export const r2Client = new S3Client({
  region: r2Config.region,
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
})

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: r2Config.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read', // Make the file publicly accessible
      },
    })

    await upload.done()

    // Return the public URL
    return `${r2Config.publicUrl}/${key}`
  } catch (error) {
    console.error('Error uploading to R2:', error)
    throw new Error('Failed to upload file')
  }
}

// Generate unique filename for avatar
export function generateAvatarKey(userId: string, type: 'user' | 'friend', friendId?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  if (type === 'user') {
    return `avatars/users/${userId}/${timestamp}-${random}.jpg`
  } else {
    return `avatars/friends/${userId}/${friendId}/${timestamp}-${random}.jpg`
  }
}
