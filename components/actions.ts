"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSearchResults, getSubjectById as getByIdFake } from "../lib/data";

function handleError() {
  return {
    statusCode: 500,
    message: "Something went wrong",
  };
}

export const fetchSubjects = async (page: number, size = 10) => {
  try {
    const data = getSearchResults({
      page,
      size,
    });

    return {
      data,
      statusCode: 200,
      message: "Success",
    };
  } catch (error) {
    console.error("Fake API error:", error);
    return {
      data: null,
      ...handleError(),
    };
  }
};

export const searchSubjects = async (
  queryText: string,
  page: number,
  size = 10,
  filter?: any
) => {
  try {
    const data = getSearchResults({
      page,
      size,
      filter: filter || "id",
      value: queryText,
    });

    return {
      data,
      statusCode: 200,
      message: "Success",
    };
  } catch (error) {
    console.error("Fake API search error:", error);
    return {
      data: null,
      ...handleError(),
    };
  }
};

export const getSubjectById = async (id: string | number) => {
  try {
    const data = getByIdFake(Number(id));
    if (!data) {
      return {
        data: null,
        statusCode: 404,
        message: "Not found",
      };
    }

    return {
      data,
      statusCode: 200,
      message: "Success",
    };
  } catch (error) {
    console.error("Fake API getById error:", error);
    return {
      data: null,
      ...handleError(),
    };
  }
};
