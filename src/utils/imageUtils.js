import { centerCrop, makeAspectCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

export const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
};

export const getCroppedBlob = (image, crop, fileName, fileType = "image/png") => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const safeMimeType = supportedTypes.includes(fileType) ? fileType : 'image/png';

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) { reject(new Error('Canvas is empty')); return; }
                resolve(new File([blob], fileName, { type: safeMimeType }));
            },
            'image/png',
            0.95
        );
    });
};