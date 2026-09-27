import React, { useState } from 'react';
import { 
  DoorClosed, 
  Plus, 
  Download, 
  Search, 
  Users, 
  Cpu, 
  Tv, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Layers,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { Room, RoomStatus, RoomType } from '../../types';
import { RoomBookingModal } from './RoomBookingModal';

export const RoomGrid: React.FC = () => {
  const { rooms, bookings, updateRoomStatus, selectedBranch } = useDepartment();
  const { canBookRooms, canManageDepartment } = useAuth();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const roomTypes: string[] = [
    'ALL',
    'Smart Classroom',
    'Lecture Hall',
    'Computer Lab',
    'Hardware / IoT Lab',
    'Seminar Hall',
    'Auditorium'
  ];

  const filteredRooms = rooms.filter(room => {
    if (selectedType !== 'ALL' && room.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && room.currentStatus !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = room.number.toLowerCase().includes(q);
      const matchName = room.name.toLowerCase().includes(q);
      const matchFloor = room.floor.toLowerCase().includes(q);
      const matchFac = room.facilities.some(f => f.toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchFloor && !matchFac) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    exportService.exportRoomsToCSV(rooms);
  };

  const handleOpenBooking = (room?: Room) => {
    setSelectedRoomForBooking(room || null);
    setIsBookingModalOpen(true);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-emerald">● Available</span>;
      case 'Occupied':
        return <span className="badge badge-rose">● In-Use / Occupied</span>;
      case 'Under Maintenance':
        return <span className="badge badge-amber">▲ Maintenance</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rooms & Laboratories Infrastructure</h1>
            <span className="badge badge-indigo">{rooms.length} Facilities</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Monitor real-time classroom & laboratory occupancy, inspect hardware equipment, and schedule reservations.
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export Inventory (CSV)
          </button>
          {canBookRooms && (
            <button onClick={() => handleOpenBooking()} className="btn btn-primary">
              <CalendarCheck size={16} /> Reserve Room / Lab
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="glass-panel no-print"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Type Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
            {roomTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t === 'ALL' ? 'All Facilities' : t}
              </button>
            ))}
          </div>

          {/* Status & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '320px' }}>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>

            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search room no, GPU, projector..."
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {filteredRooms.map(room => {
          const isAvailable = room.currentStatus === 'Available';
          const isOccupied = room.currentStatus === 'Occupied';

          return (
            <div
              key={room.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${isAvailable ? 'var(--accent-emerald)' : isOccupied ? 'var(--accent-rose)' : 'var(--accent-amber)'}`
              }}
            >
              <div>
                {/* Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '1rem', 
                        fontWeight: 800,
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--accent-indigo)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {room.number}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      {room.type}
                    </span>
                  </div>
                  {getStatusBadge(room.currentStatus)}
                </div>

                {/* Name & Location */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  {room.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  📍 {room.floor} • Seating Capacity: <strong>{room.capacity} students</strong>
                </div>

                {/* Live Occupant / Schedule Status */}
                {isOccupied && (
                  <div 
                    style={{
                      padding: '0.75rem 0.95rem',
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} /> Active Session: {room.currentSlotTime || 'In Progress'}
                    </div>
                    {room.currentSubject && (
                      <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>
                        {room.currentSubject}
                      </div>
                    )}
                    {room.currentOccupant && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        In-Charge: {room.currentOccupant}
                      </div>
                    )}
                  </div>
                )}

                {/* Facilities List */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Equipment & Amenities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {room.facilities.map((fac, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status Toggle */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: isAvailable ? 'space-between' : 'flex-end', gap: '0.5rem' }}>
                {isAvailable && (
                  <button
                    onClick={() => handleOpenBooking(room)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <CalendarCheck size={14} /> Book Slot
                  </button>
                )}

                {/* Quick Status Toggle for Admin / Faculty */}
                <select
                  className="form-select"
                  style={{ width: isAvailable ? '130px' : '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  value={room.currentStatus}
                  onChange={e => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                >
                  <option value="Available">Set Available</option>
                  <option value="Occupied">Set Occupied</option>
                  <option value="Under Maintenance">Set Maint.</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reservations Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Upcoming Room Reservations</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Official bookings requested by faculty, students, and departmental committees
            </p>
          </div>
          <span className="badge badge-indigo">{bookings.length} Bookings</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Room / Lab</th>
                <th style={{ padding: '0.75rem 1rem' }}>Purpose</th>
                <th style={{ padding: '0.75rem 1rem' }}>Applicant</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time Slot</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {b.roomNumber}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {b.purpose}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {b.bookedBy}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {b.date} ({b.startTime} - {b.endTime})
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge badge-emerald">
                      <CheckCircle size={12} /> {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Booking Modal */}
      <RoomBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedRoomForBooking(null);
        }}
        selectedRoom={selectedRoomForBooking}
      />
    </div>
  );
};
