"use client";

import { Tabs } from "@mantine/core";
import { useRouter, usePathname } from "next/navigation";
import {
  IconHome,
  IconMessages,
  IconUsers,
  IconMap,
} from "@tabler/icons-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs value={pathname} onChange={(value) => router.push(value || "/")}>
      <Tabs.List>
        <Tabs.Tab value="/" leftSection={<IconHome size={16} />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="/players" leftSection={<IconUsers size={16} />}>
          All Player Stats
        </Tabs.Tab>
        <Tabs.Tab value="/player-map" leftSection={<IconMap size={16} />}>
          Player Map
        </Tabs.Tab>
        <Tabs.Tab value="/chat" leftSection={<IconMessages size={16} />}>
          Chat
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
