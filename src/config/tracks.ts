import { publicAsset } from './theme';

/**
 * Ambient music tracks served from /public.
 */
export type Track = {
  id: string;
  name: string;
  url: string;
};

export const AMBIENT_TRACKS: Track[] = [
  {
    id: 'kyoto-rain',
    name: 'Kyoto in the rain 🌧️ temples, mossy gardens, hidden forest & cozy tea houses',
    url: publicAsset(
      'Kyoto in the rain 🌧️ temples, mossy gardens, hidden forest & cozy tea houses.mp3',
    ),
  },
  {
    id: 'bike-ride',
    name: 'Bike ride with slow music at night',
    url: publicAsset('Bike ride with slow music at night.mp3'),
  },
];

/** @deprecated use AMBIENT_TRACKS */
export const LOFI_TRACKS = AMBIENT_TRACKS;
