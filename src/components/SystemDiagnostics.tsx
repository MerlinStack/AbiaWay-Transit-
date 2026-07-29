import { useState, useEffect } from 'react';
import { runSystemSmokeTest, runTelemetryFallbackAssertions } from '../utils/productionSmokeTest';
import useNotificationStore from '../stores/notificationStore';

interface DiagnosticLog {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR';
  message: string;
}

const SystemDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<DiagnosticLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<'UNTESTED' | 'PASSED' | 'FAILED'>('UNTESTED');
  const [storageMetrics, setStorageMetrics] = useState({ usedBytes: 0, percentage: 0 });
  const showNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    let totalChars = 0;
    const key = 'abiaway_check_history';
    const val = localStorage.getItem(key);
    if (val) totalChars = key.length + val.length;
    const estimatedBytes = totalChars * 2;
    const maxQuota = 5 * 1024 * 1024;
    setStorageMetrics({
      usedBytes: estimatedBytes,
      percentage: Math.min(100, Math.round((estimatedBytes / maxQuota) * 100)),
    });
  }, [isRunning]);

  const executeSystemSuite = async () => {
    setIsRunning(true);
    let finalStatus: 'PASSED' | 'FAILED' = 'PASSED';
    setSystemStatus('UNTESTED');
    const newLogs: DiagnosticLog[] = [
      { timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'Initializing automated system validation suite...' },
    ];
    setTestLogs(newLogs);

    try {
      const coreResult = runSystemSmokeTest();
      const corePassed = coreResult !== 'FAIL';
      newLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        type: corePassed ? 'SUCCESS' : 'ERROR',
        message: `Core Suite (23 assertions): ${coreResult}`,
      });
      setTestLogs([...newLogs]);

      if (corePassed) {
        newLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'INFO',
          message: 'Testing telemetry connection fallback pathways...',
        });
        setTestLogs([...newLogs]);

        const fallbackPassed = await runTelemetryFallbackAssertions();
        if (fallbackPassed === 'PASS') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'SUCCESS',
            message: 'Transport Fallback: Network degradation paths verified successfully.',
          });
        } else {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'ERROR',
            message: 'Transport Fallback: Critical failure detected in socket degradation logic.',
          });
          finalStatus = 'FAILED';
        }
      } else {
        finalStatus = 'FAILED';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      newLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        type: 'ERROR',
        message: `Pipeline Exception: ${msg}`,
      });
      finalStatus = 'FAILED';
    } finally {
      setSystemStatus(finalStatus);
      setTestLogs([...newLogs]);
      setIsRunning(false);
      if (finalStatus === 'PASSED') showNotification('Diagnostics', 'All systems operational', 'success');
      else if (finalStatus === 'FAILED') showNotification('Diagnostics', 'Some checks failed', 'error');
    }
  };

  const statusColor = systemStatus === 'PASSED' ? 'text-green-400' : systemStatus === 'FAILED' ? 'text-red-400' : 'text-gray-400';
  const statusBorder = systemStatus === 'PASSED' ? 'border-l-green-500' : systemStatus === 'FAILED' ? 'border-l-red-500' : 'border-l-gray-500';

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i data-lucide="activity" className="text-primary"></i>
            System Diagnostic Engine
          </h3>
          <p className="text-sm text-gray-400 mt-1">Verify state framework integrity, cache usage quotas, and link degradation.</p>
        </div>
        <button className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50 whitespace-nowrap"
          onClick={executeSystemSuite} disabled={isRunning}>
          {isRunning ? 'Running Pipeline...' : 'Run Full Suite'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 bg-white/5 rounded-lg border-l-4 ${statusBorder}`}>
          <p className="text-xs text-gray-500 font-semibold tracking-wider">PIPELINE STATUS</p>
          <p className={`text-2xl font-bold mt-1 ${statusColor}`}>{systemStatus}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 font-semibold tracking-wider">STORAGE (MAINTENANCE LOGS)</p>
          <p className="text-2xl font-bold mt-1 text-white">
            {(storageMetrics.usedBytes / 1024).toFixed(2)} KB
            <span className="text-sm text-gray-400 font-normal ml-2">({storageMetrics.percentage}%)</span>
          </p>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${storageMetrics.percentage}%`, backgroundColor: storageMetrics.percentage > 80 ? '#ef4444' : '#22c55e' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm min-h-[200px] max-h-[350px] overflow-y-auto">
        <div className="border-b border-gray-700 pb-2 mb-3 text-xs text-gray-500 tracking-wider">
          TRANSIT SYSTEMS OS — CORE TERMINAL LOGS
        </div>
        {testLogs.length === 0 && (
          <div className="text-gray-600 italic">No diagnostic test logs recorded yet. Press "Run Full Suite" above.</div>
        )}
        {testLogs.map((log, i) => (
          <div key={i} className="mb-1.5 leading-relaxed">
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={`font-bold ${
              log.type === 'SUCCESS' ? 'text-green-400' : log.type === 'ERROR' ? 'text-red-400' : 'text-blue-400'
            }`}>[{log.type}]</span>{' '}
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 mt-2 text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Running...
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDiagnostics;
