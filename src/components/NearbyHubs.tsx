import { useEffect, useState, useRef } from "react";
import { MapPin, Clock, Truck, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_BASE = "http://localhost:5000";

interface Hub {
  id: number;
  name: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  queue_size: number | null;
  capacity_per_slot: number | null;
  total_load: number | null;
  distance_km?: number;
}

type StatusLevel = "low" | "medium" | "high";

const getStatus = (queue: number | null): StatusLevel => {
  const q = queue ?? 0;
  if (q <= 5) return "low";
  if (q <= 15) return "medium";
  return "high";
};

const statusColor: Record<StatusLevel, string> = {
  low: "bg-queue-low",
  medium: "bg-queue-medium",
  high: "bg-queue-high",
};

const statusBadge: Record<StatusLevel, string> = {
  low: "bg-queue-low/10 text-queue-low",
  medium: "bg-queue-medium/10 text-queue-medium",
  high: "bg-queue-high/10 text-queue-high",
};

const NearbyHubs = () => {
  const { t } = useTranslation();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all hubs on mount (no distance filter)
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/hubs`)
      .then((r) => r.json())
      .then((data: Hub[]) => {
        setHubs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load hubs. Please try again later.");
        setLoading(false);
      });
  }, []);

  const searchNearbyHubs = async () => {
    const location = searchLocation.trim();
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Geocode via OpenStreetMap Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        setError(t("noHubsFound"));
        setLoading(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lng = parseFloat(geoData[0].lon);

      // Step 2: Fetch hubs sorted by distance
      const hubRes = await fetch(
        `${API_BASE}/api/hubs/nearby?lat=${lat}&lng=${lng}`
      );
      const hubData: Hub[] = await hubRes.json();

      if (!Array.isArray(hubData) || hubData.length === 0) {
        setError(t("noHubsFound"));
        setHubs([]);
      } else {
        setHubs(hubData);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") searchNearbyHubs();
  };

  return (
    <section className="relative bg-grid">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {t("realTimeData")}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            {t("nearbyAgroHubs")}
          </h2>
        </div>

        {/* ── Location Search Bar ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto mb-10">
          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              id="hub-location-search"
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass border border-border font-ui text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <button
            id="hub-search-btn"
            onClick={searchNearbyHubs}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-ui text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? t("searchingLocation") : t("search")}
          </button>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <p className="text-center font-ui text-sm text-destructive mb-6">
            {error}
          </p>
        )}

        {/* ── Hub Cards ── */}
        {!loading && hubs.length === 0 && !error && (
          <p className="text-center font-ui text-sm text-muted-foreground mb-6">
            {t("noHubsFound")}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((hub) => {
            const status = getStatus(hub.queue_size);
            const capacityPct = hub.capacity_per_slot
              ? Math.min(Math.round(((hub.queue_size ?? 0) / hub.capacity_per_slot) * 100), 100)
              : 0;
            return (
              <div
                key={hub.id}
                className="glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-foreground/5 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        {hub.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-ui text-xs text-muted-foreground">
                          {hub.location}
                        </span>
                      </div>
                      {/* Distance badge */}
                      {hub.distance_km !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="font-ui text-xs text-primary font-semibold">
                            📍 {hub.distance_km} km {t("away") ?? "away"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`${statusBadge[status]} px-3 py-1 rounded-full font-ui text-xs font-semibold capitalize`}
                    >
                      {t(status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Truck className="h-4 w-4 text-muted-foreground mb-1" />
                      <p className="font-display text-2xl font-bold">
                        {hub.queue_size ?? 0}
                      </p>
                      <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t("inQueue")}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <p className="font-display text-2xl font-bold">
                        {hub.category}
                      </p>
                      <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t("estWait")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-1.5 bg-muted mx-5 mb-5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColor[status]} rounded-full transition-all duration-500`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NearbyHubs;
