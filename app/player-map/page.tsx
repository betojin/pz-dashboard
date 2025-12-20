"use client";

import { useEffect, useState, useRef } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Paper,
  Box,
  Badge,
  Tooltip,
  ActionIcon,
  Switch,
} from "@mantine/core";
import {
  IconMapPin,
  IconUser,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { fetchAllPlayerLocations } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navigation } from "@/components/navigation";
import Image from "next/image";

interface Player {
  username: string;
  x: number;
  y: number;
  z: number;
  steamid?: string;
  online: boolean;
}

export default function OnlinePlayersPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [dataSource, setDataSource] = useState<"api" | "fallback" | "loading">(
    "loading"
  );
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOffline, setShowOffline] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const result = await fetchAllPlayerLocations();

      if (result.data) {
        const data = result.data as any;
        setAllPlayers(data.players || []);
        setDataSource(result.source as "api" | "fallback");
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error loading player locations:", error);
    }
  }

  // Map dimensions: 19800 x 15900
  const MAP_WIDTH = 19800;
  const MAP_HEIGHT = 15900;

  // Coordinate offsets - tune these to align pins with actual locations
  // Positive X moves pin RIGHT, negative X moves pin LEFT
  // Positive Y moves pin DOWN, negative Y moves pin UP
  const OFFSET_X = -150;
  const OFFSET_Y = -120;

  // Calculate marker position as percentage
  const getMarkerPosition = (x: number, y: number) => {
    // Apply offsets to coordinates
    const adjustedX = x + OFFSET_X;
    const adjustedY = y + OFFSET_Y;

    const xPercent = (adjustedX / MAP_WIDTH) * 100;
    const yPercent = (adjustedY / MAP_HEIGHT) * 100;
    return { left: `${xPercent}%`, top: `${yPercent}%` };
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 5));
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Box>
      {/* Header */}
      <Paper p="xl" radius={0} withBorder>
        <Container size="xl">
          <Group justify="space-between" align="flex-start" mb="md">
            <Stack gap="xs">
              <Group gap="sm">
                <IconMapPin size={32} />
                <Title order={1}>Online Players Map</Title>
              </Group>
              <Text c="dimmed">
                Real-time locations of players currently on the server
              </Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Group gap="xs">
                <ThemeToggle />
                <Text size="xs" c="dimmed">
                  {dataSource === "api" ? "🟢 Live Data" : "🟡 Cached Data"} •
                  Updated {lastUpdate}
                </Text>
              </Group>
              <Badge size="lg" variant="light" color="green">
                <Group gap={4}>
                  <IconUser size={14} />
                  {allPlayers.filter((p) => p.online).length} online •{" "}
                  {allPlayers.filter((p) => !p.online).length} offline
                </Group>
              </Badge>
            </Stack>
          </Group>
          <Navigation />
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {allPlayers.length === 0 ? (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Stack align="center" gap="md">
                <IconUser size={48} opacity={0.5} />
                <Title order={3} c="dimmed">
                  No player data available
                </Title>
                <Text c="dimmed" ta="center">
                  Player locations will appear here once data is available
                </Text>
              </Stack>
            </Card>
          ) : (
            <>
              {/* Map with Player Markers */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>Knox County Map</Title>
                    <Group gap="xs">
                      <Badge variant="light" color="green">
                        {allPlayers.filter((p) => p.online).length} online
                      </Badge>
                      <Badge variant="light" color="gray">
                        {allPlayers.filter((p) => !p.online).length} offline
                      </Badge>
                      <Group gap={4}>
                        <ActionIcon
                          variant="light"
                          onClick={handleZoomIn}
                          size="lg"
                        >
                          <IconZoomIn size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          onClick={handleZoomOut}
                          size="lg"
                        >
                          <IconZoomOut size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          onClick={handleZoomReset}
                          size="lg"
                        >
                          <IconZoomReset size={18} />
                        </ActionIcon>
                        <Badge variant="light" color="blue">
                          {Math.round(zoom * 100)}%
                        </Badge>
                      </Group>
                    </Group>
                  </Group>

                  {/* Map Container */}
                  <Box
                    ref={mapContainerRef}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "2px solid var(--mantine-color-default-border)",
                      cursor: isDragging ? "grabbing" : "grab",
                      touchAction: "none",
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Zoomable/Pannable Container */}
                    <Box
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 0.2s ease",
                      }}
                    >
                      {/* Background Map */}
                      <Image
                        src="/zomboid_map.png"
                        alt="Project Zomboid Knox County Map"
                        fill
                        style={{ objectFit: "contain", pointerEvents: "none" }}
                        priority
                      />

                      {/* Player Markers */}
                      {allPlayers.map((player, idx) => {
                        const position = getMarkerPosition(player.x, player.y);
                        const isOnline = player.online;
                        return (
                          <Tooltip
                            key={idx}
                            label={
                              <Box>
                                <Group gap={4}>
                                  <Text fw={600}>{player.username}</Text>
                                  <Badge
                                    size="xs"
                                    color={isOnline ? "green" : "gray"}
                                  >
                                    {isOnline ? "Online" : "Offline"}
                                  </Badge>
                                </Group>
                                <Text size="xs">
                                  📍 ({player.x}, {player.y})
                                </Text>
                                {player.z !== 0 && (
                                  <Text size="xs">Floor {player.z}</Text>
                                )}
                              </Box>
                            }
                            withArrow
                          >
                            <Box
                              style={{
                                position: "absolute",
                                ...position,
                                transform: `translate(-50%, -50%) scale(${
                                  1 / zoom
                                })`,
                                cursor: "pointer",
                                zIndex: isOnline ? 10 : 9,
                                transition: "transform 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = `translate(-50%, -50%) scale(${
                                  1.2 / zoom
                                })`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = `translate(-50%, -50%) scale(${
                                  1 / zoom
                                })`;
                              }}
                            >
                              <Box
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  backgroundColor: isOnline ? "red" : "gray",
                                  border: "2px solid white",
                                  boxShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                                  opacity: isOnline ? 1 : 0.6,
                                }}
                              />
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>

                  <Text size="xs" c="dimmed" ta="center">
                    Map coordinates: (0, 0) to ({MAP_WIDTH.toLocaleString()},{" "}
                    {MAP_HEIGHT.toLocaleString()}) • Scroll to zoom, drag to pan
                  </Text>
                </Stack>
              </Card>

              {/* Player List */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Title order={3}>Players</Title>
                    <Switch
                      label="Show offline players"
                      checked={showOffline}
                      onChange={(event) =>
                        setShowOffline(event.currentTarget.checked)
                      }
                    />
                  </Group>
                  <Stack gap="xs">
                    {allPlayers
                      .filter((player) => showOffline || player.online)
                      .sort((a, b) => {
                        // Sort online players first
                        if (a.online && !b.online) return -1;
                        if (!a.online && b.online) return 1;
                        return a.username.localeCompare(b.username);
                      })
                      .map((player, idx) => (
                        <Group
                          key={idx}
                          justify="space-between"
                          p="sm"
                          style={{
                            borderRadius: "8px",
                            backgroundColor:
                              "var(--mantine-color-default-hover)",
                            opacity: player.online ? 1 : 0.6,
                          }}
                        >
                          <Group gap="sm">
                            <Box
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                backgroundColor: player.online ? "red" : "gray",
                                border: "2px solid white",
                                boxShadow: "0px 1px 2px rgba(0,0,0,0.3)",
                              }}
                            />
                            <Text fw={500}>{player.username}</Text>
                            <Badge
                              size="xs"
                              color={player.online ? "green" : "gray"}
                            >
                              {player.online ? "Online" : "Offline"}
                            </Badge>
                          </Group>
                          <Group gap="xs">
                            <Badge variant="light" size="sm">
                              📍 ({player.x}, {player.y})
                            </Badge>
                            {player.z !== 0 && (
                              <Badge variant="light" size="sm" color="blue">
                                Floor {player.z}
                              </Badge>
                            )}
                          </Group>
                        </Group>
                      ))}
                  </Stack>
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
