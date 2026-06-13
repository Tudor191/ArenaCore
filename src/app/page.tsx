"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  prizePool?: string;
  location?: string;
  logoUrl?: string;
  numberOfTop10: number;
  _count?: { matches: number; teams: number };
}

interface ApiData {
  data: Event[];
  total: number;
  totalPages: number;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => 2015 + i).reverse();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "18" });
    if (year) params.set("year", year);
    if (search) params.set("search", search);
    const res = await fetch(`/api/events?${params}`);
    const json: ApiData = await res.json();
    setEvents(json.data);
    setTotal(json.total);
    setTotalPages(json.totalPages);
    setLoading(false);
  }, [page, year, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          <span className="text-cs-orange">CS</span> Tournament History
        </h1>
        <p className="text-cs-muted text-sm">
          {total} tournaments with 5+ top-10 teams · from 2015 to present
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md text-cs-text placeholder-cs-muted focus:outline-none focus:border-cs-orange"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-cs-orange text-white rounded-md hover:bg-orange-500 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={year}
          onChange={(e) => { setYear(e.target.value); setPage(1); }}
          className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md text-cs-text focus:outline-none focus:border-cs-orange"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-36 bg-cs-card border border-cs-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-cs-muted">
          <p className="text-lg mb-2">No tournaments found</p>
          <p className="text-sm">Try running a sync first via Settings, or adjust your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/tournament/${ev.id}`}
                className="block bg-cs-card border border-cs-border rounded-lg p-4 hover:border-cs-orange transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-cs-orange transition-colors line-clamp-2">
                      {ev.name}
                    </h3>
                    <p className="text-cs-muted text-xs mt-1">
                      {new Date(ev.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      {ev.endDate && ` — ${new Date(ev.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                  {ev.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ev.logoUrl} alt="" className="w-10 h-10 object-contain flex-shrink-0 opacity-80" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-cs-muted mt-auto">
                  <div className="flex items-center gap-3">
                    {ev.location && <span>📍 {ev.location}</span>}
                    {ev.prizePool && <span>💰 {ev.prizePool}</span>}
                  </div>
                  <span className="bg-cs-dark px-2 py-0.5 rounded text-cs-orange font-medium">
                    {ev.numberOfTop10} top10
                  </span>
                </div>

                {ev._count && (
                  <div className="flex gap-3 mt-2 text-xs text-cs-muted border-t border-cs-border pt-2">
                    <span>{ev._count.teams} teams</span>
                    <span>{ev._count.matches} matches</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md disabled:opacity-40 hover:border-cs-orange transition-colors"
              >
                ← Prev
              </button>
              <span className="text-cs-muted text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md disabled:opacity-40 hover:border-cs-orange transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
