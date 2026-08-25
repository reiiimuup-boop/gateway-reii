const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const JAGOPAY_KEY = 'jp_c49a23ea3d01a837e789c2bdb30b';
  const { path, email } = req.query;

  try {
    // Endpoint 1: Generate QRIS (Lewat Proxy Bypass)
    if (path === 'create-qris' || req.url.includes('create-qris')) {
      const targetUrl = encodeURIComponent(`https://jagopay.my.id/api/qris?api_key=${JAGOPAY_KEY}&amount=1000`);
      const response = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`);
      const text = await response.text();

      try {
        const data = JSON.parse(text);
        if (data.status && data.data) {
          return res.status(200).json({
            status: true,
            qr_link: data.data.qris_url,
            qris_string: data.data.qris_string
          });
        }
        return res.status(400).json({ status: false, message: data.message || 'Gagal generate QRIS' });
      } catch (e) {
        return res.status(500).json({ status: false, message: 'Gagal memproses data dari JagoPay.' });
      }
    }

    // Endpoint 2: Check Status Mutasi (Lewat Proxy Bypass)
    if (path === 'check-status' || req.url.includes('check-status')) {
      const targetUrl = encodeURIComponent(`https://jagopay.my.id/api/mutasi?api_key=${JAGOPAY_KEY}`);
      const response = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`);
      const text = await response.text();

      try {
        const data = JSON.parse(text);
        const isPaid = Array.isArray(data.data) && data.data.some(trx => parseInt(trx.amount) === 1000);

        if (isPaid && email) {
          const magicUrl = `https://api.kyzznekoo.my.id/api/alightmotion/v3/magic-link?email=${encodeURIComponent(email)}`;
          await fetch(magicUrl);
          return res.status(200).json({ paid: true });
        }
        return res.status(200).json({ paid: false });
      } catch (e) {
        return res.status(200).json({ paid: false });
      }
    }

    return res.status(400).json({ status: false, message: 'Invalid API Endpoint' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
