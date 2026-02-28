import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TableauDeBordDonneur() {
  const navigate = useNavigate();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Données du donneur
  const donorProfile = {
    nom: "Amadou Diallo",
    email: "amadou.diallo@email.com",
    telephone: "+221 77 123 45 67",
    groupeSanguin: "O+",
    dateNaissance: "15/03/1990",
    adresse: "Dakar, Sénégal",
    dernierDon: "15/11/2024",
    prochainDonPossible: "15/02/2025",
    totalDons: 12,
    viesSauvees: 36
  };

  const historiqueDons = [
    { id: 1, date: "15/01/2025", centre: "CNTS Dakar", type: "Don de sang total", statut: "Complété" },
    { id: 2, date: "10/10/2024", centre: "Hôpital Principal", type: "Don de sang total", statut: "Complété" },
    { id: 3, date: "05/07/2024", centre: "CNTS Dakar", type: "Don de plaquettes", statut: "Complété" },
    { id: 4, date: "20/04/2024", centre: "Hôpital Le Dantec", type: "Don de sang total", statut: "Complété" },
    { id: 5, date: "15/01/2024", centre: "CNTS Dakar", type: "Don de sang total", statut: "Complété" }
  ];

  const prochainRdv = [
    { id: 1, date: "25/02/2025", heure: "10:00", centre: "CNTS Dakar", type: "Don de sang total" }
  ];

  const badges = [
    { nom: "Premier Don", icon: "🩸", obtenu: true },
    { nom: "5 Dons", icon: "⭐", obtenu: true },
    { nom: "10 Dons", icon: "🏆", obtenu: true },
    { nom: "Donneur Régulier", icon: "💪", obtenu: true },
    { nom: "20 Dons", icon: "🎖️", obtenu: false },
    { nom: "Héros du Sang", icon: "👑", obtenu: false }
  ];

  const urgences = [
    { id: 1, hopital: "Hôpital Principal", groupe: "O-", besoin: "Urgent", distance: "2.5 km" },
    { id: 2, hopital: "Hôpital Le Dantec", groupe: "O+", besoin: "Critique", distance: "4.1 km" }
  ];

  const campagnes = [
    { id: 1, titre: "Journée Mondiale du Donneur", date: "14/06/2025", lieu: "Place de l'Indépendance" },
    { id: 2, titre: "Collecte Mobile Université", date: "28/02/2025", lieu: "UCAD Dakar" }
  ];

  // Calcul correct des jours restants
  const dernierDonDate = new Date("2024-11-15");
  const aujourdhui = new Date();
  const joursDepuisDernierDon = Math.floor((aujourdhui.getTime() - dernierDonDate.getTime()) / (1000 * 60 * 60 * 24));
  const joursRestants = Math.max(0, 90 - joursDepuisDernierDon);
  const pourcentageProgression = Math.min(100, (joursDepuisDernierDon / 90) * 100);

  return (
    <div className="min-h-screen bg-red-50">
      {/* Navigation */}
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
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{donorProfile.nom.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{donorProfile.nom}</p>
                <p className="text-xs text-gray-500">{donorProfile.groupeSanguin}</p>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bannière de bienvenue */}
        <div className="bg-red-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bienvenue, {donorProfile.nom.split(' ')[0]} ! 👋</h2>
              <p className="text-white/90 text-lg">Merci pour votre engagement. Vous avez sauvé {donorProfile.viesSauvees} vies !</p>
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

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-drop-fill text-2xl text-red-600"></i>
              </div>
              <span className="text-2xl">🩸</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{donorProfile.totalDons}</h3>
            <p className="text-sm text-gray-500">Dons effectués</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-heart-pulse-fill text-2xl text-green-600"></i>
              </div>
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{donorProfile.viesSauvees}</h3>
            <p className="text-sm text-gray-500">Vies sauvées</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-2xl text-yellow-600"></i>
              </div>
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{joursRestants}</h3>
            <p className="text-sm text-gray-500">Jours avant prochain don</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-trophy-fill text-2xl text-orange-600"></i>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{badges.filter(b => b.obtenu).length}/{badges.length}</h3>
            <p className="text-sm text-gray-500">Badges obtenus</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Éligibilité au don */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-calendar-check-line text-red-600"></i>
                Éligibilité au don
              </h3>
              {joursRestants > 0 ? (
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-time-line text-2xl text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Prochain don possible dans {joursRestants} jours</h4>
                      <p className="text-sm text-gray-600 mb-3">Dernier don : {donorProfile.dernierDon}</p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full transition-all"
                          style={{ width: `${pourcentageProgression}%` }}
                        ></div>
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
                      <h4 className="font-semibold text-gray-900 mb-2">Vous êtes éligible pour donner !</h4>
                      <p className="text-sm text-gray-600 mb-3">Dernier don : {donorProfile.dernierDon}</p>
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

            {/* Prochains rendez-vous */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-calendar-event-line text-red-600"></i>
                Prochains rendez-vous
              </h3>
              {prochainRdv.length > 0 ? (
                <div className="space-y-3">
                  {prochainRdv.map(rdv => (
                    <div key={rdv.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <i className="ri-calendar-check-fill text-2xl text-white"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{rdv.centre}</h4>
                            <p className="text-sm text-gray-600">{rdv.type}</p>
                            <p className="text-sm text-green-600 font-medium mt-1">
                              <i className="ri-time-line mr-1"></i>
                              {rdv.date} à {rdv.heure}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
                          Modifier
                        </button>
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

            {/* Historique des dons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-history-line text-red-600"></i>
                Historique des dons
              </h3>
              <div className="space-y-3">
                {historiqueDons.map(don => (
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
                      <p className="text-sm font-medium text-gray-900">{don.date}</p>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mt-1">
                        {don.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Badges et récompenses */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-medal-line text-red-600"></i>
                Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-lg transition-all ${
                      badge.obtenu
                        ? 'bg-yellow-50 border-2 border-yellow-300'
                        : 'bg-gray-50 border border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{badge.nom}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgences */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-alarm-warning-line text-red-600"></i>
                Besoins urgents
              </h3>
              <div className="space-y-3">
                {urgences.map(urgence => (
                  <div key={urgence.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{urgence.hopital}</h4>
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold whitespace-nowrap">
                        {urgence.groupe}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <i className="ri-map-pin-line mr-1"></i>
                      {urgence.distance}
                    </p>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
                      <i className="ri-phone-line mr-2"></i>
                      Répondre à l'urgence
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Campagnes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-megaphone-line text-red-600"></i>
                Campagnes
              </h3>
              <div className="space-y-3">
                {campagnes.map(campagne => (
                  <div key={campagne.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{campagne.titre}</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      <i className="ri-calendar-line mr-1"></i>
                      {campagne.date}
                    </p>
                    <p className="text-sm text-gray-600">
                      <i className="ri-map-pin-line mr-1"></i>
                      {campagne.lieu}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Profil */}
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
                  <span className="text-white font-bold text-2xl">{donorProfile.nom.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{donorProfile.nom}</h4>
                  <p className="text-gray-600">Donneur régulier</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Groupe sanguin</label>
                    <p className="font-semibold text-gray-900">{donorProfile.groupeSanguin}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Date de naissance</label>
                    <p className="font-semibold text-gray-900">{donorProfile.dateNaissance}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email</label>
                  <p className="font-semibold text-gray-900">{donorProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Téléphone</label>
                  <p className="font-semibold text-gray-900">{donorProfile.telephone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Adresse</label>
                  <p className="font-semibold text-gray-900">{donorProfile.adresse}</p>
                </div>
              </div>
              <button className="w-full mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Modifier mes informations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rendez-vous */}
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
                  navigate('/recherche');
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <i className="ri-heart-pulse-fill text-xl text-white"></i>
                </div>
                <span className="font-bold text-lg">DonSang Sénégal</span>
              </div>
              <p className="text-gray-400 text-sm">Ensemble, sauvons des vies par le don de sang.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors cursor-pointer">Accueil</a></li>
                <li><a href="/recherche" className="hover:text-white transition-colors cursor-pointer">Recherche</a></li>
                <li><a href="/inscription" className="hover:text-white transition-colors cursor-pointer">Inscription</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><i className="ri-phone-line mr-2"></i>+221 33 123 45 67</li>
                <li><i className="ri-mail-line mr-2"></i>contact@donsang.sn</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 DonSang Sénégal. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}