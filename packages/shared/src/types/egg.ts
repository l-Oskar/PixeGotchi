export interface Egg {
  id: number;
  userId: number;
  isListed: boolean;
  isHatching: boolean;
  hatchStartedAt: Date | null;
  hatchingTimeMs: number;
  tapCount: number | null;
  createdAt: Date;
}

export interface UpdatedEgg {
  isHatching: boolean;
  hatchStartedAt: Date;
  hatchingTimeMs: number;
  tapCount: number;
}

export interface EggHatchingStatus {
  isHatching: boolean;
  remainingTimeMs: number;
  canHatchNow: boolean;
  tapCount: number;
  progress: number;
}
