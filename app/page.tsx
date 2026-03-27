"use client";

import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type DatesMap = Record<string, number>;
type NotesMap = Record<string, string>;

type TrackerDoc = {
  count?: number;
  dates?: DatesMap;
  notes?: string | NotesMap;
};

const trackerRef = doc(db, "tracker", "main");

export default function DababatiTracker() {
  const today = new Date().toISOString().split("T")[0];

  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<DatesMap>({});
  const [notes, setNotes] = useState<NotesMap>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [pin, setPin] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    if (search.get("admin") === "true") {
      setShowAdminAccess(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      trackerRef,
      (snapshot) => {
        const data = (snapshot.data() as TrackerDoc | undefined) ?? {};
        const nextHistory = data.dates ?? {};
        const nextNotes =
          typeof data.notes === "string" ? {} : (data.notes ?? {});

        setHistory(nextHistory);
        setNotes(nextNotes);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load Firebase data", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCount(history[selectedDate] ?? 0);
    setNoteInput(notes[selectedDate] ?? "");
  }, [selectedDate, history, notes]);

  const saveDocument = async (nextHistory: DatesMap, nextNotes: NotesMap) => {
    await setDoc(trackerRef, {
      count: nextHistory[selectedDate] ?? 0,
      dates: nextHistory,
      notes: nextNotes,
    });
  };

  const saveForDate = async (date: string, value: number) => {
    const safeValue = Math.max(0, value);
    const nextHistory = {
      ...history,
      [date]: safeValue,
    };

    setHistory(nextHistory);
    setCount(safeValue);
    await setDoc(trackerRef, {
      count: safeValue,
      dates: nextHistory,
      notes,
    });
  };

  const increment = async () => {
    await saveForDate(selectedDate, count + 1);
  };

  const decrement = async () => {
    await saveForDate(selectedDate, count - 1);
  };

  const login = () => {
    if (pin === "1234") {
      setIsAdmin(true);
      setPin("");
    } else {
      alert("Wrong PIN");
    }
  };

  const saveNote = async () => {
    const nextNotes = {
      ...notes,
      [selectedDate]: noteInput,
    };

    setNotes(nextNotes);
    await saveDocument(history, nextNotes);
  };

  const sortedHistory = useMemo(() => {
    return Object.entries(history).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [history]);

  const renderTankIcons = (value: number) => {
    if (value <= 0) {
      return <span style={{ color: "#888888", fontSize: "14px" }}>No tanks</span>;
    }

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          justifyContent: "flex-end",
          maxWidth: "420px",
        }}
      >
        {Array.from({ length: value }).map((_, index) => (
          <img
            key={`${value}-${index}`}
            src="/tank.png"
            alt="tank"
            style={{
              width: "26px",
              height: "26px",
              objectFit: "contain",
              display: "block",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundImage: "url('/camo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: "#111111",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          borderBottom: "1px solid #e5e5e5",
          background: "#ffffff",
          color: "#111111",
        }}
      >
        <h1 style={{ fontSize: "42px", margin: 0, color: "#111111" }}>Dababati</h1>

        <div style={{ fontSize: "22px", fontWeight: 600, color: "#111111" }}>
          الجنوب المقدس
        </div>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          style={{
            border: "1px solid #cccccc",
            background: "#ffffff",
            color: "#111111",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {!showCalendar ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            minHeight: "calc(100vh - 120px)",
            padding: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              textAlign: "center",
              minWidth: "320px",
              background: "rgba(255,255,255,0.96)",
              color: "#111111",
              border: "1px solid #dddddd",
              borderRadius: "20px",
              padding: "28px 32px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
            }}
          >
            <div
              style={{
                fontSize: "150px",
                fontWeight: "bold",
                color: "#111111",
                lineHeight: 1,
              }}
            >
              {loading ? "..." : count}
            </div>

            <div
              style={{
                fontSize: "28px",
                color: "#333333",
                marginTop: "12px",
              }}
            >
              {selectedDate}
            </div>

            {isAdmin ? (
              <>
                <div style={{ marginTop: "20px" }}>
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      fontSize: "16px",
                      border: "1px solid #cccccc",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "28px",
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={decrement}
                    style={{
                      padding: "12px 20px",
                      fontSize: "22px",
                      borderRadius: "10px",
                      border: "1px solid #cccccc",
                      background: "#f5f5f5",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>

                  <button
                    onClick={increment}
                    style={{
                      padding: "12px 20px",
                      fontSize: "22px",
                      borderRadius: "10px",
                      border: "1px solid #cccccc",
                      background: "#f5f5f5",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div
            style={{
              border: "1px solid #dddddd",
              borderRadius: "18px",
              padding: "18px",
              background: "#fafafa",
            }}
          >
            <img
              src="/tank.png"
              alt="Tank"
              style={{
                width: "420px",
                maxWidth: "90vw",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              width: "320px",
              border: "1px solid #dddddd",
              borderRadius: "18px",
              padding: "18px",
              background: "#fafafa",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "14px", fontSize: "26px" }}>Note</h2>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={isAdmin ? "Write a note for this date" : "Admin only"}
              disabled={!isAdmin}
              style={{
                width: "100%",
                minHeight: "180px",
                padding: "12px",
                border: "1px solid #cccccc",
                borderRadius: "12px",
                resize: "vertical",
                fontSize: "16px",
                boxSizing: "border-box",
                background: isAdmin ? "#ffffff" : "#f1f1f1",
                color: "#111111",
              }}
            />
            {isAdmin ? (
              <button
                onClick={saveNote}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cccccc",
                  background: "#111111",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Save note
              </button>
            ) : (
              <div style={{ marginTop: "12px", color: "#777777", fontSize: "14px" }}>
                Only admin can edit notes
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: "40px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.98)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
              border: "1px solid #dddddd",
            }}
          >
            <h2 style={{ fontSize: "34px", marginBottom: "24px", color: "#111111" }}>Calendar</h2>

            {sortedHistory.length === 0 ? (
              <p style={{ fontSize: "20px", color: "#666666" }}>No saved dates yet.</p>
            ) : (
              sortedHistory.map(([date, value]) => (
                <div
                  key={date}
                  style={{
                    marginBottom: "12px",
                    fontSize: "22px",
                    padding: "14px 18px",
                    border: "1px solid #dddddd",
                    borderRadius: "12px",
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#111111" }}>{date}</div>
                    <div style={{ color: "#555555", marginTop: "4px" }}>Count: {value}</div>
                    {notes[date] ? (
                      <div style={{ color: "#666666", marginTop: "6px", fontSize: "15px" }}>
                        Note: {notes[date]}
                      </div>
                    ) : null}
                  </div>
                  {renderTankIcons(value)}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showAdminAccess ? (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#ffffff",
            border: "1px solid #dddddd",
            borderRadius: "14px",
            padding: "12px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}
        >
          {!isAdmin ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="password"
                placeholder="admin pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  padding: "10px 12px",
                  fontSize: "16px",
                  border: "1px solid #cccccc",
                  borderRadius: "10px",
                }}
              />
              <button
                onClick={login}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #cccccc",
                  background: "#111111",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                login
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdmin(false)}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid #cccccc",
                background: "#111111",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              logout
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}