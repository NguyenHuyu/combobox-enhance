"use server";

const API_BASE = "http://localhost:3000/api";

const headers = {
  "Content-Type": "application/json",
};

function handleError() {
  return {
    statusCode: 500,
    message: "Something went wrong",
  };
}

async function fetchApi(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      headers,
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return {
      data,
      statusCode: 200,
      message: "Success",
    };
  } catch (error) {
    console.error("API error:", error);
    return {
      data: null,
      ...handleError(),
    };
  }
}

function createUrl(baseUrl: string, params: Record<string, unknown>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export const fetchSubjects = async (
  page: number,
  size = 10,
  filter?: string
) => {
  const url = createUrl(`${API_BASE}/search`, {
    page,
    size,
    filter,
  });

  return fetchApi(url);
};

export const searchSubjects = async (
  queryText: string,
  page: number,
  size = 10,
  filter?: string
) => {
  // Nếu không có queryText, sử dụng fetchSubjects thay vì gọi API tìm kiếm
  if (!queryText) {
    return fetchSubjects(page, size, filter);
  }

  const url = createUrl(`${API_BASE}/search`, {
    page,
    size,
    filter,
    value: queryText,
  });

  return fetchApi(url);
};

export const getSubjectById = async (id: string | number) => {
  return fetchApi(`${API_BASE}/${id}`);
};
