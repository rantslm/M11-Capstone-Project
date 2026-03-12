// defines routes for different record types
export const RECORD_ROUTES = {
  application: '/applications',
  contact: '/contacts',
  activity: '/activities',
  task: '/tasks',
};
// returns the route or default to home if not found
export function getRecordRoute(recordType) {
  return RECORD_ROUTES[recordType] || '/';
}
