const express = require('express');
const axios = require('axios');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON

app.get('/', (req, res) => {
  res.json('Hello World!');
});

// app.post('/auth-verify', async (req, res) => {
//   const Api = axios.create({
//       baseURL: 'https://dev-control.tenniskhelo.com/api',
//       headers:{
//           Accept: "application/json"
//       }
//   });

//   try {
//     const response = await Api.post('auth-verify', {
//         username: 'pradeep@fpdemo.com',
//         password: 'Pradeep#Fp-Dev09'
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Authentication failed' });
//   }
// });

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
});
