import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Stock {
  groupeSanguin: string;
  quantite: number;
  seuil: number;
  statut: 'critique' | 'faible' | 'normal';
}

interface Rendezous {
  id: string;
  donneur: string;
  telephone: string;
  groupeSanguin: string;
  date: string;
  heure: string;
  statut: 'en-attente' | 'confirme' | 'termine' | 'annule';
}

export default function GestionHopital() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'rendezous' | 'urgences'>('stocks');
  const [showUrgenceModal, setShowUrgenceModal] = useState(false);
  const [urgenceData, setUrgenceData] = useState({
    groupeSanguin: '',
    quantite: '',
    message: ''
  });

  const [stocks] = useState<Stock[]>([
    { groupeSanguin: 'A+', quantite: 45, seuil: 30, statut: 'normal' },
    { groupeSanguin: 'A-', quantite: 12, seuil: 20, statut: 'faible' },
    { groupeSanguin: 'B+', quantite: 38, seuil: 30, statut: 'normal' },
    { groupeSanguin: 'B-', quantite: 8, seuil: 15, statut: 'critique' },
    { groupeSanguin: 'AB+', quantite: 22, seuil: 20, statut: 'normal' },
    { groupeSanguin: 'AB-', quantite: 5, seuil: 10, statut: 'critique' },
    { groupeSanguin: 'O+', quantite: 52, seuil: 40, statut: 'normal' },
    { groupeSanguin: 'O-', quantite: 15, seuil: 25, statut: 'faible' }
  ]);

  const [rendezous, setRendezous] = useState<Rendezous[]>([
    { id: '1', donneur: 'Amadou Diallo', telephone: '+221 77 123 45 67', groupeSanguin: 'O+', date: '2025-01-25', heure: '09:00', statut: 'confirme' },
    { id: '2', donneur: 'Fatou Sall', telephone: '+221 76 234 56 78', groupeSanguin: 'A+', date: '2025-01-25', heure: '10:30', statut: 'confirme' },
    { id: '3', donneur: 'Moussa Ndiaye', telephone: '+221 78 345 67 89', groupeSanguin: 'B+', date: '2025-01-25', heure: '14:00', statut: 'en-attente' },
    { id: '4', donneur: 'Aïssatou Ba', telephone: '+221 77 456 78 90', groupeSanguin: 'AB+', date: '2025-01-26', heure: '09:30', statut: 'en-attente' },
    { id: '5', donneur: 'Ibrahima Sarr', telephone: '+221 76 567 89 01', groupeSanguin: 'O-', date: '2025-01-26', heure: '11:00', statut: 'confirme' }
  ]);

  const getStatutColor = (statut: Stock['statut']) => {
    switch (statut) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-300';
      case 'faible': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'normal': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getStatutIcon = (statut: Stock['statut']) => {
    switch (statut) {
      case 'critique': return 'ri-alert-line';
      case 'faible': return 'ri-error-warning-line';
      case 'normal': return 'ri-checkbox-circle-line';
    }
  };

  const getRendezousStatutColor = (statut: Rendezous['statut']) => {
    switch (statut) {
      case 'en-attente': return 'bg-yellow-100 text-yellow-700';
      case 'confirme': return 'bg-green-100 text-green-700';
      case 'termine': return 'bg-gray-100 text-gray-700';
      case 'annule': return 'bg-red-100 text-red-700';
    }
  };

  const handleStatutChange = (id: string, newStatut: Rendezous['statut']) => {
    setRendezous(prev => prev.map(rdv => 
      rdv.id === id ? { ...rdv, statut: newStatut } : rdv
    ));
  };

  const handleUrgenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUrgenceModal(false);
    setUrgenceData({ groupeSanguin: '', quantite: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-green-50">
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
                <div className="text-xs text-gray-500">Gestion Hôpital</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/administration" className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">
                Administration
              </Link>
              <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line text-xl mr-2"></i>
                Retour
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tableau de Bord Hôpital
          </h1>
          <p className="text-xl text-gray-600">
            Hôpital Principal de Dakar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl">
                <i className="ri-drop-line text-2xl text-green-600"></i>
              </div>
              <span className="text-sm font-semibold text-green-600">+12%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">180</div>
            <div className="text-sm text-gray-600">Unités en Stock</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-xl">
                <i className="ri-calendar-check-line text-2xl text-yellow-600"></i>
              </div>
              <span className="text-sm font-semibold text-yellow-600">Aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
            <div className="text-sm text-gray-600">Rendez-vous</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-xl">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <span className="text-sm font-semibold text-red-600">Urgent</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
            <div className="text-sm text-gray-600">Groupes Critiques</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl">
                <i className="ri-user-heart-line text-2xl text-blue-600"></i>
              </div>
              <span className="text-sm font-semibold text-blue-600">Ce mois</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">142</div>
            <div className="text-sm text-gray-600">Donneurs Actifs</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stocks' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-drop-line mr-2"></i>
            Stocks de Sang
          </button>
          <button
            onClick={() => setActiveTab('rendezous')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rendezous' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-calendar-line mr-2"></i>
            Rendez-vous
          </button>
          <button
            onClick={() => setActiveTab('urgences')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'urgences' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-alarm-warning-line mr-2"></i>
            Urgences
          </button>
        </div>

        {/* Content */}
        {activeTab === 'stocks' && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Stocks de Sang par Groupe</h2>
              <button 
                onClick={() => setShowUrgenceModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-alarm-warning-line mr-2"></i>
                Signaler Urgence
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                      <span>{Math.round((stock.quantite / stock.seuil) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <div 
                        className="bg-current h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((stock.quantite / stock.seuil) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm font-semibold mt-3">
                    {stock.statut === 'critique' && '⚠️ Stock critique - Action immédiate requise'}
                    {stock.statut === 'faible' && '⚡ Stock faible - Réapprovisionnement conseillé'}
                    {stock.statut === 'normal' && '✓ Stock normal'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rendezous' && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Rendez-vous</h2>
            
            <div className="space-y-4">
              {rendezous.map((rdv) => (
                <div key={rdv.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{rdv.donneur}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                          <span><i className="ri-phone-line mr-1"></i>{rdv.telephone}</span>
                          <span><i className="ri-drop-line mr-1"></i>{rdv.groupeSanguin}</span>
                          <span><i className="ri-calendar-line mr-1"></i>{new Date(rdv.date).toLocaleDateString('fr-FR')}</span>
                          <span><i className="ri-time-line mr-1"></i>{rdv.heure}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getRendezousStatutColor(rdv.statut)}`}>
                        {rdv.statut === 'en-attente' && 'En attente'}
                        {rdv.statut === 'confirme' && 'Confirmé'}
                        {rdv.statut === 'termine' && 'Terminé'}
                        {rdv.statut === 'annule' && 'Annulé'}
                      </span>

                      <select
                        value={rdv.statut}
                        onChange={(e) => handleStatutChange(rdv.id, e.target.value as Rendezous['statut'])}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold cursor-pointer hover:border-green-300 transition-colors"
                      >
                        <option value="en-attente">En attente</option>
                        <option value="confirme">Confirmé</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </select>

                      <button className="w-10 h-10 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-xl transition-colors cursor-pointer">
                        <i className="ri-phone-line text-xl text-green-600"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'urgences' && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des Urgences</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-red-200 bg-red-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl flex-shrink-0">
                    <i className="ri-alarm-warning-line text-2xl text-white"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-900">Urgence O- Négatif</div>
                      <span className="text-sm text-gray-600">Il y a 2 heures</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Besoin urgent de 15 unités de sang O- pour intervention chirurgicale d'urgence. Patient en salle d'opération.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                        Critique
                      </span>
                      <span className="text-sm text-gray-600">
                        <i className="ri-user-line mr-1"></i>45 donneurs notifiés
                      </span>
                      <span className="text-sm text-green-600 font-semibold">
                        <i className="ri-check-line mr-1"></i>8 réponses positives
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-yellow-200 bg-yellow-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-xl flex-shrink-0">
                    <i className="ri-error-warning-line text-2xl text-white"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-900">Stock Faible AB-</div>
                      <span className="text-sm text-gray-600">Il y a 5 heures</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Le stock de sang AB- est passé sous le seuil critique. Besoin de 10 unités supplémentaires.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-semibold">
                        Moyen
                      </span>
                      <span className="text-sm text-gray-600">
                        <i className="ri-user-line mr-1"></i>28 donneurs notifiés
                      </span>
                      <span className="text-sm text-green-600 font-semibold">
                        <i className="ri-check-line mr-1"></i>12 réponses positives
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-xl flex-shrink-0">
                    <i className="ri-checkbox-circle-line text-2xl text-white"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-900">Urgence A+ Résolue</div>
                      <span className="text-sm text-gray-600">Hier</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Besoin urgent de 20 unités de sang A+ pour accident de la route. Objectif atteint avec succès.
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                        Résolu
                      </span>
                      <span className="text-sm text-gray-600">
                        <i className="ri-user-line mr-1"></i>67 donneurs notifiés
                      </span>
                      <span className="text-sm text-green-600 font-semibold">
                        <i className="ri-check-line mr-1"></i>23 dons effectués
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Urgence */}
      {showUrgenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Signaler une Urgence</h2>
              <button 
                onClick={() => setShowUrgenceModal(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <form onSubmit={handleUrgenceSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Groupe Sanguin Requis <span className="text-red-600">*</span>
                </label>
                <select
                  value={urgenceData.groupeSanguin}
                  onChange={(e) => setUrgenceData({...urgenceData, groupeSanguin: e.target.value})}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantité Nécessaire (unités) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={urgenceData.quantite}
                  onChange={(e) => setUrgenceData({...urgenceData, quantite: e.target.value})}
                  required
                  min="1"
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Nombre d'unités"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message d'Urgence <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={urgenceData.message}
                  onChange={(e) => setUrgenceData({...urgenceData, message: e.target.value.slice(0, 500)})}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                  placeholder="Décrivez la situation d'urgence..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {urgenceData.message.length}/500
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-xl text-red-600 mt-0.5"></i>
                  <div className="text-sm text-gray-700">
                    <strong>Important :</strong> Cette alerte sera envoyée immédiatement à tous les donneurs compatibles dans votre région. Utilisez cette fonction uniquement pour les urgences réelles.
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowUrgenceModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-alarm-warning-line mr-2"></i>
                  Envoyer l'Alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
