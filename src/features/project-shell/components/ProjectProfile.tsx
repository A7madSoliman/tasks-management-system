import type { ShellUserProfile } from "../profile";

interface ProjectProfileProps {
  profile: ShellUserProfile;
  compact?: boolean;
}

export function ProjectProfile({
  profile,
  compact = false,
}: ProjectProfileProps) {
  if (compact) {
    return (
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0052cc] font-bold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
        aria-label={`User profile for ${profile.displayName}`}
      >
        <span className="text-base leading-none">{profile.initials}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-4"
      aria-label={`Profile for ${profile.displayName}`}
    >
      <div
        data-testid="desktop-profile-text"
        className="flex flex-col items-center text-center"
      >
        <span className="h-5 text-sm leading-5 font-semibold text-[#041b3c]">
          {profile.displayName}
        </span>
        {profile.jobTitle && (
          <span className="h-5 text-[10px] leading-5 font-bold tracking-[1px] text-[#003d9b] uppercase">
            {profile.jobTitle}
          </span>
        )}
      </div>
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0052cc] font-bold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
        aria-hidden="true"
      >
        <span className="text-base leading-none">{profile.initials}</span>
      </div>
    </div>
  );
}
