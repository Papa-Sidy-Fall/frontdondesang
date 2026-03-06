import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, getCurrentUser } from "../../services/auth-api";
import { getDonorDashboard } from "../../services/dashboard-api";
import {
  clearSession,
  getAccessToken,
  getCurrentUserFromStorage,
  setCurrentUserInStorage,
} from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { UserDto } from "../../types/auth";
import type { DonorDashboardDto } from "../../types/dashboard";

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR");
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("fr-FR");
}

export default function TableauDeBordDonneur() {
  const navigate = useNavigate();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [user, setUser] = useState<UserDto | null>(getCurrentUserFromStorage());
  const [dashboard, setDashboard] = useState<DonorDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, dashboardData] = await Promise.all([
          getCurrentUser(token),
          getDonorDashboard(token),
        ]);

        if (profile.role !== "DONOR") {
          if (profile.role === "ADMIN") {
            navigate("/administration", { replace: true });
            return;
          }

          if (profile.role === "HOSPITAL") {
            navigate("/gestion-hopital", { replace: true });
            return;
          }
        }

        setCurrentUserInStorage(profile);
        setUser(profile);
        setDashboard(dashboardData);
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearSession();
          navigate("/connexion-donneur", { replace: true });
          return;
        }

        setError(caughtError instanceof ApiError ? caughtError.message : "Session invalide");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/connexion-donneur", { replace: true });
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setPasswordError("Session expirée.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess("Mot de passe modifié avec succès.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setShowPasswordModal(false), 800);
    } catch (caughtError) {
      setPasswordError(
        caughtError instanceof ApiError ? caughtError.message : "Impossible de modifier le mot de passe"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const stats = useMemo(() => {
    const lastDonation = dashboard?.profile.dernierDon;

    if (!lastDonation) {
      return {
        daysRemaining: 0,
        progress: 100,
      };
    }

    const lastDate = new Date(lastDonation);
    if (Number.isNaN(lastDate.getTime())) {
      return {
        daysRemaining: 0,
        progress: 100,
      };
    }

    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      daysRemaining: Math.max(0, 90 - daysSince),
      progress: Math.min(100, (daysSince / 90) * 100),
    };
  }, [dashboard?.profile.dernierDon]);

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center text-gray-600">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (error || !user || !dashboard) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-6">
        <div className="max-w-md bg-white shadow rounded-xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Session expirée</h2>
          <p className="text-gray-600">{error || "Veuillez vous reconnecter."}</p>
          <Link to="/connexion-donneur" className="inline-block bg-red-600 text-white px-5 py-2 rounded-lg">
            Revenir à la connexion
          </Link>
        </div>
      </div>
    );
  }

  const donorProfile = dashboard.profile;

  return (
    <div className="min-h-screen bg-red-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl">
                <i className="ri-drop-fill text-2xl text-white"></i>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">DonSang Sénégal</div>
                <div className="text-xs text-gray-500">Espace Donneur</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/messagerie")}
                className="hidden sm:inline-flex px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
              >
                Messagerie
              </button>
              <button
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setShowPasswordModal(true);
                }}
                className="hidden sm:inline-flex px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
              >
                Mot de passe
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm"
              >
                Déconnexion
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {donorProfile.nom
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{donorProfile.nom}</p>
                  <p className="text-xs text-gray-500">{donorProfile.groupeSanguin}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bienvenue, {donorProfile.nom.split(" ")[0]} !</h2>
              <p className="text-white/90 text-lg">
                Merci pour votre engagement. Vous avez sauvé {donorProfile.viesSauvees} vies.
              </p>
            </div>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="px-8 py-4 bg-white text-red-600 rounded-xl font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-calendar-check-line mr-2"></i>
              Prendre RDV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon="ri-drop-fill" color="red" emoji="🩸" value={donorProfile.totalDons} label="Dons effectués" />
          <StatCard icon="ri-heart-pulse-fill" color="green" emoji="💚" value={donorProfile.viesSauvees} label="Vies sauvées" />
          <StatCard icon="ri-calendar-line" color="yellow" emoji="📅" value={stats.daysRemaining} label="Jours avant prochain don" />
          <StatCard
            icon="ri-trophy-fill"
            color="orange"
            emoji="🏆"
            value={`${dashboard.badges.filter((badge) => badge.obtenu).length}/${dashboard.badges.length}`}
            label="Badges obtenus"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-calendar-check-line text-red-600"></i>
                Éligibilité au don
              </h3>
              {stats.daysRemaining > 0 ? (
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-time-line text-2xl text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Prochain don possible dans {stats.daysRemaining} jours
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Dernier don : {formatDate(donorProfile.dernierDon)}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div className="bg-yellow-500 h-3 rounded-full transition-all" style={{ width: `${stats.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500">Délai réglementaire : 90 jours entre deux dons</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-check-line text-2xl text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Vous êtes éligible pour donner</h4>
                      <p className="text-sm text-gray-600 mb-3">Dernier don : {formatDate(donorProfile.dernierDon)}</p>
                      <button
                        onClick={() => setShowAppointmentModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-calendar-check-line mr-2"></i>
                        Prendre rendez-vous
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-calendar-event-line text-red-600"></i>
                Prochains rendez-vous
              </h3>
              {dashboard.prochainsRendezVous.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.prochainsRendezVous.map((rdv) => (
                    <div key={rdv.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <i className="ri-calendar-check-fill text-2xl text-white"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{rdv.centre}</h4>
                            <p className="text-sm text-gray-600">{rdv.type}</p>
                            <p className="text-sm text-green-600 font-medium mt-1">
                              <i className="ri-time-line mr-1"></i>
                              {formatDate(rdv.date)} à {rdv.heure}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-white text-green-700 border border-green-300 rounded-full text-xs font-medium">
                          {rdv.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="ri-calendar-line text-5xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 mb-4">Aucun rendez-vous prévu</p>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
                  >
                    Prendre un rendez-vous
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-history-line text-red-600"></i>
                Historique des dons
              </h3>
              <div className="space-y-3">
                {dashboard.historiqueDons.map((don) => (
                  <div key={don.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <i className="ri-drop-fill text-xl text-red-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{don.centre}</h4>
                        <p className="text-sm text-gray-600">{don.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatDate(don.date)}</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">
                        {don.statut}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboard.historiqueDons.length === 0 && (
                  <p className="text-sm text-gray-500">Aucun don enregistré pour le moment.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-medal-line text-red-600"></i>
                Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {dashboard.badges.map((badge) => (
                  <div
                    key={badge.nom}
                    className={`text-center p-3 rounded-lg transition-all ${
                      badge.obtenu
                        ? "bg-yellow-50 border-2 border-yellow-300"
                        : "bg-gray-50 border border-gray-200 opacity-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{badge.nom}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-alarm-warning-line text-red-600"></i>
                Besoins urgents
              </h3>
              <div className="space-y-3">
                {dashboard.urgences.map((urgence) => (
                  <div key={urgence.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <h4 className="font-semibold text-gray-900">{urgence.hopital}</h4>
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold whitespace-nowrap">
                        {urgence.groupe}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{urgence.besoin}</p>
                    <p className="text-sm text-gray-600">
                      <i className="ri-map-pin-line mr-1"></i>
                      {urgence.distance}
                    </p>
                  </div>
                ))}
                {dashboard.urgences.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune urgence active actuellement.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-megaphone-line text-red-600"></i>
                Campagnes
              </h3>
              <div className="space-y-3">
                {dashboard.campagnes.map((campagne) => (
                  <div key={campagne.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{campagne.titre}</h4>
                    <p className="text-sm text-gray-700 mb-2">{campagne.description}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      <i className="ri-calendar-line mr-1"></i>
                      {formatDate(campagne.date)} - {formatDate(campagne.dateFin)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <i className="ri-map-pin-line mr-1"></i>
                      {campagne.lieu}
                    </p>
                  </div>
                ))}
                {dashboard.campagnes.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune campagne active.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Mon Profil</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {donorProfile.nom
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{donorProfile.nom}</h4>
                  <p className="text-gray-600">Donneur</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Info label="Groupe sanguin" value={donorProfile.groupeSanguin} />
                  <Info label="Date de naissance" value={formatDate(donorProfile.dateNaissance)} />
                </div>
                <Info label="Email" value={donorProfile.email} />
                <Info label="Téléphone" value={donorProfile.telephone} />
                <Info label="Adresse" value={donorProfile.adresse} />
                <Info label="Compte créé" value={formatDateTime(user.createdAt)} />
                <Info label="Dernière mise à jour" value={formatDateTime(user.updatedAt)} />
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Changer mot de passe
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Changer le mot de passe</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-2xl text-gray-500"></i>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
                  {passwordSuccess}
                </div>
              )}

              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
                required
                placeholder="Mot de passe actuel"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) => setPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))}
                required
                minLength={8}
                placeholder="Nouveau mot de passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                required
                minLength={8}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {passwordLoading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Prendre un rendez-vous</h3>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Choisissez un centre et une date pour votre prochain don de sang.</p>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  navigate("/recherche");
                }}
                className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-search-line mr-2"></i>
                Rechercher un centre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  color,
  emoji,
  value,
  label,
}: {
  icon: string;
  color: "red" | "green" | "yellow" | "orange";
  emoji: string;
  value: string | number;
  label: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <i className={`${icon} text-2xl`}></i>
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
