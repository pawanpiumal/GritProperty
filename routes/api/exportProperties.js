const express = require("express")
var convert = require('xml-js');
const axios = require('axios')
const fs = require('fs')
const https = require('http')
const FormData = require('form-data')
const { v4: uuidv4 } = require('uuid');

const errorFile = require('../../middleware/functions').errorFile
const errorSQL = require('../../middleware/db').errorSQL

const uploadSQL = require('../../middleware/db').uploadSQL

const authenticate = require('../../middleware/functions').authenticate
const router = express.Router()
const config = require('../../config/keys')

const keepRecords = require('../../middleware/db').keepRecords

const mysql = require('mysql2/promise');

const xmlFormat = require('xml-formatter');

getImageURL = async (id) => {
    const url = `${config.WPmainURL}media/${id}`

    var item = ""
    if (id) {
        item = await axios.get(url).catch(err => {
            errorSQL('ExportProperties.js - Get media URL', err)
        })
    }
    return (item.data?.source_url);
}

getZeroOne = (string) => {
    if (string == 'false') {
        return 0
    } else {
        return 1
    }
}

getDateTypes = (date, type) => {
    if (type == 'mod' || type == 'm' || type == "withoutT") {
        return (`${date.split('T')[0]}-${date.split('T')[1]}`)
    } else if (type == "TnoDash") {
        return (date.toISOString().slice(0, 19).replace(/[^0-9T]/g, ""))
    } else if (type == "5") {
        return (`${date.split('T')[0]}-${date.split('T')[1].split(":")[0]}:${(Math.ceil(date.split('T')[1].split(":")[1] / 5) * 5).toString().length == 1 ? '0' + (Math.ceil(date.split('T')[1].split(":")[1] / 5) * 5).toString() : (Math.ceil(date.split('T')[1].split(":")[1] / 5) * 5).toString()}`)
    } else {
        return date
    }
}

