function parseCsvText(csvText) {
  const rows = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].split(",").map((item) => item.trim());

  return rows.slice(1).map((row) => {
    const values = row.split(",").map((item) => item.trim());

    return headers.reduce((accumulator, header, index) => {
      accumulator[header] = values[index] || "";
      return accumulator;
    }, {});
  });
}

module.exports = {
  parseCsvText
};
