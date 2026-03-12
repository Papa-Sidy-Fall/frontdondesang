import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, getCurrentUser } from "../../services/auth-api";
import { NotificationBadge } from "../../components/notification-badge";
import { useMessageUnreadCount } from "../../hooks/use-message-unread-count";
import {
  createEmergencyAlert,
  getHospitalDashboard,
  resolveHospitalEmergency,
  updateHospitalAppointmentStatus,
} from "../../services/dashboard-api";
import { clearSession, getAccessToken, setCurrentUserInStorage } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { HospitalDashboardDto } from "../../types/dashboard";
import { isCntsUser } from "../../utils/cnts";
import { getDashboardPathForUser } from "../../utils/dashboard-path";

interface Stock {
  groupeSanguin: string;
  quantite: number;
  seuil: number;
  statut: "critique" | "faible" | "normal";
}

interface RendezVous {
  id: string;
  donneur: string;
  cni: string;
  telephone: string;
  groupeSanguin: string;
  date: string;
  heure: string;
  statut: "en-attente" | "confirme" | "termine" | "annule";
}

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type EmergencyPriority = "CRITICAL" | "HIGH" | "MEDIUM";
const HOSPITAL_REFRESH_INTERVAL_MS = 15_000;

function toApiStatus(status: RendezVous["statut"]): "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" {
  switch (status) {
    case "en-attente":
      return "PENDING";
    case "confirme":
      return "CONFIRMED";
    case "termine":
      return "COMPLETED";
    default:
      return "CANCELLED";
  }
}

