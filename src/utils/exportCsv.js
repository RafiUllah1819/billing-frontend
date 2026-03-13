const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');

  if (
    escaped.includes(',') ||
    escaped.includes('"') ||
    escaped.includes('\n')
  ) {
    return `"${escaped}"`;
  }

  return escaped;
};

export const exportToCsv = (filename, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert('No data available to export');
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvLines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(',')
    ),
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};