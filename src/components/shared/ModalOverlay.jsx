import { useEffect, useRef } from "react";

// Open overlays, newest last. Only the top one reacts to Escape.
const openOverlays = [];

/**
 * Backdrop for the hand-made modals (the ones that are not Radix <Dialog>s).
 *
 * - Closes when a click STARTS and ENDS on the backdrop. Dragging a text
 *   selection out of an input and releasing on the backdrop does not close it.
 * - Closes on Escape (topmost overlay only).
 * - `disabled` keeps it open, e.g. while a payment or upload is in progress.
 */
const ModalOverlay = ({ onClose, disabled = false, className = "", children }) => {
    const pressedOnBackdrop = useRef(false);
    const id = useRef(Symbol("modal-overlay"));

    // Keep the latest props for the key handler without re-registering it
    const latest = useRef({ onClose, disabled });
    latest.current = { onClose, disabled };

    useEffect(() => {
        const myId = id.current;
        openOverlays.push(myId);

        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            if (openOverlays[openOverlays.length - 1] !== myId) return;
            if (latest.current.disabled) return;
            latest.current.onClose?.();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            const index = openOverlays.indexOf(myId);
            if (index !== -1) openOverlays.splice(index, 1);
        };
    }, []);

    return (
        <div
            role="presentation"
            className={`fixed inset-0 flex items-center justify-center ${className}`}
            onMouseDown={(e) => {
                pressedOnBackdrop.current = e.target === e.currentTarget;
            }}
            onMouseUp={(e) => {
                const isBackdropClick = pressedOnBackdrop.current && e.target === e.currentTarget;
                pressedOnBackdrop.current = false;
                if (isBackdropClick && !disabled) onClose?.();
            }}
        >
            {children}
        </div>
    );
};

export default ModalOverlay;
