import { getRecordRoute } from './recordRoutes';

// navigates to corresponding record page with state for selection
export function navigateToRecord(navigate, recordType, recordId) {
  navigate(getRecordRoute(recordType), {
    state: {
      selection: {
        recordType,
        id: recordId,
      },
    },
  });
}

/* example usage:
navigateToRecord(navigate, 'contact', contact.id);
navigateToRecord(navigate, 'application', application.id);
navigateToRecord(navigate, 'task', task.id);
navigateToRecord(navigate, 'activity', activity.id);
*/
