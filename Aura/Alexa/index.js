'use strict';

/**
 * This sample demonstrates a smart home skill using the publicly available API on Amazon's Alexa platform.
 * For more information about developing smart home skills, see
 *  https://developer.amazon.com/alexa/smart-home
 *
 * For details on the smart home API, please visit
 *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference
 */

/**
 * Mock data for devices to be discovered
 *
 * For more information on the discovered appliance response please see
 *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
 */
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});
const request = require('request');

const config = {};
var FacebookUserId;


var DeviceChangeState1;
var DeviceChangeState2;
var DeviceChangeState3;
var DeviceChangeState4;
var DeviceStateLocation;

var ddb = new AWS.DynamoDB({
    apiVersion: '2012-10-08'
});


var DEVICE_DATA = {} // empty Object
var key_devices = 'UserDevices';
DEVICE_DATA[key_devices] = []; // empty Array, which you can push() values into

var UserDeviceList = {};
var key_user_device = "devices";
UserDeviceList[key_user_device] = [];

/**
 * Utility functions
 */

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

/**
 * Generate a unique message ID
 *
 * TODO: UUID v4 is recommended as a message ID in production.
 */
function generateMessageID() {
    return '38A28869-DD5E-48CE-BBE5-A4DB78CECB28'; // Dummy
}

/**
 * Generate a response message
 *
 * @param {string} name - Directive name
 * @param {Object} payload - Any special payload required for the response
 * @returns {Object} Response object
 */
function generateResponse(namepace, name, value, payload, response, endpoint_id) {

    return {
        context: {
            properties: [{
                namespace: namepace,
                name: name,
                value: value,
                timeOfSample: "2017-02-03T16:20:50.52Z",
                uncertaintyInMilliseconds: 500
            }]
        },
        event: {
            header: {
                namespace: "Alexa",
                name: response,
                payloadVersion: "3",
                messageId: generateMessageID(),
                correlationToken: "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
            },
            endpoint: {
                scope: {
                    type: "BearerToken",
                    token: "access-token-from-Amazon"
                },
                endpointId: endpoint_id
            },
            payload: payload
        }
    };
}

function generateStateReportResponse(value, auraType, currentDimmerValue, payload, endpoint_id) {

    var type;
    console.log("Check aura type : " + auraType);
    if (auraType == "LIGHT") {
        return {
            context: {
                properties: [{
                    namespace: "Alexa.EndpointHealth",
                    name: "connectivity",
                    value: "OK",
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: "Alexa.PowerController",
                    name: "powerState",
                    value: value,
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: "Alexa.PowerLevelController",
                    name: "powerLevel",
                    value: currentDimmerValue,
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: "Alexa.PercentageController",
                    name: "percentage",
                    value: currentDimmerValue,
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: "Alexa.BrightnessController",
                    name: "brightness",
                    value: currentDimmerValue,
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                }

                ]
            },
            event: {
                header: {
                    namespace: "Alexa",
                    name: "StateReport",
                    payloadVersion: "3",
                    messageId: generateMessageID(),
                    correlationToken: "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                },
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: "access-token-from-Amazon"
                    },
                    endpointId: endpoint_id
                },
                payload: payload
            }
        };
    } else if (auraType == "SWITCH") {
        return {
            context: {
                properties: [{
                    namespace: "Alexa.EndpointHealth",
                    name: "connectivity",
                    value: "OK",
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: "Alexa.PowerController",
                    name: "powerState",
                    value: value,
                    timeOfSample: "2017-02-03T16:20:50.52Z",
                    uncertaintyInMilliseconds: 500
                }

                ]
            },
            event: {
                header: {
                    namespace: "Alexa",
                    name: "StateReport",
                    payloadVersion: "3",
                    messageId: generateMessageID(),
                    correlationToken: "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                },
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: "access-token-from-Amazon"
                    },
                    endpointId: endpoint_id
                },
                payload: payload
            }
        };
    }

}



