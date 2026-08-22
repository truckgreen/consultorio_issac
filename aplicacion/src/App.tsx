import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { MobileBottomNav } from './components/admin/MobileBottomNav';
import { MobileMenuSheet } from './components/admin/MobileMenuSheet';
import { DashboardView } from './components/admin/DashboardView';
import { AppointmentsManagerView } from './components/admin/AppointmentsManagerView';
import { PatientsDirectoryView } from './components/admin/PatientsDirectoryView';
import { StaffManagementView } from './components/admin/StaffManagementView';
import { ServicesPricingView } from './components/admin/ServicesPricingView';
import { MessagesInboxView } from './components/admin/MessagesInboxView';
import { SettingsView } from './components/admin/SettingsView';

import { CreateAppointmentModal } from './components/admin/CreateAppointmentModal';
import { EditAppointmentModal } from './components/admin/EditAppointmentModal';
import { PatientDetailModal } from './components/admin/PatientDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import { SpecialistAuth } from './components/admin/SpecialistAuth';

import { 
  Appointment, 
  AppointmentStatus, 
  ContactMessage, 
  PatientRecord, 
  SupabaseConfig, 
  AdminNotification 
} from './types';

import { 
  getCurrentSupabaseConfig, 
  getSupabaseClient,
  getAppointmentsFromDb, 
  subscribeToAppointments,
  insertAppointment, 
  updateAppointmentInDb, 
  deleteAppointmentFromDb,
  getContactMessagesFromDb,
  updateContactMessageStatus,
  deleteContactMessageFromDb,
  saveLocalAppointments,
  saveLocalMessages
} from './lib/supabase';

import { 
  INITIAL_SAMPLE_APPOINTMENTS, 
  INITIAL_SAMPLE_MESSAGES, 
  INITIAL_NOTIFICATIONS 
} from './data/sampleAdminData';

