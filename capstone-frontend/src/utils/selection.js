export function getIncomingSelectedId(locationState, expectedRecordType) {
  // extracts selection from location state and validates it against expected record type
  const selection = locationState?.selection;

  if (!selection) return null;
  if (selection.recordType !== expectedRecordType) return null;

  return selection.id ?? null;
}

// finds matching record based on incoming id, previous selction, or default to first record
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