function generateContoleResponse(value, auraType, currentDimmerValue, payload, endpoint_id) {

    var type;
    console.log("Check aura type : " + auraType);
    if (auraType == "LIGHT") {
        return {
            context: {
                properties: [
                    {
                        namespace: "Alexa.BrightnessController",
                        name: "brightness",
                        value: currentDimmerValue,
                        timeOfSample: "2017-02-03T16:20:50.52Z",
                        uncertaintyInMilliseconds: 500
                    }
                    // , 
                    // {
                    //     namespace: "Alexa.PowerController",
                    //     name: "powerState",
                    //     value: value,
                    //     timeOfSample: "2017-02-03T16:20:50.52Z",
                    //     uncertaintyInMilliseconds: 500
                    // },
                    // {
                    //     namespace: "Alexa.PowerLevelController",
                    //     name: "powerLevel",
                    //     value: currentDimmerValue,
                    //     timeOfSample: "2017-02-03T16:20:50.52Z",
                    //     uncertaintyInMilliseconds: 500
                    // },
                    // {
                    //     namespace: "Alexa.PercentageController",
                    //     name: "percentage",
                    //     value: currentDimmerValue,
                    //     timeOfSample: "2017-02-03T16:20:50.52Z",
                    //     uncertaintyInMilliseconds: 500
                    // }
                ]
            },
            event: {
                header: {
                    namespace: "Alexa",
                    name: "Response",
                    payloadVersion: "3",
                    messageId: generateMessageID(),
                    correlationToken: "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                },
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: "access-token-from-Amazon"
                    },
                    endpointId: endpoint_id
                },
                payload: payload
            }
        };
    } else if (auraType == "SWITCH") {
        return {
            context: {
                properties: [
                    {
                        namespace: "Alexa.PowerController",
                        name: "powerState",
                        value: value,
                        timeOfSample: "2017-02-03T16:20:50.52Z",
                        uncertaintyInMilliseconds: 500
                    }

                ]
            },
            event: {
                header: {
                    namespace: "Alexa",
                    name: "Response",
                    payloadVersion: "3",
                    messageId: generateMessageID(),
                    correlationToken: "dFMb0z+PgpgdDmluhJ1LddFvSqZ/jCc8ptlAKulUj90jSqg=="
                },
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: "access-token-from-Amazon"
                    },
                    endpointId: endpoint_id
                },
                payload: payload
            }
        };
    }

}
/**
 * Mock functions to access device cloud.
 *
 * TODO: Pass a user access token and call cloud APIs in production.
 */

function getDevicesFromPartnerCloud() {
    /**
     * For the purposes of this sample code, we will return:
     * (1) Non-dimmable light bulb
     * (2) Dimmable light bulb
     */
    //DynamoDbFunctions.ScanDbForDevices();
    // Promise.all(DynamoDbFunctions.ScanDbForDevices()).then(dataFromDynamoDb(data));
}

// function dataFromDynamoDb(data){
//     console.log("Data from dynamoDb : " + data);
// }

function isValidToken(token) {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    log("HTTP", "Token : " + token);
    //const request = require('request');
    const options = {
        url: 'https://graph.facebook.com/me?access_token=' + token,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    }

    request(options, function (err, res, body) {
        let json = JSON.parse(body);
        console.log("FaceBook ID : " + json.id);
        FacebookUserId = json.id;
        if (typeof FacebookUserId !== 'undefined' && FacebookUserId) {

            return true;
        } else {
            return false
        }
    });
    return true;
}

function isDeviceOnline(applianceId) {
    log('DEBUG', `isDeviceOnline (applianceId: ${applianceId})`);
    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
}


function turnOn(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, applianceId) {

    console.log("[TURN ON ]  auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName + " auraNodeIndex " + auraNodeIndex);
    var controleType = 1;
    var controleState = 1;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleState, function (err, data) {
        if (err) {

        } else {

        }
    });
    return generateResponse("Alexa.PowerController", "powerState", "ON", {}, "Response", applianceId);
}

function turnOff(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, applianceId) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 1;
    var controleState = 0;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleState, function (err, data) {
        if (err) {

        } else {

        }
    });
    return generateResponse("Alexa.PowerController", "powerState", "OFF", {}, "Response", applianceId);
}

function setBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    var controleState = 1;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim, function (err, data) {
        if (err) {

        } else {

        }
    });
    // return generateResponse("Alexa.BrightnessController", "brightness", controlDim, {}, "Response", "appliance-001");
    var auraType = "LIGHT";
    if (auraNodeIndex != 3) {
        auraType = "LIGHT";
    } else {
        auraType = "SWITCH";
    }
    return generateContoleResponse(controleState, auraType, controlDim, {}, applianceId);
}

function AdjustBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 3;
    var controlDim = delta;
    var controleState = 1;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim, function (err, data) {
        if (err) {
            console.log("ERROR on AdjustBrightness");
        } else {
            var auraType = "LIGHT";
            if (auraNodeIndex != 3) {
                auraType = "LIGHT";
            } else {
                auraType = "SWITCH";
            }
            console.log("SUCCESS on AdjustBrightness : " + data + " " + JSON.stringify(generateContoleResponse(controleState, auraType, data, {}, applianceId)));

            return generateContoleResponse(controleState, auraType, data, {}, applianceId);
        }

    });
    // return generateResponse("Alexa.BrightnessController", "brightness", controlDim, {}, "Response", "appliance-001");

}

function incrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim);
    return generateResponse("Alexa.PowerLevelController", "powerLevel", percentage, {}, "Response", applianceId);
}

function decrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim);
    return generateResponse("Alexa.PowerLevelController", "powerLevel", percentage, {}, "Response", applianceId);
}

/**
 * This function takes user access token and return facebook ID
 */
function GetFaceBookId(userAccessToken, callback_GetFaceBookId) {
    /**
     * create header for GET method 
     * to get facebook Id from access token
     * update access token which we get above 
     */
    const options = {
        url: 'https://graph.facebook.com/me?access_token=' + userAccessToken,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    }
    request(options, function (err, res, body) {
        /**
         * Get facebook from json format
         */
        let json = JSON.parse(body);
        //log("FB ID ", json.id);
        callback_GetFaceBookId(null, json.id);
    });

}
/**
 * This function takes Facebook ID  and returns the devices that user has access
 */
function getDevicesFromUserTable(FacebookUserId, callback_getDevicesFromUserTable) {
    var userTableName = 'aura-mobilehub-1808637480-UserTable';
    var paramsUserTable = {
        TableName: userTableName,
        Limit: 3,
        ProjectionExpression: "Devices",
        FilterExpression: "#user_id = :facebook_id",
        ExpressionAttributeNames: {
            "#user_id": "UserId",
        },
        ExpressionAttributeValues: {
            ":facebook_id": {
                "S": "us-east-1:" + FacebookUserId
            }
        },
    };
    ddb.scan(paramsUserTable, function (err, jsonData) {
        if (err) {
            console.log("ERROR " + "Unable to scan the user table. " + err);
            callback_getDevicesFromUserTable(err, err);
        } else {
            /**
             * Scan got success
             * now take each device get the device details for each device
             */
            callback_getDevicesFromUserTable(err, jsonData.Items[0]);
        }
    });
}
/**
 * This function takes device List and returns the nodes for each device that user has access
 */
