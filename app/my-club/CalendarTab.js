"use client";

import { useState } from "react";
import { bookSession, cancelBooking, createSession } from "./calendar/actions";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "pm" : "am"}`;
}

function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function SessionCard({ session, userId, isChairman }) {
  const booked = session.session_bookings?.some((b) => b.profile_id === userId);
  const bookingCount = session.session_bookings?.length ?? 0;
  const spots = session.max_places - bookingCount;
  const full = spots <= 0;
  const hasKeyholder = session.session_bookings?.some((b) =>
    session._keyholderIds?.includes(b.profile_id)
  );
  const isPast = session.session_date < new Date().toISOString().slice(0, 10);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "var(--accent-light)",
        opacity: session.is_cancelled ? 0.5 : 1,
        borderLeft: `3px solid ${!hasKeyholder && !isPast && !session.is_cancelled ? "#f59e0b" : "var(--accent)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-semibold opacity-50">{formatDate(session.session_date)}</span>
            {session.is_cancelled && (
              <span className="rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-xs font-semibold">Cancelled</span>
            )}
            {!hasKeyholder && !isPast && !session.is_cancelled && (
              <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 text-xs font-semibold">
                ⚠️ Keyholder needed
              </span>
            )}
          </div>
          <p className="font-semibold">{session.name}</p>
          <p className="text-xs opacity-60">📍 {session.location} · {formatTime(session.start_time)} – {formatTime(session.end_time)}</p>
          {session.description && <p className="text-xs opacity-50 mt-0.5">{session.description}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold" style={{ color: full ? "#dc2626" : "var(--accent)" }}>
            {full ? "Full" : `${spots} spot${spots !== 1 ? "s" : ""} left`}
          </p>
          <p className="text-xs opacity-50">{bookingCount}/{session.max_places}</p>
        </div>
      </div>

      {/* Attendees */}
      {session.session_bookings?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {session.session_bookings.map((b) => (
            <span
              key={b.profile_id}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                background: b.profile_id === userId ? "var(--accent)" : "rgba(0,0,0,0.08)",
                color: b.profile_id === userId ? "var(--accent-foreground)" : "inherit",
              }}
            >
              {session._keyholderIds?.includes(b.profile_id) ? "🔑 " : ""}
              {b.profiles?.full_name ?? "Member"}
            </span>
          ))}
        </div>
      )}

      {/* Book / cancel */}
      {!isPast && !session.is_cancelled && (
        booked ? (
          <form action={cancelBooking}>
            <input type="hidden" name="session_id" value={session.id} />
            <button type="submit" className="text-xs text-red-500 hover:underline">Cancel my booking</button>
          </form>
        ) : (
          <form action={bookSession}>
            <input type="hidden" name="session_id" value={session.id} />
            <button
              type="submit"
              disabled={full}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {full ? "Session full" : "Book my spot"}
            </button>
          </form>
        )
      )}
    </div>
  );
}

export default function CalendarTab({ sessions, clubId, userId, userRole, locations, keyholderIds }) {
  const [showForm, setShowForm] = useState(false);
  const isChairman = ["chairman", "records_keeper"].includes(userRole);

  const upcoming = sessions.filter((s) => s.session_date >= new Date().toISOString().slice(0, 10));
  const past = sessions.filter((s) => s.session_date < new Date().toISOString().slice(0, 10));

  // Annotate sessions with keyholder IDs for the card
  const annotated = sessions.map((s) => ({ ...s, _keyholderIds: keyholderIds[s.location] ?? [] }));
  const upcomingAnnotated = annotated.filter((s) => s.session_date >= new Date().toISOString().slice(0, 10));
  const pastAnnotated = annotated.filter((s) => s.session_date < new Date().toISOString().slice(0, 10)).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Club calendar</h2>
          <p className="text-xs opacity-50">{upcomingAnnotated.length} upcoming session{upcomingAnnotated.length !== 1 ? "s" : ""}</p>
        </div>
        {isChairman && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary text-sm"
          >
            {showForm ? "✕ Cancel" : "+ Add session"}
          </button>
        )}
      </div>

      {/* Create session form */}
      {showForm && isChairman && (
        <div className="card flex flex-col gap-4" style={{ borderLeft: "3px solid var(--accent)" }}>
          <h3 className="font-semibold">New session</h3>
          <form
            action={async (fd) => { fd.append("club_id", clubId); await createSession(fd); setShowForm(false); }}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="club_id" value={clubId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Session name
                <input name="name" required placeholder="e.g. Tuesday evening shoot" className="input-field font-normal" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Location
                <input
                  name="location"
                  required
                  list="location-list"
                  placeholder="e.g. Indoor range"
                  className="input-field font-normal"
                />
                <datalist id="location-list">
                  {locations.map((l) => <option key={l} value={l} />)}
                </datalist>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Description (optional)
              <input name="description" placeholder="Any notes for members…" className="input-field font-normal" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Date
                <input type="date" name="session_date" required min={new Date().toISOString().slice(0,10)} className="input-field font-normal" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Start time
                <input type="time" name="start_time" required defaultValue="19:00" className="input-field font-normal" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                End time
                <input type="time" name="end_time" required defaultValue="21:00" className="input-field font-normal" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Max places
              <input type="number" name="max_places" min={1} max={200} defaultValue={20} className="input-field font-normal" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="is_recurring" value="1" className="h-4 w-4 accent-[color:var(--accent)]" />
              Recurring weekly session
            </label>
            <div id="recurring-day" className="flex flex-col gap-1 text-sm font-medium">
              <span className="opacity-60 text-xs">Day of week (for recurring)</span>
              <select name="day_of_week" className="input-field font-normal">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary">Create session</button>
          </form>
        </div>
      )}

      {/* Upcoming sessions */}
      {upcomingAnnotated.length === 0 ? (
        <div className="card text-center py-12 opacity-50 flex flex-col gap-2 items-center">
          <span className="text-4xl">📅</span>
          <p className="text-sm">{isChairman ? "Add your first session above." : "No upcoming sessions scheduled."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcomingAnnotated.map((s) => (
            <SessionCard key={s.id} session={s} userId={userId} isChairman={isChairman} />
          ))}
        </div>
      )}

      {/* Past sessions (collapsed) */}
      {pastAnnotated.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-40">Recent past sessions</p>
          <div className="flex flex-col gap-2 opacity-60">
            {pastAnnotated.map((s) => (
              <SessionCard key={s.id} session={s} userId={userId} isChairman={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
