export interface DonorDashboardDto {
  profile: {
    id: string;
    nom: string;
    email: string;
    telephone: string;
    groupeSanguin: string;
    dateNaissance: string;
    adresse: string;
    dernierDon: string | null;
    prochainDonPossible: string | null;
    totalDons: number;
    viesSauvees: number;
  };
  historiqueDons: Array<{
    id: string;
    date: string;
    centre: string;
    type: string;
    statut: string;
  }>;
  prochainsRendezVous: Array<{
    id: string;
    date: string;
    heure: string;
    centre: string;
    type: string;
    statut: string;
  }>;
  badges: Array<{
    nom: string;
    icon: string;
    obtenu: boolean;
  }>;
  urgences: Array<{
    id: string;
    hopital: string;
    groupe: string;
    besoin: string;
    distance: string;
  }>;
  campagnes: Array<{
    id: string;
    titre: string;
    description: string;
    date: string;
    dateFin: string;
    statut: string;
    lieu: string;
  }>;
}

export interface HospitalDashboardDto {
  hospitalName: string;
  summary: {
    totalUnits: number;
    appointmentsToday: number;
    criticalGroups: number;
    activeDonors: number;
  };
  stocks: Array<{
    groupeSanguin: string;
    quantite: number;
    seuil: number;
    statut: "critique" | "faible" | "normal";
  }>;
  rendezvous: Array<{
    id: string;
    donorUserId: string;
    donneur: string;
    email: string;
    cni: string;
    telephone: string;
    groupeSanguin: string;
    date: string;
    heure: string;
    statut: "en-attente" | "confirme" | "termine" | "annule";
  }>;
  urgences: Array<{
    id: string;
    titre: string;
    description: string;
    niveauLabel: string;
    niveauColor: "red" | "yellow" | "green";
    createdAtLabel: string;
    notifiedDonors: number;
    positiveResponses: number;
    donationsCompleted: number;
  }>;
  donneurs: Array<{
    id: string;
    nom: string;
    email: string;
    cni: string;
    telephone: string;
    groupeSanguin: string;
    ville: string;
    quartier: string;
    dateNaissance: string;
    inscritLe: string;
  }>;
  campagnes: Array<{
    id: string;
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    lieu: string;
    statut: "active" | "terminee" | "planifiee";
  }>;
}

export interface AdminDashboardDto {
  statistiques: {
    totalDonors: number;
    donationsThisMonth: number;
    partnerHospitals: number;
    activeCampaigns: number;
  };
  evolutionMensuelle: Array<{
    mois: string;
    dons: number;
    max: number;
  }>;
  repartitionGroupes: Array<{
    groupe: string;
    pourcentage: number;
    couleur: string;
  }>;
  regions: Array<{
    region: string;
    donneurs: number;
    dons: number;
    centres: number;
  }>;
  campagnes: Array<{
    id: string;
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    objectif: number;
    collecte: number;
    statut: "active" | "terminee" | "planifiee";
    lieu: string;
  }>;
  utilisateurs: {
    donneursActifs: number;
    hopitauxPartenaires: number;
    administrateurs: number;
    derniersDonneurs: Array<{
      id: string;
      nom: string;
      email: string;
      cni: string;
      telephone: string;
      groupe: string;
      date: string;
      ville: string;
      quartier: string;
      dateNaissance: string;
    }>;
    donneursDetails: Array<{
      id: string;
      nom: string;
      email: string;
      cni: string;
      telephone: string;
      groupe: string;
      date: string;
      ville: string;
      quartier: string;
      dateNaissance: string;
    }>;
  };
  cntsStocks: Array<{
    groupeSanguin: string;
    quantite: number;
    seuil: number;
    statut: "critique" | "faible" | "normal";
  }>;
}

export interface CreateCampaignRequestDto {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  objectif: number;
  lieu: string;
}

export interface UpdateAppointmentStatusRequestDto {
  statut: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export interface CreateEmergencyAlertRequestDto {
  groupeSanguin: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantite: number;
  message: string;
  priorite?: "CRITICAL" | "HIGH" | "MEDIUM";
}
