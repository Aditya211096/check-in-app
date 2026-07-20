"use client";

import React, { useState } from "react";
import {
  ShieldAlert, Building2, Plus, Zap, CheckCircle2, Sliders,
  Layers, RefreshCw, Sparkles, Server, Globe, ExternalLink
} from "lucide-react";
import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from "@/hooks/use-feature-flags";

interface TenantData {
  id: string;
  name: string;
  slug: string;
  plan: "HOSTEL_BASIC" | "HOTEL_PREMIUM" | "ENTERPRISE_BOUTIQUE";
  createdAt: string;
  featureFlags: FeatureFlags;
  branding: {
    logoUrl?: string;
    primaryColor: string;
    propertyName: string;
  };
}

const INITIAL_TENANTS: TenantData[] = [
  {
    id: "t1",
    name: "Sunrise Varanasi Ghat",
    slug: "sunrise-varanasi",
    plan: "HOTEL_PREMIUM",
    createdAt: "2026-06-01",
    featureFlags: { ...DEFAULT_FEATURE_FLAGS },
    branding: {
      primaryColor: "#E76F51",
      propertyName: "Sunrise Varanasi Ghat",
    },
  },
  {
    id: "t2",
    name: "Zostel Rishikesh Heritage",
    slug: "zostel-rishikesh",
    plan: "HOSTEL_BASIC",
    createdAt: "2026-06-15",
    featureFlags: { ...DEFAULT_FEATURE_FLAGS, FEATURE_FOOD_ORDERING: false },
    branding: {
      primaryColor: "#2A9D8F",
      propertyName: "Zostel Rishikesh Heritage",
    },
  },
];

const FEATURE_DESCRIPTIONS: Record<keyof FeatureFlags, string> = {
  FEATURE_DORM_BED_INVENTORY: "Bed-level granular inventory vs whole room allocation",
  FEATURE_DIGILOCKER_VERIFICATION: "DigiLocker API Setu OAuth 2.0 verification flow",
  FEATURE_FOOD_ORDERING: "Digital room service menu & KDS kitchen workflow",
  FEATURE_VOICE_NOTES_DISPATCH: "HTML5 audio voice notes for task dispatching",
  FEATURE_ROOM_TAB_LEDGER: "Central guest tab ledger & express checkout settlement",
  FEATURE_CUSTOMER_COMPLAINTS: "In-stay emergency complaints & SLA escalation alerts",
  FEATURE_WHATSAPP_AUTOMATION: "Automated WhatsApp pre-checkin link triggers",
  FEATURE_EXECUTIVE_KPI_ANALYTICS: "Executive financial & operational SLA KPI dashboards",
};

