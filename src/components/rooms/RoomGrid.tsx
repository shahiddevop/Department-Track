import React, { useState, useMemo } from 'react';
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
  CalendarCheck,
  Lock,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { Room, RoomStatus, RoomType } from '../../types';
import { RoomBookingModal } from './RoomBookingModal';
import { getFacultyAssignedRoom } from '../../utils/roomAssignment';

export const RoomGrid: React.FC = () => {
  const { 
    rooms, 
    bookings, 
    updateRoomStatus, 
    deleteRoomBooking, 
    clearAllBookings,
    selectedBranch, 
    selectedBranchId, 
    timetable 
  } = useDepartment();
  const { canBookRooms, canManageDepartment, currentUser } = useAuth();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const facultyAssignedRoomInfo = useMemo(() => {
    return getFacultyAssignedRoom({
      currentUser,
      rooms,
      timetable,
      selectedBranchId
    });
  }, [currentUser, rooms, timetable, selectedBranchId]);

  const roomTypes: string[] = [
    'ALL',
    'Computer Lab',
    'Life Science',
    'Seminar Hall'
  ];

  const filteredRooms = rooms.filter(room => {
    if (selectedType !== 'ALL' && room.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && room.currentStatus !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = room.number.toLowerCase().includes(q) || room.number.toLowerCase().replace(/[-_]/g, ' ').includes(q);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
            <span 
              className="badge badge-indigo" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem'
              }}
            >
              <Lock size={13} />
              <span>Pre-Assigned Facility ({currentUser.branchName}):</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {facultyAssignedRoomInfo.room.number}
              </strong>
              <span style={{ opacity: 0.85 }}>({facultyAssignedRoomInfo.room.name})</span>
            </span>
          </div>
        </div>

        <div className="no-print header-actions-row">
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
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flex: '1 1 280px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {roomTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t === 'ALL' ? 'All Facilities' : t}
              </button>
            ))}
          </div>

          {/* Status & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 260px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '140px', flex: '1 1 120px' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>

            <div style={{ position: 'relative', flex: '2 1 160px' }}>
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
      <div className="cards-grid-auto" style={{ marginBottom: '2.5rem' }}>
        {filteredRooms.map(room => {
          const isAvailable = room.currentStatus === 'Available';
          const isOccupied = room.currentStatus === 'Occupied';
          const isFacultyDesignated = facultyAssignedRoomInfo.room.id === room.id;

          return (
            <div
              key={room.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${isAvailable ? 'var(--accent-emerald)' : isOccupied ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                border: isFacultyDesignated ? '1.5px solid rgba(99, 102, 241, 0.45)' : undefined,
                boxShadow: isFacultyDesignated ? '0 0 16px rgba(99, 102, 241, 0.12)' : undefined,
                position: 'relative'
              }}
            >
              <div>
                {/* Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    {isFacultyDesignated && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={11} /> Designated Facility
                      </span>
                    )}
                  </div>
                  {getStatusBadge(room.currentStatus)}
                </div>

                {/* Name & Location */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {room.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: isOccupied ? '0.85rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  📍 {room.floor}
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
              </div>

              {/* Action Buttons & Status Toggle */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: isAvailable ? 'space-between' : 'flex-end', gap: '0.5rem' }}>
                {isAvailable && (
                  <button
                    onClick={() => handleOpenBooking(room)}
                    className={isFacultyDesignated ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                    style={{ flex: 1 }}
                  >
                    <CalendarCheck size={14} /> {isFacultyDesignated ? 'Book Designated Slot' : 'Book Slot'}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Room Reservation Records</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Official bookings requested by faculty, students, and departmental committees
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-indigo">{bookings.length} Bookings</span>
            {bookings.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all reservation records?')) {
                    clearAllBookings();
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  color: 'var(--accent-rose)',
                  borderColor: 'rgba(244, 63, 94, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Clear all reservation records"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
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
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No room reservation records found.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
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
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => deleteRoomBooking(b.id)}
                        className="btn btn-secondary btn-sm"
                        title={`Delete reservation for ${b.roomNumber}`}
                        style={{
                          padding: '0.35rem 0.65rem',
                          color: 'var(--accent-rose)',
                          borderColor: 'rgba(244, 63, 94, 0.3)',
                          background: 'rgba(244, 63, 94, 0.08)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                          e.currentTarget.style.borderColor = 'var(--accent-rose)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
