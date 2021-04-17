// https://gist.github.com/dimkalinux/1478408
const ISO8601_REGEX = /^(\d{4})-(\d\d)-(\d\d)([T ](\d\d):(\d\d):(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:(\d\d))?)?)?$/;

export function parseISO8601(dateString: string): number {
	// 0 = whole string
	// 1 = year
	// 2 = month
	// 3 = day
	// 4 = whole time part
	// 5 = hour
	// 6 = minute
	// 7 = second
	// 8 = fractional (with dot)
	// 9 = whole timezone (possibly Z)
	// 10 = offset sign (+ or -)
	// 11 = offset hours
	// 12 = offset minutes (with colon)
	// 13 = offset minutes
		
	const r = ISO8601_REGEX.exec(dateString);
	if (!r)
		return Date.parse(dateString);

  const year = Number(r[1]);
  const month = Number(r[2]) - 1;
  const day = Number(r[3]);
  if (!r[4])
    return Date.UTC(year, month, day);

  const hour = Number(r[5]);
  const minute = Number(r[6]);
  const second = Number(r[7]);
	const ms = r[8]? Number((r[8] + "000").substr(1, 3)): 0;
	if (!r[9])
		return Date.UTC(year, month, day, hour, minute, second, ms);

	const oh = r[11]? Number(r[10]) + Number(r[11]): 0;
	const om = r[13]? Number(r[10]) + Number(r[13]): 0;
	return Date.UTC(year, month, day, hour - oh, minute - om, second, ms);
}