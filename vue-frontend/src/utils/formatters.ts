import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatDate = (date: string | undefined): string => {
  if (!date) return 'Unknown';
  
  const dayJsDate = dayjs(date);
  const now = dayjs();
  const diffInDays = now.diff(dayJsDate, 'days');
  
  if (diffInDays < 7) {
    return dayJsDate.fromNow();
  } else if (diffInDays < 365) {
    return dayJsDate.format('MMM DD, YYYY');
  } else {
    return dayJsDate.format('LL');
  }
};

export const formatDateTime = (date: string | undefined): string => {
  if (!date) return 'Unknown';
  return dayjs(date).format('LLLL');
};

export const formatDateShort = (date: string | undefined): string => {
  if (!date) return 'Unknown';
  return dayjs(date).format('MM/DD/YYYY');
};