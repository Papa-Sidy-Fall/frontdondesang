import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Centre {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  horaires: string;
  distance: string;
  disponible: boolean;
  groupesDisponibles: string[];
  coordinates: string;
}

export default function Recherche() {
  const [ville, setVille] = useState('');
  const [groupeSanguin, setGroupeSanguin] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    groupeSanguin: '',
    dateRdv: '',
    heureRdv: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Coordonnées des villes du Sénégal
  const villeCoordinates: Record<string, string> = {
    'Dakar': '14.7167,-17.4677',
    'Thiès': '14.7886,-16.9260',
    'Saint-Louis': '16.0179,-16.4897',
    'Kaolack': '14.1500,-16.0767',
    'Ziguinchor': '12.5833,-16.2667',
    'Diourbel': '14.6500,-16.2333',
    'Louga': '15.6167,-16.2167',
    'Tambacounda': '13.7667,-13.6667',
    'Kolda': '12.8833,-14.9500',
    'Matam': '15.6556,-13.2553',
    'Fatick': '14.3333,-16.4167',
    'Kaffrine': '14.1067,-15.5500',
    'Kédougou': '12.5500,-12.1833',
    'Sédhiou': '12.7083,-15.5567'
  };

  const centres: Centre[] = [
    {
      id: 1,
      nom: 'Centre National de Transfusion Sanguine (CNTS)',
      adresse: 'Avenue Cheikh Anta Diop, Fann Résidence',
      ville: 'Dakar',
      telephone: '+221 33 825 92 92',
      horaires: 'Lun-Ven: 8h-17h, Sam: 8h-13h',
      distance: '2.5 km',
      disponible: true,
      groupesDisponibles: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      coordinates: '14.7167,-17.4677'
    },
    {
      id: 2,
      nom: 'Hôpital Régional de Dakar',
      adresse: 'Avenue Blaise Diagne, Dakar Plateau',
      ville: 'Dakar',
      telephone: '+221 33 821 21 81',
      horaires: 'Lun-Dim: 24h/24',
      distance: '3.2 km',
      disponible: true,
      groupesDisponibles: ['A+', 'A-', 'B+', 'O+', 'O-'],
      coordinates: '14.7167,-17.4677'
    },
    {
      id: 3,
      nom: 'Hôpital Régional de Thiès',
      adresse: 'Avenue Lamine Gueye, Thiès',
      ville: 'Thiès',
      telephone: '+221 33 951 10 18',
      horaires: 'Lun-Dim: 24h/24',
      distance: '70 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'AB+', 'O-'],
      coordinates: '14.7886,-16.9260'
    },
    {
      id: 4,
      nom: 'Hôpital Régional de Saint-Louis',
      adresse: 'Avenue Général de Gaulle, Saint-Louis',
      ville: 'Saint-Louis',
      telephone: '+221 33 961 11 95',
      horaires: 'Lun-Ven: 8h-17h, Sam: 8h-13h',
      distance: '265 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'AB+'],
      coordinates: '16.0179,-16.4897'
    },
    {
      id: 5,
      nom: 'Hôpital Régional de Kaolack',
      adresse: 'Quartier Médina, Kaolack',
      ville: 'Kaolack',
      telephone: '+221 33 941 10 74',
      horaires: 'Lun-Ven: 8h-18h',
      distance: '192 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'O-'],
      coordinates: '14.1500,-16.0767'
    },
    {
      id: 6,
      nom: 'Hôpital Régional de Ziguinchor',
      adresse: 'Quartier Kandé, Ziguinchor',
      ville: 'Ziguinchor',
      telephone: '+221 33 991 11 72',
      horaires: 'Lun-Dim: 24h/24',
      distance: '450 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'AB+'],
      coordinates: '12.5833,-16.2667'
    },
    {
      id: 7,
      nom: 'Hôpital Régional de Diourbel',
      adresse: 'Route de Bambey, Diourbel',
      ville: 'Diourbel',
      telephone: '+221 33 971 10 58',
      horaires: 'Lun-Ven: 8h-17h',
      distance: '150 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+'],
      coordinates: '14.6500,-16.2333'
    },
    {
      id: 8,
      nom: 'Hôpital Régional de Louga',
      adresse: 'Avenue Abdoulaye Wade, Louga',
      ville: 'Louga',
      telephone: '+221 33 967 10 25',
      horaires: 'Lun-Ven: 8h-18h',
      distance: '205 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'O-'],
      coordinates: '15.6167,-16.2167'
    },
    {
      id: 9,
      nom: 'Hôpital Régional de Tambacounda',
      adresse: 'Quartier Gourel Diadji, Tambacounda',
      ville: 'Tambacounda',
      telephone: '+221 33 981 11 44',
      horaires: 'Lun-Dim: 24h/24',
      distance: '430 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'AB+'],
      coordinates: '13.7667,-13.6667'
    },
    {
      id: 10,
      nom: 'Hôpital Régional de Kolda',
      adresse: 'Quartier Saré Kémo, Kolda',
      ville: 'Kolda',
      telephone: '+221 33 996 11 38',
      horaires: 'Lun-Ven: 8h-17h',
      distance: '620 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+'],
      coordinates: '12.8833,-14.9500'
    },
    {
      id: 11,
      nom: 'Hôpital Régional de Matam',
      adresse: 'Quartier Escale, Matam',
      ville: 'Matam',
      telephone: '+221 33 966 61 23',
      horaires: 'Lun-Ven: 8h-18h',
      distance: '450 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'O-'],
      coordinates: '15.6556,-13.2553'
    },
    {
      id: 12,
      nom: 'Hôpital Régional de Fatick',
      adresse: 'Route de Kaolack, Fatick',
      ville: 'Fatick',
      telephone: '+221 33 949 11 56',
      horaires: 'Lun-Ven: 8h-17h',
      distance: '165 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+'],
      coordinates: '14.3333,-16.4167'
    },
    {
      id: 13,
      nom: 'Hôpital Régional de Kaffrine',
      adresse: 'Quartier Médina Baye, Kaffrine',
      ville: 'Kaffrine',
      telephone: '+221 33 945 10 89',
      horaires: 'Lun-Ven: 8h-18h',
      distance: '280 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'AB+'],
      coordinates: '14.1067,-15.5500'
    },
    {
      id: 14,
      nom: 'Hôpital Régional de Kédougou',
      adresse: 'Quartier Centre, Kédougou',
      ville: 'Kédougou',
      telephone: '+221 33 985 11 67',
      horaires: 'Lun-Dim: 24h/24',
      distance: '720 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+'],
      coordinates: '12.5500,-12.1833'
    },
    {
      id: 15,
      nom: 'Hôpital Régional de Sédhiou',
      adresse: 'Quartier Escale, Sédhiou',
      ville: 'Sédhiou',
      telephone: '+221 33 995 11 42',
      horaires: 'Lun-Ven: 8h-17h',
      distance: '550 km',
      disponible: true,
      groupesDisponibles: ['A+', 'B+', 'O+', 'O-'],
      coordinates: '12.7083,-15.5567'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleGetDirections = (center: typeof centres[0]) => {
    const destination = encodeURIComponent(`${center.nom}, ${center.adresse}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleAppointmentClick = (centre: Centre) => {
    setSelectedCentre(centre);
    setShowAppointmentModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new URLSearchParams();
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telephone', formData.telephone);
    formDataToSend.append('groupeSanguin', formData.groupeSanguin);
    formDataToSend.append('dateRdv', formData.dateRdv);
    formDataToSend.append('heureRdv', formData.heureRdv);
    formDataToSend.append('message', formData.message);
    formDataToSend.append('centre', selectedCentre?.nom || '');
    formDataToSend.append('adresseCentre', selectedCentre?.adresse || '');

    try {
      const response = await fetch('https://readdy.ai/api/form/d5l9giqdeasqilubg4bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString()
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowAppointmentModal(false);
          setSubmitSuccess(false);
          setFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            groupeSanguin: '',
            dateRdv: '',
            heureRdv: '',
            message: ''
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCentres = centres.filter(centre => {
    const matchVille = !ville || centre.ville === ville;
    const matchGroupe = !groupeSanguin || centre.groupesDisponibles.includes(groupeSanguin);
    return matchVille && matchGroupe;
  });

  // Générer l'URL de la carte en fonction de la recherche
  const getMapUrl = () => {
    if (showResults && ville && villeCoordinates[ville]) {
      // Zoom sur la ville sélectionnée
      const coords = villeCoordinates[ville];
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${coords.split(',')[1]}!3d${coords.split(',')[0]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2ssn!4v1234567890`;
    }
    // Vue par défaut du Sénégal
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936000!2d-14.4524!3d14.4974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec173f5f06453845%3A0x1a0a7ff4530c4e0!2sS%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2ssn!4v1234567890";
  };

  return (
    <div className="min-h-screen bg-green-50">
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 flex items-center justify-center bg-green-600 rounded-full mx-auto mb-6">
            <i className="ri-map-pin-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Recherche de Centre
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez le centre de collecte de sang le plus proche de vous au Sénégal
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Toutes les villes</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Kaolack">Kaolack</option>
                  <option value="Ziguinchor">Ziguinchor</option>
                  <option value="Diourbel">Diourbel</option>
                  <option value="Louga">Louga</option>
                  <option value="Tambacounda">Tambacounda</option>
                  <option value="Kolda">Kolda</option>
                  <option value="Matam">Matam</option>
                  <option value="Fatick">Fatick</option>
                  <option value="Kaffrine">Kaffrine</option>
                  <option value="Kédougou">Kédougou</option>
                  <option value="Sédhiou">Sédhiou</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Groupe Sanguin
                </label>
                <select
                  value={groupeSanguin}
                  onChange={(e) => setGroupeSanguin(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Tous les groupes</option>
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

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-all hover:scale-[1.02] whitespace-nowrap cursor-pointer"
            >
              <i className="ri-search-line mr-2"></i>
              Rechercher des Centres
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
          <div className="relative h-[400px]">
            <iframe
              key={getMapUrl()}
              src={getMapUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte des centres de collecte"
            ></iframe>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {filteredCentres.length} Centre{filteredCentres.length > 1 ? 's' : ''} Trouvé{filteredCentres.length > 1 ? 's' : ''}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="ri-filter-line"></i>
                <span className="text-sm">Triés par distance</span>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredCentres.map((centre) => (
                <div
                  key={centre.id}
                  className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all hover:shadow-xl ${
                    centre.disponible ? 'border-green-200 hover:border-green-400' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0 ${
                          centre.disponible ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <i className={`ri-hospital-line text-2xl ${
                            centre.disponible ? 'text-green-600' : 'text-gray-400'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{centre.nom}</h3>
                            {centre.disponible ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                Ouvert
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                Fermé
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <i className="ri-map-pin-line"></i>
                              <span>{centre.adresse}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <i className="ri-phone-line"></i>
                              <span>{centre.telephone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <i className="ri-time-line"></i>
                              <span>{centre.horaires}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <i className="ri-map-pin-distance-line"></i>
                              <span>{centre.distance}</span>
                            </div>
                          </div>

                          {centre.groupesDisponibles.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Groupes sanguins disponibles :</p>
                              <div className="flex flex-wrap gap-2">
                                {centre.groupesDisponibles.map((groupe) => (
                                  <span
                                    key={groupe}
                                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold"
                                  >
                                    {groupe}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleAppointmentClick(centre)}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-calendar-line mr-2"></i>
                        Prendre RDV
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(centre);
                        }}
                        className="bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-navigation-line mr-2"></i>
                        Itinéraire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showResults && filteredCentres.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-6">
              <i className="ri-search-line text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun centre trouvé</h3>
            <p className="text-gray-600 mb-8">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setVille('');
                setGroupeSanguin('');
                setShowResults(false);
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Prendre Rendez-vous</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedCentre?.nom}</p>
              </div>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <form id="appointment-form" data-readdy-form onSubmit={handleAppointmentSubmit} className="p-8">
              {submitSuccess && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <i className="ri-checkbox-circle-fill text-2xl text-green-600"></i>
                  <div>
                    <p className="font-semibold text-green-900">Rendez-vous confirmé !</p>
                    <p className="text-sm text-green-700">Vous recevrez une confirmation par email.</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Groupe Sanguin <span className="text-red-500">*</span>
                </label>
                <select
                  name="groupeSanguin"
                  value={formData.groupeSanguin}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Sélectionnez votre groupe sanguin</option>
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

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date souhaitée <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateRdv"
                    value={formData.dateRdv}
                    onChange={handleFormChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heure souhaitée <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="heureRdv"
                    value={formData.heureRdv}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Choisir une heure</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Informations complémentaires..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 caractères</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="ri-calendar-check-line mr-2"></i>
                      Confirmer le RDV
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
