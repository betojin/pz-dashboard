'use client';

import { useEffect, useState } from 'react';
import { 
    Container, 
    Title, 
    Text, 
    Grid, 
    Card, 
    Badge,
    Table,
    Stack,
    Group,
    Paper,
    Box,
    Avatar,
    Indicator,
    Divider
} from '@mantine/core';
import { 
    IconUsers, 
    IconDeviceGamepad2, 
    IconMap, 
    IconSwords,
    IconTrophy,
    IconClock
} from '@tabler/icons-react';
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
  const allPlayers = (Object.values(playerStats) as PlayerStats[]).sort((a, b) => b.total_hours - a.total_hours);

  return (
    <Box style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Paper p="xl" radius={0} withBorder>
        <Container size="xl">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={1} c="green">
                {serverStatus?.server_name || 'PZ Server'}
              </Title>
              <Text c="dimmed">
                {serverStatus?.description || 'Project Zomboid Server Dashboard'}
              </Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Group gap="xs">
                <Indicator 
                  color={serverStatus?.online ? 'green' : 'red'} 
                  processing={serverStatus?.online}
                  size={12}
                />
                <Text fw={500}>
                  {serverStatus?.online ? 'Online' : 'Offline'}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {dataSource === 'api' ? '🟢 Live Data' : '🟡 Cached Data'} • Updated {lastUpdate}
              </Text>
            </Stack>
          </Group>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        {/* Stats Cards */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={5}>
                  <Text size="sm" c="dimmed">Players Online</Text>
                  <Text size="xl" fw={700}>
                    {serverStatus?.current_players || 0} / {serverStatus?.max_players || 0}
                  </Text>
                </Stack>
                <Avatar color="blue" radius="xl" size="lg">
                  <IconUsers size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={5}>
                  <Text size="sm" c="dimmed">Total Players</Text>
                  <Text size="xl" fw={700}>{allPlayers.length}</Text>
                </Stack>
                <Avatar color="violet" radius="xl" size="lg">
                  <IconDeviceGamepad2 size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={5}>
                  <Text size="sm" c="dimmed">Map</Text>
                  <Text size="lg" fw={700}>{serverStatus?.map || 'Unknown'}</Text>
                </Stack>
                <Avatar color="teal" radius="xl" size="lg">
                  <IconMap size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={5}>
                  <Text size="sm" c="dimmed">PVP Mode</Text>
                  <Text size="lg" fw={700}>
                    {serverStatus?.pvp_enabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </Stack>
                <Avatar color="red" radius="xl" size="lg">
                  <IconSwords size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Online Players & Top Survivors */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Group mb="md">
                <Indicator color="green" processing size={12} />
                <Title order={3}>Online Players</Title>
              </Group>
              <Divider mb="md" />
              {onlinePlayers.length === 0 ? (
                <Text c="dimmed">No players currently online</Text>
              ) : (
                <Stack gap="sm">
                  {onlinePlayers.map((player: OnlinePlayer, idx: number) => (
                    <Card key={idx} padding="md" radius="sm" withBorder>
                      <Group justify="space-between">
                        <Stack gap={2}>
                          <Text fw={600}>{player.username}</Text>
                          <Text size="sm" c="dimmed">
                            Connected: {new Date(player.connected_at).toLocaleTimeString()}
                          </Text>
                        </Stack>
                        {player.x && player.y && (
                          <Text size="sm" c="dimmed">
                            📍 ({player.x}, {player.y})
                          </Text>
                        )}
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Group mb="md">
                <IconTrophy size={24} style={{ color: 'gold' }} />
                <Title order={3}>Top Survivors</Title>
              </Group>
              <Divider mb="md" />
              {topPlayers.length === 0 ? (
                <Text c="dimmed">No player data available</Text>
              ) : (
                <Stack gap="sm">
                  {topPlayers.map((player: LeaderboardEntry, idx: number) => (
                    <Card key={idx} padding="md" radius="sm" withBorder>
                      <Group justify="space-between">
                        <Group>
                          <Badge 
                            size="xl" 
                            variant="filled"
                            color={idx === 0 ? 'yellow' : idx === 1 ? 'gray' : idx === 2 ? 'orange' : 'dark'}
                          >
                            #{idx + 1}
                          </Badge>
                          <Stack gap={2}>
                            <Text fw={600}>{player.username}</Text>
                            <Text size="sm" c="dimmed">{player.deaths} deaths</Text>
                          </Stack>
                        </Group>
                        <Stack gap={0} align="flex-end">
                          <Text size="xl" fw={700} c="green">
                            {player.hours}h
                          </Text>
                          <Text size="xs" c="dimmed">survived</Text>
                        </Stack>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        {/* All Players Table */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="md">All Players</Title>
          <Divider mb="md" />
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player</Table.Th>
                <Table.Th>Hours</Table.Th>
                <Table.Th>Deaths</Table.Th>
                <Table.Th>Last Seen</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allPlayers.map((player, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <Text fw={500}>{player.username}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text>{player.total_hours}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{player.deaths}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(player.last_seen).toLocaleString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Container>

      {/* Footer */}
      <Paper p="md" mt="xl" radius={0} withBorder>
        <Container size="xl">
          <Text ta="center" size="sm" c="dimmed">
            Project Zomboid Server Dashboard • Made with ❤️ for Camp Crew
          </Text>
        </Container>
      </Paper>
    </Box>
  );
}
