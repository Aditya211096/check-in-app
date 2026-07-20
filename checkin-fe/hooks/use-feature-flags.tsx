"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface FeatureFlags {
  FEATURE_DORM_BED_INVENTORY: boolean;
  FEATURE_DIGILOCKER_VERIFICATION: boolean;
  FEATURE_FOOD_ORDERING: boolean;
  FEATURE_VOICE_NOTES_DISPATCH: boolean;
  FEATURE_ROOM_TAB_LEDGER: boolean;
  FEATURE_CUSTOMER_COMPLAINTS: boolean;
  FEATURE_WHATSAPP_AUTOMATION: boolean;
  FEATURE_EXECUTIVE_KPI_ANALYTICS: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  FEATURE_DORM_BED_INVENTORY: true,
  FEATURE_DIGILOCKER_VERIFICATION: true,
  FEATURE_FOOD_ORDERING: true,
  FEATURE_VOICE_NOTES_DISPATCH: true,
  FEATURE_ROOM_TAB_LEDGER: true,
  FEATURE_CUSTOMER_COMPLAINTS: true,
  FEATURE_WHATSAPP_AUTOMATION: true,
  FEATURE_EXECUTIVE_KPI_ANALYTICS: true,
};

const FeatureFlagsContext = createContext<{
  flags: FeatureFlags;
  setFlags: (flags: Partial<FeatureFlags>) => void;
  toggleFlag: (key: keyof FeatureFlags) => void;
}>({
  flags: DEFAULT_FEATURE_FLAGS,
  setFlags: () => {},
  toggleFlag: () => {},
});

export function FeatureFlagsProvider({ children, tenantId }: { children: ReactNode; tenantId?: string }) {
  const [flags, setFlagsState] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  useEffect(() => {
    if (!tenantId) return;
    const eventSource = new EventSource(`/api/live/tenant-config/${tenantId}`);

    eventSource.onmessage = (event) => {
      try {
        const updated = JSON.parse(event.data);
        if (updated.featureFlags) {
          setFlagsState((prev) => ({ ...prev, ...updated.featureFlags }));
        }
      } catch (e) {
        console.error("Failed to parse SSE feature flag payload", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [tenantId]);

  const setFlags = (newFlags: Partial<FeatureFlags>) => {
    setFlagsState((prev) => ({ ...prev, ...newFlags }));
  };

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlagsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlags, toggleFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
