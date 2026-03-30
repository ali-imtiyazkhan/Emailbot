export interface User {
  id: string;
  name: string;
  email: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: "gmail" | "outlook";
  isActive: boolean;
  createdAt: string;
}

export interface DigestSetting {
  enabled: boolean;
  sendTime: string;
  timezone: string;
  minEmails: number;
}

export async function fetchProfile(): Promise<User> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function fetchAccounts(): Promise<EmailAccount[]> {
  const res = await fetch("/api/accounts");
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function fetchDigestSettings(): Promise<DigestSetting> {
  const res = await fetch("/api/digest");
  if (!res.ok) throw new Error("Failed to fetch digest settings");
  return res.json();
}

export async function updateDigestSettings(data: Partial<DigestSetting>): Promise<DigestSetting> {
  const res = await fetch("/api/digest", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update digest settings");
  return res.json();
}
