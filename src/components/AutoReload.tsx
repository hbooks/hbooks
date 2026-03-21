import { useEffect } from "react";
import { Workbox } from "workbox-window";

const AutoReload = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker not supported");
      return;
    }

    const wb = new Workbox("/sw.js");

    wb.addEventListener("installed", (event) => {
      console.log("Service Worker installed event", event);
    });

    wb.addEventListener("waiting", (event) => {
      console.log("New version waiting – reloading...");
      // Reload the page to activate the new service worker
      window.location.reload();
    });

    wb.addEventListener("controlling", (event) => {
      console.log("Service Worker now controlling the page");
    });

    wb.register()
      .then((registration) => {
        console.log("Service Worker registered", registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed", err);
      });
  }, []);

  return null;
};

export default AutoReload;
