import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Users, Heart, ShieldAlert, Award, Grid, BarChart3 } from 'lucide-react';
import { ManagerDashboard } from './ManagerDashboard';

interface OwnerDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ token, user, onLogout }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'metrics' | 'rooms'>('metrics');

  const loadMetrics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tenant/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'metrics') {
      loadMetrics();
    }
  }, [token, viewMode]);

  if (viewMode === 'rooms') {
    return (
      <div>
        <div className="flex gap-4 mb-4 p-4 bg-bg rounded-2xl border border-border justify-between items-center">
          <span className="text-xs font-semibold text-text-secondary">Owner Mode: Room Controls</span>
          <button 
            onClick={() => setViewMode('metrics')} 
            className="premium-btn premium-btn-secondary text-xs py-1.5 px-4 flex items-center gap-1.5"
          >
            <BarChart3 size={14} /> Back to Metrics
          </button>
        </div>
        <ManagerDashboard token={token} user={user} onLogout={onLogout} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container justify-center items-center">
        <p className="text-sm text-text-secondary">Loading Kashi Metrics...</p>
      </div>
    );
  }

  const rooms = metrics?.rooms || { total: 0, occupied: 0, occupancyRate: 0 };
  const revenue = metrics?.revenue || { totalDailyRevenue: 0, adr: 0, revPar: 0 };
  const sat = metrics?.customerSatisfaction || { avgRating: 5.0, totalReviews: 0, feedbacks: [] };
  const ops = metrics?.operations || { activeTasks: 0, slaBreaches: 0, staffEfficiency: [], auditFeed: [] };

  return (
    <div className="desktop-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Kashi Executive Dashboard</h1>
          <p className="text-xs text-text-secondary">Varanasi Property Investor Portal</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setViewMode('rooms')} 
            className="premium-btn premium-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Grid size={14} /> Manage Rooms & Dorms
          </button>
          <button onClick={onLogout} className="premium-btn premium-btn-secondary text-xs py-2 px-4">
            Logout
          </button>
        </div>
      </div>

      {/* Grid of Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Occupancy Card */}
        <div className="premium-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Occupancy Rate</span>
              <h3 className="text-2xl font-black text-dark-navy mt-2">{rooms.occupancyRate}%</h3>
            </div>
            <div className="p-2 bg-teal bg-opacity-10 text-teal rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-4">
            {rooms.occupied} / {rooms.total} Rooms Filled Today
          </p>
        </div>

        {/* Daily RevPAR */}
        <div className="premium-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">RevPAR (Daily)</span>
              <h3 className="text-2xl font-black text-dark-navy mt-2">₹{revenue.revPar}</h3>
            </div>
            <div className="p-2 bg-secondary bg-opacity-10 text-secondary rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-4">
            ADR Target: ₹{revenue.adr} (Standard)
          </p>
        </div>

        {/* SLA breaches */}
        <div className="premium-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">SLA Breaches</span>
              <h3 className={`text-2xl font-black mt-2 ${ops.slaBreaches > 0 ? 'text-primary' : 'text-dark-navy'}`}>
                {ops.slaBreaches}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${ops.slaBreaches > 0 ? 'bg-red-50 text-primary' : 'bg-bg text-text-secondary'}`}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-4">
            Active Tickets: {ops.activeTasks}
          </p>
        </div>

        {/* Guest CSAT Rating */}
        <div className="premium-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Guest Review Index</span>
              <h3 className="text-2xl font-black text-dark-navy mt-2">{sat.avgRating} / 5.0</h3>
            </div>
            <div className="p-2 bg-purple bg-opacity-10 text-purple rounded-lg">
              <Heart size={20} />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-4">
            Total Reviews Collected: {sat.totalReviews}
          </p>
        </div>
      </div>

      {/* Detail Sections: Staff Efficiency and CSAT logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Staff speed rating metrics */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="premium-card">
            <h2 className="text-base font-bold text-dark-navy mb-6 flex items-center gap-2">
              <Award size={18} className="text-secondary" /> Staff Ticket Efficiency Rating
            </h2>
            {ops.staffEfficiency.length === 0 ? (
              <p className="text-xs text-text-secondary py-6 text-center">No resolved ticket efficiency data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="pb-3 font-bold uppercase tracking-wider">Staff Member</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-center">Resolved Tasks</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-right">Avg Response Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ops.staffEfficiency.map((staff: any) => (
                      <tr key={staff.staffId} className="border-b border-border hover:bg-bg hover:bg-opacity-20 transition-all">
                        <td className="py-4 font-semibold text-dark-navy">{staff.name}</td>
                        <td className="py-4 text-center font-bold text-teal">{staff.completedTasks} Tasks</td>
                        <td className="py-4 text-right font-black text-secondary">
                          {staff.avgResolutionMinutes} Mins
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Guest Feedbacks & Tag metrics */}
          <div className="premium-card">
            <h2 className="text-base font-bold text-dark-navy mb-6 flex items-center gap-2">
              <Heart size={18} className="text-primary" /> Live Guest Reviews Feed
            </h2>
            {sat.feedbacks.length === 0 ? (
              <p className="text-xs text-text-secondary py-6 text-center">No review logs submitted.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {sat.feedbacks.map((f: any) => (
                  <div key={f.id} className="p-4 bg-bg border border-border rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-dark-navy">{f.guestName}</span>
                      <span className="text-xs font-bold text-secondary">Rating: {f.rating}/5</span>
                    </div>
                    <p className="text-xs text-text-secondary">"{f.comments || 'No comment text provided.'}"</p>
                    {f.tags?.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {f.tags.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold bg-white text-text-secondary px-2 py-0.5 border border-border rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Event Audit Logs */}
        <div className="premium-card h-fit">
          <h2 className="text-base font-bold text-dark-navy mb-6 flex items-center gap-2">
            <Landmark size={18} className="text-teal" /> Real-time Property Operations Log
          </h2>
          {ops.auditFeed.length === 0 ? (
            <p className="text-xs text-text-secondary py-6 text-center">No operational logs recorded.</p>
          ) : (
            <div className="flex flex-col gap-4 relative pl-4 border-l border-border">
              {ops.auditFeed.map((log: any) => (
                <div key={log.id} className="relative mb-2">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal border-2 border-white" />
                  <span className="text-[9px] uppercase font-bold text-secondary">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <p className="text-xs text-dark-navy font-medium mt-1">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
