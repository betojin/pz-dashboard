"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Table,
  Stack,
  Group,
  Paper,
  Box,
  Badge,
  Divider,
  TextInput,
  Accordion,
} from "@mantine/core";
import { IconUsers, IconClock, IconSearch } from "@tabler/icons-react";
import { fetchPlayerStats } from "@/lib/api";
import type { PlayerStats } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navigation } from "@/components/navigation";

export default function PlayersPage() {
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(
    null
  );
  const [dataSource, setDataSource] = useState<"api" | "fallback" | "loading">(
    "loading"
  );
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const statsResult = await fetchPlayerStats();

      if (statsResult.data) {
        const data = statsResult.data as any;
        setPlayerStats(data.players || {});
        setDataSource(statsResult.source as "api" | "fallback");
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error loading player data:", error);
    }
  }

  const allPlayers = (Object.values(playerStats) as PlayerStats[])
    .sort((a, b) => b.total_hours - a.total_hours)
    .filter((player) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return player.username.toLowerCase().includes(query);
    });

  return (
    <Box>
      {/* Header */}
      <Paper p="xl" radius={0} withBorder>
        <Container size="xl">
          <Group justify="space-between" align="flex-start" mb="md">
            <Stack gap="xs">
              <Group gap="sm">
                <IconUsers size={32} />
                <Title order={1}>All Players</Title>
              </Group>
              <Text c="dimmed">
                View statistics for all players on the server
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
              <Badge size="lg" variant="light" color="blue">
                {allPlayers.length} players
              </Badge>
            </Stack>
          </Group>
          <Navigation />
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Search */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <TextInput
              placeholder="Search players..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>

          <Group align="flex-start" gap="lg" style={{ flexWrap: "nowrap" }}>
            {/* All Players Table */}
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ flex: selectedPlayer ? "0 0 50%" : 1 }}
            >
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Rank</Table.Th>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Hours</Table.Th>
                    <Table.Th>Deaths</Table.Th>
                    <Table.Th>Last Seen</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {allPlayers.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text c="dimmed" ta="center" py="xl">
                          No players found
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    allPlayers.map((player, idx) => (
                      <Table.Tr
                        key={idx}
                        onClick={() => setSelectedPlayer(player)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedPlayer?.username === player.username
                              ? "var(--mantine-color-blue-light)"
                              : undefined,
                        }}
                      >
                        <Table.Td>
                          <Text fw={600}>#{idx + 1}</Text>
                        </Table.Td>
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
                          <Text size="sm" c="dimmed" suppressHydrationWarning>
                            {(() => {
                              // Parse custom format: DD-MM-YY HH:MM:SS.mmm
                              const [datePart, timePart] =
                                player.last_seen.split(" ");
                              const [day, month, year] = datePart.split("-");
                              const [time] = timePart.split(".");
                              // Convert YY to YYYY (assuming 20XX)
                              const fullYear = `20${year}`;
                              // Create ISO format: YYYY-MM-DDTHH:MM:SS
                              const isoDate = `${fullYear}-${month}-${day}T${time}`;
                              const date = new Date(isoDate);
                              const now = new Date();
                              const diffMs = now.getTime() - date.getTime();
                              const diffMins = Math.floor(diffMs / (1000 * 60));
                              const diffHours = Math.floor(
                                diffMs / (1000 * 60 * 60)
                              );
                              const diffDays = Math.floor(
                                diffMs / (1000 * 60 * 60 * 24)
                              );

                              if (diffMins < 1) return "Just now";
                              if (diffMins < 60)
                                return `${diffMins} min${
                                  diffMins !== 1 ? "s" : ""
                                } ago`;
                              if (diffHours < 24)
                                return `${diffHours} hour${
                                  diffHours !== 1 ? "s" : ""
                                } ago`;
                              return `${diffDays} day${
                                diffDays !== 1 ? "s" : ""
                              } ago`;
                            })()}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Card>

            {/* Player Details Panel */}
            {selectedPlayer && (
              <Card
                shadow="md"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  flex: "0 0 50%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <div>
                      <Title order={2}>{selectedPlayer.username}</Title>
                      <Text size="sm" c="dimmed" mt={4}>
                        Steam ID: {selectedPlayer.steam_id}
                      </Text>
                    </div>
                    <Badge
                      size="xl"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                    >
                      {selectedPlayer.total_hours}h
                    </Badge>
                  </Group>

                  <Divider />

                  {/* Stats Summary */}
                  <Group grow>
                    <Card withBorder padding="sm">
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed">
                          Total Hours
                        </Text>
                        <Text size="xl" fw={700}>
                          {selectedPlayer.total_hours}
                        </Text>
                      </Stack>
                    </Card>
                    <Card withBorder padding="sm">
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed">
                          Deaths
                        </Text>
                        <Text size="xl" fw={700}>
                          {selectedPlayer.deaths}
                        </Text>
                      </Stack>
                    </Card>
                    <Card withBorder padding="sm">
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed">
                          Connections
                        </Text>
                        <Text size="xl" fw={700}>
                          {selectedPlayer.connections || 0}
                        </Text>
                      </Stack>
                    </Card>
                  </Group>

                  {/* Skills */}
                  {(() => {
                    // Mapping from internal game names to display names
                    const skillNameMapping: Record<string, string> = {
                      Doctor: "First Aid",
                      Fishing: "Fishing",
                      PlantScavenging: "Foraging",
                      Trapping: "Trapping",
                      Tracking: "Tracking",
                      Axe: "Axe",
                      Blunt: "Long Blunt",
                      SmallBlunt: "Short Blunt",
                      LongBlade: "Long Blade",
                      SmallBlade: "Short Blade",
                      Spear: "Spear",
                      Maintenance: "Maintenance",
                      Aiming: "Aiming",
                      Reloading: "Reloading",
                      Fitness: "Fitness",
                      Strength: "Strength",
                      Sprinting: "Running",
                      Lightfoot: "Lightfooted",
                      Nimble: "Nimble",
                      Sneak: "Sneaking",
                      Woodwork: "Carpentry",
                      Cooking: "Cooking",
                      Farming: "Agriculture",
                      Electricity: "Electrical",
                      MetalWelding: "Welding",
                      Mechanics: "Mechanics",
                      Tailoring: "Tailoring",
                      Blacksmith: "Blacksmithing",
                      Pottery: "Pottery",
                      Glassmaking: "Glassmaking",
                      Masonry: "Masonry",
                      Carving: "Carving",
                      FlintKnapping: "Knapping",
                      Butchering: "Butchering",
                      Husbandry: "Animal Care",
                    };

                    // Skill category mapping (matching exact game order)
                    const skillCategories: Record<string, string[]> = {
                      "Combat - Firearms": ["Aiming", "Reloading"],
                      "Combat - Melee": [
                        "Axe",
                        "Long Blade",
                        "Long Blunt",
                        "Maintenance",
                        "Short Blade",
                        "Short Blunt",
                        "Spear",
                      ],
                      Crafting: [
                        "Blacksmithing",
                        "Carpentry",
                        "Carving",
                        "Cooking",
                        "Electrical",
                        "Glassmaking",
                        "Knapping",
                        "Masonry",
                        "Mechanics",
                        "Pottery",
                        "Tailoring",
                        "Welding",
                      ],
                      Farming: ["Agriculture", "Animal Care", "Butchering"],
                      Physical: [
                        "Fitness",
                        "Lightfooted",
                        "Nimble",
                        "Running",
                        "Sneaking",
                        "Strength",
                      ],
                      Survival: [
                        "First Aid",
                        "Fishing",
                        "Foraging",
                        "Tracking",
                        "Trapping",
                      ],
                    };

                    // Helper to render skill level as cubes
                    const renderSkillCubes = (level: number) => {
                      const maxCubes = 10;
                      return (
                        <Group gap={2}>
                          {Array.from({ length: maxCubes }).map((_, i) => (
                            <Box
                              key={i}
                              style={{
                                width: "16px",
                                height: "16px",
                                border: "1px solid var(--mantine-color-dark-4)",
                                backgroundColor:
                                  i < level ? "#d4af37" : "transparent",
                                borderRadius: "2px",
                              }}
                            />
                          ))}
                        </Group>
                      );
                    };

                    // Group skills by category - show ALL skills from categories, even if 0
                    const groupedSkills: Record<string, [string, number][]> =
                      {};

                    // Initialize all categories with their complete skill lists
                    Object.entries(skillCategories).forEach(
                      ([category, skillList]) => {
                        groupedSkills[category] = skillList.map(
                          (displayName) => {
                            // Find the internal name that maps to this display name
                            const internalName = Object.entries(
                              skillNameMapping
                            ).find(
                              ([internal, display]) => display === displayName
                            )?.[0];

                            // Get level from player skills using internal name or display name
                            const level = internalName
                              ? selectedPlayer.skills[internalName] ||
                                selectedPlayer.skills[displayName] ||
                                0
                              : selectedPlayer.skills[displayName] || 0;

                            return [displayName, level];
                          }
                        );
                      }
                    );

                    // Add any extra skills not in predefined categories to "Other"
                    Object.entries(selectedPlayer.skills).forEach(
                      ([internalSkillName, level]) => {
                        const displayName =
                          skillNameMapping[internalSkillName] ||
                          internalSkillName;
                        let found = false;

                        for (const [category, skills] of Object.entries(
                          skillCategories
                        )) {
                          if (skills.includes(displayName)) {
                            found = true;
                            break;
                          }
                        }

                        if (!found) {
                          if (!groupedSkills["Other"])
                            groupedSkills["Other"] = [];
                          // Only add if not already in Other
                          if (
                            !groupedSkills["Other"].some(
                              ([name]) => name === displayName
                            )
                          ) {
                            groupedSkills["Other"].push([displayName, level]);
                          }
                        }
                      }
                    );

                    // Render in game order
                    const categoryOrder = [
                      "Combat - Firearms",
                      "Combat - Melee",
                      "Crafting",
                      "Farming",
                      "Physical",
                      "Survival",
                      "Other",
                    ];
                    const orderedCategories = categoryOrder
                      .filter(
                        (cat) =>
                          groupedSkills[cat] && groupedSkills[cat].length > 0
                      )
                      .map(
                        (cat) =>
                          [cat, groupedSkills[cat]] as [
                            string,
                            [string, number][]
                          ]
                      );

                    return orderedCategories.length > 0 ? (
                      <>
                        <Title order={4} mt="md">
                          Skills
                        </Title>
                        <Accordion
                          variant="contained"
                          defaultValue={orderedCategories[0]?.[0]}
                        >
                          {orderedCategories.map(([category, skills]) => (
                            <Accordion.Item key={category} value={category}>
                              <Accordion.Control>
                                <Text fw={600}>{category}</Text>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Stack gap="xs">
                                  {skills.map(([skill, level]) => (
                                    <Group
                                      key={skill}
                                      justify="space-between"
                                      px="sm"
                                      py={8}
                                      style={{
                                        backgroundColor:
                                          level > 0
                                            ? "var(--mantine-color-default-hover)"
                                            : "transparent",
                                      }}
                                    >
                                      <Text
                                        size="sm"
                                        fw={level > 0 ? 500 : 400}
                                        c={level > 0 ? undefined : "dimmed"}
                                        style={{
                                          color:
                                            level > 0 ? "#d4af37" : undefined,
                                        }}
                                      >
                                        {skill}
                                      </Text>
                                      {renderSkillCubes(level)}
                                    </Group>
                                  ))}
                                </Stack>
                              </Accordion.Panel>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </>
                    ) : null;
                  })()}

                  {/* Recent Level Ups */}
                  {selectedPlayer.level_ups &&
                    selectedPlayer.level_ups.length > 0 && (
                      <>
                        <Title order={4} mt="md">
                          Recent Level Ups
                        </Title>
                        <Stack gap="xs">
                          {selectedPlayer.level_ups
                            .slice(0, 10)
                            .map((levelUp, idx) => (
                              <Group key={idx} justify="space-between">
                                <Group gap="xs">
                                  <Badge size="sm" variant="light" color="teal">
                                    {levelUp.skill} → {levelUp.level}
                                  </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                  {levelUp.timestamp}
                                </Text>
                              </Group>
                            ))}
                        </Stack>
                      </>
                    )}

                  {/* Last Seen */}
                  <Divider mt="md" />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Last Seen
                    </Text>
                    <Text size="sm" suppressHydrationWarning>
                      {(() => {
                        const [datePart, timePart] =
                          selectedPlayer.last_seen.split(" ");
                        const [day, month, year] = datePart.split("-");
                        const [time] = timePart.split(".");
                        return `${month}/${day}/${year} ${time}`;
                      })()}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            )}
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}
