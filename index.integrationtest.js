const log = console.log;
const _ = require('lodash');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const restify = require('restify');

const {
    startServer
} = require('./index');

const get = (client, url)=>
{
    return new Promise((success, failure)=>
    {
        client.get(url, (err, req, res, obj)=>
        {
            if(err)
            {
                return failure(err);
            }
            return success(obj);
        });
    });
};

describe("#index integration", ()=>
{
    let server;
    let client;
    let getURL;
    let ping;
    let getAdventurers;
    let getSteamPunk;

    before((done)=>
    {
        client = restify.createJsonClient({
            url: 'http://localhost:8080'
        });
        getURL         = _.partial(get, client);
        ping           = _.partial(getURL, '/api/ping');
        getAdventurers = _.partial(getURL, '/api/data?party=adventurers');
        getSteamPunk   = _.partial(getURL, '/api/data?party=steampunk');
        startServer()
        .then((result)=>
        {
            server = result;
            done();
        })
        .catch(done);
    });
    after(()=>
    {
        client.close();
        server.close();
    });
    describe('#GET api/ping', ()=>
    {
        it('should respond', ()=>
        {
            return ping().should.eventually.be.fullfilled;
        });
        it('should get a pong back', ()=>
        {
            // {result: true, data: 'pong'}
            return ping().should.eventually.have.property('data', 'pong');
        });
        it('should get a pong back via async/await',  async ()=>
        {
            // const response = await ping();
            // response.data.should.equal('pong');
            (await ping()).data.should.equal('pong');
        });
    });
    it('#GET all should be fine via await', async ()=>
    {
        const pong  = await ping();
        const party = await getAdventurers();
        const crew  = await getSteamPunk();
        const allAreObjects = _.every([pong, party, crew], o => _.isObject(o));
        allAreObjects.should.be.true;

        return ping()
        .then((results)=>
        {
            _.isObject(results).should.be.true;
            return getAdventurers();
        })
        .then((results)=>
        {
            _.isObject(results).should.be.true;
            return getSteamPunk();
        })
        .then((results)=>
        {
            _.isObject(results).should.be.true;
        });
        
    });
    
});