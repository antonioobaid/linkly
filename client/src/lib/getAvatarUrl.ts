export function getAvatarUrl(avatarUrl: string | null | undefined) {
  return avatarUrl || "/default-avatar.png";
}