import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerDonor } from "../../services/auth-api";
import {
  setAccessToken,
  setCurrentUserInStorage,
} from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  dateNaissance: string;
  groupeSanguin: string;
  ville: string;
  quartier: string;
}

const initialFormState: FormState = {
  nom: "",
  prenom: "",
  email: "",
  motDePasse: "",
  telephone: "",
  dateNaissance: "",
  groupeSanguin: "",
  ville: "",
  quartier: "",
};

export default function Inscription() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState((previousState) => ({
      ...previousState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await registerDonor({
        firstName: formState.prenom,
        lastName: formState.nom,
        email: formState.email,
        password: formState.motDePasse,
        phone: formState.telephone || undefined,
        birthDate: formState.dateNaissance || undefined,
        bloodType: formState.groupeSanguin || undefined,
        city: formState.ville || undefined,
        district: formState.quartier || undefined,
      });

      setAccessToken(response.accessToken);
      setCurrentUserInStorage(response.user);
      navigate("/tableau-de-bord-donneur");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Inscription impossible"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-red-600 text-xl">
            DonSang Sénégal
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-red-600">
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription Donneur</h1>
          <p className="text-gray-600 mb-8">
            Création de compte sécurisée via DTO backend (données minimales exposées).
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <input
              name="prenom"
              value={formState.prenom}
              onChange={handleChange}
              required
              placeholder="Prénom"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="nom"
              value={formState.nom}
              onChange={handleChange}
              required
              placeholder="Nom"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="motDePasse"
              type="password"
              value={formState.motDePasse}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Mot de passe (8+ caractères)"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="telephone"
              value={formState.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="dateNaissance"
              type="date"
              value={formState.dateNaissance}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <select
              name="groupeSanguin"
              value={formState.groupeSanguin}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="">Groupe sanguin</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <input
              name="ville"
              value={formState.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              name="quartier"
              value={formState.quartier}
              onChange={handleChange}
              placeholder="Quartier"
              className="border border-gray-300 rounded-lg px-4 py-3 md:col-span-2"
            />

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 mt-2 bg-red-600 text-white rounded-lg py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Déjà un compte ?{" "}
            <Link to="/connexion-donneur" className="text-red-600 font-semibold hover:text-red-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
