'use client';

import { useEffect, useState } from 'react';
import {
  fetchServerStatus,
  fetchOnlinePlayers,
  fetchPlayerStats,
  fetchLeaderboards,
} from '@/lib/api';
import type {
  ServerStatus,
  OnlinePlayer,
  PlayerStats,
  LeaderboardEntry,
} from '@/types';

export default function Home() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dataSource, setDataSource] = useState<'api' | 'fallback' | 'loading'>('loading');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [statusResult, playersResult, statsResult, leaderboardResult] = await Promise.all([
        fetchServerStatus(),
        fetchOnlinePlayers(),
        fetchPlayerStats(),
        fetchLeaderboards(),
      ]);

      if (statusResult.data) {
        setServerStatus(statusResult.data as ServerStatus);
        setDataSource(statusResult.source as 'api' | 'fallback');
      }

      if (playersResult.data) {
        const data = playersResult.data as any;
        setOnlinePlayers(data.players || []);
      }

      if (statsResult.data) {
        const data = statsResult.data as any;
        setPlayerStats(data.players || {});
      }

      if (leaderboardResult.data) {
        const data = leaderboardResult.data as any;
        setLeaderboard(data.hours || data.leaderboard || []);
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  const topPlayers = leaderboard.slice(0, 5);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400">
                {serverStatus?.server_name || 'PZ Server'}
              </h1>
              <p className="text-gray-400 mt-1">
                {serverStatus?.description || 'Project Zomboid Server Dashboard'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <div className={`w-3 h-3 rounded-full ${serverStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {serverStatus?.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {dataSource === 'api' ? '🟢 Live Data' : '🟡 Cached Data'} • Updated {lastUpdate}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Players Online"
            value={`${serverStatus?.current_players || 0} / ${serverStatus?.max_players || 0}`}
            icon="👥"
            color="bg-blue-500/20 border-blue-500/50"
          />
          <StatCard
            title="Total Players"
            value={Object.keys(playerStats).length}
            icon="🎮"
            color="bg-purple-500/20 border-purple-500/50"
          />
          <StatCard
            title="Map"
            value={serverStatus?.map || 'Unknown'}
            icon="🗺️"
            color="bg-green-500/20 border-green-500/50"
          />
          <StatCard
            title="PVP Mode"
            value={serverStatus?.pvp_enabled ? 'Enabled' : 'Disabled'}
            icon="⚔️"
            color="bg-red-500/20 border-red-500/50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Players */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-green-400">🟢</span> Online Players
            </h2>
            {onlinePlayers.length === 0 ? (
              <p className="text-gray-400">No players currently online</p>
            ) : (
              <div className="space-y-3">
                {onlinePlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{player.username}</div>
                        <div className="text-sm text-gray-400">
                          Connected: {new Date(player.connected_at).toLocaleTimeString()}
                        </div>
                      </div>
                      {player.x && player.y && (
                        <div className="text-sm text-gray-400">
                          📍 ({player.x}, {player.y})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Players Leaderboard */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-yellow-400">🏆</span> Top Survivors
            </h2>
            {topPlayers.length === 0 ? (
              <p className="text-gray-400">No player data available</p>
            ) : (
              <div className="space-y-3">
                {topPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-2xl font-bold ${
                            idx === 0
                              ? 'text-yellow-400'
                              : idx === 1
                              ? 'text-gray-300'
                              : idx === 2
                              ? 'text-orange-600'
                              : 'text-gray-500'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{player.username}</div>
                          <div className="text-sm text-gray-400">{player.deaths} deaths</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">{player.hours}h</div>
                        <div className="text-xs text-gray-400">survived</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Players Stats */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-4">All Players</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-4">Hours</th>
                  <th className="text-left py-3 px-4">Deaths</th>
                  <th className="text-left py-3 px-4">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(playerStats)
                  .sort((a, b) => b.total_hours - a.total_hours)
                  .map((player, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition"
                    >
                      <td className="py-3 px-4 font-medium">{player.username}</td>
                      <td className="py-3 px-4">{player.total_hours}</td>
                      <td className="py-3 px-4">{player.deaths}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(player.last_seen).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>Project Zomboid Server Dashboard • Made with ❤️ for Camp Crew</p>
      </footer>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg border p-6 ${color} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
