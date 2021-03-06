const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const dev = false;
const origin = dev
    ? ['https://www.valorant-store.xyz', 'http://localhost:3000']
    : ['https://www.valorant-store.xyz'];
const allowlist = ['76.223.127.72', '76.223.126.116', '76.76.21.21'];
const corsOptions = {
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const apiRequestLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    handler: function (req, res /*next*/) {
        return res.status(429).json({
            error: 'You sent too many requests. Please wait a while then try again',
        });
    },
    skip: (request, response) => allowlist.includes(request.ip),
});

const loginRouter = require('./routers/login');
const storeRouter = require('./routers/store');

//app.use(apiRequestLimiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use('/login', loginRouter);
app.use('/store', storeRouter);

app.get('/', (req, res) => {
    res.send('Running Like Arabian horse 🐎');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
