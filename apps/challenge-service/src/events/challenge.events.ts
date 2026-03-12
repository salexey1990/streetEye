export interface ChallengeEvent {
  event: string;
  data: any;
  timestamp: string;
}

export interface ChallengeServedEvent {
  userId: string;
  challengeId: string;
  filters: {
    category?: string;
    difficulty?: string;
    mode?: string;
  };
  timestamp: string;
}

export interface ChallengeCreatedEvent {
  challengeId: string;
  title: string;
  categoryId: string;
  createdBy: string;
  timestamp: string;
}

export interface HeatModeStartedEvent {
  sessionId: string;
  userId: string;
  duration: number;
  category?: string;
  difficulty?: string;
  timestamp: string;
}

export interface HeatModeEndedEvent {
  sessionId: string;
  userId: string;
  challengesCompleted: number;
  duration: number;
  timestamp: string;
}
