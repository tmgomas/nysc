import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Props {
    fps?: number;
    qrbox?: number;
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string) => void;
}

const QrScanner = (props: Props) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const divId = "html5qr-code-full-region";

    useEffect(() => {
        // Helper to check if the element exists
        if (!document.getElementById(divId)) {
            console.error(`Element with id ${divId} not found`);
            return;
        }

        const config = {
            fps: props.fps || 10,
            qrbox: props.qrbox || 250,
            aspectRatio: props.aspectRatio,
            disableFlip: props.disableFlip || false,
        };

        // Create the scanner instance
        const scanner = new Html5QrcodeScanner(divId, config, props.verbose || false);

        // Render
        scanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
        scannerRef.current = scanner;

        // Cleanup
        return () => {
            if (scannerRef.current) {
                // We use cleanup safely. 
                // Note: html5-qrcode's clear() method is async and returns a promise.
                // React's cleanup function is synchronous. 
                // We just trigger it and hope for the best or handle it.
                scannerRef.current.clear().catch(error => {
                    console.warn("Failed to clear scanner: ", error);
                });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div id={divId} className="w-full overflow-hidden rounded-lg bg-gray-100" />;
};

export default QrScanner;