getProperty = async (id, type) => {
    id = parseInt(id)

    const url = `${config.WPmainURL}${type}/${id}`
    const rest = await axios.get(url, {
        headers: {
            Authorization: `basic ${config.WPAuthorization}`
        }
    }).catch(err => {
        errorSQL('ExportProperties.js - getExportData', err)
    })


    var data = rest.data.meta

    item = {}


    item['agentID'] = data.agentid
    item['uniqueID'] = data.uniqueid

    if (data['status'] == 'sold') {
        item['soldDetails'] = {
            'soldPrice': {
                '_attributes': {
                    'display': data['show_sale_price']
                },
                '_text': data['sale-price']
            },
            'soldDate': data['sale-date']
        }
    }

    if (data['status'] == 'leased') {
        // item['soldDetails'] = {
        //     'soldPrice': {
        //         '_attributes': {
        //             'display': data['show_sale_price']
        //         },
        //         '_text': data['sale-price']
        //     },
        //     'soldDate': data['sale-date']
        // }
    }
    if (type == "residential_home") {
        item['isHomeLandPackage'] = {
            '_attributes': {
                'value': data.ishomelandpackage == 'true' ? 'yes' : 'no'
            }
        }
    }

    item['authority'] = {
        '_attributes': {
            'value': data.authority
        }
    }

    if (data.authority == "setsale" && data['set-sale-date']) {
        item['setSale'] = {
            '_attributes': {
                'date': getDateTypes(data['set-sale-date'], '5')
            }
        }
    }

    if (data.authority == "auction" && data['auction-date']) {
        item['auction'] = {
            '_attributes': {
                'date': getDateTypes(data['auction-date'], '5')
            }
        }
    }

    if (type == "residential_home" || type == 'residential_land') {
        item['underOffer'] = {
            '_attributes': {
                'value': data.status == 'underoffer' ? 'yes' : 'no'
            }
        }
    }
    if (type == "residential_rental") {
        item['depositTaken'] = {
            '_attributes': {
                'value': data.status == 'deposittaken' ? 'yes' : 'no'
            }
        }
    }

    if (type == 'residential_home' || type == "residential_rental") {
        item['newConstruction'] = getZeroOne(data['new-or-established-nopackage'])
    }

    // var leadAgent = await axios.get(`${config.WPmainURL}agent/${data['lead-agent']}`).catch(err => {
    //     errorSQL('Get lead agent', err)
    // })
    // var dualAgent = ""
    // if (data['dual-agent'] != "" && data['dual-agent'] != data['lead-agent']) {
    //     var dualAgent = await axios.get(`${config.WPmainURL}agent/${data['dual-agent']}`).catch(err => {
    //         errorSQL('Get dual agent', err)
    //     })
    // }

    // leadAgent = leadAgent.data.meta
    // dualAgent = dualAgent.data?.meta.name != "" ? dualAgent.data?.meta : ""

    item['listingAgent'] = []
    if (data['lead-agent'] && data['lead-agent'] != "") {
        item['listingAgent'][0] = {
            '_attributes': {
                'id': 1
            },
            // 'uniqueListingAgentID': leadAgent.uniquelistingagentid,
            'name': data['lead-agent'],
            // 'telephone': {
            //     '_attributes': {
            //         'type': 'mobile'
            //     },
            //     '_text': leadAgent['mobile-number']
            // },
            // 'email': leadAgent.email,
            // 'twitterURL': leadAgent['twitterurl'],
            // 'facebookURL': leadAgent['facebook-url'],
            // 'linkedInURL': leadAgent['linedin-url'],
            // 'media': leadAgent && leadAgent['agent-photo'].length != 0 ? {
            //     'attachment': {
            //         '_attributes': {
            //             'id': 'm',
            //             'url': await getImageURL(leadAgent['agent-photo'][0].id),
            //             'usage': 'agentPhoto'
            //         }
            //     }
            // } : ""
        }
    }

    if (data['dual-agent'] && data['dual-agent'] != "") {
        item['listingAgent'][1] = {
            '_attributes': {
                'id': 2
            },
            // 'uniqueListingAgentID': dualAgent?.uniquelistingagentid,
            'name': data['dual-agent'],
            // 'telephone': {
            //     '_attributes': {
            //         'type': 'mobile'
            //     },
            //     '_text': dualAgent?.['mobile-number'] ? dualAgent?.['mobile-number'] : ""
            // },
            // 'email': dualAgent?.email,
            // 'twitterURL': dualAgent?.['twitterurl'],
            // 'facebookURL': dualAgent?.['facebook-url'],
            // 'linkedInURL': dualAgent?.['linedin-url'],
            // 'media': dualAgent && dualAgent['agent-photo'].length != 0 ? {
            //     'attachment': {
            //         '_attributes': {
            //             'id': 'm',
            //             'url': await getImageURL(dualAgent?.['agent-photo'][0].id),
            //             'usage': 'agentPhoto'
            //         }
            //     }
            // } : ""
        }
    }

    if (type == "residential_home" || type == "residential_land") {
        item['price'] = {
            '_attributes': {
                'display': data['price-display'] != 'no' ? 'yes' : 'no'
            },
            '_text': data.price
        }

        item['priceView'] = data['price-display'] == 'yes_' ? data['priceview'] : ""
    }

    if (type == 'residential_rental') {
        item['rent'] = {
            '_attributes': {
                'period': 'week',
                'display': data['price-display'] != 'no' ? 'yes' : 'no'
            },
            '_text': data['rental-per-week']
        }

        item['bond'] = data['security-bond']

        item['priceView'] = data['price-display'] == 'yes_' ? data['priceview'] : ""

        item['dateAvailable'] = data['date-available']
    }

    if (false && data['vendor-name']) {
        let vendorTele = data['vendor-phone-number']
        let vendorEmail = data['vendor-email']

        vendor = {}
        vendor['name'] = data['vendor-name']
        if (vendorTele) {
            vendor['telephone'] = {
                '_attributes': {
                    'type': 'mobile'
                },
                '_text': vendorTele
            }
        }
        if (vendorEmail) {
            vendor['email'] = {
                '_attributes': {
                    'receiveCampaignReport': data['communication-preferences']?.['receiveCampaignReport'] == "false" ? "no" : "yes"
                },
                '_text': vendorEmail
            }
        }
        item['vendorDetails'] = vendor
    }

    item['address'] = {
        '_attributes': {
            'display': data.display_address
        },
        'subNumber': data.subnumber,
        'lotNumber': data.lotnumber,
        'streetNumber': data['streetnumber-rr'],
        'street': data['street-rr'],
        'suburb': {
            '_attributes': {
                'display': "yes"
            },
            '_text': data.suburbstatepostcode.split(' - ')[0]
        },
        'state': data.suburbstatepostcode.split(' - ')[1],
        'postcode': data.suburbstatepostcode.split(' - ')[2],
        'country': 'AUS'
    }

    item['municipality'] = data['municipality']

    if (type == "residential_home") {
        item['category'] = {
            '_attributes': {
                name: data['category-resi']
            }
        }
    }

    if (type == "residential_rental") {
        item['category'] = {
            '_attributes': {
                name: data['category-rental']
            }
        }
    }

    item['headline'] = data.headline
    item['description'] = data['description_property']

    if (data['statement-of-information']) {
        item['media'] = {
            'attachment': {
                '_attributes': {
                    'id': data['statement-of-information']?.id,
                    'usage': 'statementOfInformation',
                    'modTime': new Date().toISOString().slice(0, 19).replace(/[^0-9T]/g, ""),
                    'url': await getImageURL(data['statement-of-information']?.id)
                }
            }
        }
    }

    objects = {}
    idArray = ['m', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai']
    objects[""] = await Promise.all(idArray.map(async (e, index) => {

        imageURL = await getImageURL(data['property-images'][index]?.id)
        return ({
            'img': {
                '_attributes': {
                    'id': idArray[index],
                    'format': imageURL?.split('.').pop(),
                    'url': imageURL,
                    'modTime': new Date().toISOString().slice(0, 19).replace(/[^0-9T]/g, "")
                }
            }
        })
    }))

    if (data['floorplans'].length != 0) {
        if (data['floorplans-2'].length != 0) {
            let imageData1 = await getImageURL(data['floorplans']?.id)
            let imageData2 = await getImageURL(data['floorplans-2']?.id)
            objects['floorplan'] = [{
                '_attributes': {
                    'id': 1,
                    'modTime': new Date().toISOString().slice(0, 19).replace(/[^0-9T]/g, ""),
                    'url': imageData1,
                    'format': imageData1.toString().split('.').pop()
                }
            }, {
                '_attributes': {
                    'id': 2,
                    'modTime': new Date().toISOString().slice(0, 19).replace(/[^0-9T]/g, ""),
                    'url': imageData2,
                    'format': imageData2.toString().split('.').pop()
                }
            }]
        } else {
            let imageData1 = await getImageURL(data['floorplans']?.id)
            objects['floorplan'] = {
                '_attributes': {
                    'id': 1,
                    'modTime': new Date().toISOString().slice(0, 19).replace(/[^0-9T]/g, ""),
                    'url': imageData1,
                    'format': imageData1.toString().split('.').pop()
                }
            }
        }
    }

    item['objects'] = objects

    if (type == "residential_home" || type == "residential_rental") {
        item['features'] = {
            'otherFeatures': data['other-features'] != "" ? data['other-features'] : 0,
            'bedrooms': ((data['category-resi'] && data['category-resi'] == "Studio") || (data['category-rental'] && data['category-rental'] == "Studio")) ? "Studio" : data['bedrooms-resi-nostu'],
            'bathrooms': data['bathrooms'],
            'ensuite': data['ensuite'],
            'garages': data['garages'],
            'carports': data['car'],
            'openSpaces': data['open-spaces'],
            'toilets': data['toilets'],
            'livingAreas': data['livingarea'],
            'remoteGarage': getZeroOne(data['outdoor-features']['Remote Garage']),
            'secureParking': getZeroOne(data['outdoor-features']['Secure Parking']),
            'balcony': getZeroOne(data['outdoor-features']['Balcony']),
            'deck': getZeroOne(data['outdoor-features']['Deck']),
            'courtyard': getZeroOne(data['outdoor-features']['Courtyard']),
            'outdoorEnt': getZeroOne(data['outdoor-features']['Outdoor Entertainment Area']),
            'shed': getZeroOne(data['outdoor-features']['Shed']),
            'fullyFenced': getZeroOne(data['outdoor-features']['Fully Fenced']),
            // 'spa':'',
            'insideSpa': getZeroOne(data['indoor-features']['Inside Spa']),
            'outsideSpa': getZeroOne(data['outdoor-features']['Outside Spa']),
            'study': getZeroOne(data['indoor-features']['Study']),
            'gasHeating': getZeroOne(data['heating--cooling']['Gas Heating']),
            'workshop': getZeroOne(data['indoor-features']['Workshop']),
            'splitSystemHeating': getZeroOne(data['heating--cooling']['Split-System Heating']),
            'floorboards': getZeroOne(data['indoor-features']['Floorboards']),
            'splitSystemAirCon': getZeroOne(data['heating--cooling']['Split-System Air Conditioning']),
            'evaporativeCooling': getZeroOne(data['heating--cooling']['Evaporative Cooling']),
            'gym': getZeroOne(data['indoor-features']['Gym']),
            'broadband': getZeroOne(data['indoor-features']['Broadband Internet Available']),
            'builtInRobes': getZeroOne(data['indoor-features']['Built-in Wardrobes']),
            'hydronicHeating': getZeroOne(data['heating--cooling']['Hydronic Heating']),
            'payTV': getZeroOne(data['indoor-features']['Pay TV Access']),
            'dishwasher': getZeroOne(data['indoor-features']['Dishwasher']),
            'ductedHeating': getZeroOne(data['heating--cooling']['Ducted Heating']),
            'ductedCooling': getZeroOne(data['heating--cooling']['Ducted Cooling']),
            'reverseCycleAirCon': getZeroOne(data['heating--cooling']['Reverse Cycle Air Conditioning']),
            'rumpusRoom': getZeroOne(data['indoor-features']['Rumpus Room']),
            'airConditioning': getZeroOne(data['heating--cooling']['Air Conditioning']),
            'openFirePlace': getZeroOne(data['heating--cooling']['Open Fireplace']),
            'alarmSystem': getZeroOne(data['indoor-features']['Alarm System']),
            'vacuumSystem': getZeroOne(data['indoor-features']['Ducted Vacuum System']),
            'intercom': getZeroOne(data['indoor-features']['Intercom']),
            'poolAboveGround': getZeroOne(data['outdoor-features']['Swimming Pool - Above Ground']),
            'poolInGround': getZeroOne(data['outdoor-features']['Swimming Pool - In Ground']),
            'tennisCourt': getZeroOne(data['outdoor-features']['Tennis Court']),
        }
        item['ecoFriendly'] = {
            'solarPanels': getZeroOne(data['eco-friendly-features']['Solar Panels']),
            'solarHotWater': getZeroOne(data['eco-friendly-features']['Solar Hot Water']),
            'waterTank': getZeroOne(data['eco-friendly-features']['Water Tank']),
            'greyWaterSystem': getZeroOne(data['eco-friendly-features']['Grey Water System']),
        }
    }

    if (type == "residential_rental") {
        item['allowances'] = {
            'petFriendly': data['allowances']['Pet Friendly'] == "false" ? false : true,
            'smokers': data['allowances']['Smokers'] == "false" ? false : true,
            'furnished': data['allowances']['Furnished'] == "false" ? false : true,
        }
    }

    item['externalLink'] = [{
        '_attributes': data['online-tour-1'].length != 0 ? {
            'href': data['online-tour-1']
        } : ""
    }, {
        '_attributes': data['online-tour-2'].length != 0 ? {
            'href': data['online-tour-2']
        } : ""
    }]

    item['videoLink'] = data['videolink'] != "" ? {
        '_attributes': {
            'href': data['videolink']
        }
    } : ""

    item['landDetails'] = {
        'area': {
            '_attributes': {
                'unit': data['land-size-unit']
            },
            '_text': data['land-size']
        }
    }

    if (type == "residential_home" || type == "residential_rental") {
        item['buildingDetails'] = {
            'area': {
                '_attributes': {
                    'unit': data['house-size-area']
                },
                '_text': data['house-size']
            },
            'energyRating': data['energy-efficiency-rating']
        }

    }

    if (data['auction-result'] && data['auction-result'] != "") {
        item['auctionOutcome'] = {
            'auctionResult': {
                "_attributes": {
                    'type': data['auction-result']
                }
            },
            'auctionDate': getDateTypes(data['auction-date_prior'], '5'),
            'auctionMaxBid': {
                '_attributes': {
                    'value': data['maximum-bid']
                }
            }

        }
    }

    if (type == "residential_land") {
        item['landCategory'] = {
            '_attributes': {
                'name': 'Residential'
            }
        }

        item['features'] = {
            'fullyFenced': getZeroOne(data['outdoor-features']['Fully Fenced']),
        }

        item['landDetails'] = {
            'area': {
                '_attributes': {
                    'unit': 'squareMeter'
                },
                '_text': parseFloat(data['land-size-sqm'])
            },
            'frontage': {
                '_attributes': {
                    'unit': 'meter',
                },
                '_text': data['frontage-m']
            },
            'depth': [{
                '_attributes': {
                    'unit': 'meter',
                    'side': 'rear'
                },
                '_text': data['rear-depth-m']
            },
            {
                '_attributes': {
                    'unit': 'meter',
                    'side': 'left'
                },
                '_text': data['left-depth-m']
            },
            {
                '_attributes': {
                    'unit': 'meter',
                    'side': 'right'
                },
                '_text': data['right-depth-m']
            }],
            'crossOver': {
                '_attributes': {
                    'value': data['cross-over']
                }
            },
        }

    }



    innerItem = {}
    if (type == 'residential_home') {
        innerItem['residential'] = {
            '_attributes': {
                "modTime": `${rest.data.modified.split('T')[0]}-${rest.data.modified.split('T')[1]}`,
                "status": data.status != 'underoffer' ? data.status : 'current',
            },
            "": item
        }
    } else if (type == "residential_rental") {
        innerItem['rental'] = {
            '_attributes': {
                "modTime": `${rest.data.modified.split('T')[0]}-${rest.data.modified.split('T')[1]}`,
                "status": data.status != 'deposittaken' ? data.status : 'current',
            },
            "": item
        }
    } else if (type == 'residential_land') {
        innerItem['land'] = {
            '_attributes': {
                "modTime": `${rest.data.modified.split('T')[0]}-${rest.data.modified.split('T')[1]}`,
                "status": data.status != 'underoffer' ? data.status : 'current',
            },
            "": item
        }
    }
    outerItem = {
        'propertyList': {
            '_attributes': {
                'date': `${rest.data.modified.split('T')[0]}-${rest.data.modified.split('T')[1]}`
            },
            "": innerItem
        }
    }

    return (convert.json2xml(outerItem, { compact: true }))
}

getReaAccessToken = async () => {
    let data = new FormData();
    data.append('grant_type', 'client_credentials');

    var token = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: config.reaTokenURL,
        headers: {
            'Authorization': config.clientAuth,
            ...data.getHeaders()
        },
        data: data
    }).catch((error) => {
        errorSQL('ExportProperties.js - Getting Access Token fro REA', error)
    });

    return (token.data.access_token)
}

/**
 * @api {post} api/exportproperty/export Export Property to Realestate.com.au
 * @apiName export
 * @apiGroup Export
 * 
 * @apiUse Authorization
 * @apiBody {Number} post_id The wordpress post ID that needs to be exported.
 * @apiBody {String="Residential_Home","Residential_Rental","Residential_Land"} post_type Property type of the property that needs to be exportd.
 * @apiBody {String="true","false"} publish Whether to publish the property to Realestate site or not.
 * @apiUse StatusMsg
 * @apiUse ErrorStatusMsg
 * @apiSuccess {string} uploadId UploadId from realestate.com.au which is used to track the upload progress.
 */


router.post('/export', keepRecords, async (req, res) => {
    if (req.body.publish != "true") {
        return res.status(200).json({ status: "Successful", msg: "Did not published in Realestate.com.au." })
    } else {

        try {
            const propertyItem = await getProperty(req.body.post_id, req.body.post_type)

            await axios.request({
                method: 'post',
                maxBodyLength: Infinity,
                url: config.reaPublishURL,
                headers: {
                    'Content-Type': 'text/xml',
                    'Authorization': `Bearer ${await getReaAccessToken()}`
                },
                data: `${propertyItem}`
            }).then(result => {
                // errorSQL('REA Result', result.data)
                uploadSQL(req.body.post_id, req.body.post_type, result.data.uploadId, propertyItem)
                return res.status(200).json({ status: "Successful", msg: "Uploaded to realestate.com.au", uploadId: result.data.uploadId })

            }).catch((error) => {
                errorSQL('ExportProperties.js - Publishing the property.', error)
                return res.status(400).json({ status: "Unsuccessful", msg: "Error occured while uploading the property to realestate.com.au" })
            });

        } catch (err) {
            await errorSQL('ExportProperties.js - Creating the XML object.', err.stack)
            return res.status(400).json({ status: "Unsuccessful", msg: "Error in getting the property from wordpress to XML object." })
        }

    }

})

/**
 * @api {get} api/exportproperty Check if the ExportProperty API is working
 * @apiName CheckExport
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */

router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Export API is working" })
})


/**
 * @api {get} api/exportproperty/uploaddetails?uploadid=:uploadid Get upload details using the uploadid from realestate.com.au
 * @apiName uploadDetails
 * @apiGroup Export
 * 
 * @apiUse Authorization
 * 
 * @apiquery {Number} uploadid The uploadId from realestate.com.au
 * 
 * @apiUse StatusMsg
 * @apiUse ErrorStatusMsg
 * @apiSuccess {Object} result Result JSON from realestate.com.au
 */

router.get('/uploaddetails', async (req, res) => {
    if (!req.query.uploadid) {
        return res.status(400).json({ status: "Unsuccessful.", msg: "Upload ID is not specified." })
    }

    await axios.request({
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${config.reaPublishURL}/${req.query.uploadid}`,
        headers: {
            'Authorization': `Bearer ${await getReaAccessToken()}`
        }
    }).then(result => {
        res.status(200).json({ status: "Successful", msg: "Results are attached.", result: result.data })

    }).catch((error) => {
        errorSQL('ExportProperties.js - Getting the upload details.', error)
        res.status(400).json({ status: "Unsuccessful", msg: "Error getting the upload details." })
    });
})

// Create mySQL Connection
const db = require('../../config/keys');

/**
 * @api {get} api/exportproperty/uploadSQL?limit=:limit Get the upload details in the SQL database
 * @apiName GetUploadsSQL
 * @apiGroup Export
 * 
 * @apiQuery {Number} limit Number of upload details required from the database.
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiSuccess {Object} rows The upload details are attached in JSON format.
 *  
 * @apiUse ErrorStatusMsg
 */

router.get('/uploadSQL', authenticate, async (req, res) => {
    var connection = await mysql.createConnection({
        port: db.port,
        user: db.username,
        password: db.password,
        host: db.host,
        database: db.db
    });

    if (req.query.limit) {
        limit = parseInt(req.query.limit)
    } else {
        limit = 1000
    }

    const [rows, fields] = await connection.execute(`SELECT * FROM uploads ORDER BY time DESC LIMIT 0,${limit}`).catch(err => {
        if (err) {
            // console.log({ err });
            errorSQL("ExportProperties.js - SQL SELECT for Uploads.", JSON.stringify(error))
            res.status(400).json({ status: "Unsuccessful", msg: "Error reading data from the database." })
        }
    })

    connection.end()

    res.status(200).json({ status: "Successful", msg: "Uploads are attached.", rows })

})



module.exports = router;