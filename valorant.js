const axios = require('axios');
const https = require('https');

const baseUrl = 'https://auth.riotgames.com';
const entitlementsUrl = 'https://entitlements.auth.riotgames.com';

const CreateLoginSession = async () => {
    try {
        const response = await axios.post(
            `${baseUrl}/api/v1/authorization`,
            {
                nonce: '1',
                client_id: 'play-valorant-web-prod',
                redirect_uri: 'https://playvalorant.com/opt_in',
                response_type: 'token id_token',
            },
            {
                headers: {
                    'User-Agent':
                        'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows;10;;Professional, x64)',
                },
                httpsAgent: new https.Agent({
                    ciphers:
                        'TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384',
                }),
            }
        );

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const Login = async (username, password, cookies) => {
    try {
        const response = await axios.put(
            `${baseUrl}/api/v1/authorization`,
            {
                type: 'auth',
                username: username,
                password: password,
            },
            {
                headers: {
                    Cookie: cookies,
                    headers: {
                        'User-Agent':
                            'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows;10;;Professional, x64)',
                    },
                },
                httpsAgent: new https.Agent({
                    ciphers:
                        'TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384',
                }),
            }
        );

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const multiFactor = async (code, cookies) => {
    try {
        const response = await axios.put(
            `${baseUrl}/api/v1/authorization`,
            {
                type: 'multifactor',
                code: code,
            },
            {
                headers: {
                    Cookie: cookies,
                    headers: {
                        'User-Agent':
                            'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows;10;;Professional, x64)',
                    },
                },
                httpsAgent: new https.Agent({
                    ciphers:
                        'TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384',
                }),
            }
        );

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const FilterAccessToken = (raw) => {
    try {
        const token = raw.data.response.parameters.uri.match(
            /access_token=((?:[a-zA-Z]|\d|\.|-|_)*).*id_token=((?:[a-zA-Z]|\d|\.|-|_)*).*expires_in=(\d*)/
        )[1];

        return [token, null];
    } catch (e) {
        return [null, e];
    }
};

const FetchEntitlementToken = async (access_token) => {
    try {
        const response = await axios.post(
            `${entitlementsUrl}/api/token/v1`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const FetchPlayerID = async (access_token) => {
    try {
        const response = await axios.get(`${baseUrl}/userinfo`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const GetPlayerStorefront = async (
    player_id,
    access_token,
    entitlement_token,
    region
) => {
    try {
        const response = await axios.get(
            `https://pd.${region}.a.pvp.net/store/v2/storefront/${player_id}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'X-Riot-Entitlements-JWT': entitlement_token,
                },
            }
        );

        return [response, null];
    } catch (e) {
        return [null, e];
    }
};

const getSkinDetails = async (skinsParam) => {
    const skins = [];
    for (const skinId of skinsParam) {
        const skin = await axios.get(
            `https://valorant-api.com/v1/weapons/skinlevels/${skinId}`
        );
        skins.push(skin.data.data);
    }
    return skins;
};
module.exports = {
    CreateLoginSession,
    Login,
    multiFactor,
    FilterAccessToken,
    FetchEntitlementToken,
    FetchPlayerID,
    GetPlayerStorefront,
    getSkinDetails,
};
