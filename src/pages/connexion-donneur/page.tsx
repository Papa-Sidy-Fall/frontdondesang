import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  getCurrentUser,
  getGoogleAuthorizationUrl,
  loginDonor,
} from "../../services/auth-api";
import {
  setAccessToken,
  setCurrentUserInStorage,
} from "../../services/auth-storage";
import { ApiError } from "../../services/http-client";

export default function ConnexionDonneur() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        navigate("/tableau-de-bord-donneur", { replace: true });
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Connexion OAuth2 échouée"
        );
      } finally {
        setLoading(false);
      }
    };

    void consumeOAuthToken();
  }, [navigate, oauthErrorMessage, oauthToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginDonor({ email, password });
      setAccessToken(response.accessToken);
      setCurrentUserInStorage(response.user);
      navigate("/tableau-de-bord-donneur");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Impossible de se connecter"
      );
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
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "OAuth2 Google indisponible"
      );
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

      <div className="max-w-md mx-auto px-6 py-14">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Connexion Donneur</h1>
            <p className="text-gray-600 mt-2">Accédez à votre espace personnel</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white rounded-lg py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-300 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Continuer avec Google (OAuth2)
          </button>

          <p className="text-sm text-gray-600 text-center">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-red-600 font-semibold hover:text-red-700">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
