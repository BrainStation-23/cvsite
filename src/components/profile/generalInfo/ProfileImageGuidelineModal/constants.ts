
export const EXAMPLES = [
  {
    src: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?auto=format&fit=facearea&w=200&h=200&facepad=2&sat=-100',
    label: 'Good',
    border: 'border-green-400',
    reason: 'Clear, professional headshot',
    color: 'text-green-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=200&h=200&facepad=2&sat=-100',
    label: 'Too Dark',
    border: 'border-red-400',
    reason: 'Poor lighting',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=200&h=200&facepad=2',
    label: 'Obstructed',
    border: 'border-red-400',
    reason: 'Face not visible',
    color: 'text-red-700',
  },
  {
    src: 'https://images.unsplash.com/photo-1650784854790-fb6c2ed400d3?auto=format&fit=facearea&w=200&h=200&facepad=2',
    label: 'Group Photo',
    border: 'border-red-400',
    reason: 'Multiple people',
    color: 'text-red-700',
  },
];

export const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/tiff',
  'image/svg+xml',
];

export const REQUIREMENTS = [
  'Recent, clear headshot',
  'Face centered, no sunglasses/hats',
  'Well-lit, neutral background',
  'JPG/PNG, max 5MB',
  'No group photos or logos',
];
