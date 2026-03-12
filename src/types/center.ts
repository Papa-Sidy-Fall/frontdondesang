export interface CenterDto {
  hospitalUserId: string;
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

export interface CentersResponseDto {
  total: number;
  centers: CenterDto[];
}
