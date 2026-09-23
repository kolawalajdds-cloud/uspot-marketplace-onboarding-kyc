import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Marketplace Neon API server running on http://127.0.0.1:${PORT}`);
});
