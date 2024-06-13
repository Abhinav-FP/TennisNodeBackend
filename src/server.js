const { default: axios } = require("axios");
const app = require("./app");
const logger = require("./utils/logger");

const port = process.env.PORT || 5000;

// const checkApiAuth = async () => {
//   const Api = axios.create({
//       baseURL: 'https://dev-control.tenniskhelo.com/api',
//       headers:{
//           Accept: "application/json"
//       }
//   });

//   await Api.post('auth-verify', {username: 'pradeep@fpdemo.com', password:'Pradeep#Fp-Dev09'})
//       .then(resp => {
//           console.log('resp-data', resp.data);
//       }).catch(_err => {
//           console.log('auth-error', _err);
//       });
// }
// checkApiAuth();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
});
