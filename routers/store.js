const express = require('express');
const { GetPlayerStorefront, getSkinDetails } = require('../valorant');
const router = express.Router();

router.post('/', async (req, res) => {
    const id = req.body.id;
    const accessToken = req.body.accessToken;
    const entitlementToken = req.body.entitlementToken;
    const region = req.body.region;
    if (region && entitlementToken && accessToken && id) {
        const [store, storeError] = await GetPlayerStorefront(
            id,
            accessToken,
            entitlementToken,
            region
        );
        if (storeError) {
            console.log(storeError);
            return res.status(424).send({
                success: false,
                message:
                    "Failed Dependency - Failed to fetch the player's store",
            });
        }
        const skins = await getSkinDetails(
            store.data.SkinsPanelLayout.SingleItemOffers
        );
        if (skins) {
            return res.status(200).send({
                success: true,
                skins: skins,
            });
        } else {
            return res.status(500).send({
                success: false,
                message: 'Internal Server Error - Failed to fetch skins',
            });
        }
    } else {
        res.status(401).send({
            success: false,
            message: 'Fill the requird inputs',
        });
    }
});

module.exports = router;
