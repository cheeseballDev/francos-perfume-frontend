import { useEffect, useState } from "react";

let memoryState = [];
let listeners = [];

export const toast = ({ title, description, variant, duration = 3000 }) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { id, title, description, variant, duration };
  
  memoryState = [...memoryState, newToast];
  listeners.forEach((listener) => listener(memoryState));

  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(memoryState));
  }, duration);
};

export const useToast = () => {
  const [toasts, setToasts] = useState(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toast, toasts };
};