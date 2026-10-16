/**
 * QUICK 4AI - Main Web Preview Application Entry Point
 * Host environment for Google AI Studio Web Preview
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidePanelSimulator } from './components/SidePanelSimulator';
import { BenchmarkRunner } from './components/BenchmarkRunner';
import { ExtensionPackager } from './components/ExtensionPackager';
import { ArchitectureInspector } from './components/ArchitectureInspector';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'benchmark' | 'extension' | 'architecture'>('simulator');
  const [isDemo, setIsDemo] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setStatusData(data);
        // If all 4 real API keys are configured, demo defaults to false, else true
        if (data.allRealKeysConfigured) {
          setIsDemo(false);
        } else {
          setIsDemo(true);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch status:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemo={isDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        statusData={statusData}
      />

      <main className="flex-1">
        {activeTab === 'simulator' && (
          <SidePanelSimulator isDemo={isDemo} onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'benchmark' && <BenchmarkRunner />}
        {activeTab === 'extension' && <ExtensionPackager />}
        {activeTab === 'architecture' && <ArchitectureInspector />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        QUICK 4AI 다중 AI 교차 검증 시스템 · Chrome Side Panel 확장 프로그램 (Manifest V3) & 백엔드 프록시
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        statusData={statusData}
        isDemo={isDemo}
        setIsDemo={setIsDemo}
      />
    </div>
  );
}
