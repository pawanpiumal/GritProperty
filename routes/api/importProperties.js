const express = require("express")
var convert = require('xml-js');
const axios = require('axios')
const fs = require('fs')
const https = require('http')
const FormData = require('form-data')
const { v4: uuidv4 } = require('uuid');

const errorFile = require('../../middleware/functions').errorFile
const errorSQL = require('../../middleware/db').errorSQL
const importSQL = require('../../middleware/db').importSQL
const authenticate = require('../../middleware/functions').authenticate
const router = express.Router()
const config = require('../../config/keys')

const keepRecords = require('../../middleware/db').keepRecords

const timeSplitString = (value, type) => {
    if (value != "") {
        if (type == "date") {
            return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
        } else if (type == "datetime") {
            return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8) + "T" + value.slice(9, 11) + ":" + value.slice(11, 13);
        } else {
            return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8) + "T" + value.slice(9, 11) + ":" + value.slice(11, 13) + ":" + value.slice(13, 15);
        }
    } else {
        return ""
    }
}

const getText = (value) => {
    if (value == undefined) {
        return ""
    }
    if (typeof value == "string") {
        if (value == undefined) {
            return ""
        } else {
            return value
        };
    }
    for (var x in value) {
        // return value[Object.keys(value)[0]]; 
        return value._text;
    }
    return "";
}

const isEmptyJson = (json) => {
    for (var i in json) return false;
    return true;
}

/*
var imageDatabase = []
const updateImageDatabase = async () => {
    var url = `${config.WPmediaURL}/?per_page=100`

    var fileList = []
    var max_pages = 5
    var breakLoop = false;
    for (let index = 1; index < max_pages; index++) {
        var listRes = await axios.get(`${url}&page=${index}`).catch(err => {
            if (err.response?.data?.code != "rest_post_invalid_page_number") {
                errorSQL("Checking List of Media", err)
            }
            breakLoop = true
        })
        if (breakLoop) { break; }
        max_pages = max_pages + 1
        listRes.data.map(element => {
            var file = {
                id: element.id,
                original_image_name: element.title.rendered
            }
            fileList.push(file)
        })


    }
    imageDatabase = fileList
}

*/

// updateImageDatabase()


const checkAvailabilityFile = async (filename) => {
    var url = `${config.WPmediaURL}`
    filename = filename.split('.')[0]
    var listRes = await axios.get(`${url}/?search=${filename}`).catch(err => {
        if (err.response?.data?.code != "rest_post_invalid_page_number") {
            errorSQL("ImportProperties.js - Checking List of Media", err)
        }
    })

    listRes.data.forEach(async e => {
        var deleteURL = `${url}/${e.id}?force=true`
        await axios.delete(deleteURL, {
            headers: {
                'Authorization': `Basic ${config.WPAuthorization}`
            }
        }).catch(err2 => {
            errorSQL("ImportProperties.js - Delete existing media", err2)
        })
    })
}

// https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
const downloadFile = async (fileUrl, filename) => {
    // var fileExt = url.split('.').pop()
    // const file = fs.createWriteStream('downloads/'+filename+'.'+fileExt);
    // var filename = fileUrl.split('/').pop()
    const writer = fs.createWriteStream('downloads/' + filename);

    return axios.request({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {

        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    });
}

const uploadFile = async (filename) => {
    const reader = await fs.createReadStream('downloads/' + filename);

    const form = new FormData();
    form.append('file', reader);

    const request_config = {
        headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            'Authorization': `Basic ${config.WPAuthorization}`,
            // ...form.getHeaders()
        }
    };
    await axios.postForm(`${config.WPmediaURL}`, form, request_config).then(res => {
        file = {
            id: res.data.id,
            url: res.data.link
        }
    }).catch(err => {
        console.error(err)
        errorSQL("ImportProperties.js - Upload Image to WP", err)
    })
    return (file)
}

const deleteFile = (filename) => {
    fs.rename('downloads/' + filename, 'downloads/trash/' + filename, err => {
        errorSQL("ImportProperties.js - Move file to trash", err)
    })
}

const path = require("path");


const deleteFileOn24Interval = () => {
    fs.readdir('downloads/trash', (err, files) => {
        if (err) {
            errorSQL('ImportProperties.js - Deleting files at midnight', err)
        }

        for (const file of files) {
            fs.unlink(path.join('downloads/trash', file), (err) => {
                if (err) {
                    errorSQL('ImportProperties.js - Deleting files at midnight', err)
                }
            });
        }

    })
}

