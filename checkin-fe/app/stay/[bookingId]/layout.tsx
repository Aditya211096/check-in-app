import React from "react";

export function generateStaticParams() {
  return [
    { bookingId: "bk-001" },
    { bookingId: "bk-002" },
    { bookingId: "bk-003" },
  ];
}

export default function StayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
