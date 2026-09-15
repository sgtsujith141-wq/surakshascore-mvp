import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { AppShell, type TabId } from '@/components/layout/AppShell';
import { AuthScreen } from '@/screens/AuthScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { CheckupScreen } from '@/screens/CheckupScreen';
import { IssuesScreen } from '@/screens/IssuesScreen';
import { PlaybookScreen } from '@/screens/PlaybookScreen';
import { LearnScreen } from '@/screens/LearnScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ToolsScreen } from '@/screens/ToolsScreen';
import { VaultScreen } from '@/screens/VaultScreen';
import { SecurityHabitsScreen } from '@/screens/SecurityHabitsScreen';
import { DiagnosticsScreen } from '@/screens/DiagnosticsScreen';
import { FullPageLoader } from '@/components/ui/Spinner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Capacitor } from '@capacitor/core';

function Root() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<TabId>('home');
  const [checkupMode, setCheckupMode] = useState<'all' | 'network'>('all');
  const [playbookFindingId, setPlaybookFindingId] = useState<string | null>(null);

  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set(['home']));
  
  useEffect(() => {
    setVisitedTabs(prev => new Set(prev).add(tab));
  }, [tab]);

  if (loading) return <FullPageLoader label="Loading SurakshaScore MVP..." />;
  if (!isSupabaseConfigured) return <ConfigurationRequired />;
  if (!user) return <AuthScreen />;

  // When a playbook is active we render it within the issues tab.
  if (playbookFindingId) {
    return (
      <AppShell activeTab="issues" onTabChange={setTab}>
        <PlaybookScreen
          findingId={playbookFindingId}
          onBack={() => setPlaybookFindingId(null)}
          onComplete={() => {
            setPlaybookFindingId(null);
            setTab('issues');
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell activeTab={tab} onTabChange={setTab}>
      <div className={tab === 'home' ? 'block' : 'hidden'}>
        {visitedTabs.has('home') && (
          <HomeScreen
            isActive={tab === 'home'}
            onRunCheckup={() => { setCheckupMode('all'); setTab('checkup'); }}
            onScanNetwork={() => { setCheckupMode('network'); setTab('checkup'); }}
            onRunHabitsCheckup={() => setTab('habits')}
            onFixNow={() => setTab('issues')}
            onViewIssues={() => setTab('issues')}
          />
        )}
      </div>
      <div className={tab === 'checkup' ? 'block' : 'hidden'}>
        {visitedTabs.has('checkup') && (
          <CheckupScreen
            mode={checkupMode}
            onViewIssues={() => setTab('issues')}
            onBackHome={() => setTab('home')}
          />
        )}
      </div>
      <div className={tab === 'habits' ? 'block' : 'hidden'}>
        {visitedTabs.has('habits') && (
          <SecurityHabitsScreen
            onComplete={() => setTab('issues')}
            onViewIssues={() => setTab('issues')}
            onBackHome={() => setTab('home')}
          />
        )}
      </div>
      <div className={tab === 'issues' ? 'block' : 'hidden'}>
        {visitedTabs.has('issues') && (
          <IssuesScreen isActive={tab === 'issues'} onOpenPlaybook={(id) => setPlaybookFindingId(id)} />
        )}
      </div>
      <div className={tab === 'tools' ? 'block' : 'hidden'}>
        {visitedTabs.has('tools') && <ToolsScreen />}
      </div>
      <div className={tab === 'vault' ? 'block' : 'hidden'}>
        {visitedTabs.has('vault') && <VaultScreen />}
      </div>
      <div className={tab === 'learn' ? 'block' : 'hidden'}>
        {visitedTabs.has('learn') && <LearnScreen />}
      </div>
      <div className={tab === 'settings' ? 'block' : 'hidden'}>
        {visitedTabs.has('settings') && <SettingsScreen onOpenDiagnostics={() => setTab('diagnostics')} />}
      </div>
      <div className={tab === 'diagnostics' ? 'block' : 'hidden'}>
        {visitedTabs.has('diagnostics') && <DiagnosticsScreen onBack={() => setTab('settings')} />}
      </div>
    </AppShell>
  );
}

function ConfigurationRequired() {
  const isProdOrNative = import.meta.env.PROD || Capacitor.isNativePlatform();

  if (isProdOrNative) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">SurakshaScore MVP configuration unavailable.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This build was not configured correctly. Please reinstall a correctly configured build.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Configure SurakshaScore MVP</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add your Supabase project details to a <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.local</code> file, then restart the development server.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">VITE_SUPABASE_URL=https://your-project.supabase.co{`\n`}VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx</pre>
        <p className="mt-5 text-xs text-slate-500">Use the public publishable key only; never put a Supabase secret or service-role key in a frontend environment file.</p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
