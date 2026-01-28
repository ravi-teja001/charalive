import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { environment } from '@/lib/environment';

// Initialize S3 client
const s3Client = new S3Client({
  region: environment.awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: environment.awsAccessKeyId || '',
    secretAccessKey: environment.awsSecretAccessKey || '',
  },
});

const BUCKET_NAME = environment.s3BucketName || 'biochar-photos';

// Upload photo to S3
export async function uploadPhotoToS3(
  photoData: string,
  folder: string,
  fileName: string
): Promise<string> {
  try {
    // Convert base64 to buffer
    const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique file name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fullFileName = `${folder}/${timestamp}-${randomId}-${fileName}`;
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullFileName,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read', // Make photos publicly accessible
    });
    
    await s3Client.send(command);
    
    // Return public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${environment.awsRegion || 'us-east-1'}.amazonaws.com/${fullFileName}`;
    
    console.log('✅ Photo uploaded to S3:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Error uploading photo to S3:', error);
    throw new Error('Failed to upload photo to cloud storage');
  }
}

// Upload multiple vehicle photos
export async function uploadVehiclePhotos(
  photos: string[]
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < photos.length; i++) {
    if (photos[i]) {
      try {
        const url = await uploadPhotoToS3(
          photos[i],
          'vehicle-photos',
          `vehicle-${i + 1}.jpg`
        );
        uploadedUrls.push(url);
      } catch (error) {
        console.error(`❌ Failed to upload vehicle photo ${i + 1}:`, error);
        throw error;
      }
    }
  }
  
  return uploadedUrls;
}

// Upload weight record photo
export async function uploadWeightPhoto(
  photoData: string
): Promise<string> {
  return await uploadPhotoToS3(
    photoData,
    'weight-photos',
    `weight-record.jpg`
  );
}

// Upload moisture photo
export async function uploadMoisturePhoto(
  photoData: string
): Promise<string> {
  return await uploadPhotoToS3(
    photoData,
    'moisture-photos',
    `moisture-record.jpg`
  );
}
