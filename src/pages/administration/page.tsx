import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Statistique {
  label: string;
  valeur: number;
  evolution: number;
  icon: string;
  color: string;
}

interface Campagne {
  id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  objectif: number;
  collecte: number;
  statut: 'active' | 'terminee' | 'planifiee';
  lieu: string;
}

export default function Administration() {
  const [activeTab, setActiveTab] = useState<'statistiques' | 'campagnes' | 'utilisateurs'>('statistiques');
  const [showCampagneModal, setShowCampagneModal] = useState(false);
  const [campagneData, setCampagneData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    objectif: '',
    lieu: ''
  });

  const statistiques: Statistique[] = [
    { label: 'Total Donneurs Inscrits', valeur: 12847, evolution: 15.3, icon: 'ri-user-heart-line', color: 'green' },
    { label: 'Dons ce Mois', valeur: 1456, evolution: 8.7, icon: 'ri-drop-line', color: 'red' },
    { label: 'Hôpitaux Partenaires', valeur: 28, evolution: 12.0, icon: 'ri-hospital-line', color: 'blue' },
    { label: 'Campagnes Actives', valeur: 5, evolution: -10.0, icon: 'ri-megaphone-line', color: 'yellow' }
  ];

  const [campagnes, setCampagnes] = useState<Campagne[]>([
    {
      id: '1',
      titre: 'Journée Mondiale du Donneur',
      description: 'Grande campagne nationale pour célébrer la Journée Mondiale du Donneur de Sang avec des collectes dans toutes les régions.',
      dateDebut: '2025-06-14',
      dateFin: '2025-06-14',
      objectif: 500,
      collecte: 387,
      statut: 'active',
      lieu: 'Toutes les régions du Sénégal'
    },
    {
      id: '2',
      titre: 'Don de Sang Universitaire',
      description: 'Campagne de sensibilisation et de collecte dans les universités de Dakar pour encourager les jeunes à donner.',
      dateDebut: '2025-01-20',
      dateFin: '2025-01-27',
      objectif: 300,
      collecte: 245,
      statut: 'active',
      lieu: 'UCAD, UGB, UASZ'
    },
    {
      id: '3',
      titre: 'Ramadan Solidaire',
      description: 'Collecte spéciale pendant le mois sacré pour répondre aux besoins accrus des hôpitaux.',
      dateDebut: '2025-03-01',
      dateFin: '2025-03-30',
      objectif: 800,
      collecte: 0,
      statut: 'planifiee',
      lieu: 'Dakar, Thiès, Saint-Louis'
    },
    {
      id: '4',
      titre: 'Entreprises Solidaires',
      description: 'Tournée de collecte dans les grandes entreprises sénégalaises pour mobiliser les employés.',
      dateDebut: '2024-12-01',
      dateFin: '2024-12-20',
      objectif: 400,
      collecte: 412,
      statut: 'terminee',
      lieu: 'Zone industrielle de Dakar'
    }
  ]);

  const getStatutColor = (statut: Campagne['statut']) => {
    switch (statut) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'terminee': return 'bg-gray-100 text-gray-700';
      case 'planifiee': return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatutLabel = (statut: Campagne['statut']) => {
    switch (statut) {
      case 'active': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'planifiee': return 'Planifiée';
    }
  };

  const handleCampagneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nouvelleCampagne: Campagne = {
      id: Date.now().toString(),
      titre: campagneData.titre,
      description: campagneData.description,
      dateDebut: campagneData.dateDebut,
      dateFin: campagneData.dateFin,
      objectif: parseInt(campagneData.objectif),
      collecte: 0,
      statut: new Date(campagneData.dateDebut) > new Date() ? 'planifiee' : 'active',
      lieu: campagneData.lieu
    };
    setCampagnes([nouvelleCampagne, ...campagnes]);
    setShowCampagneModal(false);
    setCampagneData({ titre: '', description: '', dateDebut: '', dateFin: '', objectif: '', lieu: '' });
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
                <div className="text-xs text-gray-500">Administration CNTS</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/gestion-hopital" className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer whitespace-nowrap">
                Gestion Hôpital
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
            Tableau de Bord Administrateur
          </h1>
          <p className="text-xl text-gray-600">
            Centre National de Transfusion Sanguine du Sénégal
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('statistiques')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'statistiques' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-bar-chart-line mr-2"></i>
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('campagnes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'campagnes' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-megaphone-line mr-2"></i>
            Campagnes
          </button>
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'utilisateurs' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ri-team-line mr-2"></i>
            Utilisateurs
          </button>
        </div>

        {/* Statistiques Tab */}
        {activeTab === 'statistiques' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              {statistiques.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center bg-${stat.color}-100 rounded-xl`}>
                      <i className={`${stat.icon} text-2xl text-${stat.color}-600`}></i>
                    </div>
                    <span className={`text-sm font-semibold ${stat.evolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.evolution >= 0 ? '+' : ''}{stat.evolution}%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.valeur.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Graphiques */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dons par Mois */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Évolution des Dons (2024)</h3>
                <div className="space-y-4">
                  {[
                    { mois: 'Janvier', dons: 1234, max: 1500 },
                    { mois: 'Février', dons: 1156, max: 1500 },
                    { mois: 'Mars', dons: 1389, max: 1500 },
                    { mois: 'Avril', dons: 1445, max: 1500 },
                    { mois: 'Mai', dons: 1298, max: 1500 },
                    { mois: 'Juin', dons: 1567, max: 1600 }
                  ].map((item) => (
                    <div key={item.mois}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700">{item.mois}</span>
                        <span className="text-gray-600">{item.dons} dons</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${(item.dons / item.max) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Répartition par Groupe Sanguin */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Répartition par Groupe Sanguin</h3>
                <div className="space-y-4">
                  {[
                    { groupe: 'O+', pourcentage: 38, couleur: 'bg-red-500' },
                    { groupe: 'A+', pourcentage: 28, couleur: 'bg-green-500' },
                    { groupe: 'B+', pourcentage: 15, couleur: 'bg-blue-500' },
                    { groupe: 'AB+', pourcentage: 8, couleur: 'bg-yellow-500' },
                    { groupe: 'O-', pourcentage: 5, couleur: 'bg-red-400' },
                    { groupe: 'A-', pourcentage: 3, couleur: 'bg-green-400' },
                    { groupe: 'B-', pourcentage: 2, couleur: 'bg-blue-400' },
                    { groupe: 'AB-', pourcentage: 1, couleur: 'bg-yellow-400' }
                  ].map((item) => (
                    <div key={item.groupe} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-bold text-gray-700">{item.groupe}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className={`${item.couleur} h-8 rounded-full transition-all flex items-center justify-end pr-3`}
                            style={{ width: `${item.pourcentage}%` }}
                          >
                            <span className="text-white text-sm font-semibold">{item.pourcentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistiques Régionales */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Statistiques par Région</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { region: 'Dakar', donneurs: 5234, dons: 678, centres: 12 },
                  { region: 'Thiès', donneurs: 2156, dons: 289, centres: 6 },
                  { region: 'Saint-Louis', donneurs: 1845, dons: 234, centres: 5 },
                  { region: 'Kaolack', donneurs: 1234, dons: 167, centres: 4 },
                  { region: 'Ziguinchor', donneurs: 987, dons: 123, centres: 3 },
                  { region: 'Diourbel', donneurs: 1391, dons: 165, centres: 4 }
                ].map((region) => (
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
                        <span className="font-semibold text-gray-900">{region.donneurs.toLocaleString('fr-FR')}</span>
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

        {/* Campagnes Tab */}
        {activeTab === 'campagnes' && (
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
              {campagnes.map((campagne) => (
                <div key={campagne.id} className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{campagne.titre}</h3>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatutColor(campagne.statut)}`}>
                          {getStatutLabel(campagne.statut)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{campagne.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span><i className="ri-calendar-line mr-2"></i>{new Date(campagne.dateDebut).toLocaleDateString('fr-FR')} - {new Date(campagne.dateFin).toLocaleDateString('fr-FR')}</span>
                        <span><i className="ri-map-pin-line mr-2"></i>{campagne.lieu}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-xl transition-colors cursor-pointer">
                        <i className="ri-edit-line text-xl text-green-600"></i>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-xl transition-colors cursor-pointer">
                        <i className="ri-delete-bin-line text-xl text-red-600"></i>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Progression</span>
                      <span className="text-sm text-gray-600">
                        {campagne.collecte} / {campagne.objectif} dons ({Math.round((campagne.collecte / campagne.objectif) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full transition-all"
                        style={{ width: `${Math.min((campagne.collecte / campagne.objectif) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Utilisateurs Tab */}
        {activeTab === 'utilisateurs' && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Utilisateurs</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-xl mb-4">
                  <i className="ri-user-heart-line text-2xl text-white"></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">12,847</div>
                <div className="text-sm text-gray-600">Donneurs Actifs</div>
              </div>

              <div className="border-2 border-blue-200 bg-blue-50 rounded-2xl p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl mb-4">
                  <i className="ri-hospital-line text-2xl text-white"></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">28</div>
                <div className="text-sm text-gray-600">Hôpitaux Partenaires</div>
              </div>

              <div className="border-2 border-yellow-200 bg-yellow-50 rounded-2xl p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-xl mb-4">
                  <i className="ri-admin-line text-2xl text-white"></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">15</div>
                <div className="text-sm text-gray-600">Administrateurs</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Derniers Donneurs Inscrits</h3>
              {[
                { nom: 'Amadou Diallo', email: 'amadou.diallo@email.com', groupe: 'O+', date: '2025-01-20', ville: 'Dakar' },
                { nom: 'Fatou Sall', email: 'fatou.sall@email.com', groupe: 'A+', date: '2025-01-19', ville: 'Thiès' },
                { nom: 'Moussa Ndiaye', email: 'moussa.ndiaye@email.com', groupe: 'B+', date: '2025-01-19', ville: 'Saint-Louis' },
                { nom: 'Aïssatou Ba', email: 'aissatou.ba@email.com', groupe: 'AB+', date: '2025-01-18', ville: 'Dakar' },
                { nom: 'Ibrahima Sarr', email: 'ibrahima.sarr@email.com', groupe: 'O-', date: '2025-01-18', ville: 'Kaolack' }
              ].map((user, index) => (
                <div key={index} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl">
                        <i className="ri-user-line text-2xl text-green-600"></i>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{user.nom}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
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
                        <div className="font-bold text-gray-900">{new Date(user.date).toLocaleDateString('fr-FR')}</div>
                        <div className="text-gray-600">Inscription</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Campagne */}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre de la Campagne <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={campagneData.titre}
                  onChange={(e) => setCampagneData({...campagneData, titre: e.target.value})}
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: Journée Mondiale du Donneur"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={campagneData.description}
                  onChange={(e) => setCampagneData({...campagneData, description: e.target.value.slice(0, 500)})}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Décrivez les objectifs et le déroulement de la campagne..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {campagneData.description.length}/500
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de Début <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={campagneData.dateDebut}
                    onChange={(e) => setCampagneData({...campagneData, dateDebut: e.target.value})}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de Fin <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={campagneData.dateFin}
                    onChange={(e) => setCampagneData({...campagneData, dateFin: e.target.value})}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objectif de Collecte (nombre de dons) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={campagneData.objectif}
                  onChange={(e) => setCampagneData({...campagneData, objectif: e.target.value})}
                  required
                  min="1"
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: 500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lieu(x) de la Campagne <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={campagneData.lieu}
                  onChange={(e) => setCampagneData({...campagneData, lieu: e.target.value})}
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ex: Dakar, Thiès, Saint-Louis"
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
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Créer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
