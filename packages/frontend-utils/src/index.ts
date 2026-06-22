export function createSearchParams<
  T extends Record<string, string | number | (string | number)[]>,
>(data: T): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value && (typeof value === "string" || typeof value === "number")) {
      searchParams.append(key, value.toString());
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, item.toString());
      });
    }
  }

  return searchParams;
}
