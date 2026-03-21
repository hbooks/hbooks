import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const AutoReload = () => {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const reloaded = useRef(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const pendingReload = useRef<NodeJS.Timeout | null>(null);

  // Detect form interaction (input/textarea/select focus)
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsUserActive(false);
      }
    };
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setTimeout(() => {
          const active = document.activeElement;
          if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT')) {
            setIsUserActive(true);
          }
        }, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Detect page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reload when conditions are met
  useEffect(() => {
    if (needRefresh && !reloaded.current && isUserActive && isPageVisible) {
      reloaded.current = true;

      if (pendingReload.current) clearTimeout(pendingReload.current);

      pendingReload.current = setTimeout(() => {
        if (needRefresh && !reloaded.current && isUserActive && isPageVisible) {
          updateServiceWorker(true);
        } else {
          reloaded.current = false;
        }
      }, 3000);
    }
  }, [needRefresh, isUserActive, isPageVisible, updateServiceWorker]);

  return null;
};

export default AutoReload;
