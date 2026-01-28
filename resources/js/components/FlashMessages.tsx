import { useFlashMessages } from '@/hooks/use-flash-messages';

/**
 * Flash Messages Component
 * 
 * Automatically displays toast notifications for flash messages
 * from Laravel. Add this component to your layout.
 */
export function FlashMessages() {
    useFlashMessages();
    return null; // This component doesn't render anything
}
