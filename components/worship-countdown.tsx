"use client";

import { useEffect, useState } from "react";
import { getNextWorshipOccurrence, type WorshipSchedule } from "@/lib/worship-schedule";

type WorshipCountdownProps = {
  schedule: WorshipSchedule;
  time: string;
  timeZone: string;
  durationMinutes: number;
  skipIfSameDayAs?: Array<{ schedule: WorshipSchedule; time: string; durationMinutes: number }>;
};

function localDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(":");
  return minute === "00" ? `${hour}h` : `${hour}h${minute}`;
}

function formatCountdown(milliseconds: number): string {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;
  if (days) return `Começa em ${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours) return `Começa em ${hours}h ${minutes}m ${seconds}s`;
  if (minutes) return `Começa em ${minutes}m ${seconds}s`;
  return `Começa em ${seconds}s`;
}

export function WorshipCountdown({ schedule, time, timeZone, durationMinutes, skipIfSameDayAs = [] }: WorshipCountdownProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (now === null) return <div className="worship-countdown" aria-live="off">Calculando próximo encontro…</div>;
  const excludedDates = skipIfSameDayAs.flatMap((related) => {
    const relatedOccurrence = getNextWorshipOccurrence(
      related.schedule, related.time, now, timeZone, related.durationMinutes,
    );
    return relatedOccurrence ? [localDateKey(relatedOccurrence.startsAt, timeZone)] : [];
  });
  const occurrence = getNextWorshipOccurrence(schedule, time, now, timeZone, durationMinutes, excludedDates);
  if (!occurrence) return <div className="worship-countdown">Nenhum próximo encontro programado.</div>;
  const today = localDateKey(occurrence.startsAt, timeZone) === localDateKey(new Date(now), timeZone);
  const date = today ? "Hoje" : new Intl.DateTimeFormat("pt-BR", {
    timeZone, weekday: "long", day: "numeric", month: "long",
  }).format(occurrence.startsAt).replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"));
  const label = `${date} às ${formatTime(time)}`;
  const live = occurrence.status === "live";

  return (
    <div className="worship-countdown" aria-label={`Próximo encontro: ${label}`}>
      <span className="countdown-label">{live ? "Acontecendo agora" : "Próximo encontro"}</span>
      <strong className="countdown-date">{label}</strong>
      <span className="countdown-timer" role="timer" aria-live="off">
        {live ? "Encontro em andamento" : formatCountdown(occurrence.startsAt.getTime() - now)}
      </span>
    </div>
  );
}
