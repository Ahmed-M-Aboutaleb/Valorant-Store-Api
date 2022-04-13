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
    skip: (req, res) => {
        if (req.ip == '76.76.21.21') {
            return true;
        }
        return false;
    },
});

const loginRouter = require('./routers/login');
const storeRouter = require('./routers/store');

app.use(apiRequestLimiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use('/login', loginRouter);
app.use('/store', storeRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
