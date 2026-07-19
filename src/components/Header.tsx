import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, User, Bell, ChevronDown, Check, Menu, X } from 'lucide-react';
import { UserRole, SystemNotification } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onClearNotifications
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    patient: { label: 'Patient Portal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Manage your care journey' },
    doctor: { label: 'Doctor Hub', color: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Manage patient timelines & EHR' },
    admin: { label: 'Admin Terminal', color: 'bg-purple-50 text-purple-700 border-purple-200', desc: 'Hospital resource insights' }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/30 backdrop-blur-md relative z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-200">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xl font-bold tracking-tight text-slate-900">
                Medi<span className="text-emerald-500">Flow</span>
              </span>
              
              {/* Connection Status Indicator */}
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                  : 'bg-amber-50 text-amber-700 border-amber-200/50 animate-pulse'
              }`}>
                <span className="relative flex h-1.5 w-1.5">
                  {isOnline ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
                    </>
                  )}
                </span>
                <span className="text-[7.5px] font-extrabold">{isOnline ? 'Online' : 'Offline Cache'}</span>
              </div>
            </div>
            <div className="hidden sm:block text-[10px] font-mono tracking-wider uppercase text-slate-400">
              AI Care Coordination
            </div>
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Hackathon Role Switcher */}
          <div className="relative">
            <button
              id="role-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/40 backdrop-blur-md px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/60 focus:outline-none"
            >
              <div className={`h-2 w-2 rounded-full ${
                currentRole === 'patient' ? 'bg-emerald-500' : currentRole === 'doctor' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
              <span>{roleLabels[currentRole].label}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
                  Select Hackathon Persona
                </div>
                {(['patient', 'doctor', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    id={`role-opt-${role}`}
                    onClick={() => {
                      onRoleChange(role);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                      currentRole === role ? 'bg-slate-50 font-medium' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 capitalize">{role}</div>
                      <div className="text-xs text-slate-400">{roleLabels[role].desc}</div>
                    </div>
                    {currentRole === role && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-xl border border-white/30 bg-white/40 backdrop-blur-md p-2 text-slate-600 transition hover:bg-white/60 hover:text-slate-800"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-1 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <span className="font-semibold text-sm text-slate-800">Reminders & Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      No alerts at this moment
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-left transition hover:bg-slate-50 flex items-start gap-3 ${
                          !n.read ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className={`mt-0.5 rounded-lg p-1.5 ${
                          n.type === 'medication' ? 'bg-emerald-100 text-emerald-600' :
                          n.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                          n.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          <Activity className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-xs text-slate-800">{n.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] text-slate-400 font-mono">{n.timestamp}</span>
                            {!n.read && (
                              <button
                                onClick={() => onMarkNotificationRead(n.id)}
                                className="text-[10px] text-emerald-600 font-medium hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile User Tag */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 overflow-hidden border border-slate-200 flex items-center justify-center">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-xs text-slate-800">
                {currentRole === 'patient' ? 'Amit Sharma' : currentRole === 'doctor' ? 'Dr. Mohan Rao' : 'Amina Begum'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {currentRole === 'patient' ? 'Age: 45 | Male' : currentRole === 'doctor' ? 'Chief Cardiologist' : 'Head Administrator'}
              </div>
            </div>
          </div>

        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          {/* Notifications count mobile */}
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-white/30 bg-white/40 backdrop-blur-md p-2 text-slate-600 transition hover:bg-white/60"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-xl p-4 space-y-4 shadow-inner animate-in slide-in-from-top-2">
          {/* Persona switcher */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold tracking-wider uppercase text-slate-400 px-1">
              Switch Persona (Hackathon Test)
            </div>
            {(['patient', 'doctor', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-sm ${
                  currentRole === role ? 'bg-slate-50 border border-slate-200' : ''
                }`}
              >
                <div>
                  <span className="font-semibold text-slate-800 capitalize">{role}</span>
                  <span className="text-xs text-slate-400 block">{roleLabels[role].desc}</span>
                </div>
                {currentRole === role && (
                  <Check className="h-4 w-4 text-emerald-500" />
                )}
              </button>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* User profile details */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800">
                {currentRole === 'patient' ? 'Amit Sharma' : currentRole === 'doctor' ? 'Dr. Mohan Rao' : 'Amina Begum'}
              </div>
              <div className="text-xs text-slate-400">
                {currentRole === 'patient' ? 'Patient • Amit@sharma.in' : currentRole === 'doctor' ? 'Doctor • mohan@mediflow.in' : 'Admin • amina@mediflow.in'}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
