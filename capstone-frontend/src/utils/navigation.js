import { getRecordRoute } from './recordRoutes';

// navigates to corresponding record page with query param for selection
export function navigateToRecord(navigate, recordType, recordId) {
  const route = getRecordRoute(recordType);

  navigate(`${route}?selected=${recordId}`);
}

/* example usage:
navigateToRecord(navigate, 'contact', contact.id);
navigateToRecord(navigate, 'application', application.id);
navigateToRecord(navigate, 'task', task.id);
navigateToRecord(navigate, 'activity', activity.id);
*/
