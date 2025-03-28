import { NextResponse } from "next/server";

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

const DATASET = Array.from({ length: 2000 }, (_, i) =>
  generateRandomSubject(i + 1)
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "0");
  const size = parseInt(searchParams.get("size") || "10");
  const filterKey = searchParams.get("filter");
  const filterValue = searchParams.get("value")?.toLowerCase() || "";

  let filteredData = DATASET;

  if (filterKey && filterValue) {
    filteredData = filteredData.filter((item) => {
      const fieldValue = item[filterKey as keyof typeof item];
      if (fieldValue == null) return false;
      return String(fieldValue).toLowerCase().includes(filterValue);
    });
  }

  const totalElements = filteredData.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const end = start + size;
  const content = filteredData.slice(start, end);

  return NextResponse.json({
    content,
    totalPages,
    totalElements,
    size,
    page,
    sort: [],
    numberOfElements: content.length,
  });
}
