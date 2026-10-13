/**
 * Central track configuration — swap URLs here without touching UI code.
 * Sources: SoundHelix royalty-free demo tracks (https://www.soundhelix.com/).
 * Replace with licensed lofi assets when available.
 */
export type Track = {
  id: string;
  name: string;
  url: string;
};

export const LOFI_TRACKS: Track[] = [
  {
    id: '1',
    name: 'Study Session',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    name: 'Forest Guitar',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    name: 'Rainy Night',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    name: 'Lofi Music',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    name: 'Homework Focus',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    name: 'LoFi Relax',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '7',
    name: 'Coffee Shop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '8',
    name: 'Chill Music',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
];
