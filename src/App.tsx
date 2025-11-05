import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from '@/systems/GameStateSystem';
import { Toaster } from '@/components/ui/sonner';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { GameTransitionManager } from '@/components/GameTransitionManager';
import { OptimizedPerformanceManager } from '@/components/OptimizedPerformanceManager';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PerformanceDebugger } from '@/components/PerformanceDebugger';
import { Suspense, lazy } from 'react';
import { AgeVerification } from '@/components/AgeVerification';
import { ResponsibleGamingWarnings } from '@/components/ResponsibleGamingWarnings';
import { PremiumThemeProvider } from '@/components/PremiumThemeProvider';

// Core components (always loaded)
import GameLobby from '@/pages/GameLobby';
import GamePlay from '@/pages/GamePlay';
import SlotGame from '@/pages/SlotGame';
import BlackjackGame from '@/pages/BlackjackGame';
import CrashGame from '@/pages/CrashGame';
import PuzzleGame from '@/pages/PuzzleGame';
import RouletteGame from '@/pages/RouletteGame';
import TigerHuntGame from '@/pages/TigerHuntGame';
import ZodiacWheel3DGame from '@/pages/ZodiacWheel3DGame';
import NotFound from '@/pages/NotFound';

// Lazy-loaded components for better performance
const MissionsPage = lazy(() => import('@/pages/MissionsPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const DailyRewardsPage = lazy(() => import('@/pages/DailyRewardsPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const VIPPage = lazy(() => import('@/pages/VIPPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const CoinStorePage = lazy(() => import('@/pages/CoinStorePage'));
const RewardsPage = lazy(() => import('@/pages/RewardsPage'));
const AnalyticsPage = lazy(() => import('@/pages/admin/Analytics'));
const PaytablePage = lazy(() => import('@/pages/PaytablePage'));
const ResponsibleGamingPage = lazy(() => import('@/pages/ResponsibleGaming'));
const TermsOfUsePage = lazy(() => import('@/pages/legal/TermsOfUse'));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const ComplianceDeclarationPage = lazy(() => import('@/pages/legal/ComplianceDeclaration'));
const LegalFAQPage = lazy(() => import('@/pages/legal/LegalFAQ'));

function App() {
  return (
    <GameStateProvider>
      <PremiumThemeProvider>
        <Router>
          <AgeVerification onVerified={() => {}} />
          <ResponsibleGamingWarnings />
        <GameTransitionManager>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>}>
            <Routes>
              <Route path="/" element={<SlotGame />} />
              <Route path="/lobby" element={<GameLobby />} />
              <Route path="/game" element={<GamePlay />} />
          <Route path="/blackjack" element={<BlackjackGame />} />
          <Route path="/crash" element={<CrashGame />} />
          <Route path="/puzzle" element={<PuzzleGame />} />
          <Route path="/roulette" element={<RouletteGame />} />
          <Route path="/tiger-hunt" element={<TigerHuntGame />} />
          <Route path="/zodiac-wheel-3d" element={<ZodiacWheel3DGame />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/daily-rewards" element={<DailyRewardsPage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/vip" element={<VIPPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/coin-store" element={<CoinStorePage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/paytable" element={<PaytablePage />} />
              <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
              <Route path="/legal/terms" element={<TermsOfUsePage />} />
              <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/compliance" element={<ComplianceDeclarationPage />} />
              <Route path="/legal/faq" element={<LegalFAQPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </GameTransitionManager>
        <Toaster />
        <ConsentBanner />
          <PWAInstallPrompt />
          <OptimizedPerformanceManager />
          <PerformanceDebugger />
        </Router>
      </PremiumThemeProvider>
    </GameStateProvider>
  );
}

export default App;