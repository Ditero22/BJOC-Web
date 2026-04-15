export type TripExport = {
  route: string;
  driver: string;
  jeepney: string;
  scheduled: string;
  start: string;
  end: string;
};

export function exportTripReportCSV(trips: TripExport[]) {

  if (!trips.length) {
    alert("No data to export");
    return;
  }

  const headers = [
    "Route",
    "Driver",
    "Jeepney",
    "Scheduled Start",
    "Actual Start",
    "Actual End"
  ];

  const rows = trips.map((t) => [
    t.route,
    t.driver,
    t.jeepney,
    new Date(t.scheduled).toLocaleString(),
    new Date(t.start).toLocaleString(),
    new Date(t.end).toLocaleString()
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute(
    "download",
    `BJOC_Trip_Report_${new Date().toISOString().slice(0,10)}.csv`
  );

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

export function exportCSV(filename: string, rows: any[]) {

  if (!rows.length) {
    alert("No data available to export");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => `"${row[h] ?? ""}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}