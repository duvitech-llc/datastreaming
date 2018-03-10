var azure = require("azure-storage");

const tbl_store = "bittrexdata";

var tableSvc = azure.createTableService();
var timeStamp = new Date().toISOString();

var query = new azure.TableQuery().where(
  "PartitionKey eq ?",
  "BTC-ABY"
);

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

var tickerData = {};
tableSvc.queryEntities(tbl_store, query, null, function(
  error,
  result,
  response
) {
  if (!error) {
    result.entries.forEach(element => {        
        if(isEmpty(tickerData)){
            console.log("Is Empty");
            tickerData.MarketName = element.PartitionKey._;
            tickerData.High = element.high._;
            tickerData.Low = element.low._;
            tickerData.Volume = element.volume._;
            tickerData.Last = element.last._;
            tickerData.BaseVolume = element.baseVolume._;
            tickerData.TimeStamp = element.RowKey._;
            tickerData.Bid = element.bid._;
            tickerData.Ask = element.ask._;
            tickerData.OpenBuyOrders = element.openBuyOrders._;
            tickerData.OpenSellOrders = element.openSellOrders._;
            tickerData.PrevDay = element.prevDay._;
            tickerData.Created = element.created._;
            tickerData.DisplayMarketName = element.displayMarketName._;
        }
    });
    
    console.log(JSON.stringify(tickerData));

  } else {
    console.log("Error: " + error);
  }
});

console.log("Bittrex data update completed!", timeStamp);