setInterval(deleteFileOn24Interval, 1000 * 60 * 60 * 24)


const fileOperation = async (url, filename = "") => {
    if (url != "") {
        var filename = filename == "" ? url.split('/').pop() : filename + '.' + url.split('.').pop()
        await checkAvailabilityFile(filename)
        // await updateImageDatabase()
        await downloadFile(url, filename)
        var file = await uploadFile(filename)
        deleteFile(filename)
        // await updateImageDatabase()
        return file;
    } else {
        return ""
    }
}

const checkList = async (type, uniqueidToCheck) => {
    var url = config.WPmainURL + type + '?status=any&per_page=100'

    var maxPages = 5
    var postList = []
    var breakLoop = false

    for (let index = 1; index < maxPages; index++) {
        listRes = await axios.get(`${url}&page=${index}`, {
            headers: {
                "Authorization": `basic ${config.WPAuthorization}`
            }
        }).catch(err => {
            if (err.response.data.code != "rest_post_invalid_page_number") {
                errorSQL("ImportProperties.js - Checking List of Posts", err)
            }
            breakLoop = true
        })

        if (breakLoop) { break }
        listRes.data.forEach(element => {
            postList.push({
                id: element.id,
                uniqueid: element.meta.uniqueid
            })
        })

        if (index == 1 && postList.length == 0) { break }
        maxPages = maxPages + 1
    }


    var postId = ""
    for (let index = 0; index < postList.length; index++) {
        const element = postList[index];

        if (element.uniqueid == uniqueidToCheck) {
            postId = element.id
            break
        }
    }
    return (postId);
}
/*
const CreateAgent = async (Agent) => {

    var geturl = `${config.WPmainURL}agent/?status=any&per_page=100&`
    var agentList = []

    var max_pages = 2
    var breakLoop = false
    for (let index = 1; index < max_pages; index++) {
        await axios.get(`${geturl}page=${index}`, {
            headers: {
                authorization: `basic ${config.WPAuthorization}`
            }
        }).then(res => {
            res.data.forEach(e => {
                agentList.push({
                    id: e.id,
                    name: e.meta.name,
                    unique: e.meta.uniquelistingagentid
                })
            })
        }).catch(err => {
            if (err.response.data.code != "rest_post_invalid_page_number") {
                errorSQL("Checking List of Posts", err)
            }
            breakLoop = true
        })
        if (breakLoop) { break }
        if (index == 1 && agentList.length == 0) { break }
        max_pages = max_pages + 1
    }

    var unique = getText(Agent.uniquelistingagentid)
    var name = getText(Agent.name)
    // var telephone = getText(Agent.telephone)
    // var email = getText(Agent.email)
    // var twitter = getText(Agent.twitterURL)
    // var facebook = getText(Agent.facebookURL)
    // var linkedIn = getText(Agent.linkedInURL)
    // var media = getText(Agent.media?.attachment?._attributes?.url)

    var AgentID = ""
    agentList.forEach(e => {
        if (e.unique == unique || e.name == name) {
            AgentID = e.id
            unique = e.uniquelistingagentid
        }
    })
    // if (AgentID != "") { return AgentID }

    unique = (unique && unique != "") ? unique : uuidv4()

    // media = (media && media != "") ? await fileOperation(media, unique) : ""
    var item = {
        title: name,
        status: "publish",
        meta: {
            'uniquelistingagentid': unique,
            'name': name,
            // 'mobile-number': telephone,
            // 'email': email,
            // 'twitterurl': twitter,
            // 'facebook-url': facebook,
            // 'linkedin-url': linkedIn,
            // 'agent-photo': [{ id: media }]
        }
    }
    const postURL = `${config.WPmainURL}agent/${AgentID}`
    var agentID = ""
    await axios.post(postURL, JSON.stringify(item), {
        headers: {
            'Content-Type': 'application/json',
            authorization: `basic ${config.WPAuthorization}`
        }
    }).then(res2 => {
        agentID = res2.data.id;
    }).catch(err => {
        errorSQL("Upload/Update Agent", err)
        agentID = ""
    })
    return (agentID);
}
*/

