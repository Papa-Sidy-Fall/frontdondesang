import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, getCurrentUser } from "../../services/auth-api";
import { createCampaign, deleteCampaign, getAdminDashboard } from "../../services/dashboard-api";
import { clearSession, getAccessToken, setCurrentUserInStorage } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { AdminDashboardDto } from "../../types/dashboard";

interface Statistique {
  label: string;
  valeur: number;
  evolution: number;
  icon: string;
  color: "green" | "red" | "blue" | "yellow";
}

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

export default function Administration() {
  const navigate = useNavigate();
  const DONORS_PER_PAGE = 5;
  const [activeTab, setActiveTab] = useState<"statistiques" | "campagnes" | "utilisateurs">("statistiques");
  const [adminDonorPage, setAdminDonorPage] = useState(1);
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

      const [profile, dashboardData] = await Promise.all([
        getCurrentUser(token),
        getAdminDashboard(token),
      ]);

      if (profile.role !== "ADMIN") {
        if (profile.role === "HOSPITAL") {
          navigate("/gestion-hopital", { replace: true });
        } else {
          navigate("/tableau-de-bord-donneur", { replace: true });
        }
        return;
      }

      setCurrentUserInStorage(profile);
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

  useEffect(() => {
    if (adminDonorPage > donorTotalPages) {
      setAdminDonorPage(donorTotalPages);
    }
  }, [adminDonorPage, donorTotalPages]);

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
      await createCampaign(token, {
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
      await deleteCampaign(token, campaignId);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl">
                <i className="ri-drop-fill text-2xl text-white"></i>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">DonSang Sénégal</div>
                <div className="text-xs text-gray-500">Administration CNTS</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/messagerie")}
                className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Messagerie
              </button>
              <button
                onClick={() => navigate("/gestion-stocks")}
                className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Stocks CNTS
              </button>
              <button
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setShowPasswordModal(true);
                }}
                className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Changer mot de passe
              </button>
              <Link to="/gestion-hopital" className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">
                Gestion Hôpital
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
              >
                <i className="ri-logout-box-line text-xl mr-2"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-xl text-gray-600">Centre National de Transfusion Sanguine du Sénégal</p>
        </div>

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {actionError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2">
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
        </div>

        {activeTab === "statistiques" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
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

            <div className="grid md:grid-cols-2 gap-6">
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
              <div className="grid md:grid-cols-3 gap-6">
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Campagnes</h2>
              <button
                onClick={() => setShowCampagneModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                Nouvelle Campagne
              </button>
            </div>

            <div className="space-y-6">
              {dashboard.campagnes.map((campagne) => (
                <div key={campagne.id} className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{campagne.titre}</h3>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatutColor(campagne.statut)}`}>
                          {getStatutLabel(campagne.statut)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{campagne.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
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
                    <div className="flex justify-between items-center mb-3">
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

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <UserMiniCard icon="ri-user-heart-line" color="green" value={dashboard.utilisateurs.donneursActifs} label="Donneurs Actifs" />
              <UserMiniCard icon="ri-hospital-line" color="blue" value={dashboard.utilisateurs.hopitauxPartenaires} label="Hôpitaux Partenaires" />
              <UserMiniCard icon="ri-admin-line" color="yellow" value={dashboard.utilisateurs.administrateurs} label="Administrateurs" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Derniers Donneurs Inscrits</h3>
              {paginatedDonors.map((user) => (
                <div key={user.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{user.nom}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
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
                    <div className="flex items-center gap-6 text-sm">
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
              <div className="mt-6 flex items-center justify-between">
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
              <div className="grid md:grid-cols-4 gap-4">
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

              <div className="flex gap-4">
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
