const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const JAGOPAY_KEY = 'jp_c49a23ea3d01a837e789c2bdb30b';

// Endpoint 1: Generate QRIS
app.get('/api/create-qris', async (req, res) => {
  try {
    const response = await fetch(`https://jagopay.my.id/api/qris?api_key=${JAGOPAY_KEY}&amount=1000`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    if (data.status && data.data) {
      return res.json({
        status: true,
        qr_link: data.data.qris_url,
        qris_string: data.data.qris_string
      });
    }
    return res.json({ status: false, message: data.message || 'Gagal generate QRIS' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});

// Endpoint 2: Check Status
app.get('/api/check-status', async (req, res) => {
  const { email } = req.query;
  try {
    const response = await fetch(`https://jagopay.my.id/api/mutasi?api_key=${JAGOPAY_KEY}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    const isPaid = Array.isArray(data.data) && data.data.some(trx => parseInt(trx.amount) === 1000);

    if (isPaid && email) {
      const magicUrl = `https://api.kyzznekoo.my.id/api/alightmotion/v3/magic-link?email=${encodeURIComponent(email)}`;
      await fetch(magicUrl);
      return res.json({ paid: true });
    }

    return res.json({ paid: false });
  } catch (err) {
    return res.status(500).json({ paid: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
