const express = require('express');
const {
    CreateLoginSession,
    Login,
    FilterAccessToken,
    FetchEntitlementToken,
    FetchPlayerID,
    multiFactor,
} = require('../valorant');
const router = express.Router();

router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        const [session, sessionError] = await CreateLoginSession();
        if (sessionError) {
            console.error(sessionError);
            return res.status(424).send({
                success: false,
                message:
                    'Failed Dependency - Failed to create a VALORANT login session',
            });
        }
        const sessionCookies = session.headers['set-cookie'].join('; ');
        const [auth, authError] = await Login(
            username,
            password,
            sessionCookies
        );
        const authCookies = auth.headers['set-cookie'].join('; ');
        if (authError) {
            if (authError.response.status === 401) {
                return res.status(401).send({
                    success: false,
                    message:
                        'Unauthorized - Invalid username or password provided',
                });
            } else {
                return res.status(424).send({
                    success: false,
                    message:
                        'Failed Dependency - Failed to login via the provided username and password',
                });
            }
        }
        if (auth.data.error && auth.data.error === 'auth_failure') {
            return res.status(401).send({
                success: false,
                message: 'Unauthorized - Invalid username or password provided',
            });
        } else if (auth.data.type == 'multifactor') {
            return res.status(200).send({
                success: true,
                cookies: authCookies,
                message: 'Please Enter the 2FA',
            });
        }
        const [token, tokenError] = FilterAccessToken(auth);
        if (!token || tokenError) {
            return res.status(500).send({
                success: false,
                message: 'Internal Server Error - Failed to fetch access token',
            });
        }
        const [entitlement, player] = await Promise.all([
            FetchEntitlementToken(token),
            FetchPlayerID(token),
        ]);
        if (entitlement[1]) {
            return res.status(424).send({
                success: false,
                message:
                    'Failed Dependency - Failed to fetch entitlement token',
            });
        }

        if (player[1]) {
            return res.status(424).send({
                success: false,
                message: 'Failed Dependency - Failed to fetch player ID',
            });
        }

        const entitlement_token = entitlement[0].data.entitlements_token;
        const id = player[0].data.sub;
        return res.status(200).send({
            success: true,
            payload: {
                id,
                entitlement_token,
                access_token: token,
            },
        });
    } else {
        res.status(401).send({
            success: false,
            message: 'Fill the requird inputs',
        });
    }
});

router.post('/multifactor', async (req, res) => {
    const code = req.body.code;
    const cookies = req.body.cookies;
    if (code && cookies) {
        const [auth, authError] = await multiFactor(code, cookies);
        if (authError) {
            return res.status(424).send({
                success: false,
                message:
                    'Failed Dependency - Failed to login via the provided username and password',
            });
        }
        const [token, tokenError] = FilterAccessToken(auth);
        if (!token || tokenError) {
            return res.status(500).send({
                success: false,
                message: 'Internal Server Error - Failed to fetch access token',
            });
        }
        const [entitlement, player] = await Promise.all([
            FetchEntitlementToken(token),
            FetchPlayerID(token),
        ]);
        if (entitlement[1]) {
            return res.status(424).send({
                success: false,
                message:
                    'Failed Dependency - Failed to fetch entitlement token',
            });
        }

        if (player[1]) {
            return res.status(424).send({
                success: false,
                message: 'Failed Dependency - Failed to fetch player ID',
            });
        }

        const entitlement_token = entitlement[0].data.entitlements_token;
        const id = player[0].data.sub;
        return res.status(200).send({
            success: true,
            payload: {
                id,
                entitlement_token,
                access_token: token,
            },
        });
    } else {
        res.status(400).send({
            success: false,
            message: 'Fill the requird inputs',
        });
    }
});
module.exports = router;
