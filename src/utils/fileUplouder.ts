import { cloudinary } from '../config/cloudinary';

export class FileUploader {
  // Статический метод для загрузки файлов в Cloudinary
  public static async uploadToCloudinary(
    buffer: Buffer,
    resourceType: 'image' | 'video'
  ): Promise<string | undefined> {
    try {
      const uploadUrl = await new Promise<string | undefined>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(new Error('Error uploading to Cloudinary'));
              } else if (
                !result?.secure_url ||
                result.secure_url.trim() === ''
              ) {
                reject(
                  new Error(
                    'Cloudinary response is missing or empty secure_url'
                  )
                );
              } else {
                resolve(result.secure_url); // Возвращаем secure_url, если загрузка успешна
              }
            }
          );
          uploadStream.end(buffer); // Завершаем загрузку
        }
      );

      return uploadUrl;
    } catch (error) {
      console.error('Error during Cloudinary upload:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }
  // Метод для удаления файла из Cloudinary
  public static async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        console.log(`File with public ID ${publicId} has been deleted from Cloudinary.`);
      } else {
        console.error(`Error deleting file with public ID ${publicId}: ${result.error}`);
        throw new Error(`Failed to delete file from Cloudinary: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during Cloudinary deletion:', error);
      throw new Error('Failed to delete file from Cloudinary');
    }
  }
}
