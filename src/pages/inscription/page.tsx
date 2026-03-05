import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerDonor } from "../../services/auth-api";
import { setAccessToken, setCurrentUserInStorage } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmationMotDePasse: string;
  telephone: string;
  dateNaissance: string;
  groupeSanguin: string;
  ville: string;
  quartier: string;
  accepteNotifications: boolean;
  accepteUrgences: boolean;
}

const initialFormState: FormState = {
  nom: "",
  prenom: "",
  email: "",
  motDePasse: "",
  confirmationMotDePasse: "",
  telephone: "",
  dateNaissance: "",
  groupeSanguin: "",
  ville: "",
  quartier: "",
  accepteNotifications: true,
  accepteUrgences: true,
};

export default function Inscription() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (formData.motDePasse !== formData.confirmationMotDePasse) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerDonor({
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        password: formData.motDePasse,
        phone: formData.telephone,
        birthDate: formData.dateNaissance,
        bloodType: formData.groupeSanguin || undefined,
        city: formData.ville,
        district: formData.quartier,
      });

      setAccessToken(response.accessToken);
      setCurrentUserInStorage(response.user);
      setSubmitted(true);

      setTimeout(() => {
        navigate("/tableau-de-bord-donneur", { replace: true });
      }, 1200);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData((previousState) => ({
      ...previousState,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-red-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl">
                <i className="ri-drop-fill text-2xl text-white"></i>
              </div>
              <span className="text-xl font-bold text-red-600">DonSang Sénégal</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer">
              <i className="ri-arrow-left-line text-xl mr-2"></i>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-6">
            <i className="ri-user-heart-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Inscription Donneur</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez notre communauté de donneurs et contribuez à sauver des vies au Sénégal
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-xl mb-4">
              <i className="ri-notification-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-600 text-sm">Recevez des alertes pour les urgences</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-xl mb-4">
              <i className="ri-map-pin-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Géolocalisation</h3>
            <p className="text-gray-600 text-sm">Trouvez les centres proches de vous</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-xl mb-4">
              <i className="ri-calendar-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Suivi</h3>
            <p className="text-gray-600 text-sm">Gérez vos rendez-vous facilement</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                <i className="ri-check-line text-4xl text-green-600"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Inscription Réussie !</h2>
              <p className="text-xl text-gray-600 mb-8">Votre compte est créé. Redirection vers votre espace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="exemple@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="8 caractères minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmationMotDePasse"
                    value={formData.confirmationMotDePasse}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Retapez le mot de passe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de Naissance <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Groupe Sanguin <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="groupeSanguin"
                    value={formData.groupeSanguin}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Sélectionnez votre groupe</option>
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
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Sélectionnez votre ville</option>
                    <option value="Dakar">Dakar</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Kaolack">Kaolack</option>
                    <option value="Ziguinchor">Ziguinchor</option>
                    <option value="Diourbel">Diourbel</option>
                    <option value="Louga">Louga</option>
                    <option value="Tambacounda">Tambacounda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quartier <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="quartier"
                    value={formData.quartier}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Votre quartier"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-red-50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="accepteNotifications"
                    checked={formData.accepteNotifications}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label className="text-sm text-gray-700">
                    <strong>J'accepte de recevoir des notifications</strong> pour les campagnes de don et les informations importantes
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="accepteUrgences"
                    checked={formData.accepteUrgences}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label className="text-sm text-gray-700">
                    <strong>J'accepte d'être contacté(e) en cas d'urgence</strong> quand mon groupe sanguin est requis
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-red-700 transition-all hover:scale-[1.01] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Inscription..." : "Créer mon compte"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link to="/connexion-donneur" className="text-red-600 font-semibold hover:text-red-700">
                  Se connecter
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
