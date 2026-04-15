import { mockUsers } from '../data/mockUsers';
import { uruguayDepartments } from '../data/uruguayDepartments';

const DEFAULT_API_BASE_URL = 'http://localhost:4000';

function getBaseUrl() {
  return (
    import.meta.env.PUBLIC_API_URL ||
    import.meta.env.PUBLIC_API_BASE_URL ||
    import.meta.env.URL_BACKEND ||
    DEFAULT_API_BASE_URL
  );
}

export async function fetchUsers() {
  const endpoint = `${getBaseUrl()}/api/users`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload?.data || !Array.isArray(payload.data)) {
      throw new Error('Invalid payload shape');
    }

    return payload.data;
  } catch {
    return mockUsers;
  }
}

export async function fetchDepartmentsWithCounts() {
  const endpoint = `${getBaseUrl()}/api/departments`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload?.data || !Array.isArray(payload.data)) {
      throw new Error('Invalid payload shape');
    }

    return payload.data;
  } catch {
    const countMap = mockUsers.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {});

    return uruguayDepartments.map((department) => ({
      id: department.id,
      name: department.name,
      userCount: countMap[department.id] || 0
    }));
  }
}
