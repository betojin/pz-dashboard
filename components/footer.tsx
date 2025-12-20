'use client';

import { ReactNode } from 'react';
import { Paper, Container, Text } from '@mantine/core';

export function Footer() {
  return (
    <Paper p="md" mt="xl" radius={0} withBorder>
      <Container size="xl">
        <Text ta="center" size="sm" c="dimmed">
          Project Zomboid Server Dashboard • Made with ❤️ for Camp Crew
        </Text>
      </Container>
    </Paper>
  );
}
