import React, { useState } from 'react';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { CommunityHeader } from './components/layout/CommunityHeader';
import { Footer } from './components/layout/Footer';
import { PropietarioDashboard } from './components/propietarios/PropietarioDashboard';
import { VigilanteDashboard } from './components/vigilante/VigilanteDashboard';
import { ReportList } from './components/reports/ReportList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NewReportModal } from './components/reports/NewReportModal';
import { ReportDetailModal } from './components/reports/ReportDetailModal';
import { ClusteringModal } from './components/clustering/ClusteringModal';
import { ExecutiveReportModal } from './components/analytics/ExecutiveReportModal';
import { CommunityRulesModal } from './components/community/CommunityRulesModal';
import { ZoneManagerModal } from './components/community/ZoneManagerModal';
import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/legal/TermsOfServiceModal';
import { EmergencyProtocolModal } from './components/legal/EmergencyProtocolModal';
import { AboutModal } from './components/legal/AboutModal';
import { CommunitySettingsModal } from './components/community/CommunitySettingsModal';
import { InteractiveZoneMap } from './components/map/InteractiveZoneMap';
import { LoginModal } from './components/auth/LoginModal';
import { WalkieTalkieModal } from './components/radio/WalkieTalkieModal';
import { IntercomGaritaModal } from './components/chat/IntercomGaritaModal';
import { ToastContainer } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const {
    activePortal,
    activeView,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isRadioModalOpen,
    setIsRadioModalOpen,
    isChatModalOpen,
    setIsChatModalOpen,
  } = useCommunity();

  // Modal states
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isClusteringOpen, setIsClusteringOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isZoneManagerOpen, setIsZoneManagerOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Map view toggle
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar with Dual Portal Switcher & Auth */}
      <Navbar
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onOpenClustering={() => setIsClusteringOpen(true)}
        onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenZoneManager={() => setIsZoneManagerOpen(true)}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      {/* Community Info Header */}
      <CommunityHeader
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onOpenClustering={() => setIsClusteringOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenZoneManager={() => setIsZoneManagerOpen(true)}
        showMap={showMap}
        onToggleMap={() => setShowMap(!showMap)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Interactive Zone Map if toggled */}
        {showMap && (
          <InteractiveZoneMap onSelectReport={(id) => setSelectedReportId(id)} />
        )}

        {/* THREE DEDICATED PORTALS RENDERING */}
        {activePortal === 'propietarios' && (
          activeView === 'feed' ? (
            <PropietarioDashboard
              onSelectReport={(id) => setSelectedReportId(id)}
              onOpenNewReport={() => setIsNewReportOpen(true)}
              onOpenRules={() => setIsRulesOpen(true)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
            />
          ) : (
            <ReportList
              onSelectReport={(id) => setSelectedReportId(id)}
              onOpenNewReport={() => setIsNewReportOpen(true)}
              onOpenClustering={() => setIsClusteringOpen(true)}
            />
          )
        )}

        {activePortal === 'vigilante' && (
          <VigilanteDashboard
            onSelectReport={(id) => setSelectedReportId(id)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activePortal === 'admin' && (
          <AdminDashboard
            onSelectReport={(id) => setSelectedReportId(id)}
            onOpenClustering={() => setIsClusteringOpen(true)}
            onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
          />
        )}
      </main>

      {/* Complete Footer with Legal, Emergency & Community Info */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onOpenExecutiveReport={() => setIsExecutiveReportOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Modals & Dialogs */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onReportCreated={(id) => setSelectedReportId(id)}
      />

      <ReportDetailModal
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />

      <ClusteringModal
        isOpen={isClusteringOpen}
        onClose={() => setIsClusteringOpen(false)}
        onSelectReport={(id) => {
          setIsClusteringOpen(false);
          setSelectedReportId(id);
        }}
      />

      <ExecutiveReportModal
        isOpen={isExecutiveReportOpen}
        onClose={() => setIsExecutiveReportOpen(false)}
      />

      <CommunityRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ZoneManagerModal
        isOpen={isZoneManagerOpen}
        onClose={() => setIsZoneManagerOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <EmergencyProtocolModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <CommunitySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Radio Frequency Walkie-Talkie PTT Modal */}
      <WalkieTalkieModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
      />

      {/* Direct Intercom Garita & Resident Chat Modal */}
      <IntercomGaritaModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CommunityProvider>
      <AppContent />
    </CommunityProvider>
  );
}
