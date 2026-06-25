"use client";

import { useState } from "react";
import {
  bookSession, cancelBooking, createSession,
  cancelSession, assignSessionKeyholder,
  createLocation, updateLocation, deleteLocation,
  addKeyholder, removeKeyholder,
} from "./calendar/actions";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const EVENT_TYPES = [
  { value: "practice",     label: "Practice" },
  { value: "competition",  label: "Competition" },
  { value: "meeting",      label: "Meeting" },
  { value: "course",       label: "Course" },
  { value: "social",       label: "Social" },
];
const EVENT_COLORS = {
  practice:    "var(--accent)",
  competition: "#8b5cf6",
  meeting:     "#3b82f6",
  course:      "#f59e0b",
  social:      "#ec4899",
};

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m}${hour >= 12 ? "pm" : "am"}`;
}

function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function Avatar({ name, size = 28 }) {
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--accent)", color: "var(--accent-foreground)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function Chip({ label, color, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: color ? `${color}22` : "var(--accent-light)", color: color || "var(--accent)",
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "inherit", opacity: 0.6 }}>×</button>
      )}
    </span>
  );
}

// ── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session, userId, isOfficer, members, onAssignKeyholder }) {
  const [expanded, setExpanded] = useState(false);
  const booked = session.session_bookings?.some(b => b.profile_id === userId);
  const bookingCount = session.session_bookings?.length ?? 0;
  const spots = session.max_places - bookingCount;
  const isPast = session.session_date < new Date().toISOString().slice(0, 10);
  const assignedKH = session.assigned_keyholder_id;
  const assignedKHName = members.find(m => m.profile_id === assignedKH)?.profiles?.full_name;
  const defaultKHIds = session._keyholderIds ?? [];
  const anyKHBooked = session.session_bookings?.some(b => defaultKHIds.includes(b.profile_id));
  const needsKeyholder = !assignedKH && !anyKHBooked && !isPast && !session.is_cancelled;
  const color = EVENT_COLORS[session.event_type] ?? EVENT_COLORS.practice;

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: `1px solid ${needsKeyholder ? "#f59e0b44" : "var(--accent-light)"}`,
      background: "color-mix(in srgb, var(--accent) 3%, var(--background))",
      opacity: session.is_cancelled ? 0.55 : 1,
    }}>
      {/* Header bar */}
      <div style={{ height: 3, background: color }} />

      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
              <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 600 }}>{formatDate(session.session_date)}</span>
              <Chip label={session.event_type || "practice"} color={color} />
              {session.is_cancelled && <Chip label="Cancelled" color="#dc2626" />}
              {needsKeyholder && <Chip label="⚠️ Key holder needed" color="#f59e0b" />}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{session.name}</div>
            <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
              📍 {session.location} · {formatTime(session.start_time)} – {formatTime(session.end_time)}
            </div>
            {session.description && (
              <div style={{ fontSize: 12, opacity: 0.45, marginTop: 3 }}>{session.description}</div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: spots <= 0 ? "#dc2626" : "var(--accent)" }}>
              {spots <= 0 ? "Full" : `${spots} left`}
            </div>
            <div style={{ fontSize: 11, opacity: 0.4 }}>{bookingCount}/{session.max_places}</div>
          </div>
        </div>

        {/* Key holder assigned */}
        {assignedKHName && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span>🔑</span>
            <span style={{ fontWeight: 500 }}>{assignedKHName}</span>
            <span style={{ opacity: 0.4 }}>· key holder</span>
          </div>
        )}

        {/* Attendees */}
        {session.session_bookings?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {session.session_bookings.map(b => (
              <span key={b.profile_id} style={{
                fontSize: 12, padding: "2px 8px", borderRadius: 20,
                background: b.profile_id === userId ? "var(--accent)" : "rgba(127,127,127,0.12)",
                color: b.profile_id === userId ? "var(--accent-foreground)" : "inherit",
              }}>
                {defaultKHIds.includes(b.profile_id) ? "🔑 " : ""}{b.profiles?.full_name || "Member"}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {!isPast && !session.is_cancelled && (
            booked ? (
              <form action={cancelBooking}>
                <input type="hidden" name="session_id" value={session.id} />
                <button type="submit" style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                  Cancel booking
                </button>
              </form>
            ) : (
              <form action={bookSession}>
                <input type="hidden" name="session_id" value={session.id} />
                <button type="submit" disabled={spots <= 0}
                  style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 6,
                    background: "var(--accent)", color: "var(--accent-foreground)",
                    border: "none", cursor: spots <= 0 ? "not-allowed" : "pointer",
                    opacity: spots <= 0 ? 0.4 : 1,
                  }}>
                  Book spot
                </button>
              </form>
            )
          )}

          {isOfficer && !isPast && (
            <button onClick={() => setExpanded(v => !v)}
              style={{ fontSize: 12, opacity: 0.5, background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
              {expanded ? "▲ less" : "▼ manage"}
            </button>
          )}
        </div>

        {/* Officer management panel */}
        {expanded && isOfficer && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--accent-light)", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Assign keyholder */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>🔑 Assign key holder:</span>
              <form action={assignSessionKeyholder} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <input type="hidden" name="session_id" value={session.id} />
                <select name="keyholder_id" style={{
                  fontSize: 12, padding: "3px 8px", borderRadius: 6,
                  border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)",
                }}>
                  <option value="">— none —</option>
                  {members.map(m => (
                    <option key={m.profile_id} value={m.profile_id}>{m.profiles?.full_name}</option>
                  ))}
                </select>
                <button type="submit" style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 6,
                  background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer",
                }}>Save</button>
              </form>
            </div>

            {/* Cancel session */}
            {!session.is_cancelled && (
              <form action={cancelSession} onSubmit={e => {
                if (!confirm("Cancel this session? Members will see it as cancelled.")) e.preventDefault();
              }}>
                <input type="hidden" name="session_id" value={session.id} />
                <button type="submit" style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                  Cancel session
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Location management panel ─────────────────────────────────────────────────
function LocationsPanel({ locations, keyholders, members, clubId }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null); // location name being edited

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Locations & key holders
        </span>
        <button onClick={() => setAdding(v => !v)}
          style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer" }}>
          + Add location
        </button>
      </div>

      {adding && (
        <form action={async fd => { fd.append("club_id", clubId); await createLocation(fd); setAdding(false); }}
          style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 10, background: "var(--accent-light)" }}>
          <input type="hidden" name="club_id" value={clubId} />
          <input name="name" required placeholder="Location name (e.g. Indoor range)" style={{
            fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent)", background: "var(--background)", color: "var(--foreground)",
          }} />
          <input name="address" placeholder="Address (optional)" style={{
            fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)",
          }} />
          <textarea name="access_notes" placeholder="Access notes (e.g. lockbox code, parking info)" rows={2} style={{
            fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)", resize: "vertical",
          }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer" }}>
              Save location
            </button>
            <button type="button" onClick={() => setAdding(false)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, background: "none", border: "1px solid var(--accent-light)", cursor: "pointer", color: "var(--foreground)" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {locations.length === 0 && !adding && (
        <div style={{ fontSize: 13, opacity: 0.4, textAlign: "center", padding: "16px 0" }}>
          No locations added yet. Add one above to assign key holders.
        </div>
      )}

      {locations.map(loc => {
        const locKH = keyholders.filter(k => k.location === loc.name);
        const isEditing = editing === loc.name;

        return (
          <div key={loc.id || loc.name} style={{ padding: 14, borderRadius: 10, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 3%, var(--background))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{loc.name}</div>
                {loc.address && <div style={{ fontSize: 12, opacity: 0.5 }}>{loc.address}</div>}
                {loc.access_notes && (
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>🔒 {loc.access_notes}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(isEditing ? null : loc.name)}
                  style={{ fontSize: 11, opacity: 0.5, background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
                  Edit
                </button>
                <form action={async fd => { await deleteLocation(fd); }}
                  onSubmit={e => { if (!confirm(`Delete "${loc.name}"?`)) e.preventDefault(); }}>
                  <input type="hidden" name="location_id" value={loc.id} />
                  <button type="submit" style={{ fontSize: 11, opacity: 0.5, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                    Delete
                  </button>
                </form>
              </div>
            </div>

            {isEditing && (
              <form action={async fd => { await updateLocation(fd); setEditing(null); }}
                style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, padding: 10, borderRadius: 8, background: "var(--accent-light)" }}>
                <input type="hidden" name="location_id" value={loc.id} />
                <input name="name" defaultValue={loc.name} required style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--accent)", background: "var(--background)", color: "var(--foreground)" }} />
                <input name="address" defaultValue={loc.address || ""} placeholder="Address" style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }} />
                <textarea name="access_notes" defaultValue={loc.access_notes || ""} placeholder="Access notes" rows={2}
                  style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)", resize: "vertical" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="submit" style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer" }}>Save</button>
                  <button type="button" onClick={() => setEditing(null)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "none", border: "1px solid var(--accent-light)", cursor: "pointer", color: "var(--foreground)" }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Key holders for this location */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                🔑 Key holders
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {locKH.map(kh => (
                  <div key={kh.profile_id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 4px", borderRadius: 20, background: "var(--accent-light)", fontSize: 12 }}>
                    <Avatar name={kh.profiles?.full_name} size={20} />
                    <span>{kh.profiles?.full_name || "Member"}</span>
                    <form action={removeKeyholder} style={{ display: "inline" }}>
                      <input type="hidden" name="keyholder_id" value={kh.id} />
                      <button type="submit" title="Remove" style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                    </form>
                  </div>
                ))}

                {/* Add keyholder */}
                <form action={async fd => { fd.append("location", loc.name); fd.append("club_id", clubId); await addKeyholder(fd); }}
                  style={{ display: "flex", gap: 4 }}>
                  <input type="hidden" name="location" value={loc.name} />
                  <input type="hidden" name="club_id" value={clubId} />
                  <select name="profile_id" style={{ fontSize: 12, padding: "3px 6px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }}>
                    <option value="">+ add key holder</option>
                    {members
                      .filter(m => !locKH.some(k => k.profile_id === m.profile_id))
                      .map(m => (
                        <option key={m.profile_id} value={m.profile_id}>{m.profiles?.full_name}</option>
                      ))}
                  </select>
                  <button type="submit" style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer" }}>Add</button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main CalendarTab ──────────────────────────────────────────────────────────
export default function CalendarTab({ sessions, clubId, userId, userRole, locations, keyholders, members }) {
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("upcoming"); // upcoming | past | locations

  const isOfficer = ["chairman","secretary","records_keeper","tournament_org"].includes(userRole);
  const today = new Date().toISOString().slice(0, 10);

  // Annotate sessions with keyholder IDs
  const khByLocation = {};
  for (const kh of keyholders) {
    if (!khByLocation[kh.location]) khByLocation[kh.location] = [];
    khByLocation[kh.location].push(kh.profile_id);
  }

  const annotated = sessions.map(s => ({ ...s, _keyholderIds: khByLocation[s.location] ?? [] }));
  const upcoming = annotated.filter(s => s.session_date >= today);
  const past = annotated.filter(s => s.session_date < today);

  // "Who has the key this week?" callout
  const thisWeek = upcoming.slice(0, 5);
  const needsKH = thisWeek.filter(s =>
    !s.assigned_keyholder_id && !s.session_bookings?.some(b => (khByLocation[s.location] ?? []).includes(b.profile_id)) && !s.is_cancelled
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>

      {/* Alert: sessions needing a key holder */}
      {isOfficer && needsKH.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e" }}>
          <strong>⚠️ {needsKH.length} upcoming session{needsKH.length > 1 ? "s" : ""} without an assigned key holder</strong>
          <div style={{ fontSize: 12, marginTop: 3, opacity: 0.7 }}>
            {needsKH.map(s => `${formatDate(s.session_date)} – ${s.name}`).join(" · ")}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["upcoming","past","locations"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{
                fontSize: 13, padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: view === v ? "var(--accent)" : "var(--accent-light)",
                color: view === v ? "var(--accent-foreground)" : "var(--foreground)",
                fontWeight: view === v ? 600 : 400,
              }}>
              {v === "upcoming" ? `Upcoming (${upcoming.length})` : v === "past" ? "Past" : "📍 Locations"}
            </button>
          ))}
        </div>
        {isOfficer && view !== "locations" && (
          <button onClick={() => setShowForm(v => !v)}
            style={{ fontSize: 13, padding: "5px 12px", borderRadius: 6, background: showForm ? "none" : "var(--accent)", color: showForm ? "var(--foreground)" : "var(--accent-foreground)", border: showForm ? "1px solid var(--accent-light)" : "none", cursor: "pointer" }}>
            {showForm ? "✕ Cancel" : "+ Add session"}
          </button>
        )}
      </div>

      {/* Create session form */}
      {showForm && isOfficer && (
        <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--accent)", background: "color-mix(in srgb, var(--accent) 4%, var(--background))" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>New session</h3>
          <form action={async fd => { fd.append("club_id", clubId); await createSession(fd); setShowForm(false); }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="club_id" value={clubId} />
            <div className="grid-responsive-2">
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
                Name
                <input name="name" required placeholder="e.g. Tuesday evening shoot"
                  style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
                Type
                <select name="event_type"
                  style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
            </div>
            <div className="grid-responsive-2">
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
                Location
                <input name="location" required list="loc-list" placeholder="Select or type"
                  style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }} />
                <datalist id="loc-list">
                  {locations.map(l => <option key={l.id || l.name} value={l.name} />)}
                </datalist>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
                Assigned key holder
                <select name="assigned_keyholder_id"
                  style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }}>
                  <option value="">— assign later —</option>
                  {members.map(m => <option key={m.profile_id} value={m.profile_id}>{m.profiles?.full_name}</option>)}
                </select>
              </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
              Description
              <input name="description" placeholder="Optional notes for members"
                style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }} />
            </label>
            <div className="grid-responsive-4">
              {[
                { name: "session_date", type: "date", label: "Date" },
                { name: "start_time", type: "time", label: "Start", defaultValue: "19:00" },
                { name: "end_time", type: "time", label: "End", defaultValue: "21:00" },
                { name: "max_places", type: "number", label: "Places", defaultValue: "20" },
              ].map(f => (
                <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500 }}>
                  {f.label}
                  <input type={f.type} name={f.name} required defaultValue={f.defaultValue}
                    min={f.name === "session_date" ? today : undefined}
                    style={{ fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-light)", background: "var(--background)", color: "var(--foreground)" }} />
                </label>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" name="is_recurring" value="1" style={{ accentColor: "var(--accent)" }} />
              Recurring weekly session
            </label>
            <button type="submit" style={{ fontSize: 14, padding: "8px 18px", borderRadius: 8, background: "var(--accent)", color: "var(--accent-foreground)", border: "none", cursor: "pointer", fontWeight: 600, alignSelf: "flex-start" }}>
              Create session
            </button>
          </form>
        </div>
      )}

      {/* Upcoming */}
      {view === "upcoming" && (
        upcoming.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", opacity: 0.4 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 14 }}>{isOfficer ? "Add your first session above." : "No upcoming sessions scheduled."}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(s => (
              <SessionCard key={s.id} session={s} userId={userId} isOfficer={isOfficer} members={members} onAssignKeyholder={assignSessionKeyholder} />
            ))}
          </div>
        )
      )}

      {/* Past */}
      {view === "past" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: 0.7 }}>
          {past.slice(0, 10).map(s => (
            <SessionCard key={s.id} session={s} userId={userId} isOfficer={false} members={members} />
          ))}
          {past.length === 0 && <div style={{ opacity: 0.4, fontSize: 14, textAlign: "center", padding: "48px 0" }}>No past sessions.</div>}
        </div>
      )}

      {/* Locations */}
      {view === "locations" && (
        isOfficer ? (
          <LocationsPanel locations={locations} keyholders={keyholders} members={members} clubId={clubId} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {locations.map(loc => {
              const locKH = keyholders.filter(k => k.location === loc.name);
              return (
                <div key={loc.id || loc.name} style={{ padding: 14, borderRadius: 10, border: "1px solid var(--accent-light)", background: "color-mix(in srgb, var(--accent) 3%, var(--background))" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{loc.name}</div>
                  {loc.address && <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>{loc.address}</div>}
                  {locKH.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {locKH.map(kh => (
                        <div key={kh.profile_id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "2px 8px 2px 4px", borderRadius: 20, background: "var(--accent-light)" }}>
                          <Avatar name={kh.profiles?.full_name} size={18} />
                          <span>🔑 {kh.profiles?.full_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {locations.length === 0 && <div style={{ opacity: 0.4, fontSize: 14, textAlign: "center", padding: "48px 0" }}>No locations configured.</div>}
          </div>
        )
      )}
    </div>
  );
}