function getNodesFromDeviceTable(deviceList, callback_getNodesFromDeviceTable) {


    //console.log("getNodesFromDeviceTable deviceList : " + JSON.stringify(deviceList));
    //[{"S":"96500E"},{"S":"96500E"},{"S":"96500E"},{"S":"96500E"}]
    var DeviceNodeInfoList = {};
    var key_name = "info";
    DeviceNodeInfoList[key_name] = [];
    var resultCount = 0;
    for (var listLen in deviceList) {
        //console.log("FOR LOOP check device list data : " + deviceList[listLen].S);
        var deviceTableName = 'aura-mobilehub-1808637480-DevicesTable';
        var paramsDeviceTable = {
            TableName: deviceTableName,
            Limit: 3,
            ProjectionExpression: "Thing,Loads,Room",
            FilterExpression: "#device_id = :device_number",
            ExpressionAttributeNames: {
                "#device_id": "DeviceId",
            },
            ExpressionAttributeValues: {
                ":device_number": {
                    "S": deviceList[listLen].S
                }
            },
        };
        ddb.scan(paramsDeviceTable, function (err, data) {
            if (err) {
                console.error("Unable to scan the paramsDeviceTable. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                //console.log("DEVICE INFO DATA : " + JSON.stringify(data));
                for (var nodeLen in data.Items[0].Loads.L) {
                    if (nodeLen != 3) {
                        var lightNodeInfo = createJsonForLight(deviceList[resultCount].S, data.Items[0].Thing.S, data.Items[0].Room.S, data.Items[0].Loads.L[nodeLen].S, nodeLen);
                        DeviceNodeInfoList[key_name].push(lightNodeInfo);
                    } else {
                        var switchNodeInfo = createJsonForSwitch(deviceList[resultCount].S, data.Items[0].Thing.S, data.Items[0].Room.S, data.Items[0].Loads.L[nodeLen].S, nodeLen);
                        DeviceNodeInfoList[key_name].push(switchNodeInfo);
                    }
                }
                resultCount = resultCount + 1;
                if (deviceList.length == resultCount) {
                    // console.log("DEVICE NODE INFO : " + JSON.stringify(DeviceNodeInfoList));
                    console.log("ALL DEVICE DATA PROCESSED : ");
                    const jsonResponse = {
                        event: {
                            header: {
                                messageId: generateMessageID(),
                                name: 'Discover.Response',
                                namespace: 'Alexa.Discovery',
                                payloadVersion: '3',
                            },
                            payload: {
                                endpoints: DeviceNodeInfoList.info,

                            },
                        }
                    };
                    callback_getNodesFromDeviceTable(null, jsonResponse);
                }

            }
        });
    }
}
function createJsonForLight(deviceName, thingName, roomName, loadName, loadIndex) {
    return {
        endpointId: deviceName + "_" + thingName + "_" + loadName,
        manufacturerName: 'wozart',
        modelName: 'Aura',
        friendlyName: roomName + " " + loadName,
        description: 'A node for control and change brightness for  lights or fans',
        displayCategories: [
            'LIGHT'
        ],
        cookie: {
            AuraName: deviceName,
            AuraThing: thingName,
            AuraLoad: loadName,
            AuraNodeIndex: loadIndex,
            AuraType: "LIGHT"
        },
        capabilities: [
            {
                type: "AlexaInterface",
                interface: "Alexa.EndpointHealth",
                version: "3",
                properties: {
                    supported: [
                        {
                            name: "connectivity"
                        }
                    ],
                    proactivelyReported: true,
                    retrievable: true
                }
            },
            {
                type: 'AlexaInterface',
                interface: 'Alexa',
                version: '3'
            },
            {
                type: 'AlexaInterface',
                interface: 'Alexa.PowerController',
                version: '3',
                properties: {
                    supported: [{
                        name: 'powerState'
                    }],
                    proactivelyReported: true,
                    retrievable: true
                }
            },
            {
                type: "AlexaInterface",
                interface: "Alexa.PowerLevelController",
                version: "3",
                properties: {
                    supported: [
                        {
                            name: "powerLevel"
                        }
                    ],
                    proactivelyReported: true,
                    retrievable: true
                }
            },
            {
                type: "AlexaInterface",
                interface: "Alexa.PercentageController",
                version: "3",
                properties: {
                    supported: [
                        {
                            name: "percentage"
                        }
                    ],
                    proactivelyReported: true,
                    retrievable: true
                }
            },
            {
                type: 'AlexaInterface',
                interface: 'Alexa.BrightnessController',
                version: '3',
                properties: {
                    supported: [{
                        name: 'brightness'
                    }],
                    proactivelyReported: true,
                    retrievable: true
                }
            }
        ]

    };
}
function createJsonForSwitch(deviceName, thingName, roomName, loadName, loadIndex) {
    return {
        endpointId: deviceName + "_" + thingName + "_" + loadName,
        manufacturerName: 'wozart',
        modelName: 'Aura',
        friendlyName: roomName + " " + loadName,
        description: 'A node for control and change brightness for  lights or fans',
        displayCategories: [
            'SWITCH'
        ],
        cookie: {
            AuraName: deviceName,
            AuraThing: thingName,
            AuraLoad: loadName,
            AuraNodeIndex: loadIndex,
            AuraType: "SWITCH"
        },
        capabilities: [
            {
                type: "AlexaInterface",
                interface: "Alexa.EndpointHealth",
                version: "3",
                properties: {
                    supported: [
                        {
                            name: "connectivity"
                        }
                    ],
                    proactivelyReported: true,
                    retrievable: true
                }
            },
            {
                type: 'AlexaInterface',
                interface: 'Alexa',
                version: '3'
            },
            {
                type: 'AlexaInterface',
                interface: 'Alexa.PowerController',
                version: '3',
                properties: {
                    supported: [{
                        name: 'powerState'
                    }],
                    proactivelyReported: true,
                    retrievable: true
                }
            }
        ]
    };
}

/**
 * This function is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given customer.
 *
 * @param {Object} request - The full request object from the Alexa smart home service. This represents a DiscoverAppliancesRequest.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesrequest
 *
 * @param {function} callback - The callback object on which to succeed or fail the response.
 *     https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
 *     If successful, return <DiscoverAppliancesResponse>.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
 */
function handleDiscovery(request1, EndReturnFunction) {
    /**
     * Print entire request coming from alexa for handel discovery
     */
    log("REQUEST ", `Discovery Request: ${JSON.stringify(request1)}`);
    /**
     * Here we will get user acces token trim that data
     */
    const userAccessToken = request1.directive.payload.scope.token.trim();
    /**
     * print access token here
     */
    log("TOKEN ", userAccessToken);
    GetFaceBookId(userAccessToken, handleGetFaceBookIdFunction);

    function handleGetFaceBookIdFunction(err, FacebookUserId) {
        if (err) {
            console.log("ERROR FB ID  " + " ERROR Check facebook id");
        } else {
            /**
             * Getting facebook id is success now do next stuff
             */
            //console.log("FB ID >> " + FacebookUserId);
            if (typeof FacebookUserId !== 'undefined' && FacebookUserId) {
                getDevicesFromUserTable(FacebookUserId, handleGetDevicesFromUserTableFunction);
            } else {
                /**
                 * Handel facebook error here
                 */
            }
        }
    }
    function handleGetDevicesFromUserTableFunction(err, deviceArrayList) {
        if (err) {
            console.log("ERROR : " + "getDevicesFromUserTable");
        } else {
            /**
             * getting device list from user table is success now do next stuff
             */
            //console.log("deviceArrayList " + JSON.stringify(deviceArrayList));
            getNodesFromDeviceTable(deviceArrayList.Devices.L, handleGetNodesFromDeviceTableFunction);
        }
    }
    function handleGetNodesFromDeviceTableFunction(err, data) {
        if (err) {
            console.log("ERROR : " + "getNodesFromDeviceTable");
        } else {
            //console.log("getNodesFromDeviceTable " + JSON.stringify(data));
            EndReturnFunction(null, data);
        }
    }
    console.log("End Of The Code Here ");
}

function handleCurrentState(request, callback) {
    log('DEBUG', `current state Request: ${JSON.stringify(request)}`);

    const userAccessToken = request.directive.endpoint.scope.token.trim();

    if (!userAccessToken || !isValidToken(userAccessToken)) {
        log('ERROR', `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(null, generateResponse('InvalidAccessTokenError', {}, "Response", "appliance-001"));
        return;
    }
    const applianceId = request.directive.endpoint.endpointId;
    const auraDeviceName = request.directive.endpoint.cookie.AuraName;
    const auraThingName = request.directive.endpoint.cookie.AuraThing;
    const auraLoadName = request.directive.endpoint.cookie.AuraLoad;
    const auraNodeIndex = request.directive.endpoint.cookie.AuraNodeIndex;
    const auraType = request.directive.endpoint.cookie.AuraType;

    //console.log("DEBUF|G auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName + " auraType : " + auraType);

    if (!applianceId) {
        log('ERROR', 'No applianceId provided in request');
        const payload = {
            faultingParameter: `applianceId: ${applianceId}`
        };
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", applianceId));
        return;
    }
    if (!isDeviceOnline(applianceId, userAccessToken)) {
        log('ERROR', `Device offline: ${applianceId}`);
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", applianceId));
        return;
    }

    let response;
    switch (request.directive.header.name) {
        case 'ReportState':

            //response = GetCurrentState(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex);
            config.IOT_BROKER_ENDPOINT = "a15bui8ebaqvjn.iot.us-east-1.amazonaws.com"; // also called the REST API endpoint
            config.IOT_BROKER_REGION = "us-east-1"; // eu-west-1 corresponds to the Ireland Region.  Use us-east-1 for the N. Virginia region
            config.IOT_THING_NAME = auraThingName;
            AWS.config.region = config.IOT_BROKER_REGION;

            var iotData = new AWS.IotData({
                endpoint: config.IOT_BROKER_ENDPOINT
            });

            var paramsGet = {
                "thingName": config.IOT_THING_NAME /* required */
            };

            iotData.getThingShadow(paramsGet, function (err, data1) {
                if (err) {
                    console.log("@@@@@@@@@@@@@@@@@" + err, err.stack);
                } else {

                    //console.log("\r\n stringfy data \r\n " + JSON.stringify(data1));
                    var data3 = data1.payload;
                    var data4 = JSON.parse(data3);
                    var keys = Object.keys(data4);
                    var currentState = data4[keys[0]]['desired']['state'][auraNodeIndex];
                    var currentDimmerValue = data4[keys[0]]['desired']['dimm'][auraNodeIndex];
                    //console.log("DEBUG " + " auraNodeIndex " + auraNodeIndex + "  currentState " + currentState + " currentDimmerValue " + currentDimmerValue);
                    var currentVal = "Default";
                    if (currentState == 1) {
                        currentVal = "ON";
                    } else {
                        currentVal = "OFF";
                    }
                    let callbackResponse = generateStateReportResponse(currentVal, auraType, currentDimmerValue, {}, applianceId);
                    //let callbackResponse = generateResponse("Alexa.EndpointHealth", "connectivity", currentVal, {}, "StateReport", "appliance-001");
                    //log('DEBUG', `Before call back: ${JSON.stringify(callbackResponse)}`);
                    callback(null, callbackResponse);
                } // successful response
            });

            log("DEBUG", 'inside report state namespace');
            break;

        default:
            {
                log('ERROR', `No supported directive name: ${request.header.name}`);
                callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-Id"));
                return;
            }
    }

    log('DEBUG', `stateReport End of code:`);

    //callback(null, response);
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleControl(request, callback) {
    log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

    /**
     * Get the access token.
     */

    const userAccessToken = request.directive.endpoint.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     *
     * If the token is invliad, return InvalidAccessTokenError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#invalidaccesstokenerror
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        log('ERROR', `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(null, generateResponse('InvalidAccessTokenError', {}, "response", "application-id"));
        return;
    }

    /**
     * Grab the applianceId from the request.
     */
    const applianceId = request.directive.endpoint.endpointId;
    const auraDeviceName = request.directive.endpoint.cookie.AuraName;
    const auraThingName = request.directive.endpoint.cookie.AuraThing;
    const auraLoadName = request.directive.endpoint.cookie.AuraLoad;
    const auraNodeIndex = request.directive.endpoint.cookie.AuraNodeIndex;
    /**
     * If the applianceId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!applianceId) {
        log('ERROR', 'No applianceId provided in request');
        const payload = {
            faultingParameter: `applianceId: ${applianceId}`
        };
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, applianceId));
        return;
    }

    /**
     * At this point the applianceId and accessToken are present in the request.
     *
     * Please review the full list of errors in the link below for different states that can be reported.
     * If these apply to your device/cloud infrastructure, please add the checks and respond with
     * accurate error messages. This will give the user the best experience and help diagnose issues with
     * their devices, accounts, and environment
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#error-messages
     */
    if (!isDeviceOnline(applianceId, userAccessToken)) {
        log('ERROR', `Device offline: ${applianceId}`);
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
        return;
    }

    let response;

    switch (request.directive.header.name) {
        case 'TurnOn':
            response = turnOn(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, applianceId);
            break;

        case 'TurnOff':
            response = turnOff(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, applianceId);
            break;

        case 'SetBrightness':
            {
                const percentage = request.directive.payload.brightness;
                if (!percentage) {
                    const payload = {
                        faultingParameter: `percentageState: ${percentage}`
                    };
                    callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
                    return;
                }
                response = setBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, percentage, applianceId);
                break;
            }

        case 'AdjustBrightness':
            {
                const delta = request.directive.payload.brightnessDelta;
                if (!delta) {
                    const payload = {
                        faultingParameter: `deltaPercentage: ${delta}`
                    };
                    callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
                    return;
                }
                response = AdjustBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId);
                break;
            }

        case 'DecrementPercentage':
            {
                const delta = request.payload.deltaPercentage.value;
                if (!delta) {
                    const payload = {
                        faultingParameter: `deltaPercentage: ${delta}`
                    };
                    callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
                    return;
                }
                response = decrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta, applianceId);
                break;
            }

        default:
            {
                log('ERROR', `No supported directive name: ${request.header.name}`);
                callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
                return;
            }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    callback(null, response);
}

