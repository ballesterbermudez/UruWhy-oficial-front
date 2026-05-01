import { uruguayDepartments } from '../data/uruguayDepartments';

const DEFAULT_API_BASE_URL = 'http://localhost:4000';
const UY_MEMBERS_ENDPOINT = '/api/uruguay-members';

const departmentIdByName = Object.fromEntries(
  uruguayDepartments.map((department) => [normalizeDepartmentName(department.name), department.id])
);

function normalizeDepartmentName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function normalizeAvatarUrl(avatarUrl, userId) {
  return avatarUrl || null;
}

function normalizeMembersPayload(payload) {
  const membersByDepartment = Array.isArray(payload?.members) ? payload.members : [];
  const users = [];
  const countMap = {};

  for (const entry of membersByDepartment) {
    const departmentName = normalizeDepartmentName(entry?.department);
    const departmentId = departmentIdByName[departmentName];

    if (!departmentId || !Array.isArray(entry?.members) || entry.members.length === 0) {
      continue;
    }

    countMap[departmentId] = 0;

    for (const member of entry.members) {
      if (!member?.userId || !member?.username) {
        continue;
      }

      users.push({
        discordId: String(member.userId),
        username: member.username,
        avatar: normalizeAvatarUrl(member.avatarUrl, member.userId),
        department: departmentId
      });

      countMap[departmentId] += 1;
    }
  }

  return { users, countMap };
}

function getBaseUrl() {
  return (
    import.meta.env.PUBLIC_API_URL ||
    import.meta.env.PUBLIC_API_BASE_URL ||
    import.meta.env.URL_BACKEND ||
    DEFAULT_API_BASE_URL
  );
}

export async function fetchUsers() {
  const endpoint = `${getBaseUrl()}${UY_MEMBERS_ENDPOINT}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    const { users } = normalizeMembersPayload(payload);

    return users;
  } catch {
    return [];
  }
}

export async function fetchDepartmentsWithCounts() {
  const endpoint = `${getBaseUrl()}${UY_MEMBERS_ENDPOINT}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    const { countMap } = normalizeMembersPayload(payload);

    return uruguayDepartments.map((department) => ({
      id: department.id,
      name: department.name,
      userCount: countMap[department.id] || 0
    }));
  } catch {
    return uruguayDepartments.map((department) => ({
      id: department.id,
      name: department.name,
      userCount: 0
    }));
  }
}
