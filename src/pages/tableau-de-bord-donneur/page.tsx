import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth-api";
import {
  clearSession,
  getAccessToken,
  getCurrentUserFromStorage,
  setCurrentUserInStorage,
} from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { UserDto } from "../../types/auth";

export default function TableauDeBordDonneur() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDto | null>(getCurrentUserFromStorage());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getCurrentUser(token);
        setCurrentUserInStorage(profile);
        setUser(profile);
      } catch (caughtError) {
        clearSession();
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Session invalide"
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/connexion-donneur");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center text-gray-600">
        Chargement du profil...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-6">
        <div className="max-w-md bg-white shadow rounded-xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Session expirée</h2>
          <p className="text-gray-600">{error || "Veuillez vous reconnecter."}</p>
          <Link
            to="/connexion-donneur"
            className="inline-block bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Revenir à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-red-600 text-xl">DonSang Sénégal</p>
            <p className="text-xs text-gray-500">Tableau de bord donneur</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dev/logs"
              className="text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Logs Dev
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Bonjour {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mb-8">Profil récupéré depuis l'API backend sécurisée.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <InfoCard label="Email" value={user.email} />
            <InfoCard label="Téléphone" value={user.phone || "-"} />
            <InfoCard label="Groupe sanguin" value={user.bloodType || "-"} />
            <InfoCard label="Ville" value={user.city || "-"} />
            <InfoCard label="Quartier" value={user.district || "-"} />
            <InfoCard label="Type d'auth" value={user.authProvider} />
            <InfoCard
              label="Inscrit le"
              value={new Date(user.createdAt).toLocaleString("fr-FR")}
            />
            <InfoCard
              label="Dernière mise à jour"
              value={new Date(user.updatedAt).toLocaleString("fr-FR")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <p className="text-gray-500">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}
