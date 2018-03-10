var bittrex = require("node-bittrex-api");
var azure = require("azure-storage");
var easydate = require('easydate');

const tbl_store = "bittrexdata";
bittrex.options({
  apikey: process.env.BITTREX_API_KEY,
  apisecret: process.env.BITTREX_API_SECRET
});

const tableSvc = azure.createTableService();

module.exports = function(context, myTimer) {
  var timeStamp = new Date().toISOString();

  if (myTimer.isPastDue) {
    context.log("Bittrex Update running late!");
  }

  bittrex.getmarketsummaries(function(data, err) {
    if (err) {
      return context.log(err);
    }
    
    for (var i in data.result) {
      var entity = {
        PartitionKey: { _: data.result[i].MarketName},
        RowKey: { _: data.result[i].TimeStamp },
        high: { _: data.result[i].High },
        low: { _: data.result[i].Low },
        bid: { _: data.result[i].Bid },
        ask: { _: data.result[i].Ask },
        last: { _: data.result[i].Last },
        baseVolume: { _: data.result[i].BaseVolume },
        volume: { _: data.result[i].Volume },
        openBuyOrders: { _: data.result[i].OpenBuyOrders },
        openSellOrders: { _: data.result[i].OpenSellOrders },
        prevDay: { _: data.result[i].PrevDay },
        created: { _: data.result[i].Created },
        displayMarketName: { _: data.result[i].DisplayMarketName }
      };
      
      tableSvc.insertEntity(tbl_store, entity, function(error, result, response) {
        if (error) {
          context.log("Error inserting data");
        }
      });
    }
  });

  context.log("Bittrex data update completed!", timeStamp);

  context.done();
};
