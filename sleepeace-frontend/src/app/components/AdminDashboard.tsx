import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, Shield, Brain, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Activity, ArrowLeft, Lock,
} from 'lucide-react';
import type {
  BIDashboard, ChurnPrediction, ClusterResult, ComplianceStats,
} from '../../services/analytics';
import {
  fetchBIDashboard, fetchChurnPrediction, fetchUserClusters, fetchComplianceStats,
} from '../../services/analytics';

interface Props {
  navigate: (screen: string) => void;
}

export default function AdminDashboard({ navigate }: Props) {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'bi' | 'ml' | 'compliance'>('bi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bi, setBi] = useState<BIDashboard | null>(null);
  const [churn, setChurn] = useState<ChurnPrediction | null>(null);
  const [clusters, setClusters] = useState<ClusterResult | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStats | null>(null);

  const loadAll = useCallback(async (s: string) => {
    setLoading(true);
    setError('');
    try {
      const [b, ch, cl, co] = await Promise.allSettled([
        fetchBIDashboard(s),
        fetchChurnPrediction(s),
        fetchUserClusters(s),
        fetchComplianceStats(s),
      ]);
      if (b.status === 'fulfilled') setBi(b.value);
      if (ch.status === 'fulfilled') setChurn(ch.value);
      if (cl.status === 'fulfilled') setClusters(cl.value);
      if (co.status === 'fulfilled') setCompliance(co.value);
      setAuthenticated(true);
    } catch {
      setError('Failed to load dashboard data. Check admin secret.');
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (!secret.trim()) return;
    loadAll(secret);
  };

  // ── Auth gate ──────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400 mb-6 text-sm">Enter the admin secret to access BI, ML, and Compliance analytics.</p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin Secret"
            className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-indigo-500 focus:outline-none mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
          <button onClick={() => navigate('mode-selection')} className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm">
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  // ── Tabs ────────────────────────────────────────
  const tabs = [
    { id: 'bi' as const, label: 'Business Intelligence', icon: BarChart3 },
    { id: 'ml' as const, label: 'ML Models', icon: Brain },
    { id: 'compliance' as const, label: 'Compliance', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700">
        <button onClick={() => navigate('mode-selection')} className="p-2 rounded-lg hover:bg-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">SleepEase Admin Dashboard</h1>
        <button onClick={() => loadAll(secret)} className="ml-auto text-sm text-indigo-400 hover:text-indigo-300">
          ↻ Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {loading && <div className="text-center py-10 text-slate-400">Loading analytics...</div>}

        {/* ═════ BI Tab ═════ */}
        {activeTab === 'bi' && bi && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard icon={Users} label="Total Users" value={bi.churn_metrics.total_users} color="indigo" />
              <KPICard icon={Activity} label="Active (7d)" value={bi.churn_metrics.active_7d} color="green" />
              <KPICard icon={TrendingUp} label="Retention (7d)" value={`${bi.churn_metrics.retention_7d_pct}%`} color="blue" />
              <KPICard icon={AlertTriangle} label="Churn Rate" value={`${bi.churn_metrics.churn_rate_pct}%`} color="red" />
            </div>

            {/* Content Volume */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Content Volume</h3>
              <div className="space-y-2">
                <BarRow label="Mood Logs" value={bi.content_volume.mood_logs} max={bi.content_volume.total} color="bg-purple-500" />
                <BarRow label="Sleep Logs" value={bi.content_volume.sleep_logs} max={bi.content_volume.total} color="bg-blue-500" />
                <BarRow label="Chat Sessions" value={bi.content_volume.chat_sessions} max={bi.content_volume.total} color="bg-green-500" />
              </div>
            </div>

            {/* Mode Distribution */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Mode Distribution</h3>
              <div className="flex gap-4">
                {Object.entries(bi.mode_distribution).map(([mode, count]) => (
                  <div key={mode} className="flex-1 text-center">
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-xs text-slate-400 capitalize">{mode}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DAU Chart */}
            {Object.keys(bi.daily_active_users).length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Daily Active Users (7d)</h3>
                <div className="flex items-end gap-2 h-32">
                  {Object.entries(bi.daily_active_users).map(([date, count]) => {
                    const maxDAU = Math.max(...Object.values(bi.daily_active_users), 1);
                    const h = (count / maxDAU) * 100;
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center">
                        <span className="text-xs text-slate-400 mb-1">{count}</span>
                        <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                        <span className="text-[10px] text-slate-500 mt-1">{date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Retention Cohorts */}
            {bi.retention_cohorts?.cohorts && Object.keys(bi.retention_cohorts.cohorts).length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 overflow-x-auto">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Retention Cohorts</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left py-1">Cohort</th>
                      <th className="text-right py-1">Reg</th>
                      <th className="text-right py-1">7d %</th>
                      <th className="text-right py-1">30d %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bi.retention_cohorts.cohorts).map(([key, c]) => (
                      <tr key={key} className="border-t border-slate-700">
                        <td className="py-1 text-slate-300">{key}</td>
                        <td className="py-1 text-right">{c.registered}</td>
                        <td className="py-1 text-right text-green-400">{c.retention_7d_pct}%</td>
                        <td className="py-1 text-right text-blue-400">{c.retention_30d_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═════ ML Tab ═════ */}
        {activeTab === 'ml' && (
          <>
            {/* Churn Prediction */}
            {churn && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-semibold text-slate-300">Churn Prediction ({churn.model})</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <MiniStat label="Accuracy" value={`${(churn.accuracy * 100).toFixed(1)}%`} />
                  <MiniStat label="At Risk" value={churn.at_risk_count} />
                  <MiniStat label="Total" value={churn.total_users} />
                </div>

                {churn.feature_importances && (
                  <div className="mb-4">
                    <h4 className="text-xs text-slate-400 mb-2">Feature Importances</h4>
                    <div className="space-y-1">
                      {Object.entries(churn.feature_importances)
                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                        .slice(0, 5)
                        .map(([name, value]) => (
                          <div key={name} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 w-36 truncate">{name}</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${value > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, Math.abs(value) * 100)}%` }}
                              />
                            </div>
                            <span className="text-slate-300 w-12 text-right">{value.toFixed(3)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* User risk list */}
                <h4 className="text-xs text-slate-400 mb-2">User Risk Levels</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {churn.predictions
                    .sort((a, b) => b.churn_probability - a.churn_probability)
                    .map((p) => (
                      <div key={p.user_id} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-slate-750">
                        <span className={`w-2 h-2 rounded-full ${
                          p.risk_level === 'high' ? 'bg-red-500' : p.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="text-slate-300 flex-1 truncate font-mono">{p.user_id.slice(0, 16)}...</span>
                        <span className={`font-semibold ${
                          p.risk_level === 'high' ? 'text-red-400' : p.risk_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {(p.churn_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* User Clusters */}
            {clusters && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-slate-300">User Segmentation ({clusters.model}, k={clusters.n_clusters})</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(clusters.cluster_summary).map(([label, info]) => (
                    <div key={label} className="bg-slate-750 rounded-lg p-3 border border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-white">{label}</span>
                        <span className="text-xs text-indigo-400">{info.member_count} users</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(info.centroid)
                          .filter(([, v]) => v !== 0)
                          .slice(0, 4)
                          .map(([feat, val]) => (
                            <span key={feat} className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">
                              {feat.replace(/_/g, ' ')}: {val}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═════ Compliance Tab ═════ */}
        {activeTab === 'compliance' && compliance && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <KPICard icon={Shield} label="Total Audits" value={compliance.total_audits} color="indigo" />
              <KPICard icon={CheckCircle2} label="Pass Rate" value={`${compliance.pass_rate}%`} color="green" />
              <KPICard icon={XCircle} label="Blocked" value={compliance.blocked} color="red" />
              <KPICard icon={Activity} label="Avg Score" value={`${(compliance.avg_score * 100).toFixed(1)}%`} color="blue" />
            </div>

            {compliance.score_distribution && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Score Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(compliance.score_distribution).map(([range, count]) => (
                    <div key={range} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 w-28">{range.replace(/_/g, ' ')}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            range.includes('excellent') ? 'bg-green-500' :
                            range.includes('good') ? 'bg-blue-500' :
                            range.includes('review') ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (count / Math.max(compliance.total_audits, 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-300 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function KPICard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10',
    green: 'text-green-400 bg-green-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
  };
  const cls = colorMap[color] || colorMap.indigo;
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${cls}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-slate-400 w-24">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-300 w-10 text-right">{value}</span>
    </div>
  );
}