export default function GestionHopital() {
  const navigate = useNavigate();
  const unreadMessagesCount = useMessageUnreadCount(Boolean(getAccessToken()));
  const DONORS_PER_PAGE = 5;
  const [activeTab, setActiveTab] = useState<"stocks" | "rendezous" | "urgences" | "donneurs">("stocks");
  const [canAccessCntsDashboard, setCanAccessCntsDashboard] = useState(false);
  const [donorPage, setDonorPage] = useState(1);
  const [donorCniQuery, setDonorCniQuery] = useState("");
  const [appointmentCniQuery, setAppointmentCniQuery] = useState("");
  const [showUrgenceModal, setShowUrgenceModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [urgenceData, setUrgenceData] = useState({
    groupeSanguin: "" as BloodType | "",
    quantite: "",
    message: "",
    priorite: "HIGH" as EmergencyPriority,
  });

  const [dashboard, setDashboard] = useState<HospitalDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadDashboard = async () => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const profile = await getCurrentUser(token);

      setCanAccessCntsDashboard(isCntsUser(profile));

      if (profile.role !== "HOSPITAL") {
        navigate(getDashboardPathForUser(profile), { replace: true });
        return;
      }

      setCurrentUserInStorage(profile);
      const dashboardData = await getHospitalDashboard(token);
      setDashboard(dashboardData);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearSession();
        navigate("/connexion-donneur", { replace: true });
        return;
      }

      setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de charger le tableau de bord");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stocks = dashboard?.stocks ?? [];
  const rendezous = dashboard?.rendezvous ?? [];
  const urgences = dashboard?.urgences ?? [];
  const normalizedAppointmentCniQuery = appointmentCniQuery.trim().toUpperCase();
  const filteredRendezous = rendezous.filter((rdv) =>
    !normalizedAppointmentCniQuery ? true : rdv.cni.toUpperCase().includes(normalizedAppointmentCniQuery)
  );
  const donorList = dashboard?.donneurs ?? [];
  const normalizedCniQuery = donorCniQuery.trim().toUpperCase();
  const filteredDonors = donorList.filter((donor) =>
    !normalizedCniQuery ? true : donor.cni.toUpperCase().includes(normalizedCniQuery)
  );
  const donorTotalPages = Math.max(1, Math.ceil(filteredDonors.length / DONORS_PER_PAGE));
  const paginatedDonors = filteredDonors.slice(
    (donorPage - 1) * DONORS_PER_PAGE,
    donorPage * DONORS_PER_PAGE
  );

  useEffect(() => {
    if (donorPage > donorTotalPages) {
      setDonorPage(donorTotalPages);
    }
  }, [donorPage, donorTotalPages]);

  useEffect(() => {
    setDonorPage(1);
  }, [normalizedCniQuery]);

  const summary = useMemo(
    () =>
      dashboard?.summary ?? {
        totalUnits: 0,
        appointmentsToday: 0,
        criticalGroups: 0,
        activeDonors: 0,
      },
    [dashboard]
  );
  const pendingAppointmentsCount = useMemo(
    () => rendezous.filter((rdv) => rdv.statut === "en-attente").length,
    [rendezous]
  );

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      return;
    }

    let disposed = false;

    const refreshDashboard = async () => {
      try {
        const dashboardData = await getHospitalDashboard(token);

        if (disposed) {
          return;
        }

        setDashboard(dashboardData);
      } catch (caughtError) {
        if (disposed) {
          return;
        }

        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearSession();
          navigate("/connexion-donneur", { replace: true });
        }
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshDashboard();
    }, HOSPITAL_REFRESH_INTERVAL_MS);

    const handleFocus = () => {
      void refreshDashboard();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshDashboard();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  const getStatutColor = (statut: Stock["statut"]) => {
    switch (statut) {
      case "critique":
        return "bg-red-100 text-red-700 border-red-300";
      case "faible":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  const getStatutIcon = (statut: Stock["statut"]) => {
    switch (statut) {
      case "critique":
        return "ri-alert-line";
      case "faible":
        return "ri-error-warning-line";
      default:
        return "ri-checkbox-circle-line";
    }
  };

  const getRendezousStatutColor = (statut: RendezVous["statut"]) => {
    switch (statut) {
      case "en-attente":
        return "bg-yellow-100 text-yellow-700";
      case "confirme":
        return "bg-green-100 text-green-700";
      case "termine":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const handleStatutChange = async (id: string, newStatut: RendezVous["statut"]) => {
    const token = getAccessToken();

    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await updateHospitalAppointmentStatus(token, id, {
        statut: toApiStatus(newStatut),
      });

      setDashboard((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          rendezvous: previous.rendezvous.map((rdv) =>
            rdv.id === id ? { ...rdv, statut: newStatut } : rdv
          ),
        };
      });
    } catch (caughtError) {
      setActionError(caughtError instanceof ApiError ? caughtError.message : "Mise à jour impossible");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUrgenceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = getAccessToken();
    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      if (!urgenceData.groupeSanguin) {
        setActionError("Sélectionnez un groupe sanguin.");
        return;
      }

      await createEmergencyAlert(token, {
        groupeSanguin: urgenceData.groupeSanguin,
        quantite: Number(urgenceData.quantite),
        message: urgenceData.message,
        priorite: urgenceData.priorite,
      });

      setShowUrgenceModal(false);
      setUrgenceData({ groupeSanguin: "", quantite: "", message: "", priorite: "HIGH" });
      await loadDashboard();
    } catch (caughtError) {
      setActionError(caughtError instanceof ApiError ? caughtError.message : "Création d'alerte impossible");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveEmergency = async (emergencyId: string) => {
    const token = getAccessToken();
    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await resolveHospitalEmergency(token, emergencyId);
      await loadDashboard();
    } catch (caughtError) {
      setActionError(caughtError instanceof ApiError ? caughtError.message : "Cloture de l'urgence impossible");
    } finally {
      setActionLoading(false);
    }
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
      setPasswordError(caughtError instanceof ApiError ? caughtError.message : "Impossible de modifier le mot de passe");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/connexion-donneur", { replace: true });
  };

  const openDonorMessaging = (donor: {
    id: string;
    nom: string;
    email: string;
    ville: string;
  }) => {
    navigate(`/messagerie?contactId=${donor.id}`, {
      state: {
        prefillContact: {
          id: donor.id,
          nom: donor.nom,
          email: donor.email,
          role: "DONOR",
          hospitalName: null,
          ville: donor.ville,
        },
      },
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center">Chargement...</div>;
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-6 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || "Impossible de charger les données"}</p>
          <button onClick={() => void loadDashboard()} className="bg-green-600 text-white px-4 py-2 rounded-lg">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl">
                <i className="ri-drop-fill text-2xl text-white"></i>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">DonSang Sénégal</div>
                <div className="text-xs text-gray-500">Gestion Hôpital</div>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
              <button
                onClick={() => navigate("/messagerie")}
                className="inline-flex items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-green-600"
              >
                <i className="ri-message-3-line"></i>
                Messagerie
                <NotificationBadge count={unreadMessagesCount} />
              </button>
              <button
                onClick={() => navigate("/gestion-stocks")}
                className="inline-flex items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-green-600"
              >
                <i className="ri-stack-line"></i>
                Stocks manuels
              </button>
              <button
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setShowPasswordModal(true);
                }}
                className="inline-flex items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-green-600"
              >
                <i className="ri-lock-password-line"></i>
                Changer mot de passe
              </button>
              {canAccessCntsDashboard && (
                <Link to="/cnts" className="inline-flex items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-green-600">
                  <i className="ri-bar-chart-box-line"></i>
                  Dashboard CNTS
                </Link>
              )}
              <button onClick={handleLogout} className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-green-600">
                <i className="ri-logout-box-line text-xl"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">Tableau de Bord Hôpital</h1>
          <p className="text-base text-gray-600 sm:text-xl">{dashboard.hospitalName}</p>
        </div>

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {actionError}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon="ri-drop-line" color="green" value={summary.totalUnits} label="Unités en Stock" helper="Temps réel" />
          <SummaryCard icon="ri-calendar-check-line" color="yellow" value={summary.appointmentsToday} label="Rendez-vous" helper="Aujourd'hui" />
          <SummaryCard icon="ri-alert-line" color="red" value={summary.criticalGroups} label="Groupes Critiques" helper="Urgent" />
          <SummaryCard icon="ri-user-heart-line" color="blue" value={summary.activeDonors} label="Donneurs Actifs" helper="Ville" />
        </div>

        <div className="mb-8 overflow-x-auto rounded-2xl bg-white p-2 shadow-lg">
          <div className="flex min-w-max gap-2">
            <button
            onClick={() => setActiveTab("stocks")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "stocks" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-drop-line mr-2"></i>
            Stocks de Sang
            </button>
            <button
            onClick={() => setActiveTab("rendezous")}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "rendezous" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-calendar-line mr-2"></i>
            Rendez-vous
            <NotificationBadge count={pendingAppointmentsCount} />
            </button>
            <button
            onClick={() => setActiveTab("urgences")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "urgences" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-alarm-warning-line mr-2"></i>
            Urgences
            </button>
            <button
            onClick={() => setActiveTab("donneurs")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "donneurs" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-team-line mr-2"></i>
            Donneurs
            </button>
          </div>
        </div>

        {activeTab === "stocks" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Stocks de Sang par Groupe</h2>
              <button
                onClick={() => setShowUrgenceModal(true)}
                className="w-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
              >
                <i className="ri-alarm-warning-line mr-2"></i>
                Signaler Urgence
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {stocks.map((stock) => (
                <div key={stock.groupeSanguin} className={`border-2 rounded-2xl p-6 ${getStatutColor(stock.statut)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center bg-white rounded-xl">
                        <span className="text-2xl font-bold text-gray-900">{stock.groupeSanguin}</span>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stock.quantite}</div>
                        <div className="text-sm opacity-80">unités disponibles</div>
                      </div>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <i className={`${getStatutIcon(stock.statut)} text-3xl`}></i>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Seuil minimum: {stock.seuil}</span>
                      <span>{Math.round((stock.quantite / Math.max(stock.seuil, 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div className="bg-current h-2 rounded-full transition-all" style={{ width: `${Math.min((stock.quantite / Math.max(stock.seuil, 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="text-sm font-semibold mt-3">
                    {stock.statut === "critique" && "Stock critique - Action immédiate requise"}
                    {stock.statut === "faible" && "Stock faible - Réapprovisionnement conseillé"}
                    {stock.statut === "normal" && "Stock normal"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rendezous" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Rendez-vous</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recherche par CNI</label>
              <input
                type="text"
                value={appointmentCniQuery}
                onChange={(event) => setAppointmentCniQuery(event.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors sm:max-w-md"
                placeholder="Ex: 123456789012A"
              />
            </div>

            <div className="space-y-4">
              {filteredRendezous.map((rdv) => (
                <div key={rdv.id} className="rounded-2xl border-2 border-gray-100 p-6 transition-colors hover:border-green-200">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{rdv.donneur}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-4 mt-1 flex-wrap">
                          <span><i className="ri-id-card-line mr-1"></i>{rdv.cni}</span>
                          <span><i className="ri-phone-line mr-1"></i>{rdv.telephone}</span>
                          <span><i className="ri-drop-line mr-1"></i>{rdv.groupeSanguin}</span>
                          <span><i className="ri-calendar-line mr-1"></i>{new Date(rdv.date).toLocaleDateString("fr-FR")}</span>
                          <span><i className="ri-time-line mr-1"></i>{rdv.heure}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRendezousStatutColor(rdv.statut)}`}>
                        {rdv.statut === "en-attente" && "En attente"}
                        {rdv.statut === "confirme" && "Confirmé"}
                        {rdv.statut === "termine" && "Terminé"}
                        {rdv.statut === "annule" && "Annulé"}
                      </span>

                      <select
                        value={rdv.statut}
                        onChange={(event) => void handleStatutChange(rdv.id, event.target.value as RendezVous["statut"])}
                        disabled={actionLoading}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-semibold transition-colors hover:border-green-300 disabled:opacity-50 sm:w-auto"
                      >
                        <option value="en-attente">En attente</option>
                        <option value="confirme">Confirmé</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRendezous.length === 0 && <p className="text-sm text-gray-500">Aucun rendez-vous pour le moment.</p>}
            </div>
          </div>
        )}

        {activeTab === "urgences" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des Urgences</h2>

            <div className="space-y-4">
              {urgences.map((urgence) => (
                <div key={urgence.id} className={`border-2 rounded-2xl p-6 ${getUrgenceContainerClass(urgence.niveauColor)}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${getUrgenceBadgeClass(urgence.niveauColor)}`}>
                      <i className="ri-alarm-warning-line text-2xl text-white"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-lg text-gray-900">{urgence.titre}</div>
                        <span className="text-sm text-gray-600">{urgence.createdAtLabel}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{urgence.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 text-white rounded-full text-sm font-semibold ${getUrgenceBadgeClass(urgence.niveauColor)}`}>
                          {urgence.niveauLabel}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            urgence.statut === "active"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {urgence.statut === "active" ? "Active" : "Resolue"}
                        </span>
                        <span className="text-sm text-gray-600">
                          <i className="ri-user-line mr-1"></i>{urgence.notifiedDonors} donneurs notifiés
                        </span>
                        <span className="text-sm text-green-600 font-semibold">
                          <i className="ri-check-line mr-1"></i>{urgence.positiveResponses} réponses positives
                        </span>
                        <span className="text-sm text-blue-600 font-semibold">
                          <i className="ri-drop-line mr-1"></i>{urgence.donationsCompleted} dons effectués
                        </span>
                      </div>
                      {urgence.statut === "active" && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => void handleResolveEmergency(urgence.id)}
                            disabled={actionLoading}
                            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            Marquer comme resolue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {urgences.length === 0 && <p className="text-sm text-gray-500">Aucune alerte d'urgence.</p>}
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Campagnes nationales</h3>
              <div className="space-y-3">
                {dashboard.campagnes.map((campagne) => (
                  <div key={campagne.id} className="border border-green-200 bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900">{campagne.titre}</h4>
                    <p className="text-sm text-gray-700 mt-1">{campagne.description}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(campagne.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                      {new Date(campagne.dateFin).toLocaleDateString("fr-FR")}
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
        )}

        {activeTab === "donneurs" && (
          <div className="bg-white rounded-3xl p-6 shadow-xl sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Donneurs</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recherche par CNI</label>
              <input
                type="text"
                value={donorCniQuery}
                onChange={(event) => setDonorCniQuery(event.target.value)}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors sm:max-w-md"
                placeholder="Ex: 123456789012A"
              />
            </div>

            <div className="space-y-4">
              {paginatedDonors.map((donneur) => (
                <div
                  key={donneur.id}
                  className="rounded-2xl border-2 border-gray-100 p-6 transition-colors hover:border-green-200"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-lg text-gray-900">{donneur.nom}</div>
                        <div className="text-sm text-gray-600 break-all">{donneur.email}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <i className="ri-phone-line mr-1"></i>
                          {donneur.telephone}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <i className="ri-id-card-line mr-1"></i>
                          CNI: {donneur.cni}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openDonorMessaging(donneur)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:border-green-300 hover:text-green-700"
                        title={`Envoyer un message a ${donneur.nom}`}
                      >
                        <i className="ri-message-3-line text-xl"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <InfoTile label="Groupe" value={donneur.groupeSanguin} />
                      <InfoTile label="Ville" value={donneur.ville} />
                      <InfoTile label="Quartier" value={donneur.quartier} />
                      <InfoTile
                        label="Inscription"
                        value={new Date(donneur.inscritLe).toLocaleDateString("fr-FR")}
                      />
                      <InfoTile
                        label="Naissance"
                        value={
                          donneur.dateNaissance !== "-"
                            ? new Date(donneur.dateNaissance).toLocaleDateString("fr-FR")
                            : "-"
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              {filteredDonors.length === 0 && (
                <p className="text-sm text-gray-500">Aucun donneur associé pour le moment.</p>
              )}
            </div>

            {filteredDonors.length > DONORS_PER_PAGE && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Page {donorPage} / {donorTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDonorPage((page) => Math.max(1, page - 1))}
                    disabled={donorPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonorPage((page) => Math.min(donorTotalPages, page + 1))}
                    disabled={donorPage === donorTotalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showUrgenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Signaler une Urgence</h2>
              <button onClick={() => setShowUrgenceModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <form onSubmit={handleUrgenceSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Groupe Sanguin Requis <span className="text-red-600">*</span></label>
                <select
                  value={urgenceData.groupeSanguin}
                  onChange={(event) =>
                    setUrgenceData({
                      ...urgenceData,
                      groupeSanguin: event.target.value as BloodType | "",
                    })
                  }
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Sélectionnez un groupe</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priorité</label>
                <select
                  value={urgenceData.priorite}
                  onChange={(event) =>
                    setUrgenceData({
                      ...urgenceData,
                      priorite: event.target.value as EmergencyPriority,
                    })
                  }
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="HIGH">Urgent</option>
                  <option value="CRITICAL">Critique</option>
                  <option value="MEDIUM">Moyen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantité Nécessaire (unités) <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  value={urgenceData.quantite}
                  onChange={(event) => setUrgenceData({ ...urgenceData, quantite: event.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Nombre d'unités"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message d'Urgence <span className="text-red-600">*</span></label>
                <textarea
                  value={urgenceData.message}
                  onChange={(event) => setUrgenceData({ ...urgenceData, message: event.target.value.slice(0, 500) })}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                  placeholder="Décrivez la situation d'urgence..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{urgenceData.message.length}/500</div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowUrgenceModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={actionLoading} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50">
                  <i className="ri-alarm-warning-line mr-2"></i>
                  {actionLoading ? "Envoi..." : "Envoyer l'Alerte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Changer le mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                <i className="ri-close-line text-2xl text-gray-500"></i>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{passwordError}</div>}
              {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{passwordSuccess}</div>}

              <input type="password" value={passwordData.currentPassword} onChange={(event) => setPasswordData((prev) => ({ ...prev, currentPassword: event.target.value }))} required placeholder="Mot de passe actuel" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" />
              <input type="password" value={passwordData.newPassword} onChange={(event) => setPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))} required minLength={8} placeholder="Nouveau mot de passe" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" />
              <input type="password" value={passwordData.confirmPassword} onChange={(event) => setPasswordData((prev) => ({ ...prev, confirmPassword: event.target.value }))} required minLength={8} placeholder="Confirmer le nouveau mot de passe" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none" />

              <button type="submit" disabled={passwordLoading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
                {passwordLoading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  color,
  value,
  label,
  helper,
}: {
  icon: string;
  color: "green" | "yellow" | "red" | "blue";
  value: number;
  label: string;
  helper: string;
}) {
  const styles: Record<string, { border: string; bg: string; text: string }> = {
    green: { border: "border-green-100", bg: "bg-green-100", text: "text-green-600" },
    yellow: { border: "border-yellow-100", bg: "bg-yellow-100", text: "text-yellow-600" },
    red: { border: "border-red-100", bg: "bg-red-100", text: "text-red-600" },
    blue: { border: "border-blue-100", bg: "bg-blue-100", text: "text-blue-600" },
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${styles[color].border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 flex items-center justify-center ${styles[color].bg} rounded-xl`}>
          <i className={`${icon} text-2xl ${styles[color].text}`}></i>
        </div>
        <span className={`text-sm font-semibold ${styles[color].text}`}>{helper}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function getUrgenceContainerClass(color: "red" | "yellow" | "green") {
  if (color === "red") {
    return "border-red-200 bg-red-50";
  }

  if (color === "yellow") {
    return "border-yellow-200 bg-yellow-50";
  }

  return "border-green-200 bg-green-50";
}

function getUrgenceBadgeClass(color: "red" | "yellow" | "green") {
  if (color === "red") {
    return "bg-red-600";
  }

  if (color === "yellow") {
    return "bg-yellow-600";
  }

  return "bg-green-600";
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-semibold text-gray-900">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
