import { useEffect } from "react";
import { Workbox } from "workbox-window";

const AutoReload = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const wb = new Workbox("/sw.js");
    let reloadTimeout: ReturnType<typeof setTimeout>;

    wb.addEventListener("waiting", () => {
      console.log("New version waiting – reloading...");
      window.location.reload();
    });

    wb.register().then((reg) => {
      console.log("Service Worker registered", reg);

      // Fallback: check every 30 seconds if a new version is waiting
      const checkForUpdate = () => {
        if (reg.waiting) {
          console.log("Fallback: waiting worker found, reloading");
          window.location.reload();
        } else {
          reg.update();
        }
      };
      reloadTimeout = setInterval(checkForUpdate, 30000);
    });

    return () => {
      clearInterval(reloadTimeout);
    };
  }, []);

  return null;
};

export default AutoReload;
