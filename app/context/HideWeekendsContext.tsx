"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface HideWeekendsContextProps {
  hideWeekends: boolean;
  setHideWeekends: React.Dispatch<React.SetStateAction<boolean>>;
}

const HideWeekendsContext = createContext<HideWeekendsContextProps | undefined>(undefined);

export const HideWeekendsProvider = ({ children }: { children: React.ReactNode }) => {
  const [hideWeekends, setHideWeekends] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hideWeekends");
    if (saved === "true") {
      setHideWeekends(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hideWeekends", String(hideWeekends));
  }, [hideWeekends]);

  return <HideWeekendsContext.Provider value={{ hideWeekends, setHideWeekends }}>{children}</HideWeekendsContext.Provider>;
};

export const useHideWeekends = () => {
  const context = useContext(HideWeekendsContext);
  if (!context) throw new Error("useHideWeekends must be used within HideWeekendsProvider");
  return context;
};
