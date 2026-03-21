import { useEffect } from "react";
import { Workbox } from "workbox-window";

const AutoReload = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const wb = new Workbox("/sw.js");
    let reloadTimeout: ReturnType<typeof setTimeout>;
    let updateCheckCount = 0;

    // Primary: Listen for the waiting event
    wb.addEventListener("waiting", () => {
      console.log("✓ New version waiting – calling skipWaiting and reloading...");
      // Tell the new SW to skip waiting and take control
      wb.messageSW({ type: "SKIP_WAITING" });
      // Reload after a brief delay to ensure the new SW takes control
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });

    // Fallback: Check for updates every 10 seconds (more aggressive than 30s)
    const checkForUpdate = async () => {
      updateCheckCount++;
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (!reg) {
          console.log("⚠ No service worker registration found");
          return;
        }

        // Explicitly check for updates
        await reg.update();

        if (reg.waiting) {
          console.log(
            `✓ Fallback (check #${updateCheckCount}): waiting worker detected, reloading...`
          );
          // Tell the waiting worker to skip waiting
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else if (reg.active) {
          console.log(
            `Fallback (check #${updateCheckCount}): active worker is up-to-date`
          );
        }
      } catch (error) {
        console.error("Error checking for SW updates:", error);
      }
    };

    wb.register()
      .then((reg) => {
        console.log("✓ Service Worker registered:", reg);
        // Start aggressive fallback checking
        reloadTimeout = setInterval(checkForUpdate, 10000); // Check every 10 seconds
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    return () => {
      if (reloadTimeout) {
        clearInterval(reloadTimeout);
      }
    };
  }, []);

  return null;
};

export default AutoReload;