import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser, getGoogleAuthorizationUrl, loginDonor } from "../../services/auth-api";
import { setAccessToken, setCurrentUserInStorage } from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";
import type { UserDto } from "../../types/auth";

function getDashboardPathForRole(role: UserDto["role"]): string {
  if (role === "ADMIN") {
    return "/administration";
  }

  if (role === "HOSPITAL") {
    return "/gestion-hopital";
  }

  return "/tableau-de-bord-donneur";
}

export default function ConnexionDonneur() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    motDePasse?: string;
  }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const oauthToken = searchParams.get("token");
  const oauthStatus = searchParams.get("oauth");

  const oauthErrorMessage = useMemo(() => {
    if (oauthStatus === "success" && oauthToken) {
      return null;
    }

    return searchParams.get("error");
  }, [oauthStatus, oauthToken, searchParams]);

  const validateForm = (): { email?: string; motDePasse?: string } => {
    const errors: { email?: string; motDePasse?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,100}$/;

    if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Veuillez saisir une adresse email valide.";
    }

    if (!passwordRegex.test(formData.motDePasse)) {
      errors.motDePasse = "Le mot de passe doit contenir entre 8 et 100 caractères.";
    }

    return errors;
  };

  useEffect(() => {
    if (!oauthToken) {
      if (oauthErrorMessage) {
        setError(oauthErrorMessage);
      }
      return;
    }

    const consumeOAuthToken = async () => {
      try {
        setLoading(true);
        setAccessToken(oauthToken);
        const user = await getCurrentUser(oauthToken);
        setCurrentUserInStorage(user);
        navigate(getDashboardPathForRole(user.role), { replace: true });
      } catch (caughtError) {
        setError(caughtError instanceof ApiError ? caughtError.message : "Connexion OAuth2 échouée");
      } finally {
        setLoading(false);
      }
    };

    void consumeOAuthToken();
  }, [navigate, oauthErrorMessage, oauthToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Veuillez corriger les champs de connexion.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginDonor({
        email: formData.email.trim(),
        password: formData.motDePasse,
      });

      setAccessToken(response.accessToken);
      setCurrentUserInStorage(response.user);
      navigate(getDashboardPathForRole(response.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const redirectUri = `${window.location.origin}/connexion-donneur`;
      const authorizationUrl = await getGoogleAuthorizationUrl(redirectUri);
      window.location.href = authorizationUrl;
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "OAuth2 Google indisponible");
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousState) => ({
      ...previousState,
      [name]: value,
    }));
    setFieldErrors((previous) => ({
      ...previous,
      [name]: undefined,
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

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-6">
            <i className="ri-user-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Connexion</h1>
          <p className="text-lg text-gray-600">Donneur, hôpital, administration</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                placeholder="exemple@email.com"
              />
              {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {fieldErrors.motDePasse && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.motDePasse}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <span className="text-sm text-gray-400 font-medium">Mot de passe oublié ?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-red-700 transition-all hover:scale-[1.02] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <button
            onClick={() => void handleGoogleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link to="/inscription" className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
