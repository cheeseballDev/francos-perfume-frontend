import { uploadImage } from "@/services/ImageService";
import { centerAspectCrop, getCroppedBlob } from "@/utils/imageUtils";
import { validateImageFile } from "@/utils/validationUtils";
import { Loader2, User } from "lucide-react";
import { guardDismiss } from "@/utils/modalUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

const ImageUpload = ({
    value,
    onChange,
    bucket = 'product-pictures',
    imageText = 'Photo',
    className = '',
    isEditing = false,
    aspect = 1,  // 1 = square, 16/9 = landscape, etc.
}) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(value || null);

    // crop state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
    const imgRef = useRef(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            toast({ title: "Invalid File", description: validationError, variant: "destructive" });
            e.target.value = '';
            return;
        }

        setError(null);
        setPendingFile(file);

        // read file and open crop modal
        const reader = new FileReader();
        reader.onload = () => {
            setImgSrc(reader.result?.toString() || '');
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
    }, [aspect]);

    const handleCropConfirm = async () => {
        if (!completedCrop || !imgRef.current || !pendingFile) return;

        setIsUploading(true);
        setIsCropModalOpen(false);

        const localPreview = URL.createObjectURL(pendingFile);
        setPreview(localPreview);

        try {
            const croppedFile = await getCroppedBlob(
                imgRef.current,
                completedCrop,
                pendingFile.name
            );

            const publicUrl = await uploadImage(croppedFile, bucket);
            setPreview(publicUrl);
            onChange(publicUrl);
            
        } catch (err) {
            setError(err.message);
            setPreview(value || null);
            
            toast({ 
                title: "Upload Failed", 
                description: err.message, 
                variant: "destructive" 
            });

        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(localPreview);
            setPendingFile(null);
            setImgSrc('');
        }
    };

    const handleCropCancel = () => {
        setIsCropModalOpen(false);
        setImgSrc('');
        setPendingFile(null);
        setCrop(null);
        setCompletedCrop(null);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
        setError(null);
    };

    return (
        <>
            <div className={`flex items-center gap-6 ${className}`}>
                {/* Preview circle */}
                <div className="h-28 w-28 rounded-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted shrink-0 relative">
                    {isUploading ? (
                        <Loader2 className="animate-spin text-muted-foreground" size={32} />
                    ) : preview ? (
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                        <User size={40} className="text-muted-foreground stroke-[1.5]" />
                    )}
                </div>

                <div className="flex-grow">
                    <h3 className="text-[16px] font-bold text-foreground">{imageText}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                        Allowed: JPG, PNG, WEBP, GIF, AVIF, SVG (Max 50MB)
                    </p>

                    <input
                        type="file"
                        id="image-upload-input"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                        className="hidden"
                    />

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById('image-upload-input').click()}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            {preview && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemove}
                                    disabled={isUploading}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    )}

                    {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
                </div>
            </div>

            {/* Crop Modal */}
            <Dialog open={isCropModalOpen} onOpenChange={(open) => !open && handleCropCancel()}>
                <DialogContent
                    className="max-w-lg font-montserrat"
                    onPointerDownOutside={guardDismiss({ isBusy: isUploading })}
                    onEscapeKeyDown={guardDismiss({ isBusy: isUploading })}
                >
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Crop Image</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            Drag to reposition. Resize the box to crop.
                        </p>

                        {/* Crop area */}
                        <div className="max-h-[70vh] overflow-auto bg-muted rounded-lg p-4 text-center">
                            {imgSrc && (
                                <div className="inline-block max-w-full">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspect}
                                        circularCrop
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imgSrc}
                                            alt="Crop preview"
                                            onLoad={onImageLoad}
                                            style={{ 
                                                display: 'block', 
                                                maxWidth: '100%', 
                                                maxHeight: '60vh',
                                                height: 'auto'
                                            }}
                                        />
                                    </ReactCrop>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCropCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleCropConfirm}
                                disabled={!completedCrop?.width || !completedCrop?.height}
                            >
                                Crop & Upload
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageUpload;