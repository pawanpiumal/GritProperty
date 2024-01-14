const express = require("express")
var convert = require('xml-js');
const axios = require('axios')


const router = express.Router()

const timeSplitString = (value,type) => {
    if(type=="date"){
        return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
    }else if(type=="datetime"){
        return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8) + "T" + value.slice(9, 11) + ":" + value.slice(11, 13);
    }else{
        return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8) + "T" + value.slice(9, 11) + ":" + value.slice(11, 13) + ":" + value.slice(13, 15);
    }
    
}

const getText = (value) => {
    if(typeof value == "string"){
        if(value == undefined){
            return ""
        }else{
            return value
        };
    }
    for (var x in value) {
        // return value[Object.keys(value)[0]]; 
        return value._text;
    }
    return "";
}

router.get('/', (req, res) => {
    // console.log({ req })
    var result = JSON.parse(convert.xml2json(req.rawBody, { compact: true }))

    result = result.residential
        // console.log(result.residential)
    if (req.query == "publish" || req.query == "draft") {
        reqStatus = req.query
    } else {
        reqStatus = "draft"
    }
    
    itemResidential = {
        "title": {
            "raw": getText(result.headline)
        },
        "status": reqStatus,
        "meta": {
            "mod-time": timeSplitString(result._attributes.modTime),
            "uniqueid": getText(result.uniqueID),
            "agentid": getText(result.agentID),
            "listing-id": getText(result.listingId),
            "new-or-old-post": "Old",
            "status": getText(result._attributes.status),
            "sale-price": getText(result.soldDetails.soldPrice),
            "show_sale_price": getText(result.soldDetails.soldPrice._attributes.display),
            "sale-date": timeSplitString(getText(result.soldDetails.soldDate),"date"),
            "ishomelandpackage": getText(result.isHomeLandPackage._attributes.value),
            "category-resi": getText(result.category._attributes.name),
            "new-or-established-nopackage": getText(result.newConstruction) == 0 ? "false" : "true",
            "new-or-established-package": getText(result.newConstruction) == 0 ? "false" : "true",
            "lead-agent": "842",
            "dual-agent": "843",
            "authority": getText(result.authority._attributes.value),
            "auction-date": "",
            "set-sale-date": "",
            "price": getText(result.price),
            "price-display": getText(result.priceView) != ""? "yes_" : getText(result.price._attributes.display),
            "priceview": getText(result.priceView),
            "vendor-name": "",
            "vendor-email": "",
            "vendor-phone-number": "",
            "communication-preferences": {
                "receiveCampaignReport": "true"
            },
            "subnumber": getText(result.address.subNumber),
            "streetnumber-rr": getText(result.address.streetNumber),
            "street-rr": getText(result.address.street),
            "suburbstatepostcode": `${getText(result.address.suburb)} - ${getText(result.address.state)} - ${getText(result.address.postcode)}`,
            "municipality": getText(result.municipality._value),
            "streetview": getText(result.address._attributes.streetview),
            "display_address": getText(result.address._attributes.display),
            "bedrooms-resi-nostu": getText(result.features.bedrooms),
            "bedrooms-rr-studio": "Studio",
            "bathrooms": getText(result.features.bathrooms),
            "ensuite": getText(result.features.ensuite),
            "toilets": getText(result.features.toilets),
            "garages": getText(result.features.garages),
            "car": getText(result.features.carports),
            "open-spaces": getText(result.features.openSpaces),
            "livingarea": getText(result.features.livingAreas),
            "house-size": getText(result.buildingDetails.area),
            "house-size-area": getText(result.buildingDetails.area._attributes.unit),
            "land-size": getText(result.landDetails.area),
            "land-size-unit": getText(result.landDetails.area._attributes.unit),
            "energy-efficiency-rating": getText(result.buildingDetails.energyRating),
            "outdoor-features": {
                "Balcony": getText(result.features.balcony) == 0 ? "false" : "true",
                "Courtyard": getText(result.features.courtyard) == 0 ? "false" : "true",
                "Deck": getText(result.features.deck) == 0 ? "false" : "true",
                "Fully Fenced": getText(result.features.fullyFenced) == 0 ? "false" : "true",
                "Outdoor Entertainment Area": getText(result.features.outdoorEnt) == 0 ? "false" : "true",
                "Outside Spa": getText(result.features.outsideSpa) == 0 ? "false" : "true",
                "Remote Garage": getText(result.features.remoteGarage) == 0 ? "false" : "true",
                "Secure Parking": getText(result.features.secureParking) == 0 ? "false" : "true",
                "Shed": getText(result.features.shed) == 0 ? "false" : "true",
                "Swimming Pool - Above Ground": getText(result.features.poolAboveGround) == 0 ? "false" : "true",
                "Swimming Pool - In Ground": getText(result.features.poolInGround) == 0 ? "false" : "true",
                "Tennis Court": getText(result.features.tennisCourt) == 0 ? "false" : "true"
            },
            "indoor-features": {
                "Alarm System": getText(result.features.alarmSystem) == 0 ? "false" : "true",
                "Broadband Internet Available": getText(result.features.broadband) == 0 ? "false" : "true",
                "Built-in Wardrobes": getText(result.features.builtInRobes) == 0 ? "false" : "true",
                "Dishwasher": getText(result.features.dishwasher) == 0 ? "false" : "true",
                "Ducted Vacuum System": getText(result.features.vacuumSystem) == 0 ? "false" : "true",
                "Floorboards": getText(result.features.floorboards) == 0 ? "false" : "true",
                "Gym": getText(result.features.gym) == 0 ? "false" : "true",
                "Inside Spa": getText(result.features.insideSpa) == 0 ? "false" : "true",
                "Intercom": getText(result.features.intercom) == 0 ? "false" : "true",
                "Pay TV Access": getText(result.features.payTV) == 0 ? "false" : "true",
                "Rumpus Room": getText(result.features.rumpusRoom) == 0 ? "false" : "true",
                "Study": getText(result.features.study) == 0 ? "false" : "true",
                "Workshop": getText(result.features.workshop) == 0 ? "false" : "true"
            },
            "heating--cooling": {
                "Air Conditioning": getText(result.features.airConditioning) == 0 ? "false" : "true",
                "Ducted Cooling": getText(result.features.ductedCooling) == 0 ? "false" : "true",
                "Ducted Heating": getText(result.features.ductedHeating) == 0 ? "false" : "true",
                "Evaporative Cooling": getText(result.features.evaporativeCooling) == 0 ? "false" : "true",
                "Gas Heating": getText(result.features.gasHeating) == 0 ? "false" : "true",
                "Hydronic Heating": getText(result.features.hydronicHeating) == 0 ? "false" : "true",
                "Open Fireplace": getText(result.features.openFirePlace) == 0 ? "false" : "true",
                "Reverse Cycle Air Conditioning": getText(result.features.reverseCycleAirCon) == 0 ? "false" : "true",
                "Split-System Air Conditioning": getText(result.features.splitSystemAirCon) == 0 ? "false" : "true",
                "Split-System Heating": getText(result.features.splitSystemHeating) == 0 ? "false" : "true"
            },
            "eco-friendly-features": {
                "Grey Water System": getText(result.ecoFriendly.greyWaterSystem) == 0 ? "false" : "true",
                "Solar Hot Water": getText(result.ecoFriendly.solarHotWater) == 0 ? "false" : "true",
                "Solar Panels": getText(result.ecoFriendly.solarPanels) == 0 ? "false" : "true",
                "Water Tank": getText(result.ecoFriendly.waterTank) == 0 ? "false" : "true"
            },
            "other-features": getText(result.features.otherFeatures),
            "headline": getText(result.headline),
            "description_property": getText(result.description),
            "property-images": [{
                    "id": 898
                },
                {
                    "id": 727,
                    "url": "https://charming-beaver.13-211-217-84.plesk.page/wp-content/uploads/2023/09/08-08-2023-FB-Flyer-Sydney-03-1.jpg"
                },
                {
                    "id": 723,
                    "url": "https://charming-beaver.13-211-217-84.plesk.page/wp-content/uploads/2023/04/cropped-android-chrome-512x512-1.png"
                }
            ],
            "floorplans": "",
            "floorplans-2": "",
            "statement-of-information": "",
            "front-page-image": "",
            "videolink": "http://",
            "online-tour-1": "http://",
            "online-tour-2": "http://"
        }
    }



    res.status(200).json({itemResidential })
})


// router.get('/', (req, res) => {
//     var axios = require('axios')
//     axios.request({
//         baseURL: 'https://charming-beaver.13-211-217-84.plesk.page/wp-json/wp/v2/residential_home/837',
//         // proxy: {
//         //     protocol: 'https',
//         //     host: '127.0.0.1',
//         //     port: 2081
//         // }
//     }).then((res2) => {
//         console.log(res2)
//         res.status(200).json({ msg: "Working" })
//     }).catch(err2 => {
//         console.error({err2})
//     })

// });



module.exports = router;