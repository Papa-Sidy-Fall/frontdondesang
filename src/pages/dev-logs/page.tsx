import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loginDevLogs } from "../../services/dev-auth-api";
import {
  clearDevLogsSession,
  getDevLogsEmail,
  getDevLogsToken,
  setDevLogsSession,
} from "../../services/dev-auth-storage";
import { getLogs } from "../../services/log-api";
import { ApiError } from "../../services/http-client";
import type { LogEntryDto, LogLevel } from "../../types/logs";

export default function DevLogsPage() {
  const [logs, setLogs] = useState<LogEntryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<"" | LogLevel>("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);
  const [logToken, setLogToken] = useState("");

  const [devEmail, setDevEmail] = useState(getDevLogsEmail() ?? "");
  const [devPassword, setDevPassword] = useState("");
  const [devAuthLoading, setDevAuthLoading] = useState(false);

  const hasDevSession = Boolean(getDevLogsToken());

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getLogs({
        level: level || undefined,
        search: search || undefined,
        limit,
        logToken: logToken || undefined,
      });
      setLogs(response.logs);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger les logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasDevSession) {
      return;
    }

    void fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDevSession]);

  const handleDevLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setDevAuthLoading(true);

    try {
      const response = await loginDevLogs({
        email: devEmail,
        password: devPassword,
      });

      setDevLogsSession(response.accessToken, response.user.email);
      setDevPassword("");
      await fetchLogs();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Connexion développeur impossible");
    } finally {
      setDevAuthLoading(false);
    }
  };

  const handleDevLogout = () => {
    clearDevLogsSession();
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dev Logs Console</h1>
        <Link to="/tableau-de-bord-donneur" className="text-sm text-gray-300 hover:text-white">
          Retour dashboard
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {!hasDevSession && (
          <form onSubmit={handleDevLogin} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={devEmail}
              onChange={(event) => setDevEmail(event.target.value)}
              placeholder="Email dev"
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={devPassword}
              onChange={(event) => setDevPassword(event.target.value)}
              placeholder="Mot de passe dev"
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={logToken}
              onChange={(event) => setLogToken(event.target.value)}
              placeholder="x-log-token (optionnel)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={devAuthLoading}
              className="bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {devAuthLoading ? "Connexion..." : "Se connecter (Dev)"}
            </button>
          </form>
        )}

        {hasDevSession && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as "" | LogLevel)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous niveaux</option>
              <option value="debug">debug</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
            </select>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Recherche message/context"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="number"
              min={1}
              max={500}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />

            <input
              value={logToken}
              onChange={(event) => setLogToken(event.target.value)}
              placeholder="x-log-token (prod)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={() => void fetchLogs()}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Rafraîchir"}
            </button>

            <button
              onClick={handleDevLogout}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              Déconnexion Dev
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left px-3 py-2">Timestamp</th>
                <th className="text-left px-3 py-2">Level</th>
                <th className="text-left px-3 py-2">Message</th>
                <th className="text-left px-3 py-2">Context</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id} className="border-t border-gray-800 align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                    {new Date(entry.timestamp).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-2 uppercase font-semibold">
                    <span className={levelClassName(entry.level)}>{entry.level}</span>
                  </td>
                  <td className="px-3 py-2">{entry.message}</td>
                  <td className="px-3 py-2 text-gray-300">
                    {entry.context ? (
                      <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(entry.context, null, 2)}</pre>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && logs.length === 0 && <div className="px-4 py-10 text-center text-gray-400">Aucun log</div>}
        </div>
      </main>
    </div>
  );
}

function levelClassName(level: LogLevel): string {
  switch (level) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-yellow-400";
    case "info":
      return "text-cyan-400";
    default:
      return "text-purple-300";
  }
}
