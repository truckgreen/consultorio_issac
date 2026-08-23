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
import { CreatePatientModal } from './components/admin/CreatePatientModal';
import { EditPatientModal } from './components/admin/EditPatientModal';
import { DeletePatientModal } from './components/admin/DeletePatientModal';
import { UploadMedicalRecordModal } from './components/admin/UploadMedicalRecordModal';
import { PdfViewerModal } from './components/admin/PdfViewerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { SpecialistAuth } from './components/admin/SpecialistAuth';

import { 
  Appointment, 
  AppointmentStatus, 
  ContactMessage, 
  PatientRecord, 
  MedicalRecordDocument,
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
  getPatientsFromDb,
  insertPatientInDb,
  updatePatientInDb,
  deletePatientFromDb,
  addDocumentToPatient,
  removeDocumentFromPatient,
  saveLocalAppointments,
  saveLocalMessages,
  saveLocalPatients,
  getLocalAppointments,
  getLocalMessages,
  getLocalPatients
} from './lib/supabase';

import { 
  INITIAL_SAMPLE_APPOINTMENTS, 
  INITIAL_SAMPLE_MESSAGES, 
  INITIAL_SAMPLE_PATIENTS,
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
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);

  // 4. Modals State
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [defaultStaffForNewApp, setDefaultStaffForNewApp] = useState<string | undefined>(undefined);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Patient Modals
  const [selectedPatientFile, setSelectedPatientFile] = useState<{
    patient: PatientRecord;
    appointments: Appointment[];
  } | null>(null);

  const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientRecord | null>(null);
  const [uploadingPdfForPatient, setUploadingPdfForPatient] = useState<PatientRecord | null>(null);
  
  // PDF Viewer Modal
  const [viewingPdfDocument, setViewingPdfDocument] = useState<{
    doc: MedicalRecordDocument;
    patient: PatientRecord;
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

  // Initial Data Fetching from Supabase & Local Cache (Empty by default)
  useEffect(() => {
    async function loadData() {
      const config = getCurrentSupabaseConfig();
      setSupabaseConfig(config);

      // Clean out any legacy demo records from local cache
      const storedApps = getLocalAppointments().filter(a => !a.id.startsWith('app_seed_') && !a.id.startsWith('seed_'));
      const storedPatients = getLocalPatients().filter(p => !p.id.startsWith('pat_'));
      const storedMessages = getLocalMessages().filter(m => !m.id.startsWith('msg_seed_'));

      saveLocalAppointments(storedApps);
      saveLocalPatients(storedPatients);
      saveLocalMessages(storedMessages);

      if (config.isConnected) {
        const dbAppointments = await getAppointmentsFromDb();
        setAppointments(dbAppointments || []);

        const dbPatients = await getPatientsFromDb();
        setPatients(dbPatients || []);

        const dbMessages = await getContactMessagesFromDb();
        setMessages(dbMessages || []);
      } else {
        setAppointments(storedApps);
        setPatients(storedPatients);
        setMessages(storedMessages);
      }
    }

    loadData();

    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      setAppointments(updatedAppointments);
    });

    return () => unsubscribe?.();
  }, []);

  // CRUD Operations for Patients
  const handleCreatePatient = async (newPatient: PatientRecord) => {
    setPatients(prev => [newPatient, ...prev]);
    await insertPatientInDb(newPatient);

    const notif: AdminNotification = {
      id: `notif_${Date.now()}`,
      title: 'Nuevo Paciente Registrado',
      message: `Se ha creado el expediente de ${newPatient.nombre} ${newPatient.apellido}.`,
      timestamp: 'Ahora mismo',
      type: 'appointment',
      read: false,
      linkTab: 'pacientes'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdatePatient = async (patientId: string, updates: Partial<PatientRecord>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const updated = { ...p, ...updates };
        if (selectedPatientFile && selectedPatientFile.patient.id === patientId) {
          setSelectedPatientFile({
            ...selectedPatientFile,
            patient: updated
          });
        }
        return updated;
      }
      return p;
    }));
    await updatePatientInDb(patientId, updates);
  };

  const handleDeletePatient = async (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (selectedPatientFile && selectedPatientFile.patient.id === patientId) {
      setSelectedPatientFile(null);
    }
    await deletePatientFromDb(patientId);
  };

  // PDF Medical Record Operations
  const handleSavePdfDocument = async (newDoc: MedicalRecordDocument) => {
    await addDocumentToPatient(newDoc.patientId, newDoc);
    setPatients(prev => prev.map(p => {
      if (p.id === newDoc.patientId) {
        const currentDocs = p.documents || [];
        const updatedPatient = {
          ...p,
          documents: [newDoc, ...currentDocs.filter(d => d.id !== newDoc.id)]
        };
        if (selectedPatientFile && selectedPatientFile.patient.id === newDoc.patientId) {
          setSelectedPatientFile({
            ...selectedPatientFile,
            patient: updatedPatient
          });
        }
        return updatedPatient;
      }
      return p;
    }));

    const notif: AdminNotification = {
      id: `notif_${Date.now()}`,
      title: 'Registro PDF Anexado',
      message: `Nuevo documento "${newDoc.title}" agregado al expediente.`,
      timestamp: 'Ahora mismo',
      type: 'appointment',
      read: false,
      linkTab: 'pacientes'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleDeletePdfDocument = async (patientId: string, docId: string) => {
    await removeDocumentFromPatient(patientId, docId);
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const currentDocs = p.documents || [];
        const updatedPatient = {
          ...p,
          documents: currentDocs.filter(d => d.id !== docId)
        };
        if (selectedPatientFile && selectedPatientFile.patient.id === patientId) {
          setSelectedPatientFile({
            ...selectedPatientFile,
            patient: updatedPatient
          });
        }
        return updatedPatient;
      }
      return p;
    }));
  };

  const handleViewPdfDocument = (doc: MedicalRecordDocument, patient: PatientRecord) => {
    setViewingPdfDocument({ doc, patient });
  };

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
    setPatients(INITIAL_SAMPLE_PATIENTS);
    saveLocalPatients(INITIAL_SAMPLE_PATIENTS);
    setMessages(INITIAL_SAMPLE_MESSAGES);
    saveLocalMessages(INITIAL_SAMPLE_MESSAGES);
    alert('Datos de prueba y expedientes clínicos de EQUILIBRA cargados con éxito.');
  };

  const handleClearLocalData = () => {
    setAppointments([]);
    setPatients([]);
    setMessages([]);
    saveLocalAppointments([]);
    saveLocalPatients([]);
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
      patients,
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
    patientsTotal: patients.length,
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
                patients={patients}
                appointments={appointments}
                onSelectPatientFile={(patient, patientApps) => {
                  setSelectedPatientFile({ patient, appointments: patientApps });
                }}
                onOpenNewAppointmentModal={() => {
                  setDefaultStaffForNewApp(undefined);
                  setIsNewAppointmentOpen(true);
                }}
                onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
                onOpenEditPatient={(patient) => setEditingPatient(patient)}
                onOpenDeletePatient={(patient) => setDeletingPatient(patient)}
                onOpenUploadPdf={(patient) => setUploadingPdfForPatient(patient)}
                onViewPdfDocument={handleViewPdfDocument}
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
        onOpenEditPatient={(patient) => {
          setEditingPatient(patient);
        }}
        onOpenDeletePatient={(patient) => {
          setDeletingPatient(patient);
        }}
        onOpenUploadPdf={(patient) => {
          setUploadingPdfForPatient(patient);
        }}
        onViewPdfDocument={handleViewPdfDocument}
        onDeletePdfDocument={handleDeletePdfDocument}
      />

      {/* Create Patient Modal */}
      <CreatePatientModal
        isOpen={isCreatePatientOpen}
        onClose={() => setIsCreatePatientOpen(false)}
        onSavePatient={handleCreatePatient}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onSaveUpdates={handleUpdatePatient}
      />

      {/* Delete Patient Modal */}
      <DeletePatientModal
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        patient={deletingPatient}
        onConfirmDelete={handleDeletePatient}
      />

      {/* Upload Medical Record PDF Modal */}
      <UploadMedicalRecordModal
        isOpen={Boolean(uploadingPdfForPatient)}
        onClose={() => setUploadingPdfForPatient(null)}
        patient={uploadingPdfForPatient}
        onSaveDocument={handleSavePdfDocument}
      />

      {/* PDF Viewer & Print Modal */}
      <PdfViewerModal
        isOpen={Boolean(viewingPdfDocument)}
        onClose={() => setViewingPdfDocument(null)}
        document={viewingPdfDocument?.doc || null}
        patient={viewingPdfDocument?.patient || null}
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