postProperty = async (result, type, reqStatus = "draft") => {

    if (type == 'residential') {
        type = 'residential_home'
    } else if (type == 'rental') {
        type = 'residential_rental'
    } else if (type == 'land') {
        type = 'residential_land'
    }

    var resultImgArray = result.objects?.img

    var idArray = ['m', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai']

    var featuredImageId = 0

    if (resultImgArray) {
        if (Array.isArray(resultImgArray)) {
            var imagesArray = await Promise.all(resultImgArray.map(async (element, index) => {
                var file = await fileOperation(getText(element._attributes?.url), `${getText(result.uniqueID)}-${idArray[index]}`)
                return file
            }))
        } else {
            var imagesArray = [await fileOperation(getText(resultImgArray._attributes?.url), `${getText(result.uniqueID)}-${idArray[0]}`)]
        }
        featuredImageId = imagesArray[0].id
    } else {
        var imagesArray = ""
    }



    var statementOfInformationID = await fileOperation(getText(result.media?.attachment?._attributes?.url), `${getText(result.uniqueID)}-SOI`)
    statementOfInformationID = statementOfInformationID.id

    var resultFloorPlanArray = result.objects?.floorplan
    if (resultFloorPlanArray) {
        if (Array.isArray(resultFloorPlanArray)) {
            var floorplans1ID = await fileOperation(getText(resultFloorPlanArray[0]._attributes?.url), `${getText(result.uniqueID)}-Floorplan1`)
            var floorplans2ID = await fileOperation(getText(resultFloorPlanArray[1]._attributes?.url), `${getText(result.uniqueID)}-Floorplan2`)
        } else {
            var floorplans1ID = await fileOperation(getText(resultFloorPlanArray._attributes?.url), `${getText(result.uniqueID)}-Floorplan1`)
            var floorplans2ID = ""
        }
    } else {
        var floorplans1ID = ""
        var floorplans2ID = ""
    }

    var externalLinkArray = result.externalLink
    if (externalLinkArray) {
        if (Array.isArray(externalLinkArray)) {
            var externalLink1 = getText(externalLinkArray[0]._attributes?.href)
            var externalLink2 = getText(externalLinkArray[1]._attributes?.href)
        } else {
            var externalLink1 = getText(externalLinkArray[0]._attributes?.href)
            var externalLink2 = ""
        }
    } else {
        var externalLink1 = ""
        var externalLink2 = ""
    }

    var AgentArray = result.listingAgent
    if (AgentArray) {
        if (Array.isArray(AgentArray)) {
            var leadAgentID = getText(AgentArray[0].name)
            var dualAgentID = getText(AgentArray[1].name)
        } else {
            var leadAgentID = getText(AgentArray.name)
            var dualAgentID = ""
        }
    } else {
        var leadAgentID = ""
        var dualAgentID = ""
    }

    // var imagesArray = []
    // var statementOfInformationID = ""

    item = {
        "title": {
            "raw": getText(result.headline)
        },
        "status": reqStatus,
        "featured_media":featuredImageId,
        "meta": {
            "mod-time": timeSplitString(result._attributes?.modTime),
            "uniqueid": getText(result.uniqueID),
            "agentid": getText(result.agentID),
            "listing-id": getText(result.listingId),
            "new-or-old-post": "Old",
            "status": getText(result.underOffer?._attributes?.value) == "yes" ? "Under Offer" : (getText(result.depositTaken?._attributes?.value) == "yes" ? "DepositTaken" : getText(result._attributes?.status)),

            "sale-price": getText(result.soldDetails?.soldPrice),
            "show_sale_price": getText(result.soldDetails?.soldPrice?._attributes?.display),
            "sale-date": timeSplitString(getText(result.soldDetails?.soldDate), "date"),
            'leased-date': timeSplitString(getText(result._attributes?.modTime), "date"),

            "ishomelandpackage": getText(result.isHomeLandPackage?._attributes?.value),
            "category-resi": getText(result.category?._attributes?.name),
            "category-rental": getText(result.category?._attributes?.name),

            "new-or-established-nopackage": getText(result.newConstruction) == 0 ? "false" : "true",
            "new-or-established-package": getText(result.newConstruction) == 0 ? "false" : "true",

            "lead-agent": leadAgentID,
            "dual-agent": dualAgentID,

            "rental-per-week": getText(result.rent),
            "rental-per-calendar-month": "",
            "security-bond": getText(result.bond),

            "authority": getText(result.authority?._attributes?.value),
            "auction-date": getText(result.auction?._attributes?.date),
            "set-sale-date": getText(result.setSale?._attributes?.date),

            "price": getText(result.price),
            "price-display": !isEmptyJson(getText(result.priceView)) ? "yes_" : getText(result.price?._attributes?.display) != "" ? getText(result.price?._attributes?.display) : getText(result.rent?._attributes?.display),
            "priceview": getText(result.priceView),

            "date-available": getText(result.dateAvailable) != "" ? getText(result.dateAvailable).slice(0, 10) : "",

            "vendor-name": getText(result.vendorDetails?.name),
            "vendor-email": getText(result.vendorDetails?.email),
            "vendor-phone-number": getText(result.vendorDetails?.telephone),
            "communication-preferences": {
                "receiveCampaignReport": getText(result.vendorDetails?.email?._attributes?.receiveCampaignReport) == "" ? "yes" : getText(result.vendorDetails?.email?._attributes?.receiveCampaignReport),
            },

            "subnumber": getText(result.address?.subNumber),
            "lotnumber": getText(result.address?.lotNumber),
            "streetnumber-rr": getText(result.address?.streetNumber),
            "street-rr": getText(result.address?.street),
            "suburbstatepostcode": `${getText(result.address?.suburb)} - ${getText(result.address?.state)} - ${getText(result.address?.postcode)}`,
            "municipality": getText(result.municipality),
            "streetview": getText(result.address?._attributes?.streetview),
            "display_address": getText(result.address?._attributes?.display),

            "auction-result": getText(result.auctionOutcome?.auctionResult?._attributes?.type),
            "auction-date_prior": getText(result.auctionOutcome?.auctionDate),
            "maximum-bid": getText(result.auctionOutcome?.auctionMaxBid?._attributes?.value),
            "maximum-bid_passedin": getText(result.auctionOutcome?.auctionMaxBid?._attributes?.value),

            "bedrooms-resi-nostu": getText(result.features?.bedrooms),
            "bedrooms-rr-studio": "Studio",
            "bathrooms": getText(result.features?.bathrooms),
            "ensuite": getText(result.features?.ensuite),
            "toilets": getText(result.features?.toilets),
            "garages": getText(result.features?.garages),
            "car": getText(result.features?.carports),
            "open-spaces": getText(result.features?.openSpaces),
            "livingarea": getText(result.features?.livingAreas),
            "house-size": getText(result.buildingDetails?.area),
            "house-size-area": getText(result.buildingDetails?.area?._attributes?.unit),
            "land-size": getText(result.landDetails?.area),
            "land-size-unit": getText(result.landDetails?.area?._attributes?.unit),
            "energy-efficiency-rating": getText(result.buildingDetails?.energyRating),

            "land-size-sqm": getText(result.landDetails?.area),
            "cross-over": getText(result.landDetails?.crossOver?._attributes?.value),
            "frontage-m": getText(result.landDetails?.frontage),

            "rear-depth-m": getText(result.landDetails?.depth?.filter(e => e._attributes?.side == 'rear')[0]),
            "right-depth-m": getText(result.landDetails?.depth?.filter(e => e._attributes?.side == 'right')[0]),
            "left-depth-m": getText(result.landDetails?.depth?.filter(e => e._attributes?.side == 'left')[0]),


            "allowances": {
                "Furnished": getText(result.allowances?.furnished),
                "Pet Friendly": getText(result.allowances?.petFriendly),
                "Smokers": getText(result.allowances?.smokers),
            },
            "outdoor-features": {
                "Balcony": getText(result.features?.balcony) == 0 ? "false" : "true",
                "Courtyard": getText(result.features?.courtyard) == 0 ? "false" : "true",
                "Deck": getText(result.features?.deck) == 0 ? "false" : "true",
                "Fully Fenced": getText(result.features?.fullyFenced) == 0 ? "false" : "true",
                "Outdoor Entertainment Area": getText(result.features?.outdoorEnt) == 0 ? "false" : "true",
                "Outside Spa": getText(result.features?.outsideSpa) == 0 ? "false" : "true",
                "Remote Garage": getText(result.features?.remoteGarage) == 0 ? "false" : "true",
                "Secure Parking": getText(result.features?.secureParking) == 0 ? "false" : "true",
                "Shed": getText(result.features?.shed) == 0 ? "false" : "true",
                "Swimming Pool - Above Ground": getText(result.features?.poolAboveGround) == 0 ? "false" : "true",
                "Swimming Pool - In Ground": getText(result.features?.poolInGround) == 0 ? "false" : "true",
                "Tennis Court": getText(result.features?.tennisCourt) == 0 ? "false" : "true"
            },
            "indoor-features": {
                "Alarm System": getText(result.features?.alarmSystem) == 0 ? "false" : "true",
                "Broadband Internet Available": getText(result.features?.broadband) == 0 ? "false" : "true",
                "Built-in Wardrobes": getText(result.features?.builtInRobes) == 0 ? "false" : "true",
                "Dishwasher": getText(result.features?.dishwasher) == 0 ? "false" : "true",
                "Ducted Vacuum System": getText(result.features?.vacuumSystem) == 0 ? "false" : "true",
                "Floorboards": getText(result.features?.floorboards) == 0 ? "false" : "true",
                "Gym": getText(result.features?.gym) == 0 ? "false" : "true",
                "Inside Spa": getText(result.features?.insideSpa) == 0 ? "false" : "true",
                "Intercom": getText(result.features?.intercom) == 0 ? "false" : "true",
                "Pay TV Access": getText(result.features?.payTV) == 0 ? "false" : "true",
                "Rumpus Room": getText(result.features?.rumpusRoom) == 0 ? "false" : "true",
                "Study": getText(result.features?.study) == 0 ? "false" : "true",
                "Workshop": getText(result.features?.workshop) == 0 ? "false" : "true"
            },
            "heating--cooling": {
                "Air Conditioning": getText(result.features?.airConditioning) == 0 ? "false" : "true",
                "Ducted Cooling": getText(result.features?.ductedCooling) == 0 ? "false" : "true",
                "Ducted Heating": getText(result.features?.ductedHeating) == 0 ? "false" : "true",
                "Evaporative Cooling": getText(result.features?.evaporativeCooling) == 0 ? "false" : "true",
                "Gas Heating": getText(result.features?.gasHeating) == 0 ? "false" : "true",
                "Hydronic Heating": getText(result.features?.hydronicHeating) == 0 ? "false" : "true",
                "Open Fireplace": getText(result.features?.openFirePlace) == 0 ? "false" : "true",
                "Reverse Cycle Air Conditioning": getText(result.features?.reverseCycleAirCon) == 0 ? "false" : "true",
                "Split-System Air Conditioning": getText(result.features?.splitSystemAirCon) == 0 ? "false" : "true",
                "Split-System Heating": getText(result.features?.splitSystemHeating) == 0 ? "false" : "true"
            },
            "eco-friendly-features": {
                "Grey Water System": getText(result.ecoFriendly?.greyWaterSystem) == 0 ? "false" : "true",
                "Solar Hot Water": getText(result.ecoFriendly?.solarHotWater) == 0 ? "false" : "true",
                "Solar Panels": getText(result.ecoFriendly?.solarPanels) == 0 ? "false" : "true",
                "Water Tank": getText(result.ecoFriendly?.waterTank) == 0 ? "false" : "true"
            },
            "other-features": getText(result.features?.otherFeatures),

            "headline": getText(result.headline),
            "description_property": getText(result.description),

            "property-images": imagesArray,
            "floorplans": floorplans1ID,
            "floorplans-2": floorplans2ID,
            "statement-of-information": statementOfInformationID != "" ? [{ id: statementOfInformationID }] : "",
            "front-page-image": "",

            "videolink": getText(result.videoLink?._attributes?.href),
            "online-tour-1": externalLink1,
            "online-tour-2": externalLink2
        }
    }

    let data = JSON.stringify(item);
    let postId = await checkList(type, item.meta.uniqueid)
    let restURL = `${config.WPmainURL}${type}/${postId != "" ? postId : ""}`
    let configReq = {
        method: 'post',
        maxBodyLength: Infinity,
        url: restURL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${config.WPAuthorization}`
        },
        data: data
    };

    await axios.request(configReq).then(res => {
    }).catch((error) => {
        errorSQL("ImportProperties.js - Upload Property", error)
    });

    importSQL(result, item)
    return ([result, item])
}

/**
 * @api {get} api/postproperty Upload property to wordpress.
 * @apiName import
 * @apiGroup Import
 * 
 * @apiUse Authorization
 * 
 * @apiHeader {String} Content-Type application/xml is required for this request.
 * @apiBody {String} Body XML object
 * 
 * @apiUse StatusMsg
 * @apiUse ErrorStatusMsg
 * @apiSuccess {Object} result The resulting JSON object when XML input is parsed.
 */


router.post('/', keepRecords, authenticate, async (req, res) => {
    console.log({ "msg": "Request Recievied" });

    if (!req.rawBody || req.rawBody == "") {
        return (res.status(400).json({ status: "Unsuccessful", msg: "XML is not provided." }))
    }
    try {
        var result = JSON.parse(convert.xml2json(req.rawBody, { compact: true }))
    } catch (err) {
        errorSQL("ImportProperties.js - Import Parsing the XML to JSON.", err)
        return res.status(400).json({ status: "Unsuccessful", msg: "Invalid XML object." })
    }

    var type = Object.keys(result)[0]

    if (type != "propertyList" || (result.propertyList && Object.keys(result.propertyList).length == 1 && !Array.isArray(result.propertyList[Object.keys(result.propertyList)[0]]))) {
        try {
            await postProperty(result[Object.keys(result)[0]], type, req.query.status)
            res.status(200).json({ status: "Successful", msg: "Property Uploaded.", result })
        } catch (err) {
            errorSQL("ImportProperties.js - Uploading Property Try Catch 1 (No Property List/ Single Object)", err)
            res.status(400).json({ status: "Unsuccessful", msg: "Error uploading the property." })
        }
    } else if (type == "propertyList" && result.propertyList && Object.keys(result.propertyList).length == 1 && Array.isArray(result.propertyList[Object.keys(result.propertyList)[0]])) {
        try {
            resultArray = result.propertyList[Object.keys(result.propertyList)[0]]

            await Promise.all(await resultArray.map(e => {
                return (postProperty(e, Object.keys(result.propertyList)[0], req.query.status))
            }))

            res.status(200).json({ status: "Successful", msg: "Property Uploaded.", result })
        } catch (err) {
            errorSQL("ImportProperties.js - Uploading Property Try Catch 2 (Property List/ Single Type/ Multiple objects)", err)
            res.status(400).json({ status: "Unsuccessful", msg: "Error uploading the property." })
        }
    } else if (type == "propertyList" && result.propertyList && Object.keys(result.propertyList).length != 1) {
        try {
            typeArr = Object.keys(result.propertyList)
            await Promise.all(typeArr.map(e => {
                if (!Array.isArray(result.propertyList[e])) {
                    item = result.propertyList[e]
                    return (postProperty(item, e, req.query.status))
                } else {
                    Promise.all(result.propertyList[e].map(async e2 => {
                        return (await postProperty(e2, e, req.query.status))
                    }))
                }
            }))
            res.status(200).json({ status: "Successful", msg: "Property Uploaded.", result })
        } catch (err) {
            errorSQL("ImportProperties.js - Uploading Property Try Catch 3 (Property List/ Multiple Types)", err)
            res.status(400).json({ status: "Unsuccessful", msg: "Error uploading the property." })
        }
    } else {
        res.status(400).json({ status: "Unsuccessful", msg: "Invalid XML provided." })
    }
})

/**
 * @api {get} api/postproperty Check if the ImportProperty API is working
 * @apiName CheckImport
 * @apiGroup Check
 * 
 * @apiUse StatusMsg
 * 
 */

router.get('/', (req, res) => {
    res.status(200).json({ status: "Successful", msg: "Import API is working" })
})

// Create mySQL Connection
const mysql = require('mysql2/promise');
const db = require('../../config/keys');


/**
 * @api {get} api/postproperty/importSQL?limit=:limit Get the import details in the SQL database
 * @apiName GetImportSQL
 * @apiGroup Import
 * 
 * @apiQuery {Number} limit Number of imports required from the database.
 * @apiUse Authorization
 * @apiUse StatusMsg
 * @apiSuccess {Object} rows The imports are attached in JSON format.
 *  
 * @apiUse ErrorStatusMsg
 */

router.get('/importSQL', keepRecords, authenticate, async (req, res) => {
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

    const [rows, fields] = await connection.execute(`SELECT * FROM imports ORDER BY time DESC LIMIT 0,${limit}`).catch(err => {
        if (err) {
            // console.log({ err });
            errorSQL("ImportProperties.js - SQL SELECT for Imports.", JSON.stringify(error))
            res.status(400).json({ status: "Unsuccessful", msg: "Error reading data from the database." })
        }
    })

    connection.end()

    res.status(200).json({ status: "Successful", msg: "Imports are attached.", rows })

})

module.exports = router;