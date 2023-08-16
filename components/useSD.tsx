import { useEffect, useRef } from "react";
import { sdwebui } from "../pages";

export function useSD() {
  const clientRef = useRef<ReturnType<typeof sdwebui> | null>(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    clientRef.current = sdwebui({
      apiUrl: urlParams.get("sd") || "http://127.0.0.1:7860",
    });
  }, []);

  return clientRef;
}
