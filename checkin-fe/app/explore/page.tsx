"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users, ArrowRight, Ship, Star, Wifi, Coffee, ShowerHead } from "lucide-react";

// ── MOCK DATA ── (replaced by live API after auth)
const MOCK_ROOMS = [
  {
    roomId: "r1",
    roomCode: "101",
    roomType: "Deluxe River View",
    kind: "PRIVATE",
    basePrice: 4500,
    beds: [{ bedId: "b1", bedCode: "Single", available: true }],
    amenities: ["Wifi", "Coffee", "Shower"],
    rating: 4.8,
    reviews: 42,
    description: "Breathtaking view of the Ganga Ghats. Premium cotton sheets, curated minibar, and a deep bathtub.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
  },
  {
    roomId: "r2",
    roomCode: "DORM-A",
    roomType: "Sunrise Dormitory",
    kind: "DORM",
    basePrice: 900,
    beds: [
      { bedId: "b2", bedCode: "Bunk A - Lower", available: true },
      { bedId: "b3", bedCode: "Bunk A - Upper", available: true },
      { bedId: "b4", bedCode: "Bunk B - Lower", available: false },
      { bedId: "b5", bedCode: "Bunk B - Upper", available: true },
    ],
    amenities: ["Wifi", "Coffee"],
    rating: 4.5,
    reviews: 118,
    description: "Community sleeping area with privacy curtains, individual reading lights, and personal lockers.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80",
  },
  {
    roomId: "r3",
    roomCode: "102",
    roomType: "Standard Heritage",
    kind: "PRIVATE",
    basePrice: 2800,
    beds: [{ bedId: "b6", bedCode: "Double Bed", available: true }],
    amenities: ["Wifi", "Shower"],
    rating: 4.3,
    reviews: 67,
    description: "Traditional terracotta walls, handwoven Banarasi textiles, and courtyard views.",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80",
  },
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  Shower: <ShowerHead className="w-3.5 h-3.5" />,
};

