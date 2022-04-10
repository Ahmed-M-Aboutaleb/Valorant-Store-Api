const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
var origin = 'https://valorant-store.xyz';
var corsOptions = {
    origin: [origin],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const loginRouter = require('./routers/login');

app.use(helmet());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use('/login', loginRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
