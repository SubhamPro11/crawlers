import { Tool } from "@/data/mockDb";

export interface VerificationStatus {
  isFresh: boolean;
  label: string;
  daysAgo: number;
}

export const VERIFICATION_THRESHOLD_DAYS = 30;

export function getVerificationStatus(tool: Tool): VerificationStatus {
  const dateStr = tool.last_checked_at || tool.last_crawled_at || tool.created_at;
  
  if (!dateStr || tool.status === "broken_link" || tool.status === "needs_review") {
    return {
      isFresh: false,
      label: "link may be stale",
      daysAgo: 999
    };
  }

  const checkDate = new Date(dateStr);
  if (isNaN(checkDate.getTime())) {
    return {
      isFresh: false,
      label: "link may be stale",
      daysAgo: 999
    };
  }

  const diffMs = Date.now() - checkDate.getTime();
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (daysAgo > VERIFICATION_THRESHOLD_DAYS) {
    return {
      isFresh: false,
      label: "link may be stale",
      daysAgo
    };
  }

  if (daysAgo === 0) {
    return {
      isFresh: true,
      label: "verified today",
      daysAgo: 0
    };
  }

  return {
    isFresh: true,
    label: `verified ${daysAgo}d ago`,
    daysAgo
  };
}