export default function ExploreRooms() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [searched, setSearched] = useState(false);
  const [selectedBeds, setSelectedBeds] = useState<Record<string, string[]>>({});
  const [kindFilter, setKindFilter] = useState<"ALL" | "PRIVATE" | "DORM">("ALL");

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;

  const filteredRooms = searched
    ? MOCK_ROOMS.filter((r) => kindFilter === "ALL" || r.kind === kindFilter)
    : [];

  const toggleBed = (roomId: string, bedId: string) => {
    setSelectedBeds((prev) => {
      const existing = prev[roomId] ?? [];
      const already = existing.includes(bedId);
      return {
        ...prev,
        [roomId]: already ? existing.filter((b) => b !== bedId) : [...existing, bedId],
      };
    });
  };

  const totalBeds = Object.values(selectedBeds).flat().length;
  const totalAmount = MOCK_ROOMS.reduce((sum, room) => {
    const beds = selectedBeds[room.roomId]?.length ?? 0;
    return sum + room.basePrice * beds * Math.max(nights, 1);
  }, 0);

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] font-sans">
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#1C2D37]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-full flex items-center justify-center shadow-md">
            <Ship className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">Sunrise Varanasi Ghat</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-white/60 hover:text-white text-xs transition-colors"
            onClick={() => router.push("/onboarding/profile")}
          >
            My Profile
          </button>
          <button
            className="text-white/60 hover:text-white text-xs transition-colors"
            onClick={() => router.push("/bookings")}
          >
            My Bookings
          </button>
        </div>
      </nav>

      {/* ── HERO SEARCH BAR ── */}
      <div className="bg-gradient-to-br from-[#1C2D37] to-[#253945] px-6 pt-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#E76F51]" />
            <span className="text-[#E76F51] text-xs font-semibold uppercase tracking-wider">Varanasi, Uttar Pradesh</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-2">
            Find your perfect stay
          </h1>
          <p className="text-white/50 text-sm mb-8">Wake up to the Ganga. Wander the ghats. Come home to Sunrise.</p>

          {/* Search Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" /> Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-white text-sm outline-none border-0 py-1"
              />
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" /> Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-white text-sm outline-none border-0 py-1"
              />
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Guests
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="bg-transparent text-white text-sm outline-none border-0 py-1 w-16"
              />
            </div>
            <button
              onClick={() => { if (checkIn && checkOut) setSearched(true); }}
              className="bg-[#E76F51] hover:bg-[#d85c3e] text-white rounded-xl font-semibold text-sm px-6 py-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#E76F51]/20"
            >
              Search Rooms <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {!searched ? (
          <div className="text-center py-20 text-[#1C2D37]/40">
            <Ship className="w-12 h-12 mx-auto mb-4 opacity-30 animate-bounce" />
            <p className="text-sm">Enter your dates above to explore available rooms</p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#1C2D37]/60">
                <span className="font-semibold text-[#1C2D37]">{filteredRooms.length} spaces</span> available · {nights} night{nights !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                {(["ALL", "PRIVATE", "DORM"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKindFilter(k)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      kindFilter === k
                        ? "bg-[#1C2D37] text-white"
                        : "bg-white/60 text-[#1C2D37]/60 hover:bg-white"
                    }`}
                  >
                    {k === "ALL" ? "All Types" : k === "PRIVATE" ? "Private Room" : "Dormitory"}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Cards */}
            <div className="space-y-5">
              {filteredRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="bg-[#F7F5F0] rounded-[24px] border border-white/40 shadow-lg overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="md:w-72 h-52 md:h-auto shrink-0 relative">
                    <img src={room.image} alt={room.roomType} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      room.kind === "PRIVATE" ? "bg-[#1C2D37] text-white" : "bg-[#2A9D8F] text-white"
                    }`}>
                      {room.kind === "PRIVATE" ? "Private" : "Dormitory"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-base text-[#1C2D37]">{room.roomType}</h3>
                          <p className="text-xs text-[#1C2D37]/50 mt-0.5">Room {room.roomCode}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-[#1C2D37]">₹{room.basePrice.toLocaleString()}</div>
                          <div className="text-[10px] text-[#1C2D37]/40">per bed / night</div>
                        </div>
                      </div>

                      <p className="text-xs text-[#1C2D37]/60 mb-4 leading-relaxed">{room.description}</p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.map((a) => (
                          <span key={a} className="flex items-center gap-1.5 bg-[#E5E7E6] px-2.5 py-1 rounded-full text-[10px] text-[#1C2D37]/70 font-medium">
                            {AMENITY_ICONS[a]} {a}
                          </span>
                        ))}
                        <span className="flex items-center gap-1 bg-[#F4A261]/15 px-2.5 py-1 rounded-full text-[10px] text-[#E76F51] font-semibold">
                          <Star className="w-3 h-3 fill-[#E76F51]" /> {room.rating} · {room.reviews} reviews
                        </span>
                      </div>

                      {/* Bed Selector for Dorms */}
                      {room.kind === "DORM" && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#1C2D37]/40 font-bold mb-2">Select Beds</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {room.beds.map((bed) => {
                              const selected = (selectedBeds[room.roomId] ?? []).includes(bed.bedId);
                              return (
                                <button
                                  key={bed.bedId}
                                  disabled={!bed.available}
                                  onClick={() => toggleBed(room.roomId, bed.bedId)}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-semibold border transition-all ${
                                    !bed.available
                                      ? "bg-[#1C2D37]/5 text-[#1C2D37]/20 border-transparent cursor-not-allowed line-through"
                                      : selected
                                      ? "bg-[#2A9D8F] text-white border-transparent"
                                      : "bg-white text-[#1C2D37]/70 border-[#1C2D37]/10 hover:border-[#2A9D8F]/40"
                                  }`}
                                >
                                  {bed.bedCode}
                                  {!bed.available && " (taken)"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Single bed toggle for private */}
                      {room.kind === "PRIVATE" && (
                        <button
                          onClick={() => toggleBed(room.roomId, room.beds[0].bedId)}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all mt-2 ${
                            (selectedBeds[room.roomId] ?? []).includes(room.beds[0].bedId)
                              ? "bg-[#2A9D8F] text-white border-transparent"
                              : "bg-white text-[#1C2D37]/70 border-[#1C2D37]/10 hover:border-[#2A9D8F]/40"
                          }`}
                        >
                          {(selectedBeds[room.roomId] ?? []).includes(room.beds[0].bedId)
                            ? "✓ Room Selected"
                            : "Select this Room"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── STICKY BOOKING SUMMARY BAR ── */}
            {totalBeds > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#1C2D37] border-t border-white/5 px-6 py-4 flex items-center justify-between z-50 shadow-2xl">
                <div className="text-white">
                  <div className="text-sm font-semibold">
                    {totalBeds} bed{totalBeds > 1 ? "s" : ""} selected · {nights} night{nights !== 1 ? "s" : ""}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">Taxes & fees will be calculated at checkout</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString()}</div>
                    <div className="text-white/40 text-[10px]">Total (estimated)</div>
                  </div>
                  <button
                    onClick={() => router.push("/bookings/new")}
                    className="bg-[#E76F51] hover:bg-[#d85c3e] text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#E76F51]/20"
                  >
                    Confirm & Book <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
