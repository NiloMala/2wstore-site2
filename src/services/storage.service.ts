import { supabase } from '@/integrations/supabase';

export type BucketName = 'product-images' | 'banners' | 'avatars' | 'categories';

export const storageService = {
  /**
   * Upload a single image
   */
  async uploadImage(file: File, bucket: BucketName = 'product-images'): Promise<string> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[], bucket: BucketName = 'product-images'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, bucket));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete an image by URL
   */
  async deleteImage(url: string, bucket: BucketName = 'product-images'): Promise<void> {
    // Extract path from URL
    const bucketUrl = supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;
    const path = url.replace(bucketUrl, '');

    if (!path) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Delete multiple images
   */
  async deleteImages(urls: string[], bucket: BucketName = 'product-images'): Promise<void> {
    const deletePromises = urls.map(url => this.deleteImage(url, bucket));
    await Promise.all(deletePromises);
  },
};