/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 * It is recommended to validate the request and response with Alexa Smart Home Skill API Validation package.
 *  https://github.com/alexa/alexa-smarthome-validation
 */
exports.handler = (request, context, callback) => {
    log('DEBUG', `Discovery Start Request: ${JSON.stringify(request)}`);

    switch (request.directive.header.namespace) {
        case 'Alexa.Discovery':
            handleDiscovery(request, callback);
            break;


        case 'Alexa.PowerController':
        case 'Alexa.BrightnessController':
            handleControl(request, callback);
            break;
        case 'Alexa':
            handleCurrentState(request, callback);
            break;
        default:
            {
                const errorMessage = `No supported namespace: ${request.directive.header.namespace}`;
                log('ERROR', errorMessage);
                callback(new Error(errorMessage));
            }
    }
};


function updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleValue, shadowCallBack) {

    config.IOT_BROKER_ENDPOINT = "a15bui8ebaqvjn.iot.us-east-1.amazonaws.com"; // also called the REST API endpoint
    config.IOT_BROKER_REGION = "us-east-1"; // eu-west-1 corresponds to the Ireland Region.  Use us-east-1 for the N. Virginia region
    config.IOT_THING_NAME = auraThingName;
    AWS.config.region = config.IOT_BROKER_REGION;



    var iotData = new AWS.IotData({
        endpoint: config.IOT_BROKER_ENDPOINT
    });

    var paramsGet = {
        "thingName": config.IOT_THING_NAME /* required */
    };
    iotData.getThingShadow(paramsGet, function (err, data1) {
        if (err) {
            console.log("@@@@@@@@@@@@@@@@@" + err, err.stack);
        } else {

            console.log("\r\n stringfy data \r\n " + JSON.stringify(data1));
            var data3 = data1.payload;
            var data4 = JSON.parse(data3);
            var keys = Object.keys(data4);
            console.log("\r\nfor >> " + keys.length);

            //var stateData = data4[keys[0]];
            //var reportedData = data4[keys[1]];
            //var versionData = data4[keys[2]];
            //var timeData = data4[keys[3]];
            //var desiredData = data4[keys[0]]['desired'];

            var deviceState1 = data4[keys[0]]['desired']['state'][0];
            var deviceState2 = data4[keys[0]]['desired']['state'][1];
            var deviceState3 = data4[keys[0]]['desired']['state'][2];
            var deviceState4 = data4[keys[0]]['desired']['state'][3];
            var LedState = data4[keys[0]]['desired']['led'];
            var deviceDimmerValue1 = data4[keys[0]]['desired']['dimm'][0];
            var deviceDimmerValue2 = data4[keys[0]]['desired']['dimm'][1];
            var deviceDimmerValue3 = data4[keys[0]]['desired']['dimm'][2];
            var deviceDimmerValue4 = data4[keys[0]]['desired']['dimm'][3];

            console.log("check before state led " + LedState + " states " + deviceState1 + deviceState2 + deviceState3 + deviceState4 + " dimmers " + deviceDimmerValue1 + deviceDimmerValue2 + deviceDimmerValue3 + deviceDimmerValue4);


            if (controleType == 1) {
                if (auraNodeIndex == 0) {
                    deviceState1 = controleValue;
                } else if (auraNodeIndex == 1) {
                    deviceState2 = controleValue;
                } else if (auraNodeIndex == 2) {
                    deviceState3 = controleValue;
                } else if (auraNodeIndex == 3) {
                    deviceState4 = controleValue;
                }
            } else if (controleType == 2) {
                if (auraNodeIndex == 0) {
                    deviceDimmerValue1 = controleValue;
                    deviceState1 = 1;
                } else if (auraNodeIndex == 1) {
                    deviceDimmerValue2 = controleValue;
                    deviceState2 = 1;
                } else if (auraNodeIndex == 2) {
                    deviceDimmerValue3 = controleValue;
                    deviceState3 = 1;
                } else if (auraNodeIndex == 3) {
                    deviceDimmerValue4 = controleValue;
                    deviceState4 = 1;
                }
            } else if (controleType == 3) {
                console.log("CHECK DELTA VALUE : " + controleValue + "ALL PERCENT : " + deviceDimmerValue1 + " " + deviceDimmerValue2 + " " + deviceDimmerValue3 + " " + deviceDimmerValue4 + " ");
                if (auraNodeIndex == 0) {
                    deviceDimmerValue1 = deviceDimmerValue1 + controleValue;
                    if (deviceDimmerValue1 < 0) {
                        deviceDimmerValue1 = 0;
                    }
                    if (deviceDimmerValue1 > 100) {
                        deviceDimmerValue1 = 100;
                    }

                    deviceState1 = 1;
                } else if (auraNodeIndex == 1) {
                    deviceDimmerValue2 = deviceDimmerValue2 + controleValue;
                    if (deviceDimmerValue2 < 0) {
                        deviceDimmerValue2 = 0;
                    }
                    if (deviceDimmerValue2 > 100) {
                        deviceDimmerValue2 = 100;
                    }
                    deviceState2 = 1;
                } else if (auraNodeIndex == 2) {
                    deviceDimmerValue3 = deviceDimmerValue3 + controleValue;
                    if (deviceDimmerValue3 < 0) {
                        deviceDimmerValue3 = 0;
                    }
                    if (deviceDimmerValue3 > 100) {
                        deviceDimmerValue3 = 100;
                    }
                    deviceState3 = 1;
                } else if (auraNodeIndex == 3) {
                    deviceDimmerValue4 = deviceDimmerValue4 + controleValue;
                    if (deviceDimmerValue4 < 0) {
                        deviceDimmerValue4 = 0;
                    }
                    if (deviceDimmerValue4 > 100) {
                        deviceDimmerValue4 = 100;
                    }
                    deviceState4 = 1;
                }
                console.log("CHECK AFTER VALUE : " + controleValue + "ALL PERCENT : " + deviceDimmerValue1 + " " + deviceDimmerValue2 + " " + deviceDimmerValue3 + " " + deviceDimmerValue4 + " ");

            }

            if (LedState == 1) {
                LedState = 0;
            } else {
                LedState = 1;
            }
            console.log("check after state data " + LedState + " data " + deviceState1 + deviceState2 + deviceState3 + deviceState4 + " dimmers " + deviceDimmerValue1 + deviceDimmerValue2 + deviceDimmerValue3 + deviceDimmerValue4);
            // console.log("state : " + JSON.stringify(stateData) + " \r\n reported : " + JSON.stringify(reportedData)  );
            // console.log("\r\nversion : " + JSON.stringify(versionData) + "\r\n time : " + JSON.stringify(timeData));
            // console.log("\r\ndesired : " + JSON.stringify(desiredData) + "\r\n wlcome : " + JSON.stringify(welcomeData));
            var updateShadowData = {
                "state": {
                    "desired": {
                        "led": LedState,
                        "state": [deviceState1, deviceState2, deviceState3, deviceState4],
                        "dimm": [deviceDimmerValue1, deviceDimmerValue2, deviceDimmerValue3, deviceDimmerValue4]
                    }
                }
            };
            console.log("one -> " + updateShadowData + "\r\n String " + JSON.stringify(updateShadowData));

            var paramsUpdate = {
                "thingName": config.IOT_THING_NAME,
                "payload": JSON.stringify(updateShadowData)
            };
            iotData.updateThingShadow(paramsUpdate, function (err, data) {
                if (err) {
                    console.log(err);

                    // callback("not ok");
                } else {
                    console.log("updated thing shadow " + config.IOT_THING_NAME + ' to state ' + paramsUpdate.payload);
                    var retState, retLevel;
                    if (auraNodeIndex == 0) {
                        retState = deviceState1;
                        retLevel = deviceDimmerValue1;
                    } else if (auraNodeIndex == 1) {
                        retState = deviceState2;
                        retLevel = deviceDimmerValue2;
                    } else if (auraNodeIndex == 2) {
                        retState = deviceState3;
                        retLevel = deviceDimmerValue3;
                    } else if (auraNodeIndex == 3) {
                        retState = deviceState4;
                        retLevel = deviceDimmerValue4;
                    }

                    shadowCallBack(null, retLevel);
                }

            });


        } // successful response
    });
    // console.log("#######" + data);



}