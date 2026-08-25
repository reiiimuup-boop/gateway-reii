const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Buka CORS agar bisa diakses dari web utama Anda
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const JAGOPAY_KEY = 'jp_c49a23ea3d01a837e789c2bdb30b';
  const { path, email } = req.query;

  try {
    // Endpoint 1: Create QRIS
    if (path === 'create-qris' || req.url.includes('create-qris')) {
      const response = await fetch(`https://jagopay.my.id/api/qris?api_key=${JAGOPAY_KEY}&amount=1000`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (data.status && data.data) {
        return res.status(200).json({
          status: true,
          qr_link: data.data.qris_url,
          qris_string: data.data.qris_string
        });
      }

      return res.status(400).json({ status: false, message: data.message || 'Gagal generate QRIS' });
    }

    // Endpoint 2: Check Status
    if (path === 'check-status' || req.url.includes('check-status')) {
      const response = await fetch(`https://jagopay.my.id/api/mutasi?api_key=${JAGOPAY_KEY}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      const isPaid = Array.isArray(data.data) && data.data.some(trx => parseInt(trx.amount) === 1000);

      if (isPaid && email) {
        const magicUrl = `https://api.kyzznekoo.my.id/api/alightmotion/v3/magic-link?email=${encodeURIComponent(email)}`;
        await fetch(magicUrl);
        return res.status(200).json({ paid: true });
      }

      return res.status(200).json({ paid: false });
    }

    return res.status(400).json({ status: false, message: 'Invalid API Endpoint' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
