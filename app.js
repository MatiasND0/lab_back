/*---------------------------- Inicializo las variables de entorno ------------------------------*/
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

/*--------------------------------- Inicializo el servidor HTTP ---------------------------------*/

const express = require('express')
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors({
    origin: `http://localhost:3001`,
    credentials: true,
  }));

/*-----------------------------------------------------------------------------------------------*/

const routes = require('./api/endPoints');

app.use('/',routes);

app.listen(process.env.BACKEND_PORT, () => console.log(`Servidor escuchando http://${process.env.LOCAL_IP}:${process.env.BACKEND_PORT}`))