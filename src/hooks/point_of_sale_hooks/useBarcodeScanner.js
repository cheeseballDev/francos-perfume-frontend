import { useCallback, useEffect, useRef } from 'react';

export const useBarcodeScanner = ({ onScanSuccess, onScanError }) => {
    const barcodeBuffer = useRef('');
    const lastKeyTime = useRef(Date.now());

    const handleBarScanned = useCallback(async (barcode) => {
        try {
            await onScanSuccess(barcode);
        } catch (error) {
            if (onScanError) onScanError(error, barcode);
        }
    }, [onScanSuccess, onScanError]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }

            const currentTime = Date.now();

            if (currentTime - lastKeyTime.current > 100) {
                barcodeBuffer.current = '';
            }
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                e.preventDefault();
                const scannedCode = barcodeBuffer.current.trim();
                
                if (scannedCode) {
                    handleBarScanned(scannedCode);
                }
                barcodeBuffer.current = '';
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleBarScanned]);
};