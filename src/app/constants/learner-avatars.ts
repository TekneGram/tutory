const learnerAvatarSources = {
  "girl_1.webp": new URL("../../assets/avatars/girl_1.webp", import.meta.url).href,
  "girl_2.webp": new URL("../../assets/avatars/girl_2.webp", import.meta.url).href,
  "golden-retriever.webp": new URL("../../assets/avatars/golden-retriever.webp", import.meta.url).href,
  "husky.webp": new URL("../../assets/avatars/husky.webp", import.meta.url).href,
  "kai.webp": new URL("../../assets/avatars/kai.webp", import.meta.url).href,
  "rabbit.webp": new URL("../../assets/avatars/rabbit.webp", import.meta.url).href,
} as const;

export type LearnerAvatarId = keyof typeof learnerAvatarSources;

export type LearnerAvatarOption = {
  avatarId: LearnerAvatarId;
  label: string;
  src: string;
};

export const learnerAvatarOptions: LearnerAvatarOption[] = [
  { avatarId: "girl_1.webp", label: "Girl 1", src: learnerAvatarSources["girl_1.webp"] },
  { avatarId: "girl_2.webp", label: "Girl 2", src: learnerAvatarSources["girl_2.webp"] },
  { avatarId: "golden-retriever.webp", label: "Golden retriever", src: learnerAvatarSources["golden-retriever.webp"] },
  { avatarId: "husky.webp", label: "Husky", src: learnerAvatarSources["husky.webp"] },
  { avatarId: "kai.webp", label: "Kai", src: learnerAvatarSources["kai.webp"] },
  { avatarId: "rabbit.webp", label: "Rabbit", src: learnerAvatarSources["rabbit.webp"] },
];

export function getLearnerAvatarSrc(avatarId: string | null | undefined): string | null {
  if (!avatarId) {
    return null;
  }

  if (avatarId in learnerAvatarSources) {
    return learnerAvatarSources[avatarId as LearnerAvatarId];
  }

  const avatarWithExtension = `${avatarId}.webp`;

  if (avatarWithExtension in learnerAvatarSources) {
    return learnerAvatarSources[avatarWithExtension as LearnerAvatarId];
  }

  return null;
}
