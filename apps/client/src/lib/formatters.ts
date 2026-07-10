const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatPln(value: number) {
  return plnFormatter.format(value);
}

export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export function formatUnixDateTime(timestamp: number) {
  return formatDateTime(new Date(timestamp * 1000));
}

export function shortId(id: string, length = 8) {
  return id.slice(0, length).toUpperCase();
}
