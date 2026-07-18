import React, { useState, useEffect } from 'react';
import { AlertOctagon, Check, Play, CheckSquare, BellRing, UtensilsCrossed, Brush } from 'lucide-react';

interface StaffDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ token, user, onLogout }) => {
  const [unverifiedGuests, setUnverifiedGuests] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [takeoverTask, setTakeoverTask] = useState<any | null>(null);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch bookings to find guests needing verification
      const resBookings = await fetch('http://localhost:5000/api/stay/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataBookings = await resBookings.json();
      if (Array.isArray(dataBookings)) {
        setUnverifiedGuests(dataBookings.filter(b => b.guest && !b.guest.isVerified && b.guest.idProofUrl));
      }

      // 2. Fetch tasks
      const resTasks = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataTasks = await resTasks.json();
      if (Array.isArray(dataTasks)) {
        setTasks(dataTasks);
        
        // Find any PENDING task to trigger takeover alert if not acknowledged
        const pending = dataTasks.find(t => t.status === 'PENDING');
        if (pending) {
          setTakeoverTask(pending);
        }
      }

      // 3. Fetch rooms
      const resRooms = await fetch('http://localhost:5000/api/stay/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRooms = await resRooms.json();
      if (Array.isArray(dataRooms)) {
        setRooms(dataRooms);
      }

      // 4. Fetch orders
      const resOrders = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataOrders = await resOrders.json();
      if (Array.isArray(dataOrders)) {
        setOrders(dataOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // SSE connection for live updates
    const sse = new EventSource(`http://localhost:5000/api/realtime/stream?token=${token}`);

    sse.addEventListener('task_new', (e: any) => {
      const newTask = JSON.parse(e.data);
      setTasks(prev => [newTask, ...prev]);
      setTakeoverTask(newTask); // Trigger screen takeover alert buzzer
    });

    sse.addEventListener('task_updated', (e: any) => {
      const updatedTask = JSON.parse(e.data);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
      if (takeoverTask?.id === updatedTask.id && updatedTask.status !== 'PENDING') {
        setTakeoverTask(null); // Clear takeover once acknowledged
      }
    });

    sse.addEventListener('order_new', (e: any) => {
      const newOrder = JSON.parse(e.data);
      setOrders(prev => [newOrder, ...prev]);
    });

    return () => {
      sse.close();
    };
  }, [token, takeoverTask]);

  const handleVerifyGuest = async (bookingId: string) => {
    try {
      // Find guest ID to update profile verification status
      const booking = unverifiedGuests.find(b => b.id === bookingId);
      if (!booking) return;

      // Simulate approving profile verification
      await fetch(`http://localhost:5000/api/stay/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTakeoverTask(null);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteCleaning = async (roomId: string) => {
    try {
      await fetch(`http://localhost:5000/api/stay/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'AVAILABLE' }),
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="desktop-container">
      {/* Dynamic Screen Takeover buzzer alert overlay for staff */}
      {takeoverTask && (
        <div className="fixed inset-0 bg-primary bg-opacity-95 z-50 flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="animate-bounce mb-6">
            <BellRing size={64} className="text-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-2">
            New Guest Complaint!
          </h1>
          <p className="text-sm opacity-90 max-w-md mb-8">
            Room {takeoverTask.booking?.room?.roomNumber}: "{takeoverTask.description}"
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleAcknowledgeTask(takeoverTask.id)} 
              className="kashi-btn kashi-btn-secondary bg-white text-primary border-none font-bold py-4 px-8"
            >
              <Play size={18} /> Acknowledge Ticket
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Kashi Staff Dashboard</h1>
          <p className="text-xs text-text-secondary">Logged in as Front Desk/Housekeeping - {user.fullName}</p>
        </div>
        <button onClick={onLogout} className="kashi-btn kashi-btn-secondary text-xs px-4">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: ID Verification Queue & Housekeeping */}
        <div className="flex flex-col gap-8">
          
          {/* Guest ID Verification Queue */}
          <div className="kashi-card">
            <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
              <AlertOctagon size={18} className="text-secondary" /> Guest Verification Queue
            </h2>
            {unverifiedGuests.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No pending ID verifications.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {unverifiedGuests.map(b => (
                  <div key={b.id} className="p-4 bg-bg border border-border rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-dark-navy">{b.guest.fullName}</span>
                      <span className="text-xs font-semibold text-secondary">Room {b.room.roomNumber}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mb-3"><strong>Parsed ID Number:</strong> {b.guest.idDetails?.idNumber}</p>
                    <button 
                      onClick={() => handleVerifyGuest(b.id)} 
                      className="kashi-btn kashi-btn-primary w-full text-xs py-2"
                    >
                      <Check size={14} /> Approve Verification & Check-In
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Housekeeping / Room cleaning queue */}
          <div className="kashi-card">
            <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
              <Brush size={18} className="text-teal" /> Housekeeping Queue
            </h2>
            {rooms.filter(r => r.status === 'CLEANING').length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">All rooms are clean and available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rooms.filter(r => r.status === 'CLEANING').map(r => (
                  <div key={r.id} className="p-4 bg-bg border border-border rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-lg font-bold text-dark-navy">Room {r.roomNumber}</span>
                      <p className="text-[10px] text-primary uppercase font-bold tracking-wider mt-1">Needs Cleaning</p>
                    </div>
                    <button 
                      onClick={() => handleCompleteCleaning(r.id)} 
                      className="kashi-btn kashi-btn-secondary text-xs py-2 mt-4"
                    >
                      <CheckSquare size={14} /> Cleaned
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active complaints & Kitchen Orders */}
        <div className="flex flex-col gap-8">
          
          {/* Active Complaints/Maintenance */}
          <div className="kashi-card">
            <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
              <BellRing size={18} className="text-primary" /> Active Service Tickets
            </h2>
            {tasks.filter(t => t.status !== 'RESOLVED').length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No active service tickets.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.filter(t => t.status !== 'RESOLVED').map(task => (
                  <div key={task.id} className={`p-4 border rounded-xl ${task.status === 'BREACHED' ? 'border-primary bg-red-50 bg-opacity-20' : 'border-border bg-bg'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">{task.status}</span>
                      <span className="text-xs text-text-secondary">Room {task.booking?.room?.roomNumber}</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-navy mb-4">"{task.description}"</p>
                    <div className="flex gap-2">
                      {task.status === 'PENDING' ? (
                        <button onClick={() => handleAcknowledgeTask(task.id)} className="kashi-btn kashi-btn-primary text-xs py-2 px-4">
                          Acknowledge
                        </button>
                      ) : (
                        <button onClick={() => handleResolveTask(task.id)} className="kashi-btn kashi-btn-secondary text-xs py-2 px-4">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kitchen / F&B Orders */}
          <div className="kashi-card">
            <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-secondary" /> Kitchen F&B Orders
            </h2>
            {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No active kitchen orders.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').map(o => (
                  <div key={o.id} className="p-4 bg-bg border border-border rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-teal">Status: {o.status}</span>
                      <span className="text-xs text-text-secondary">Room {o.booking?.room?.roomNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-dark-navy mb-2">
                      {o.items[0]?.name} (x{o.items[0]?.quantity})
                    </h4>
                    <div className="flex gap-2 mt-4">
                      {o.status === 'RECEIVED' && (
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'PREPARING')} className="kashi-btn kashi-btn-primary text-xs py-2 px-4">
                          Prepare
                        </button>
                      )}
                      {o.status === 'PREPARING' && (
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'ON_THE_WAY')} className="kashi-btn kashi-btn-primary text-xs py-2 px-4">
                          Deliver
                        </button>
                      )}
                      {o.status === 'ON_THE_WAY' && (
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED')} className="kashi-btn kashi-btn-secondary text-xs py-2 px-4">
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
