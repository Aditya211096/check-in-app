/**
 * Financial & Hospitality Operational Calculation Engine.
 * Provides 100% precision in monetary math, tax breakdowns, occupancy metrics, and SLA rates.
 */

import { calculateNights } from "./date-utils";

export interface BookingBreakdown {
  nights: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  taxRate: number;
}

/**
 * Calculates itemized booking breakdown including subtotal, GST tax, and grand total.
 */
export function calculateBookingBreakdown(
  basePricePerNight: number,
  bedCount: number,
  checkIn: string,
  checkOut: string,
  taxRate: number = 0.12
): BookingBreakdown {
  const nights = calculateNights(checkIn, checkOut);
  const effectiveNights = Math.max(nights, 1);
  const subtotal = Math.round(basePricePerNight * bedCount * effectiveNights);
  const tax = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + tax;

  return {
    nights,
    subtotal,
    tax,
    grandTotal,
    taxRate,
  };
}

export interface RoomRateHistoryEntry {
  roomId?: string;
  roomTypeId?: string;
  pricePerNight: number;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
}

/**
 * Calculates effective historical room/bed price for a given date based on owner price updates.
 */
export function getEffectiveRoomPrice(
  roomIdOrType: string,
  targetDate: string,
  priceHistory: RoomRateHistoryEntry[],
  fallbackPrice: number
): number {
  const matches = priceHistory.filter((entry) => {
    const isTargetRoom = entry.roomId === roomIdOrType || entry.roomTypeId === roomIdOrType;
    if (!isTargetRoom) return false;
    const fromValid = targetDate >= entry.effectiveFrom;
    const toValid = !entry.effectiveTo || targetDate <= entry.effectiveTo;
    return fromValid && toValid;
  });

  if (matches.length === 0) return fallbackPrice;
  // Pick the most recent effective update
  matches.sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return matches[0].pricePerNight;
}

export interface ExecutiveKPIs {
  totalRevenue: number;
  roomRevenue: number;
  foodRevenue: number;
  occupancyRate: number;
  revPAR: number;
  adr: number;
  pendingRoomTabs: number;
  complaintResolutionRate: number;
  avgResolutionMinutes: number;
  slaBreachCount: number;
}

/**
 * Calculates Executive Financial and SLA KPIs.
 */
export function calculateExecutiveKPIs(params: {
  occupiedBeds: number;
  totalBeds: number;
  totalRooms: number;
  roomRevenue: number;
  foodRevenue: number;
  pendingTabsAmount: number;
  totalComplaints: number;
  resolvedComplaints: number;
  resolutionTimesMin: number[];
}): ExecutiveKPIs {
  const {
    occupiedBeds,
    totalBeds,
    totalRooms,
    roomRevenue,
    foodRevenue,
    pendingTabsAmount,
    totalComplaints,
    resolvedComplaints,
    resolutionTimesMin,
  } = params;

  const totalRevenue = roomRevenue + foodRevenue;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const adr = occupiedBeds > 0 ? Math.round(roomRevenue / occupiedBeds) : 0;
  const revPAR = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;

  const complaintResolutionRate =
    totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  const avgResolutionMinutes =
    resolutionTimesMin.length > 0
      ? Math.round(resolutionTimesMin.reduce((a, b) => a + b, 0) / resolutionTimesMin.length)
      : 0;

  const slaBreachCount = resolutionTimesMin.filter((t) => t > 15).length;

  return {
    totalRevenue,
    roomRevenue,
    foodRevenue,
    occupancyRate,
    revPAR,
    adr,
    pendingRoomTabs: pendingTabsAmount,
    complaintResolutionRate,
    avgResolutionMinutes,
    slaBreachCount,
  };
}
