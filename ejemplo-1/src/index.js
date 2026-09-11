const express = require('express');
const informesRoutes = require('./routes/informes.routes');



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: true });
});

app.use('/informes', informesRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
