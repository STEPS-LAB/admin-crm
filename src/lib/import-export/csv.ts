function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const next = line[index + 1];

      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);

  return values.map((value) => value.trim());
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function parseCsv(content: string): {
  readonly headers: string[];
  readonly rows: Record<string, string>[];
} {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0] ?? "").map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    return record;
  });

  return { headers, rows };
}

export function stringifyCsv(
  headers: readonly string[],
  rows: readonly Record<string, string | number | null | undefined>[],
): string {
  const headerLine = headers.map((header) => escapeCsvValue(header)).join(",");
  const dataLines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];

        if (value === null || value === undefined) {
          return "";
        }

        return escapeCsvValue(String(value));
      })
      .join(","),
  );

  return [headerLine, ...dataLines].join("\n");
}
