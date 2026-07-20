import React from "react";

export function generateStaticParams() {
  return [
    { id: "bk-001" },
    { id: "bk-002" },
    { id: "bk-003" },
  ];
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
