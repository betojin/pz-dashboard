"use client";

import { useEffect, useState } from "react";
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
  ScrollArea,
  Divider,
  TextInput,
} from "@mantine/core";
import { IconMessages, IconSearch, IconFilter } from "@tabler/icons-react";
import { fetchRecentActivity } from "@/lib/api";
import type { ChatMessage } from "@/types";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navigation } from "@/components/navigation";

export default function ChatPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatType, setSelectedChatType] = useState<string>("all");
  const [dataSource, setDataSource] = useState<"api" | "fallback" | "loading">(
    "loading"
  );
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMessages();
  }, [chatMessages, searchQuery, selectedChatType]);

  async function loadData() {
    try {
      const result = await fetchRecentActivity();

      if (result.data) {
        const data = result.data as any;
        const messages = (data.chat_messages || []).map((msg: any) => ({
          ...msg,
          timestamp: parseCustomDate(msg.timestamp),
        }));
        setChatMessages(messages);
        setDataSource(result.source as "api" | "fallback");
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error loading chat data:", error);
    }
  }

  function parseCustomDate(dateStr: string): Date {
    // Parse custom format: DD-MM-YY HH:MM:SS.mmm
    const [datePart, timePart] = dateStr.split(" ");
    const [day, month, year] = datePart.split("-");
    const [time] = timePart.split(".");
    const fullYear = `20${year}`;
    const isoDate = `${fullYear}-${month}-${day}T${time}`;
    return new Date(isoDate);
  }

  function filterMessages() {
    let filtered = [...chatMessages];

    // Filter by chat type
    if (selectedChatType !== "all") {
      filtered = filtered.filter((msg) => msg.chat_type === selectedChatType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.author.toLowerCase().includes(query) ||
          msg.text.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setFilteredMessages(filtered);
  }

  const chatTypes = [
    "all",
    ...Array.from(new Set(chatMessages.map((msg) => msg.chat_type))),
  ];

  return (
    <Box>
      {/* Header */}
      <Paper p="xl" radius={0} withBorder>
        <Container size="xl">
          <Group justify="space-between" align="flex-start" mb="md">
            <Stack gap="xs">
              <Group gap="sm">
                <IconMessages size={32} />
                <Title order={1}>Game Chat</Title>
              </Group>
              <Text c="dimmed">View all in-game chat messages</Text>
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
                {filteredMessages.length} messages
              </Badge>
            </Stack>
          </Group>
          <Navigation />
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Filters */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="md">
                <TextInput
                  placeholder="Search messages or players..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
              </Group>
              <Group gap="xs">
                <IconFilter size={16} />
                <Text size="sm" fw={500}>
                  Chat Type:
                </Text>
                {chatTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedChatType === type ? "filled" : "light"}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedChatType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Card>

          {/* Chat Messages */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ScrollArea h={600}>
              <Stack gap="md">
                {filteredMessages.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No messages found
                  </Text>
                ) : (
                  filteredMessages.map((msg, idx) => (
                    <Box key={idx}>
                      <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="nowrap"
                      >
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={600} size="sm">
                              {msg.author}
                            </Text>
                            <Badge size="xs" variant="light">
                              {msg.chat_type}
                            </Badge>
                            <Text size="xs" c="dimmed" suppressHydrationWarning>
                              {(() => {
                                const date = new Date(msg.timestamp);
                                const month = String(
                                  date.getMonth() + 1
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                const year = String(date.getFullYear()).slice(
                                  -2
                                );
                                const hours = String(date.getHours()).padStart(
                                  2,
                                  "0"
                                );
                                const minutes = String(
                                  date.getMinutes()
                                ).padStart(2, "0");
                                const seconds = String(
                                  date.getSeconds()
                                ).padStart(2, "0");
                                return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
                              })()}
                            </Text>
                          </Group>
                          <Text size="sm">{msg.text}</Text>
                        </Stack>
                      </Group>
                      {idx < filteredMessages.length - 1 && <Divider my="sm" />}
                    </Box>
                  ))
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
