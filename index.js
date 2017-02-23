const restify   = require('restify');
const _         = require('lodash');
const log       = console.log;

const getPerson = (firstName, lastName, characterClass)=>
{
    return {
        firstName,
        lastName,
        characterClass
    };
};

const getAdventureParty = ()=>
{
    return [
        getPerson('Jesse', 'Warden', 'Bard'),
        getPerson('Albus', 'Dumbledog', 'Thief'),
        getPerson('Cow', 'Moo', 'Cleric')
    ];
};

const getSteamPunkParty = ()=>
{
    return [
        getPerson('Jesse', 'Warden', 'Alchemist'),
        getPerson('Albus', 'Dumbledog', 'Troublershooter'),
        getPerson('Cow', 'Moo', 'Witch Doctor')
    ];
};

const getSuccessResponse = (data)=>
{
    return {
        result: true,
        data
    };
};

const PARTY_TYPE_ADVENTURE  = 'adventure';
const PARTY_TYPE_STEAM_PUNK = 'steampunk';
const PARTY_TYPE_UNKNOWN    = 'unknown';

const acceptablePartyTypes = {
    [PARTY_TYPE_ADVENTURE] : PARTY_TYPE_ADVENTURE,
    [PARTY_TYPE_STEAM_PUNK]: PARTY_TYPE_STEAM_PUNK,
    [PARTY_TYPE_UNKNOWN]   : PARTY_TYPE_UNKNOWN
};

const partyTypeFactoryMap = {
    [PARTY_TYPE_ADVENTURE] : getAdventureParty,
    [PARTY_TYPE_STEAM_PUNK]: getSteamPunkParty,
    [PARTY_TYPE_UNKNOWN]   : getAdventureParty
};

const getPartyTypeFromRequest = (req)=>
{
    let result = _.get(req, 'params.party', PARTY_TYPE_UNKNOWN);
    result     = result.toLowerCase();
    return _.get(acceptablePartyTypes, result, PARTY_TYPE_UNKNOWN);
};

const getPeopleResponseFromRequestType = (req)=>
{
    const partyType          = getPartyTypeFromRequest(req);
    const partyMakerFunction = _.get(partyTypeFactoryMap, partyType);
    const people             = partyMakerFunction();
    const response           = getSuccessResponse(people);
    return response;
};

const startServer = ()=>
{
    return new Promise((success, failure)=>
    {
        const server    = restify.createServer();
        server.use(restify.queryParser());

        server.get('/api/data', (req, res)=>
        {
            const response = getPeopleResponseFromRequestType(req);
            res.send(response);
        });
        server.get('/api/ping', (req, res)=> res.send(getSuccessResponse('pong')));

        server.listen(8080, ()=>
        {
            console.log('%s listening at %s', server.name, server.url);
            success(server);
        });
    });
};

module.exports = {
    getPerson,
    getAdventureParty,
    getSteamPunkParty,
    getSuccessResponse,
    PARTY_TYPE_ADVENTURE,
    PARTY_TYPE_STEAM_PUNK,
    PARTY_TYPE_UNKNOWN,
    acceptablePartyTypes,
    partyTypeFactoryMap,
    getPartyTypeFromRequest,
    getPeopleResponseFromRequestType,
    startServer
};

if(require.main === module)
{
    startServer();
}