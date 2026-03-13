import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, getCurrentUser } from "../../services/auth-api";
import { NotificationBadge } from "../../components/notification-badge";
import { useMessageUnreadCount } from "../../hooks/use-message-unread-count";
import { createCntsCampaign, deleteCntsCampaign, getCntsDashboard } from "../../services/dashboard-api";
import { clearSession, getAccessToken, setCurrentUserInStorage } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { AdminDashboardDto } from "../../types/dashboard";
import { isCntsUser } from "../../utils/cnts";
import { getDashboardPathForUser } from "../../utils/dashboard-path";

interface Statistique {
  label: string;
  valeur: number;
  evolution: number;
  icon: string;
  color: "green" | "red" | "blue" | "yellow";
}

const NETWORK_HOSPITALS_PER_PAGE = 2;
const NETWORK_HIGHLIGHT_BLOOD_TYPES = ["O+", "A+", "B+", "AB+"] as const;

function getStatutColor(statut: "active" | "terminee" | "planifiee") {
  switch (statut) {
    case "active":
      return "bg-green-100 text-green-700";
    case "terminee":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function getStatutLabel(statut: "active" | "terminee" | "planifiee") {
  switch (statut) {
    case "active":
      return "En cours";
    case "terminee":
      return "Terminée";
    default:
      return "Planifiée";
  }
}

function getNetworkHospitalStatus(totalUnits: number): {
  label: string;
  className: string;
} {
  if (totalUnits > 0) {
    return {
      label: "Actif",
      className: "bg-green-100 text-green-700",
    };
  }

  return {
    label: "Inactif",
    className: "bg-gray-100 text-gray-500",
  };
}

function getNetworkBloodTypeClass(bloodType: string): string {
  if (bloodType.startsWith("O")) {
    return "text-red-600";
  }

  if (bloodType.startsWith("A")) {
    return "text-green-600";
  }

  if (bloodType.startsWith("B")) {
    return "text-blue-600";
  }

  return "text-amber-500";
}

function getNetworkPreviewStocks(
  stocks: AdminDashboardDto["hopitauxStocks"][number]["stocks"]
): AdminDashboardDto["hopitauxStocks"][number]["stocks"] {
  return NETWORK_HIGHLIGHT_BLOOD_TYPES.map((bloodType) => {
    const stock = stocks.find((item) => item.groupeSanguin === bloodType);

    return (
      stock ?? {
        groupeSanguin: bloodType,
        quantite: 0,
        seuil: 0,
        statut: "critique" as const,
      }
    );
  });
}

export default function Administration() {
  const navigate = useNavigate();
  const unreadMessagesCount = useMessageUnreadCount(Boolean(getAccessToken()));
  const DONORS_PER_PAGE = 5;
  const [activeTab, setActiveTab] = useState<"statistiques" | "campagnes" | "utilisateurs" | "reseau">("statistiques");
  const [adminDonorPage, setAdminDonorPage] = useState(1);
  const [networkHospitalPage, setNetworkHospitalPage] = useState(1);
  const [showCampagneModal, setShowCampagneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [campagneData, setCampagneData] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    objectif: "",
    lieu: "",
  });

  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
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

      if (!isCntsUser(profile) && profile.role !== "ADMIN") {
        navigate(getDashboardPathForUser(profile), { replace: true });
        return;
      }

      setCurrentUserInStorage(profile);
      const dashboardData = await getCntsDashboard(token);
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

  const statistiques: Statistique[] = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const currentMonth = dashboard.evolutionMensuelle[dashboard.evolutionMensuelle.length - 1]?.dons ?? 0;
    const previousMonth = dashboard.evolutionMensuelle[dashboard.evolutionMensuelle.length - 2]?.dons ?? 0;
    const monthlyTrend = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

    return [
      {
        label: "Total Donneurs Inscrits",
        valeur: dashboard.statistiques.totalDonors,
        evolution: 0,
        icon: "ri-user-heart-line",
        color: "green",
      },
      {
        label: "Dons ce Mois",
        valeur: dashboard.statistiques.donationsThisMonth,
        evolution: Number(monthlyTrend.toFixed(1)),
        icon: "ri-drop-line",
        color: "red",
      },
      {
        label: "Hôpitaux Partenaires",
        valeur: dashboard.statistiques.partnerHospitals,
        evolution: 0,
        icon: "ri-hospital-line",
        color: "blue",
      },
      {
        label: "Campagnes Actives",
        valeur: dashboard.statistiques.activeCampaigns,
        evolution: 0,
        icon: "ri-megaphone-line",
        color: "yellow",
      },
    ];
  }, [dashboard]);

  const donorDetails = dashboard?.utilisateurs.donneursDetails ?? [];
  const donorTotalPages = Math.max(1, Math.ceil(donorDetails.length / DONORS_PER_PAGE));
  const paginatedDonors = donorDetails.slice(
    (adminDonorPage - 1) * DONORS_PER_PAGE,
    adminDonorPage * DONORS_PER_PAGE
  );
  const networkHospitals = dashboard?.hopitauxStocks ?? [];
  const networkHospitalTotalPages = Math.max(
    1,
    Math.ceil(networkHospitals.length / NETWORK_HOSPITALS_PER_PAGE)
  );
  const paginatedNetworkHospitals = networkHospitals.slice(
    (networkHospitalPage - 1) * NETWORK_HOSPITALS_PER_PAGE,
    networkHospitalPage * NETWORK_HOSPITALS_PER_PAGE
  );

  useEffect(() => {
    if (adminDonorPage > donorTotalPages) {
      setAdminDonorPage(donorTotalPages);
    }
  }, [adminDonorPage, donorTotalPages]);

  useEffect(() => {
    if (networkHospitalPage > networkHospitalTotalPages) {
      setNetworkHospitalPage(networkHospitalTotalPages);
    }
  }, [networkHospitalPage, networkHospitalTotalPages]);

  const handleCampagneSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = getAccessToken();
    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await createCntsCampaign(token, {
        titre: campagneData.titre,
        description: campagneData.description,
        dateDebut: campagneData.dateDebut,
        dateFin: campagneData.dateFin,
        objectif: Number(campagneData.objectif),
        lieu: campagneData.lieu,
      });

      setShowCampagneModal(false);
      setCampagneData({ titre: "", description: "", dateDebut: "", dateFin: "", objectif: "", lieu: "" });
      await loadDashboard();
    } catch (caughtError) {
      setActionError(caughtError instanceof ApiError ? caughtError.message : "Création impossible");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const token = getAccessToken();
    if (!token) {
      navigate("/connexion-donneur", { replace: true });
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await deleteCntsCampaign(token, campaignId);
      await loadDashboard();
    } catch (caughtError) {
      setActionError(caughtError instanceof ApiError ? caughtError.message : "Suppression impossible");
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
          <button
            onClick={() => void loadDashboard()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
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
                <div className="text-xs text-gray-500">Coordination nationale CNTS</div>
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
                Stocks CNTS
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
              <Link to="/gestion-hopital" className="inline-flex items-center gap-2 whitespace-nowrap text-gray-600 transition-colors hover:text-green-600">
                <i className="ri-hospital-line"></i>
                Gestion Hôpital
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-green-600"
              >
                <i className="ri-logout-box-line text-xl"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">Tableau de Bord CNTS</h1>
          <p className="text-base text-gray-600 sm:text-xl">Centre National de Transfusion Sanguine du Sénégal</p>
        </div>

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {actionError}
          </div>
        )}

        <div className="mb-8 overflow-x-auto rounded-2xl bg-white p-2 shadow-lg">
          <div className="flex min-w-max gap-2">
            <button
            onClick={() => setActiveTab("statistiques")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "statistiques" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-bar-chart-line mr-2"></i>
            Statistiques
            </button>
            <button
            onClick={() => setActiveTab("campagnes")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "campagnes" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-megaphone-line mr-2"></i>
            Campagnes
            </button>
            <button
            onClick={() => setActiveTab("utilisateurs")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "utilisateurs" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-team-line mr-2"></i>
            Utilisateurs
            </button>
            <button
            onClick={() => setActiveTab("reseau")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "reseau" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-hospital-line mr-2"></i>
            Réseau hôpitaux
            </button>
          </div>
        </div>

        {activeTab === "statistiques" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {statistiques.map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${getIconBg(stat.color)}`}>
                      <i className={`${stat.icon} text-2xl ${getIconText(stat.color)}`}></i>
                    </div>
                    <span className={`text-sm font-semibold ${stat.evolution >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.evolution >= 0 ? "+" : ""}
                      {stat.evolution}%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.valeur.toLocaleString("fr-FR")}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Évolution des Dons</h3>
                <div className="space-y-4">
                  {dashboard.evolutionMensuelle.map((item) => (
                    <div key={item.mois}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700 capitalize">{item.mois}</span>
                        <span className="text-gray-600">{item.dons} dons</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${Math.min((item.dons / item.max) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition par Groupe Sanguin</h3>
                <div className="space-y-4">
                  {dashboard.repartitionGroupes.map((item) => (
                    <div key={item.groupe} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-bold text-gray-700">{item.groupe}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div className={`${item.couleur} h-8 rounded-full transition-all flex items-center justify-end pr-3`} style={{ width: `${item.pourcentage}%` }}>
                            <span className="text-white text-sm font-semibold">{item.pourcentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Statistiques par Région</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {dashboard.regions.map((region) => (
                  <div key={region.region} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-map-pin-line text-xl text-green-600"></i>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{region.region}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donneurs inscrits</span>
                        <span className="font-semibold text-gray-900">{region.donneurs.toLocaleString("fr-FR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dons ce mois</span>
                        <span className="font-semibold text-gray-900">{region.dons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Centres actifs</span>
                        <span className="font-semibold text-gray-900">{region.centres}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "campagnes" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Campagnes</h2>
              <button
                onClick={() => setShowCampagneModal(true)}
                className="w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 sm:w-auto"
              >
                <i className="ri-add-line mr-2"></i>
                Nouvelle Campagne
              </button>
            </div>

            <div className="space-y-6">
              {dashboard.campagnes.map((campagne) => (
                <div key={campagne.id} className="bg-white rounded-3xl p-6 shadow-xl sm:p-8">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="text-2xl font-bold text-gray-900">{campagne.titre}</h3>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatutColor(campagne.statut)}`}>
                          {getStatutLabel(campagne.statut)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{campagne.description}</p>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                        <span>
                          <i className="ri-calendar-line mr-2"></i>
                          {new Date(campagne.dateDebut).toLocaleDateString("fr-FR")} - {new Date(campagne.dateFin).toLocaleDateString("fr-FR")}
                        </span>
                        <span>
                          <i className="ri-map-pin-line mr-2"></i>
                          {campagne.lieu}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => void handleDeleteCampaign(campagne.id)}
                      disabled={actionLoading}
                      className="w-10 h-10 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <i className="ri-delete-bin-line text-xl text-red-600"></i>
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-semibold text-gray-700">Progression</span>
                      <span className="text-sm text-gray-600">
                        {campagne.collecte} / {campagne.objectif} dons ({Math.round((campagne.collecte / Math.max(campagne.objectif, 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${Math.min((campagne.collecte / Math.max(campagne.objectif, 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {dashboard.campagnes.length === 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 text-gray-500">Aucune campagne pour le moment.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "utilisateurs" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Utilisateurs</h2>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <UserMiniCard icon="ri-user-heart-line" color="green" value={dashboard.utilisateurs.donneursActifs} label="Donneurs Actifs" />
              <UserMiniCard icon="ri-hospital-line" color="blue" value={dashboard.utilisateurs.hopitauxPartenaires} label="Hôpitaux Partenaires" />
              <UserMiniCard icon="ri-government-line" color="yellow" value={dashboard.utilisateurs.coordinationNationale} label="Coordination CNTS" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Derniers Donneurs Inscrits</h3>
              {paginatedDonors.map((user) => (
                <div key={user.id} className="rounded-2xl border-2 border-gray-100 p-6 transition-colors hover:border-green-200">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-lg text-gray-900">{user.nom}</div>
                        <div className="text-sm text-gray-600 break-all">{user.email}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <i className="ri-phone-line mr-1"></i>
                          {user.telephone}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <i className="ri-id-card-line mr-1"></i>
                          CNI: {user.cni}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                      <button
                        type="button"
                        onClick={() => openDonorMessaging(user)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:border-green-300 hover:text-green-700"
                        title={`Envoyer un message a ${user.nom}`}
                      >
                        <i className="ri-message-3-line text-xl"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 xl:grid-cols-5">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{user.groupe}</div>
                        <div className="text-gray-600">Groupe</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{user.ville}</div>
                        <div className="text-gray-600">Ville</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{user.quartier}</div>
                        <div className="text-gray-600">Quartier</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{new Date(user.date).toLocaleDateString("fr-FR")}</div>
                        <div className="text-gray-600">Inscription</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">
                          {user.dateNaissance !== "-"
                            ? new Date(user.dateNaissance).toLocaleDateString("fr-FR")
                            : "-"}
                        </div>
                        <div className="text-gray-600">Naissance</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {donorDetails.length === 0 && (
                <p className="text-sm text-gray-500">Aucun donneur enregistré.</p>
              )}
            </div>

            {donorDetails.length > DONORS_PER_PAGE && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Page {adminDonorPage} / {donorTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminDonorPage((page) => Math.max(1, page - 1))}
                    disabled={adminDonorPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDonorPage((page) => Math.min(donorTotalPages, page + 1))}
                    disabled={adminDonorPage === donorTotalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stock CNTS</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboard.cntsStocks.map((stock) => (
                  <div key={stock.groupeSanguin} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="font-bold text-lg text-gray-900">{stock.groupeSanguin}</div>
                    <div className="text-sm text-gray-600">Quantité: {stock.quantite}</div>
                    <div className="text-sm text-gray-600">Seuil: {stock.seuil}</div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        stock.statut === "critique"
                          ? "bg-red-100 text-red-700"
                          : stock.statut === "faible"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {stock.statut}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reseau" && (
          <div className="space-y-6">
            <div className="rounded-[32px] bg-[#e7f2e8] p-4 shadow-xl sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Réseau des Hôpitaux Partenaires</h2>
                  <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
                    Vue CNTS consolidée pour suivre rapidement les niveaux de stock des autres hôpitaux et anticiper les besoins.
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-500">{networkHospitals.length} hôpitaux</p>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {paginatedNetworkHospitals.map((hopital) => {
                  const status = getNetworkHospitalStatus(hopital.totalUnites);
                  const previewStocks = getNetworkPreviewStocks(hopital.stocks);

                  return (
                    <article
                      key={hopital.id}
                      className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6"
                    >
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <i className="ri-hospital-line text-2xl"></i>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{hopital.nom}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              <i className="ri-map-pin-line mr-1"></i>
                              {hopital.ville}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                              <i className="ri-drop-line mr-1"></i>
                              {hopital.totalUnites} poches disponibles
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-[#f3f5f3] p-4">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                            Stocks de sang (poches)
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                              Total: {hopital.totalUnites}
                            </span>
                            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                              Critiques: {hopital.groupesCritiques}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {previewStocks.map((stock) => (
                            <div
                              key={`${hopital.id}-${stock.groupeSanguin}`}
                              className="rounded-2xl border border-white bg-white px-3 py-4 text-center shadow-sm"
                            >
                              <p className={`text-sm font-bold ${getNetworkBloodTypeClass(stock.groupeSanguin)}`}>
                                {stock.groupeSanguin}
                              </p>
                              <p className="mt-2 text-2xl font-bold text-gray-900">{stock.quantite}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {networkHospitals.length === 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-8 text-gray-500">
                  Aucun autre hôpital n'est encore disponible dans le réseau.
                </div>
              )}

              {networkHospitals.length > NETWORK_HOSPITALS_PER_PAGE && (
                <div className="rounded-3xl bg-white/85 p-6 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Page {networkHospitalPage} / {networkHospitalTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNetworkHospitalPage((page) => Math.max(1, page - 1))}
                      disabled={networkHospitalPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNetworkHospitalPage((page) =>
                          Math.min(networkHospitalTotalPages, page + 1)
                        )
                      }
                      disabled={networkHospitalPage === networkHospitalTotalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCampagneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Créer une Nouvelle Campagne</h2>
              <button
                onClick={() => setShowCampagneModal(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <form onSubmit={handleCampagneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre de la Campagne <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={campagneData.titre}
                  onChange={(event) => setCampagneData({ ...campagneData, titre: event.target.value })}
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: Journée Mondiale du Donneur"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-600">*</span></label>
                <textarea
                  value={campagneData.description}
                  onChange={(event) => setCampagneData({ ...campagneData, description: event.target.value.slice(0, 500) })}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Décrivez les objectifs et le déroulement de la campagne..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">{campagneData.description.length}/500</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de Début <span className="text-red-600">*</span></label>
                  <input
                    type="date"
                    value={campagneData.dateDebut}
                    onChange={(event) => setCampagneData({ ...campagneData, dateDebut: event.target.value })}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de Fin <span className="text-red-600">*</span></label>
                  <input
                    type="date"
                    value={campagneData.dateFin}
                    onChange={(event) => setCampagneData({ ...campagneData, dateFin: event.target.value })}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Objectif de Collecte <span className="text-red-600">*</span></label>
                <input
                  type="number"
                  value={campagneData.objectif}
                  onChange={(event) => setCampagneData({ ...campagneData, objectif: event.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: 500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu(x) <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={campagneData.lieu}
                  onChange={(event) => setCampagneData({ ...campagneData, lieu: event.target.value })}
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: Dakar, Thiès"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowCampagneModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <i className="ri-add-line mr-2"></i>
                  {actionLoading ? "Création..." : "Créer la Campagne"}
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
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-2xl text-gray-500"></i>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{passwordError}</div>}
              {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">{passwordSuccess}</div>}

              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) => setPasswordData((prev) => ({ ...prev, currentPassword: event.target.value }))}
                required
                placeholder="Mot de passe actuel"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) => setPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))}
                required
                minLength={8}
                placeholder="Nouveau mot de passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) => setPasswordData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
                minLength={8}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {passwordLoading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getIconBg(color: "green" | "red" | "blue" | "yellow"): string {
  switch (color) {
    case "green":
      return "bg-green-100";
    case "red":
      return "bg-red-100";
    case "blue":
      return "bg-blue-100";
    default:
      return "bg-yellow-100";
  }
}

function getIconText(color: "green" | "red" | "blue" | "yellow"): string {
  switch (color) {
    case "green":
      return "text-green-600";
    case "red":
      return "text-red-600";
    case "blue":
      return "text-blue-600";
    default:
      return "text-yellow-600";
  }
}

function UserMiniCard({
  icon,
  color,
  value,
  label,
}: {
  icon: string;
  color: "green" | "blue" | "yellow";
  value: number;
  label: string;
}) {
  const colorMap: Record<string, string> = {
    green: "border-green-200 bg-green-50 bg-green-600",
    blue: "border-blue-200 bg-blue-50 bg-blue-600",
    yellow: "border-yellow-200 bg-yellow-50 bg-yellow-600",
  };

  const textMap: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
  };

  const [border, bg, iconBg] = colorMap[color].split(" ");

  return (
    <div className={`border-2 ${border} ${bg} rounded-2xl p-6`}>
      <div className={`w-12 h-12 flex items-center justify-center ${iconBg} rounded-xl mb-4`}>
        <i className={`${icon} text-2xl text-white`}></i>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString("fr-FR")}</div>
      <div className={`text-sm ${textMap[color]}`}>{label}</div>
    </div>
  );
}