export function App() {
  // 1. Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('equilibra_theme') === 'dark' ||
      (!('equilibra_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // 2. Active Admin Navigation Tab & Mobile Menu State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 3. Database & App Data State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getCurrentSupabaseConfig());
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);

  // 4. Modals State
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [defaultStaffForNewApp, setDefaultStaffForNewApp] = useState<string | undefined>(undefined);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const [selectedPatientFile, setSelectedPatientFile] = useState<{
    patient: PatientRecord;
    appointments: Appointment[];
  } | null>(null);

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthChecked(true);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setAuthSession(data.session);
      setAuthChecked(true);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Apply dark mode class to HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('equilibra_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('equilibra_theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Data Fetching from Supabase & Local Cache
  useEffect(() => {
    async function loadData() {
      const config = getCurrentSupabaseConfig();
      setSupabaseConfig(config);
      const dbAppointments = await getAppointmentsFromDb();
      if (dbAppointments && dbAppointments.length > 0) {
        setAppointments(dbAppointments);
      } else if (!config.isConnected) {
        // Populate initial seed data so the clinic dashboard is immediately populated
        setAppointments(INITIAL_SAMPLE_APPOINTMENTS);
        saveLocalAppointments(INITIAL_SAMPLE_APPOINTMENTS);
      } else {
        setAppointments([]);
      }

      const dbMessages = await getContactMessagesFromDb();
      if (dbMessages && dbMessages.length > 0) {
        setMessages(dbMessages);
      } else {
        setMessages(INITIAL_SAMPLE_MESSAGES);
        saveLocalMessages(INITIAL_SAMPLE_MESSAGES);
      }

    }

    loadData();

    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
    });

    return () => unsubscribe?.();
  }, []);

  // CRUD Operations for Appointments
  const handleSaveNewAppointment = async (newApp: Appointment) => {
    setAppointments(prev => [newApp, ...prev]);
    await insertAppointment(newApp);
    
    // Add notification
    const notif: AdminNotification = {
      id: `notif_${Date.now()}`,
      title: 'Nueva Cita Agendada',
      message: `${newApp.nombre} ${newApp.apellido} (${newApp.service_title}) para el ${newApp.fecha}.`,
      timestamp: 'Ahora mismo',
      type: 'appointment',
      read: false,
      linkTab: 'citas'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    await updateAppointmentInDb(id, updates);
  };

  const handleQuickStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await updateAppointmentInDb(id, { status: newStatus });
  };

  const handleDeleteAppointment = async (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    await deleteAppointmentFromDb(id);
  };

  // CRUD Operations for Messages
  const handleUpdateMessageStatus = async (id: string, status: 'NUEVO' | 'RESPONDIDO' | 'ARCHIVADO', adminNotes?: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status, adminNotes: adminNotes ?? m.adminNotes } : m));
    await updateContactMessageStatus(id, status, adminNotes);
  };

  const handleDeleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    await deleteContactMessageFromDb(id);
  };

  // Notification Operations
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Demo Data Reset & Operations
  const handleLoadDemoData = () => {
    setAppointments(INITIAL_SAMPLE_APPOINTMENTS);
    saveLocalAppointments(INITIAL_SAMPLE_APPOINTMENTS);
    setMessages(INITIAL_SAMPLE_MESSAGES);
    saveLocalMessages(INITIAL_SAMPLE_MESSAGES);
    alert('Datos de prueba de la clínica EQUILIBRA cargados con éxito.');
  };

  const handleClearLocalData = () => {
    setAppointments([]);
    setMessages([]);
    saveLocalAppointments([]);
    saveLocalMessages([]);
    alert('Registros locales vaciados.');
  };

  // CSV Export
  const handleExportCsv = () => {
    if (appointments.length === 0) {
      alert('No hay citas para exportar.');
      return;
    }

    const headers = ['Código', 'Fecha', 'Hora', 'Paciente', 'Teléfono', 'Email', 'Servicio', 'Especialista', 'Estado', 'Monto ($ USD)', 'Motivo'];
    const rows = appointments.map(a => [
      `"${a.code}"`,
      `"${a.fecha}"`,
      `"${a.hora}"`,
      `"${a.nombre} ${a.apellido}"`,
      `"${a.telefono}"`,
      `"${a.email}"`,
      `"${a.service_title}"`,
      `"${a.specialist_name || ''}"`,
      `"${a.status}"`,
      `"${a.amount || 35}"`,
      `"${(a.motivo || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EQUILIBRA_Citas_Reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Backup Export
  const handleExportJsonBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      clinic: 'EQUILIBRA Centro de Fisioterapia & Salud Integral (Sabana Grande)',
      appointments,
      messages
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EQUILIBRA_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Counts for navigation badges
  const todayStr = new Date().toISOString().split('T')[0];
  const counts = {
    appointmentsToday: appointments.filter(a => a.fecha === todayStr).length,
    appointmentsTotal: appointments.length,
    patientsTotal: new Set(appointments.map(a => `${a.nombre.toLowerCase()}_${a.apellido.toLowerCase()}`)).size,
    unreadMessages: messages.filter(m => m.status === 'NUEVO').length
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  const supabaseClient = getSupabaseClient();
  if (!authSession && supabaseClient) {
    return <SpecialistAuth client={supabaseClient} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-amber-500 selection:text-white flex flex-col">
      
      {/* 1. Mobile & Desktop App Header */}
      <AdminHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenNewAppointmentModal={() => {
          setDefaultStaffForNewApp(undefined);
          setIsNewAppointmentOpen(true);
        }}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onNavigateToTab={(tabId) => setActiveTab(tabId as AdminTab)}
        activeTab={activeTab}
      />

      {/* 2. Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* Sidebar Navigation (Visible on Desktop / Tablet) */}
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            counts={counts}
          />

          {/* Dynamic Content View */}
          <main className="flex-1 min-w-0 w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                appointments={appointments}
                messages={messages}
                onOpenNewAppointmentModal={() => {
                  setDefaultStaffForNewApp(undefined);
                  setIsNewAppointmentOpen(true);
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectAppointmentForEdit={(app) => setEditingAppointment(app)}
                onQuickUpdateStatus={handleQuickStatusChange}
                onExportCsv={handleExportCsv}
              />
            )}

            {activeTab === 'citas' && (
              <AppointmentsManagerView
                appointments={appointments}
                onOpenNewAppointmentModal={() => {
                  setDefaultStaffForNewApp(undefined);
                  setIsNewAppointmentOpen(true);
                }}
                onSelectAppointmentForEdit={(app) => setEditingAppointment(app)}
                onQuickUpdateStatus={handleQuickStatusChange}
                onDeleteAppointment={handleDeleteAppointment}
                onExportCsv={handleExportCsv}
              />
            )}

            {activeTab === 'pacientes' && (
              <PatientsDirectoryView
                appointments={appointments}
                onSelectPatientFile={(patient, patientApps) => {
                  setSelectedPatientFile({ patient, appointments: patientApps });
                }}
                onOpenNewAppointmentModal={() => {
                  setDefaultStaffForNewApp(undefined);
                  setIsNewAppointmentOpen(true);
                }}
              />
            )}

            {activeTab === 'especialistas' && (
              <StaffManagementView
                appointments={appointments}
                onOpenNewAppointmentForStaff={(staffName) => {
                  setDefaultStaffForNewApp(staffName);
                  setIsNewAppointmentOpen(true);
                }}
              />
            )}

            {activeTab === 'servicios' && (
              <ServicesPricingView />
            )}

            {activeTab === 'mensajes' && (
              <MessagesInboxView
                messages={messages}
                onUpdateStatus={handleUpdateMessageStatus}
                onDeleteMessage={handleDeleteMessage}
              />
            )}

            {activeTab === 'configuracion' && (
              <SettingsView
                supabaseConfig={supabaseConfig}
                onConfigUpdated={() => setSupabaseConfig(getCurrentSupabaseConfig())}
                onLoadDemoData={handleLoadDemoData}
                onExportCsv={handleExportCsv}
                onExportJsonBackup={handleExportJsonBackup}
                onClearData={handleClearLocalData}
              />
            )}
          </main>

        </div>
      </div>

      {/* 3. Mobile Bottom Dock Navigation (Phone ergonomic bar) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
        onOpenNewAppointment={() => {
          setDefaultStaffForNewApp(undefined);
          setIsNewAppointmentOpen(true);
        }}
        counts={counts}
      />

      {/* 4. Mobile "Más" Menu Sheet */}
      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onExportCsv={handleExportCsv}
        onExportJsonBackup={handleExportJsonBackup}
        onLoadDemoData={handleLoadDemoData}
        unreadMessagesCount={counts.unreadMessages}
      />

      {/* 5. Global Admin Modals */}

      {/* New Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onSaveAppointment={handleSaveNewAppointment}
        defaultSpecialistName={defaultStaffForNewApp}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={Boolean(editingAppointment)}
        onClose={() => setEditingAppointment(null)}
        appointment={editingAppointment}
        onSaveUpdates={handleUpdateAppointment}
        onDeleteAppointment={handleDeleteAppointment}
      />

      {/* Patient Detail / Dossier Modal */}
      <PatientDetailModal
        isOpen={Boolean(selectedPatientFile)}
        onClose={() => setSelectedPatientFile(null)}
        patient={selectedPatientFile?.patient || null}
        patientAppointments={selectedPatientFile?.appointments || []}
        onOpenNewAppointmentForPatient={(patient) => {
          setDefaultStaffForNewApp(undefined);
          setIsNewAppointmentOpen(true);
        }}
      />

      {/* Supabase Connection Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          setSupabaseConfig(getCurrentSupabaseConfig());
        }}
        config={supabaseConfig}
        onConfigUpdated={() => {
          setSupabaseConfig(getCurrentSupabaseConfig());
        }}
      />

    </div>
  );
}

export default App;
