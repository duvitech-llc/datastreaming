var bittrex = require("node-bittrex-api");
var azure = require("azure-storage");
var easydate = require('easydate');

const tbl_store = "bittrexdata";
bittrex.options({
  apikey: process.env.BITTREX_API_KEY,
  apisecret: process.env.BITTREX_API_SECRET
});

var tableSvc = azure.createTableService();

module.exports = function(context, myTimer) {
  var timeStamp = new Date().toISOString();

  if (myTimer.isPastDue) {
    context.log("Bittrex Update running late!");
  }

  bittrex.getmarketsummaries(function(data, err) {
    if (err) {
      return context.log(err);
    }
    var dateStamp =  easydate('Y-d-MTh:m:s.lZ',{timeZone: 'utc'})
    for (var i in data.result) {
      bittrex.getticker({ market: data.result[i].MarketName }, function(ticker) 
      {
        context.log(ticker);
        
        var entity = {
            PartitionKey: {'_': data.result[i].MarketName },
            RowKey: {'_': dateStamp},
            bid: {'_': ticker.result.bid},
            ask: {'_': ticker.result.ask},
            last: {'_': ticker.result.last}
        };

        tableSvc.insertEntity(tbl_store, entity);
      });
    }
  });

  context.log("Bittrex data update completed!", timeStamp);

  context.done();
};
