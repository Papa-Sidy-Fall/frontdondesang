import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth-api";
import { clearSession, getAccessToken } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import { getMyStocks, upsertMyStock } from "../../services/stock-api";
import type { StockLineDto } from "../../services/stock-api";

export default function GestionStocksPage() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<StockLineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    groupeSanguin: "A+",
    quantite: "0",
    seuil: "",
    mode: "SET" as "SET" | "ADD",
  });

  const loadStocks = async () => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const profile = await getCurrentUser(token);
      if (profile.role !== "HOSPITAL") {
        navigate("/tableau-de-bord-donneur", { replace: true });
        return;
      }

      const response = await getMyStocks();
      setStocks(response.stocks);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearSession();
        navigate("/connexion-donneur", { replace: true });
        return;
      }

      setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger le stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setError("");
      await upsertMyStock({
        groupeSanguin: form.groupeSanguin,
        quantite: Number(form.quantite),
        seuil: form.seuil ? Number(form.seuil) : undefined,
        mode: form.mode,
      });

      setForm((previous) => ({ ...previous, quantite: "0", seuil: "" }));
      await loadStocks();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Mise à jour impossible");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 space-y-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestion manuelle des stocks</h1>
          <button onClick={() => navigate(-1)} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 sm:w-auto">
            Retour
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={form.groupeSanguin}
              onChange={(event) => setForm({ ...form, groupeSanguin: event.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={form.quantite}
              onChange={(event) => setForm({ ...form, quantite: event.target.value })}
              placeholder="Quantité"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              min={0}
              value={form.seuil}
              onChange={(event) => setForm({ ...form, seuil: event.target.value })}
              placeholder="Seuil (optionnel)"
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={form.mode}
              onChange={(event) => setForm({ ...form, mode: event.target.value as "SET" | "ADD" })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="SET">Définir (SET)</option>
              <option value="ADD">Ajouter (ADD)</option>
            </select>
            <button type="submit" className="bg-red-600 text-white rounded-lg px-3 py-2 font-semibold">
              Mettre à jour
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="min-w-[520px] w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Groupe</th>
                <th className="text-left px-3 py-2">Quantité</th>
                <th className="text-left px-3 py-2">Seuil</th>
                <th className="text-left px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                stocks.map((stock) => (
                  <tr key={stock.groupeSanguin} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-semibold">{stock.groupeSanguin}</td>
                    <td className="px-3 py-2">{stock.quantite}</td>
                    <td className="px-3 py-2">{stock.seuil}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          stock.statut === "critique"
                            ? "bg-red-100 text-red-700"
                            : stock.statut === "faible"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {stock.statut}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && stocks.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">Aucune donnée de stock.</div>
          )}
        </div>
      </div>
    </div>
  );
}
