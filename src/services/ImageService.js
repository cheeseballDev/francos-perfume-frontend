
import { supabase } from '@/config/supabaseClient';

export const uploadImage = async (file, folder = 'products') => {
    // create unique filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw new Error(error.message);

    // get public URL
    const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

    return urlData.publicUrl;  // ← save this to your database
};

export const deleteImage = async (imageUrl) => {
    // extract file path from URL
    const path = imageUrl.split('/product-images/')[1];
    if (!path) return;

    const { error } = await supabase.storage
        .from('product-images')
        .remove([path]);

    if (error) throw new Error(error.message);
};