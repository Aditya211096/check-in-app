import React, { useState, useEffect } from 'react';
import { WaveProgress } from '../components/WaveProgress';
import { Upload, Users, Coffee, HelpCircle, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

interface GuestPortalProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({ token, user, onLogout }) => {
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ocrDetails, setOcrDetails] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Dependent form
  const [depName, setDepName] = useState('');
  const [depRel, setDepRel] = useState('');
  const [addingDep, setAddingDep] = useState(false);

  // Complaints / Tasks
  const [complaintText, setComplaintText] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  // Kitchen Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordering, setOrdering] = useState(false);

  // Load guest profile data
  const loadProfileData = async () => {
    try {
      const resProfile = await fetch('http://localhost:5000/api/guest/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProfile = await resProfile.json();
      setProfile(dataProfile);
      setOcrDetails(dataProfile.user?.idDetails);

      const resTasks = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataTasks = await resTasks.json();
      setTasks(dataTasks);

      const resOrders = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataOrders = await resOrders.json();
      setOrders(dataOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfileData();

    // Setup Realtime Push Notifications via Server-Sent Events (SSE)
    const sse = new EventSource(`http://localhost:5000/api/realtime/stream?token=${token}`);

    sse.addEventListener('task_updated', (e: any) => {
      const updatedTask = JSON.parse(e.data);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    });

    sse.addEventListener('task_resolved', (e: any) => {
      const resolvedTask = JSON.parse(e.data);
      setTasks(prev => prev.map(t => t.id === resolvedTask.id ? { ...t, ...resolvedTask } : t));
    });

    sse.addEventListener('order_updated', (e: any) => {
      const updatedOrder = JSON.parse(e.data);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
    });

    return () => {
      sse.close();
    };
  }, [token]);

  const handleUploadId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('idProof', file);

    try {
      const res = await fetch('http://localhost:5000/api/guest/upload-id', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setOcrDetails(data.idDetails);
      loadProfileData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depName || !depRel) return;

    setAddingDep(true);
    try {
      await fetch('http://localhost:5000/api/guest/dependent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: depName, relationship: depRel }),
      });
      setDepName('');
      setDepRel('');
      loadProfileData();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingDep(false);
    }
  };

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: complaintText }),
      });
      const data = await res.json();
      setTasks(prev => [data.task, ...prev]);
      setComplaintText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async (itemName: string, itemPrice: number) => {
    setOrdering(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ name: itemName, quantity: 1, price: itemPrice }],
        }),
      });
      const data = await res.json();
      setOrders(prev => [data.order, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdering(false);
    }
  };

  const activeBooking = profile?.bookings?.find((b: any) => b.status === 'CHECKED_IN');
  const upcomingBooking = profile?.bookings?.find((b: any) => b.status === 'UPCOMING');

  return (
    <div className="app-container px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-dark-navy">Kashi Guest Portal</h2>
          <p className="text-xs text-text-secondary">Welcome, {user.fullName}</p>
        </div>
        <button onClick={onLogout} className="p-2 text-text-secondary hover:text-primary transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* ID Verification Section */}
      <div className="kashi-card mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
          <Upload size={16} /> ID Proof Status
        </h3>

        {profile?.user?.isVerified ? (
          <div className="flex items-center gap-2 text-teal font-semibold text-sm">
            <CheckCircle2 size={18} /> Verified ID on file
          </div>
        ) : ocrDetails ? (
          <div>
            <div className="flex items-center gap-2 text-secondary font-semibold text-sm mb-4">
              <AlertCircle size={18} /> Auto-parsed (Pending Staff Verification)
            </div>
            <div className="text-xs bg-bg p-3 rounded-lg border border-border">
              <p><strong>Name:</strong> {ocrDetails.fullName}</p>
              <p><strong>Document Type:</strong> {ocrDetails.idType}</p>
              <p><strong>ID Number:</strong> {ocrDetails.idNumber}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadId} className="flex flex-col gap-3">
            <p className="text-xs text-text-secondary">Upload ID proof to enable zero-wait auto check-in.</p>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="kashi-input py-2"
            />
            <button 
              type="submit" 
              className="kashi-btn kashi-btn-primary w-full text-xs py-2"
              disabled={uploading || !file}
            >
              {uploading ? 'Processing OCR...' : 'Upload & Parse ID'}
            </button>
          </form>
        )}
      </div>

      {/* Dependents Section */}
      <div className="kashi-card mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
          <Users size={16} /> Dependents
        </h3>
        
        {profile?.dependents?.length > 0 && (
          <ul className="text-xs flex flex-col gap-2 mb-4">
            {profile.dependents.map((dep: any) => (
              <li key={dep.id} className="p-2 bg-bg rounded border border-border flex justify-between">
                <span>{dep.fullName} ({dep.relationship})</span>
                <span className="text-[9px] uppercase tracking-wider text-teal font-bold">Loaded</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddDependent} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Name" 
            value={depName} 
            onChange={(e) => setDepName(e.target.value)} 
            className="kashi-input text-xs py-2"
          />
          <input 
            type="text" 
            placeholder="Rel" 
            value={depRel} 
            onChange={(e) => setDepRel(e.target.value)} 
            className="kashi-input text-xs py-2"
          />
          <button 
            type="submit" 
            className="kashi-btn kashi-btn-secondary text-xs px-4"
            disabled={addingDep}
          >
            Add
          </button>
        </form>
      </div>

      {/* Stay Commands Dashboard */}
      {activeBooking ? (
        <div>
          {/* F&B Kitchen Ordering */}
          <div className="kashi-card mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
              <Coffee size={16} /> Kashi Express Kitchen
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button onClick={() => handlePlaceOrder('Kulhad Masala Chai', 30)} className="p-2 bg-bg border border-border rounded-xl text-center text-xs font-semibold hover:border-primary transition-all" disabled={ordering}>
                ☕ Chai (₹30)
              </button>
              <button onClick={() => handlePlaceOrder('Kachori Sabzi', 60)} className="p-2 bg-bg border border-border rounded-xl text-center text-xs font-semibold hover:border-primary transition-all" disabled={ordering}>
                🥟 Kachori (₹60)
              </button>
              <button onClick={() => handlePlaceOrder('Saffron Lassi', 80)} className="p-2 bg-bg border border-border rounded-xl text-center text-xs font-semibold hover:border-primary transition-all" disabled={ordering}>
                🥛 Lassi (₹80)
              </button>
            </div>

            {orders.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary">Recent Orders</span>
                <ul className="text-[11px] flex flex-col gap-2 mt-2">
                  {orders.slice(0, 3).map((o: any) => (
                    <li key={o.id} className="p-2 bg-bg rounded border border-border flex justify-between">
                      <span>{o.items[0]?.name} (x{o.items[0]?.quantity})</span>
                      <span className="font-bold text-teal">{o.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Raise Complaints / Live Progress Bar */}
          <div className="kashi-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
              <HelpCircle size={16} /> Raise Stay Requests / Complaints
            </h3>
            <form onSubmit={handleRaiseComplaint} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="E.g., Extra water bottles needed, AC not cooling..." 
                value={complaintText} 
                onChange={(e) => setComplaintText(e.target.value)} 
                className="kashi-input text-xs"
              />
              <button type="submit" className="kashi-btn kashi-btn-primary text-xs px-4">
                Raise
              </button>
            </form>

            {/* List active tickets with boat progress bar */}
            {tasks.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Stay Tickets</span>
                {tasks.map((task: any) => (
                  <WaveProgress 
                    key={task.id} 
                    status={task.status} 
                    etaMinutes={task.etaMinutes} 
                    etaSetAt={task.etaSetAt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : upcomingBooking ? (
        <div className="kashi-card text-center py-8">
          <h3 className="text-lg font-bold text-dark-navy mb-2">Upcoming Stay</h3>
          <p className="text-xs text-text-secondary mb-4">
            Reservation at {upcomingBooking.tenant?.name || 'Kashi Resort'}
          </p>
          <div className="p-3 bg-bg border border-border rounded-xl inline-block text-xs font-semibold text-secondary">
            Check-In: {new Date(upcomingBooking.checkInDate).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="kashi-card text-center py-8">
          <p className="text-xs text-text-secondary">No active bookings found.</p>
        </div>
      )}
    </div>
  );
};
