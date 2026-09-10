export const resolveGoogleMapsEmbedUrl = (rawInput?: string, addressFallback?: string, salonNameFallback?: string): string => {
  const input = (rawInput || '').trim();
  if (input.includes('<iframe') && input.includes('src=')) {
    const match = input.match(/src=["']([^"']+)["']/);
    if (match && match[1]) return match[1];
  }
  if (input.includes('/maps/embed') || (input.includes('output=embed') && input.includes('maps.google'))) {
    return input;
  }
  const coordMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    const placeMatch = input.match(/\/maps\/place\/([^/@?]+)/);
    const query = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : `${lat},${lng}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=tr&z=16&output=embed`;
  }
  const placeOnlyMatch = input.match(/\/maps\/place\/([^/@?]+)/);
  if (placeOnlyMatch) {
    const placeName = decodeURIComponent(placeOnlyMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=tr&z=16&output=embed`;
  }
  if (input.includes('?q=') || input.includes('/search/')) {
    const qMatch = input.match(/[?&]q=([^&]+)/) || input.match(/\/search\/([^/?]+)/);
    if (qMatch) {
      const q = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=tr&z=16&output=embed`;
    }
  }
  if (input && !input.startsWith('http')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(input)}&hl=tr&z=16&output=embed`;
  }
  const fallback = (addressFallback || salonNameFallback || '').trim();
  if (fallback) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallback)}&hl=tr&z=16&output=embed`;
  }
  return input;
};

export const resolveGoogleMapsDirectionsUrl = (rawDirections?: string, rawEmbed?: string, addressFallback?: string): string => {
  const dir = (rawDirections || '').trim();
  if (dir && dir.startsWith('http')) return dir;
  const embed = (rawEmbed || '').trim();
  if (embed && embed.includes('google.com/maps/place/')) return embed;
  if (dir) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}`;
  if (addressFallback) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFallback)}`;
  return 'https://maps.google.com';
};
