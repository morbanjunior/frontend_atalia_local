import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Para República Dominicana (UTC-4)
export function TimeAgo(dateString: string): string {
  return dayjs.utc(dateString).tz("America/Santo_Domingo").fromNow();
}
