"use client";

import { useEffect } from "react";

export function LandingInteractions() {
  useEffect(() => {
    import("../script.js");
  }, []);

  return null;
}
