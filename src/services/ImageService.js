import { supabase } from "@/lib/SupabaseClient";
import { validateImageFile } from "@/utils/validationUtils";

export const uploadImage = async (file, bucket) => {
    const validationError = validateImageFile(file);
    if (validationError) throw new Error(validationError);

    const ext = file.name.split('.').pop().toLowerCase();
    const dbFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(dbFileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(dbFileName);

    return data.publicUrl;
};

export const deleteImage = async (imageUrl, bucket = 'product-pictures') => {
    if (!imageUrl) return;
    
    const path = imageUrl.split(`/${bucket}/`)[1];
    if (!path) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(error.message)
};