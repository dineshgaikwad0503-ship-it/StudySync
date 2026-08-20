require('dotenv').config();

const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('../../socket/socket');

const PORT = process.env.PORT || 5001;

// 👇 यह नया route यहाँ add करो
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StudySync API is running',
    port: PORT
  });
});

(async () => {
  await connectDB();

  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`StudySync API running on ${PORT}`);
  });
})().catch(err => {
  console.error(err);
  process.exit(1);
});