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

const config   = {};
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


function turnOn(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex) {

    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 1;
    var controleState = 1;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleState);
    return generateResponse("Alexa.PowerController", "powerState", "ON", {}, "Response", "appliance-001");
}

function turnOff(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 1;
    var controleState = 0;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleState);
    return generateResponse("Alexa.PowerController", "powerState", "OFF", {}, "Response", "appliance-001");
}

function setBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim);
    // return generateResponse("Alexa.BrightnessController", "brightness", controlDim, {}, "Response", "appliance-001");
    return generateContoleResponse(value, auraType, currentDimmerValue, payload, endpoint_id);
}

function incrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim);
    return generateResponse("Alexa.PowerLevelController", "powerLevel", percentage, {}, "Response", "appliance-001");
}

function decrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta) {
    console.log("auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName);
    var controleType = 2;
    var controlDim = delta;
    updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controlDim);
    return generateResponse("Alexa.PowerLevelController", "powerLevel", percentage, {}, "Response", "appliance-001");
}

/**
 * Main logic
 */

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
     * Here we will get user acces token trim that data
     */
    log('DEBUG', `Discovery Request: ${JSON.stringify(request1)}`);
    const userAccessToken = request1.directive.payload.scope.token.trim();
    /**
     * print access token here
     */
    log("HTTP A", userAccessToken);

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

    /**
     * call request module to get facebook id
     * if success then only call dynamoDB functions
     */
    request(options, function (err, res, body) {

        /**
         * Get facebook from json format
         */
        let json = JSON.parse(body);
        FacebookUserId = json.id;
        log("FB ID ", FacebookUserId);

        var FlagResultComplete = 0;
        if (typeof FacebookUserId !== 'undefined' && FacebookUserId) {
            /**
             * Facebook request got success
             * frame dynamodb table scan header  paramsUserTable to reuest user devices
             */
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

            /**
             * call scan function
             */
            ddb.scan(paramsUserTable, scanUserTable);

            /**
             * scan user table function 
             * on success it will return all the device related to user
             *  
             */
            function scanUserTable(err, data) {
                if (err) {
                    console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    /**
                     * Scan got success
                     * now take each device get the device details for each device
                     */
                    console.log("User Device Table Scan succeeded.");
                    var json_data = data.Items[0];

                    // console.log("Check result : " + JSON.stringify(i));

                    var DeviceList = {};
                    var key_name = "names";
                    DeviceList[key_name] = [];
                    for (var len in json_data.Devices.L) {
                        //console.log("Data from the table : " + listLen + " >> " + json_data.Devices.L[listLen].S);
                        var d_name = {
                            Name: json_data.Devices.L[len].S
                        };
                        DeviceList[key_name].push(d_name);
                    }

                    for (var listLen in json_data.Devices.L) {
                        ////////////////////Calling device table for Things/////////////////////
                        //console.log("check device list data : " + DeviceList.names[listLen].Name);
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
                                    "S": DeviceList.names[listLen].Name
                                }
                            },
                        };
                        // paramsDeviceTable.ExpressionAttributeValues.S = json_data.Devices.L[listLen].S;
                        //console.log("Check scanning table : "+ JSON.stringify(paramsDeviceTable));
                        ddb.scan(paramsDeviceTable, scanDeviceTable);

                        var loadNames = {};
                        var key_load = "names";
                        loadNames[key_load] = [];
                        var dummyLoadName;

                        function scanDeviceTable(err, data) {
                            if (err) {
                                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                //console.log("Device Table Scan succeeded.");
                                var i = data.Items[0];
                                //console.log("printing another data : " + DeviceList.names[listLen].Name);
                                dummyLoadName = {
                                    Name: DeviceList.names[listLen].Name,
                                    Thing: i.Thing.S,
                                    Room: i.Room.S,
                                    Loads: [{
                                        LoadName: i.Loads.L[0].S
                                    },
                                    {
                                        LoadName: i.Loads.L[1].S
                                    },
                                    {
                                        LoadName: i.Loads.L[2].S
                                    },
                                    {
                                        LoadName: i.Loads.L[3].S
                                    }
                                    ]
                                };
                                loadNames[key_load].push(dummyLoadName);
                                FlagResultComplete = FlagResultComplete + 1;
                                console.log("checking for end results : " + FlagResultComplete + " " + json_data.Devices.L.length);
                                if (FlagResultComplete == json_data.Devices.L.length) {

                                    var k = 0,
                                        l = 0;
                                    for (k = 0; k < FlagResultComplete; k++) {
                                        for (l = 0; l < 4; l++) {
                                            if (l != 3) {
                                                var dummy_device_list = {
                                                    endpointId: loadNames.names[k].Name + "_" + loadNames.names[k].Thing + "_" + loadNames.names[k].Loads[l].LoadName,
                                                    manufacturerName: 'wozart',
                                                    modelName: 'Aura',
                                                    friendlyName: loadNames.names[k].Room + " " + loadNames.names[k].Loads[l].LoadName,
                                                    description: 'A node for control and change brightness for  lights or fans',
                                                    displayCategories: [
                                                        'LIGHT'
                                                    ],
                                                    cookie: {
                                                        AuraName: loadNames.names[k].Name,
                                                        AuraThing: loadNames.names[k].Thing,
                                                        AuraLoad: loadNames.names[k].Loads[l].LoadName,
                                                        AuraNodeIndex: l + 1,
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
                                            } else {
                                                var dummy_device_list = {
                                                    endpointId: loadNames.names[k].Name + "_" + loadNames.names[k].Thing + "_" + loadNames.names[k].Loads[l].LoadName,
                                                    manufacturerName: 'wozart',
                                                    modelName: 'Aura',
                                                    friendlyName: loadNames.names[k].Room + " " + loadNames.names[k].Loads[l].LoadName,
                                                    description: 'A node for control switches',
                                                    displayCategories: [
                                                        'SWITCH'
                                                    ],
                                                    cookie: {
                                                        AuraName: loadNames.names[k].Name,
                                                        AuraThing: loadNames.names[k].Thing,
                                                        AuraLoad: loadNames.names[k].Loads[l].LoadName,
                                                        AuraNodeIndex: l + 1,
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

                                            UserDeviceList[key_user_device].push(dummy_device_list);
                                        }

                                    }

                                    //console.log("Check UserDEvice list " + JSON.stringify(UserDeviceList));
                                    const response = {
                                        event: {
                                            header: {
                                                messageId: generateMessageID(),
                                                name: 'Discover.Response',
                                                namespace: 'Alexa.Discovery',
                                                payloadVersion: '3',
                                            },
                                            payload: {
                                                endpoints: UserDeviceList.devices,

                                            },
                                        }
                                    };



                                    EndReturnFunction(null, response);
                                    //return UserDeviceList;
                                }
                            }
                        }
                        ////////////////////End of Calling device table for Things/////////////////////
                    }
                }
            }
            return true;
        } else {
            return false
        }
    });


    console.log("End Of The Code Here ");


}

function handleCurrentState(request, callback) {
    log('DEBUG', `current state Request: ${JSON.stringify(request)}`);
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
        callback(null, generateResponse('InvalidAccessTokenError', {}, "Response", "appliance-001"));
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
    const auraType = request.directive.endpoint.cookie.AuraType;

    console.log("DEBUF|G auraDeviceName : " + auraDeviceName + " auraThingName : " + auraThingName + " auraLoadName : " + auraLoadName + " auraType : " + auraType);
    /**
       * If the applianceId is missing, return UnexpectedInformationReceivedError
       *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
       */
    if (!applianceId) {
        log('ERROR', 'No applianceId provided in request');
        const payload = {
            faultingParameter: `applianceId: ${applianceId}`
        };
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", applianceId));
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
        callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", applianceId));
        return;
    }

    let response;
    //log('DEBUG', `current state Request: ${JSON.stringify(request)}`);
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
                    //console.log("\r\nfor >> " + keys.length);


                    // var deviceState1 = data4[keys[0]]['desired']['state'][0];
                    // var deviceState2 = data4[keys[0]]['desired']['state'][1];
                    // var deviceState3 = data4[keys[0]]['desired']['state'][2];
                    // var deviceState4 = data4[keys[0]]['desired']['state'][3];
                    // var LedState = data4[keys[0]]['desired']['led'];
                    // var deviceDimmerValue1 = data4[keys[0]]['desired']['dimm'][0];
                    // var deviceDimmerValue2 = data4[keys[0]]['desired']['dimm'][1];
                    // var deviceDimmerValue3 = data4[keys[0]]['desired']['dimm'][2];
                    // var deviceDimmerValue4 = data4[keys[0]]['desired']['dimm'][3];


                    var currentState = data4[keys[0]]['desired']['state'][auraNodeIndex - 1];
                    var currentDimmerValue = data4[keys[0]]['desired']['dimm'][auraNodeIndex - 1];
                    console.log("DEBUG " + " auraNodeIndex " + auraNodeIndex + "  currentState " + currentState + " currentDimmerValue " + currentDimmerValue);
                    var currentVal = "Default";
                    if (currentState == 1) {
                        currentVal = "ON";
                    } else {
                        currentVal = "OFF";
                    }




                    //console.log("check before state led " + LedState + " states " + deviceState1 + deviceState2 + deviceState3 + deviceState4 + " dimmers " + deviceDimmerValue1 + deviceDimmerValue2 + deviceDimmerValue3 + deviceDimmerValue4);
                    let callbackResponse = generateStateReportResponse(currentVal, auraType, currentDimmerValue, {}, "appliance-001");
                    //let callbackResponse = generateResponse("Alexa.EndpointHealth", "connectivity", currentVal, {}, "StateReport", "appliance-001");
                    log('DEBUG', `Before call back: ${JSON.stringify(callbackResponse)}`);
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
            response = turnOn(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex);
            break;

        case 'TurnOff':
            response = turnOff(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex);
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
                response = setBrightness(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, percentage);
                break;
            }

        case 'IncrementPercentage':
            {
                const delta = request.payload.deltaPercentage.value;
                if (!delta) {
                    const payload = {
                        faultingParameter: `deltaPercentage: ${delta}`
                    };
                    callback(null, generateResponse('UnexpectedInformationReceivedError', 'NoDevice', 'NoDevice', payload, "Response", "application-id"));
                    return;
                }
                response = incrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta);
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
                response = decrementPercentage(auraDeviceName, auraThingName, auraLoadName, auraNodeIndex, delta);
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
    //log('DEBUG', `Discovery Start Request: ${JSON.stringify(request)}`);

    switch (request.directive.header.namespace) {
        /**
         * The namespace of 'Alexa.ConnectedHome.Discovery' indicates a request is being made to the Lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         *
         * For more information on device discovery, please see
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discovery-messages
         */
        case 'Alexa.Discovery':
            handleDiscovery(request, callback);
            break;

        /**
         * The namespace of "Alexa.ConnectedHome.Control" indicates a request is being made to control devices such as
         * a dimmable or non-dimmable bulb. The full list of Control events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         */
        case 'Alexa.PowerController':
        case 'Alexa.BrightnessController':
            handleControl(request, callback);
            break;

        case 'Alexa':
            //log("DEBUG",'check alexa state report request');
            handleCurrentState(request, callback);
            break;
        /**
         * The namespace of "Alexa.ConnectedHome.Query" indicates a request is being made to query devices about
         * information like temperature or lock state. The full list of Query events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         *
         * TODO: In this sample, query handling is not implemented. Implement it to retrieve temperature or lock state.
         */
        // case 'Alexa.ConnectedHome.Query':
        //     handleQuery(request, callback);
        //     break;

        /**
         * Received an unexpected message
         */
        default:
            {
                const errorMessage = `No supported namespace: ${request.directive.header.namespace}`;
                log('ERROR', errorMessage);
                callback(new Error(errorMessage));
            }
    }
};


function updateThingShadowStates(auraThingName, auraNodeIndex, controleType, controleValue) {

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
                if (auraNodeIndex == 1) {
                    deviceState1 = controleValue;
                } else if (auraNodeIndex == 2) {
                    deviceState2 = controleValue;
                } else if (auraNodeIndex == 3) {
                    deviceState3 = controleValue;
                } else if (auraNodeIndex == 4) {
                    deviceState4 = controleValue;
                }
            } else if (controleType == 2) {
                if (auraNodeIndex == 1) {
                    deviceDimmerValue1 = controleValue;
                } else if (auraNodeIndex == 2) {
                    deviceDimmerValue2 = controleValue;
                } else if (auraNodeIndex == 3) {
                    deviceDimmerValue3 = controleValue;
                } else if (auraNodeIndex == 4) {
                    deviceDimmerValue4 = controleValue;
                }
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
                    // callback("ok");
                }

            });


        } // successful response
    });
    // console.log("#######" + data);



}