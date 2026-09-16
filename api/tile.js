export default async function handler(req, res) {
  const { x, y, z } = req.query;

  if (!x || !y || !z) {
    return res.status(400).send('Missing x, y, or z parameters');
  }

  // Google Maps Hybrid Tile URL
  const url = `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps returned ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();

    // Enable CORS so WebGL can use the image as a texture
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');

    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Tile fetch error:', error);
    res.status(500).send('Error fetching tile');
  }
}
