// reads the selected record id from the URL query string
export function getIncomingSelectedId(location) {
  const params = new URLSearchParams(location.search);
  const selectedId = params.get('selected');

  if (!selectedId) return null;

  const parsedId = Number(selectedId);

  return Number.isNaN(parsedId) ? null : parsedId;
}

// finds matching record based on incoming id, previous selection, or defaults to first record
export function resolveSelectedRecord(records, previousSelected, incomingId) {
  if (!records.length) return null;

  if (incomingId) {
    const incomingMatch = records.find((record) => record.id === incomingId);
    if (incomingMatch) return incomingMatch;
  }

  if (previousSelected) {
    const previousMatch = records.find((record) => record.id === previousSelected.id);
    if (previousMatch) return previousMatch;
  }

  return records[0];
}
