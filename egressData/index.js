var azure = require("azure-storage");

const tbl_store = "bittrexdata";

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.ticker) {
        /* retrieve ticker info */
        var tickerData = {};

        //tableSvc.retrieveEntity(tbl_store, req.query.ticker, entity_id, callback);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: tickerData
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
    context.done();
};