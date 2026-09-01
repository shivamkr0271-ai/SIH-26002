export interface NERLocation {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  isTransitHub: boolean;
  connectedCorridors: string[];
}

export const NER_LOCATIONS: NERLocation[] = [
  // Assam
  {
    id: 'AS-GAU',
    name: 'Guwahati',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    lat: 26.1445,
    lng: 91.7362,
    elevationMeters: 55,
    isTransitHub: true,
    connectedCorridors: ['NH-27', 'NH-37', 'NH-06']
  },
  {
    id: 'AS-SIL',
    name: 'Silchar',
    state: 'Assam',
    district: 'Cachar',
    lat: 24.8333,
    lng: 92.7789,
    elevationMeters: 25,
    isTransitHub: true,
    connectedCorridors: ['NH-06', 'NH-37', 'NH-08']
  },
  {
    id: 'AS-DIB',
    name: 'Dibrugarh',
    state: 'Assam',
    district: 'Dibrugarh',
    lat: 27.4728,
    lng: 94.9120,
    elevationMeters: 108,
    isTransitHub: true,
    connectedCorridors: ['NH-37', 'NH-15']
  },
  {
    id: 'AS-JOR',
    name: 'Jorhat',
    state: 'Assam',
    district: 'Jorhat',
    lat: 26.7509,
    lng: 94.2037,
    elevationMeters: 116,
    isTransitHub: false,
    connectedCorridors: ['NH-37', 'NH-715']
  },
  {
    id: 'AS-TEZ',
    name: 'Tezpur',
    state: 'Assam',
    district: 'Sonitpur',
    lat: 26.6528,
    lng: 92.7926,
    elevationMeters: 48,
    isTransitHub: false,
    connectedCorridors: ['NH-15', 'NH-715']
  },

  // Arunachal Pradesh
  {
    id: 'AR-ITA',
    name: 'Itanagar',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    lat: 27.0844,
    lng: 93.6053,
    elevationMeters: 320,
    isTransitHub: true,
    connectedCorridors: ['NH-13', 'NH-415']
  },
  {
    id: 'AR-TAW',
    name: 'Tawang',
    state: 'Arunachal Pradesh',
    district: 'Tawang',
    lat: 27.5861,
    lng: 91.8594,
    elevationMeters: 3048,
    isTransitHub: false,
    connectedCorridors: ['NH-13', 'Bhalukpong-Tawang Highway']
  },
  {
    id: 'AR-PAS',
    name: 'Pasighat',
    state: 'Arunachal Pradesh',
    district: 'East Siang',
    lat: 28.0664,
    lng: 95.3267,
    elevationMeters: 153,
    isTransitHub: false,
    connectedCorridors: ['NH-13', 'NH-515']
  },

  // Meghalaya
  {
    id: 'ML-SHI',
    name: 'Shillong',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    lat: 25.5788,
    lng: 91.8933,
    elevationMeters: 1525,
    isTransitHub: true,
    connectedCorridors: ['NH-06', 'NH-106']
  },
  {
    id: 'ML-TUR',
    name: 'Tura',
    state: 'Meghalaya',
    district: 'West Garo Hills',
    lat: 25.5138,
    lng: 90.2201,
    elevationMeters: 349,
    isTransitHub: false,
    connectedCorridors: ['NH-51', 'NH-217']
  },

  // Manipur
  {
    id: 'MN-IMP',
    name: 'Imphal',
    state: 'Manipur',
    district: 'Imphal West',
    lat: 24.8170,
    lng: 93.9368,
    elevationMeters: 786,
    isTransitHub: true,
    connectedCorridors: ['NH-29', 'NH-37', 'NH-102']
  },

  // Mizoram
  {
    id: 'MZ-AIZ',
    name: 'Aizawl',
    state: 'Mizoram',
    district: 'Aizawl',
    lat: 23.7307,
    lng: 92.7173,
    elevationMeters: 1132,
    isTransitHub: true,
    connectedCorridors: ['NH-06', 'NH-54', 'NH-108']
  },
  {
    id: 'MZ-LUN',
    name: 'Lunglei',
    state: 'Mizoram',
    district: 'Lunglei',
    lat: 22.8878,
    lng: 92.7410,
    elevationMeters: 1222,
    isTransitHub: false,
    connectedCorridors: ['NH-54']
  },

  // Nagaland
  {
    id: 'NL-KOH',
    name: 'Kohima',
    state: 'Nagaland',
    district: 'Kohima',
    lat: 25.6751,
    lng: 94.1086,
    elevationMeters: 1444,
    isTransitHub: true,
    connectedCorridors: ['NH-29', 'NH-02']
  },
  {
    id: 'NL-DIM',
    name: 'Dimapur',
    state: 'Nagaland',
    district: 'Dimapur',
    lat: 25.9095,
    lng: 93.7266,
    elevationMeters: 145,
    isTransitHub: true,
    connectedCorridors: ['NH-29', 'NH-36']
  },

  // Tripura
  {
    id: 'TR-AGA',
    name: 'Agartala',
    state: 'Tripura',
    district: 'West Tripura',
    lat: 23.8315,
    lng: 91.2868,
    elevationMeters: 16,
    isTransitHub: true,
    connectedCorridors: ['NH-08', 'NH-108']
  },

  // Sikkim
  {
    id: 'SK-GAN',
    name: 'Gangtok',
    state: 'Sikkim',
    district: 'East Sikkim',
    lat: 27.3389,
    lng: 88.6065,
    elevationMeters: 1650,
    isTransitHub: true,
    connectedCorridors: ['NH-10', 'NH-710']
  },

  // West Bengal (Key Gateway to NER & Sikkim)
  {
    id: 'WB-SIL',
    name: 'Siliguri',
    state: 'West Bengal',
    district: 'Darjeeling',
    lat: 26.7271,
    lng: 88.3953,
    elevationMeters: 122,
    isTransitHub: true,
    connectedCorridors: ['NH-10', 'NH-27', 'NH-31']
  }
];

export function getLocationByName(name: string): NERLocation | undefined {
  const clean = name.toLowerCase().trim();
  return NER_LOCATIONS.find(loc => 
    loc.name.toLowerCase() === clean || 
    `${loc.name}, ${loc.state}`.toLowerCase() === clean ||
    clean.includes(loc.name.toLowerCase()) ||
    loc.id.toLowerCase() === clean
  );
}

export const findLocation = getLocationByName;

