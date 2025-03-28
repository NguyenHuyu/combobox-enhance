// lib/fakeSearchApi.ts

const SUBJECT_NAMES = [
  "Nguyên lý kế toán",
  "Lập trình Python",
  "Kỹ thuật phần mềm",
  "Phân tích dữ liệu",
  "Trí tuệ nhân tạo",
  "Thương mại điện tử",
  "Hệ quản trị cơ sở dữ liệu",
  "Cấu trúc dữ liệu và giải thuật",
  "Mạng máy tính",
  "An toàn thông tin",
];

const SUBJECT_TYPES = ["CSN", "BB", "TC"];

function generateRandomSubject(id: number) {
  const name = SUBJECT_NAMES[Math.floor(Math.random() * SUBJECT_NAMES.length)];
  const subjectId = `2BUS${10000 + id}`;
  return {
    id,
    subjectId,
    name: `${name} (${
      Math.random() > 0.5 ? "Thương mại điện tử" : "Học kỳ 1"
    })`,
    nameEnglish: `${name} (English)`,
    specializationId: Math.floor(Math.random() * 100),
    subjectMethodId: Math.floor(Math.random() * 3) + 1,
    outlineSubjectId: Math.floor(Math.random() * 50) + 1,
    numberCredits: Math.floor(Math.random() * 4) + 1,
    numberPracticalCredits: 0,
    subjectType:
      SUBJECT_TYPES[Math.floor(Math.random() * SUBJECT_TYPES.length)],
    preConditionSubjects: [],
    dependentSubjects: null,
    isDeprecated: false,
  };
}

// Dataset chỉ sinh 1 lần khi import
const DATASET = Array.from({ length: 2000 }, (_, i) =>
  generateRandomSubject(i + 1)
);

export function getSearchResults({
  page = 0,
  size = 10,
  filter,
  value,
}: {
  page?: number;
  size?: number;
  filter?: keyof ReturnType<typeof generateRandomSubject>;
  value?: string;
}) {
  let filtered = DATASET;

  if (filter && value) {
    const lowerVal = value.toLowerCase();
    filtered = filtered.filter((item) => {
      const fieldValue = item[filter];
      return String(fieldValue).toLowerCase().includes(lowerVal);
    });
  }

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const end = start + size;
  const content = filtered.slice(start, end);

  return {
    content,
    totalPages,
    totalElements,
    size,
    page,
    sort: [],
    numberOfElements: content.length,
  };
}

export function getSubjectById(id: number) {
  return DATASET.find((item) => item.id === id) || null;
}
