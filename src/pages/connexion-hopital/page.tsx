
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ConnexionHopital() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifiant: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulation de connexion avec validation basique
      if (!formData.identifiant || !formData.motDePasse) {
        setError('Veuillez remplir tous les champs');
        return;
      }

      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection vers la gestion hôpital
      navigate('/gestion-hopital');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Navigation */}
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center bg-red-600 rounded-full mx-auto mb-6">
            <i className="ri-hospital-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connexion Hôpital
          </h1>
          <p className="text-lg text-gray-600">
            Accédez à votre espace de gestion
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-green-600 text-xl mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">Identifiants par défaut</p>
                  <p className="text-xs text-green-700">
                    Utilisez vos identifiants fournis par l'administration. Vous pourrez les modifier après la première connexion.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="identifiant"
                value={formData.identifiant}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                placeholder="Votre identifiant"
              />
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
                required
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <Link to="/mot-de-passe-oublie" className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-red-700 transition-all hover:scale-[1.02] whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Besoin d'aide ?{' '}
              <Link to="/" className="text-red-600 hover:text-red-700 font-semibold cursor-pointer">
                Contactez l'administration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
