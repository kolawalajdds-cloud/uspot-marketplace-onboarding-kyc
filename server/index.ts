import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Marketplace Neon API server running on http://localhost:${PORT}`);
});
