export interface ServerStatus {
    online: boolean;
    timestamp: string;
    current_players: number;
    max_players: number;
    server_name: string;
    description: string;
    pvp_enabled: boolean;
    map: string;
}

export interface OnlinePlayer {
    username: string;
    steam_id: string;
    connected_at: string;
    x?: string;
    y?: string;
    z?: string;
    online: boolean;
}

export interface PlayerSkills {
    [skill: string]: number;
}

export interface PlayerStats {
    username: string;
    steam_id: string;
    total_hours: number;
    deaths: number;
    skills: PlayerSkills;
    level_ups: Array<{
        skill: string;
        level: string;
        timestamp: string;
    }>;
    last_seen: string;
    connections?: number;
}

export interface LeaderboardEntry {
    username: string;
    hours: number;
    deaths: number;
}

export interface SkillLeaderboardEntry {
    username: string;
    skill: string;
    level: number;
}

export interface ChatMessage {
    timestamp: string;
    chat_type: string;
    author: string;
    text: string;
}

export interface UserEvent {
    timestamp: string;
    steam_id: string;
    username: string;
    action: string;
    x?: string;
    y?: string;
    z?: string;
}
