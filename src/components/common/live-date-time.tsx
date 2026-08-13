"use client";

import { useEffect, useState } from "react";

const seoulDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatLiveDateTime(date: Date) {
  const parts = Object.fromEntries(seoulDateTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}.${parts.month}.${parts.day} (${parts.weekday}) ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function LiveDateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return <time data-testid="live-date-time" dateTime={now?.toISOString()}>{now ? formatLiveDateTime(now) : "현재 시각 확인 중"}</time>;
}
