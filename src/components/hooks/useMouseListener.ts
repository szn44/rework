"use client";

import { useEffect } from "react";

export function useMouseListener(callback: (mouse: "down" | "up") => void) {
  useEffect(() => {
    const handleMouseDown = () => callback("down");
    const handleMouseUp = () => callback("up");

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [callback]);
} 