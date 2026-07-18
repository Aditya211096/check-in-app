import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import { Home, Trash2, ShieldAlert, PlusCircle, CheckSquare, Clock } from 'lucide-react';

interface ManagerDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ token, user, onLogout }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Room Form (Admin/Owner only)
  const [roomNum, setRoomNum] = useState('');
  const [roomType, setRoomType] = useState('Deluxe');
  const [isDormitory, setIsDormitory] = useState(false);
  const [bunkBeds, setBunkBeds] = useState(2);

  // Assign Guest form (Manager/Staff/Owner)
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [etaVal, setEtaVal] = useState<number>(15);

  const loadData = async () => {
    try {
      const resRooms = await fetch('http://localhost:5000/api/stay/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRooms = await resRooms.json();
      if (Array.isArray(dataRooms)) setRooms(dataRooms);

      const resTasks = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataTasks = await resTasks.json();
      if (Array.isArray(dataTasks)) setTasks(dataTasks);

      const resBookings = await fetch('http://localhost:5000/api/stay/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataBookings = await resBookings.json();
      if (Array.isArray(dataBookings)) setBookings(dataBookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNum) return;

    try {
      const res = await fetch('http://localhost:5000/api/stay/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNumber: roomNum,
          roomType,
          isDormitory,
          totalBunkBeds: isDormitory ? bunkBeds : 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || 'Failed to create room');
        return;
      }

      setRoomNum('');
      setIsDormitory(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/stay/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, status: string) => {
    try {
      await fetch(`http://localhost:5000/api/stay/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetETA = async (taskId: string, eta: number) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}/eta`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ etaMinutes: eta }),
      });
      setSelectedTask(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user.role === 'OWNER';

  return (
    <div className="desktop-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-dark-navy">Kashi Manager Desk</h1>
          <p className="text-xs text-text-secondary">
            {isAdmin ? 'Property Admin Portal (Owner Mode)' : 'Front Desk Manager Desk (Operations Mode)'}
          </p>
        </div>
        <button onClick={onLogout} className="premium-btn premium-btn-secondary text-xs px-4 py-2">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Room Grid & Configurations */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Rooms Grid Status matrix */}
          <div className="premium-card">
            <h2 className="text-base font-bold text-dark-navy mb-6 flex items-center gap-2">
              <Home size={18} className="text-teal" /> Property Rooms Status Matrix
            </h2>
            {rooms.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">No rooms initialized yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {rooms.map(room => {
                  let statusBg = 'border-border bg-white';
                  if (room.status === 'OCCUPIED') statusBg = 'border-teal bg-teal bg-opacity-5';
                  if (room.status === 'CLEANING') statusBg = 'border-secondary bg-secondary bg-opacity-5';
                  if (room.status === 'MAINTENANCE') statusBg = 'border-primary bg-primary bg-opacity-5';

                  const capacity = room.isDormitory ? room.totalBunkBeds * 2 : 1;
                  const checkedInCount = bookings.filter(b => b.roomId === room.id && b.status === 'CHECKED_IN').length;

                  return (
                    <div key={room.id} className={`p-5 border-2 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md ${statusBg}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-base font-bold text-dark-navy">Room {room.roomNumber}</span>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteRoom(room.id)}
                              className="text-text-secondary hover:text-primary transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-text-secondary font-medium block mt-1">
                          {room.roomType} {room.isDormitory ? `(Dormitory - ${room.totalBunkBeds} Bunks)` : '(Private)'}
                        </span>
                        
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            Occupancy: {checkedInCount} / {capacity} Beds
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-5">
                        <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Room Status</label>
                        <CustomSelect 
                          options={[
                            { value: 'AVAILABLE', label: 'Available' },
                            { value: 'OCCUPIED', label: 'Occupied' },
                            { value: 'CLEANING', label: 'Dirty/Cleaning' },
                            { value: 'MAINTENANCE', label: 'Maintenance' },
                          ]}
                          value={room.status}
                          onChange={(val) => handleUpdateRoomStatus(room.id, val)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Room Form (Admin/Owner only) */}
          {isAdmin ? (
            <div className="premium-card">
              <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-secondary" /> Configure New Room Unit
              </h2>
              <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="premium-input-container">
                    <label className="premium-input-label">Room Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 101" 
                      value={roomNum} 
                      onChange={(e) => setRoomNum(e.target.value)} 
                      className="premium-input"
                    />
                  </div>

                  <div className="premium-input-container">
                    <label className="premium-input-label">Room Category</label>
                    <CustomSelect 
                      options={[
                        { value: 'Deluxe', label: 'Deluxe Room' },
                        { value: 'Suite', label: 'Presidential Suite' },
                        { value: 'Dormitory', label: 'Dormitory Room' },
                      ]}
                      value={roomType}
                      onChange={(val) => {
                        setRoomType(val);
                        if (val === 'Dormitory') setIsDormitory(true);
                        else setIsDormitory(false);
                      }}
                    />
                  </div>
                </div>

                {isDormitory && (
                  <div className="premium-input-container bg-bg p-4 rounded-2xl border border-border">
                    <label className="premium-input-label">Dormitory Bunk Beds Count</label>
                    <p className="text-[10px] text-text-secondary mb-3">
                      Each Bunk Bed provides sleeping capacity for 2 single guests.
                    </p>
                    <input 
                      type="number" 
                      min={1} 
                      max={12}
                      value={bunkBeds} 
                      onChange={(e) => setBunkBeds(parseInt(e.target.value))} 
                      className="premium-input max-w-[120px]"
                    />
                  </div>
                )}

                <button type="submit" className="premium-btn premium-btn-primary self-end">
                  Initialize Room
                </button>
              </form>
            </div>
          ) : (
            <div className="premium-card bg-bg border border-border p-5 flex items-center gap-3">
              <ShieldAlert className="text-secondary" size={20} />
              <p className="text-xs text-text-secondary">
                Room configuration parameters (adding/deleting/sizing) are managed exclusively by the Property Owner.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Dispatch Desk (ETA adjustments) */}
        <div className="flex flex-col gap-8">
          <div className="premium-card">
            <h2 className="text-base font-bold text-dark-navy mb-4 flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" /> Active Service Tickets
            </h2>
            
            {tasks.filter(t => t.status !== 'RESOLVED').length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">All customer complaints resolved!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {tasks.filter(t => t.status !== 'RESOLVED').map(task => (
                  <div key={task.id} className="p-4 bg-bg border border-border rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-primary">Room {task.booking?.room?.roomNumber}</span>
                      <span className={`text-[10px] font-bold ${task.status === 'BREACHED' ? 'text-primary' : 'text-secondary'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-dark-navy mb-3">"{task.description}"</p>

                    {selectedTask === task.id ? (
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                        <label className="text-[10px] uppercase font-bold text-text-secondary">Set Resolve ETA (Mins)</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={etaVal} 
                            onChange={(e) => setEtaVal(parseInt(e.target.value))} 
                            className="premium-input py-1 text-center font-bold max-w-[80px]"
                          />
                          <button 
                            onClick={() => handleSetETA(task.id, etaVal)} 
                            className="premium-btn premium-btn-primary text-xs py-1 px-4"
                          >
                            Set ETA
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-text-secondary">
                          {task.etaMinutes ? `Est: ${task.etaMinutes} mins` : 'No ETA Set'}
                        </span>
                        <button 
                          onClick={() => { setSelectedTask(task.id); setEtaVal(task.etaMinutes || 15); }}
                          className="text-xs font-bold text-teal flex items-center gap-1"
                        >
                          <Clock size={12} /> {task.etaMinutes ? 'Change ETA' : 'Assign ETA'}
                        </button>
                      </div>
                    )}
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