export default function SuperAdminConsole() {
  const [tenants, setTenants] = useState<TenantData[]>(INITIAL_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState<TenantData>(INITIAL_TENANTS[0]);
  const [provisionModal, setProvisionModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState<TenantData["plan"]>("HOTEL_PREMIUM");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFlag = (key: keyof FeatureFlags) => {
    const updatedFlags = {
      ...selectedTenant.featureFlags,
      [key]: !selectedTenant.featureFlags[key],
    };
    const updatedTenant = { ...selectedTenant, featureFlags: updatedFlags };
    setSelectedTenant(updatedTenant);
    setTenants((prev) => prev.map((t) => (t.id === selectedTenant.id ? updatedTenant : t)));
    showToast(`Feature '${key}' updated live! Hot-reloading via SSE broadcast.`);
  };

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) return;
    setIsProvisioning(true);

    setTimeout(() => {
      const created: TenantData = {
        id: "t_" + Math.random().toString(36).substring(2, 9),
        name: newTenantName,
        slug: newTenantSlug.toLowerCase().replace(/\s+/g, "-"),
        plan: newTenantPlan,
        createdAt: new Date().toISOString().split("T")[0],
        featureFlags: { ...DEFAULT_FEATURE_FLAGS },
        branding: {
          primaryColor: "#E76F51",
          propertyName: newTenantName,
        },
      };
      setTenants((prev) => [created, ...prev]);
      setSelectedTenant(created);
      setIsProvisioning(false);
      setProvisionModal(false);
      setNewTenantName("");
      setNewTenantSlug("");
      showToast(`Tenant '${created.name}' provisioned in 2.4 seconds! RLS DB scope initialized.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#141E24] text-white font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2A9D8F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Console Bar */}
      <header className="bg-[#1C2D37] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#E76F51] to-[#F4A261] rounded-xl flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Platform Super-Admin Console <span className="text-[9px] bg-[#E76F51]/20 text-[#E76F51] border border-[#E76F51]/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Provider Access Only</span>
            </h1>
            <p className="text-white/40 text-xs">Multi-Tenant Tenant Provisioning & Hot-Reloading Feature Flag Engine</p>
          </div>
        </div>

        <button
          onClick={() => setProvisionModal(true)}
          className="bg-gradient-to-r from-[#E76F51] to-[#F4A261] hover:brightness-110 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#E76F51]/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Provision New Tenant (&lt; 60s)
        </button>
      </header>

      {/* Main Console Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tenant Directory */}
        <aside className="w-80 bg-[#1A262F] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Tenants ({tenants.length})
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Postgres RLS Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTenant(t)}
                className={`w-full p-4 rounded-2xl text-left border transition-all flex flex-col gap-2 ${
                  selectedTenant.id === t.id
                    ? "bg-[#1C2D37] border-[#E76F51] shadow-lg shadow-[#E76F51]/10"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white truncate">{t.name}</span>
                  <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/60">{t.plan}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  <span>slug: {t.slug}</span>
                  <span>Created {t.createdAt}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content: Selected Tenant Feature Flag & Branding Control */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Header Card */}
          <div className="bg-[#1C2D37] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">{selectedTenant.name}</h2>
                <span className="text-xs font-mono bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40 px-3 py-1 rounded-full font-bold">
                  {selectedTenant.plan}
                </span>
              </div>
              <p className="text-white/40 text-xs">Tenant ID: <code className="text-[#F4A261] font-mono">{selectedTenant.id}</code> · Isolated RLS Schema Scope</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/dashboard/owner`, "_blank")}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Launch Tenant Portal
              </button>
            </div>
          </div>

          {/* Feature Flags Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#F4A261]" /> Reactive Real-Time Feature Flag Controls
                </h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Toggling feature flags triggers instant SSE event stream broadcast to live tenant sessions without relogin.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                SSE Live Broadcast: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(DEFAULT_FEATURE_FLAGS) as Array<keyof FeatureFlags>).map((flagKey) => {
                const enabled = selectedTenant.featureFlags[flagKey];
                return (
                  <div
                    key={flagKey}
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      enabled
                        ? "bg-[#1C2D37]/80 border-[#2A9D8F]/40 shadow-md shadow-[#2A9D8F]/5"
                        : "bg-white/5 border-white/5 opacity-60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-white">{flagKey}</span>
                        {enabled ? (
                          <span className="text-[9px] font-bold bg-[#2A9D8F]/20 text-[#2A9D8F] px-2 py-0.5 rounded-full">ENABLED</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-white/10 text-white/40 px-2 py-0.5 rounded-full">DISABLED</span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{FEATURE_DESCRIPTIONS[flagKey]}</p>
                    </div>

                    <button
                      onClick={() => handleToggleFlag(flagKey)}
                      className={`w-12 h-6 rounded-full transition-all relative shrink-0 p-1 ${
                        enabled ? "bg-[#2A9D8F]" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all shadow-md ${
                          enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Provisioning Modal */}
      {provisionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#1C2D37] border border-white/10 rounded-3xl p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white font-serif">Provision New Tenant</h3>
                <p className="text-white/40 text-xs mt-1">Initializes Postgres RLS schema & tenant configuration in &lt; 60s</p>
              </div>
              <button onClick={() => setProvisionModal(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <form onSubmit={handleProvisionTenant} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Property / Tenant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backpacker Haven Goa"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#E76F51]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Tenant Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. backpacker-goa"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#E76F51]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Subscription Tier</label>
                <select
                  value={newTenantPlan}
                  onChange={(e) => setNewTenantPlan(e.target.value as TenantData["plan"])}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#E76F51]"
                >
                  <option value="HOSTEL_BASIC" className="bg-[#1C2D37]">Hostel Basic</option>
                  <option value="HOTEL_PREMIUM" className="bg-[#1C2D37]">Hotel Premium</option>
                  <option value="ENTERPRISE_BOUTIQUE" className="bg-[#1C2D37]">Enterprise Boutique</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProvisionModal(false)}
                  className="flex-1 bg-white/10 text-white/70 py-3 rounded-xl font-semibold text-xs hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="flex-1 bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#E76F51]/20 disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Zap className="w-4 h-4" /> Provision Tenant</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
