var azure = require("azure-storage");

const tbl_store = "bittrexdata";

function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

var dates = {
  convert: function(d) {
    // Converts the date in d to a date-object. The input can be:
    //   a date object: returned without modification
    //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
    //   a number     : Interpreted as number of milliseconds
    //                  since 1 Jan 1970 (a timestamp)
    //   a string     : Any format supported by the javascript engine, like
    //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
    //  an object     : Interpreted as an object with year, month and date
    //                  attributes.  **NOTE** month is 0-11.
    return d.constructor === Date
      ? d
      : d.constructor === Array
        ? new Date(d[0], d[1], d[2])
        : d.constructor === Number
          ? new Date(d)
          : d.constructor === String
            ? new Date(d)
            : typeof d === "object" ? new Date(d.year, d.month, d.date) : NaN;
  },
  compare: function(a, b) {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    //  -1 : if a < b
    //   0 : if a = b
    //   1 : if a > b
    // NaN : if a or b is an illegal date
    // NOTE: The code inside isFinite does an assignment (=).
    return isFinite((a = this.convert(a).valueOf())) &&
      isFinite((b = this.convert(b).valueOf()))
      ? (a > b) - (a < b)
      : NaN;
  },
  inRange: function(d, start, end) {
    // Checks if date in d is between dates in start and end.
    // Returns a boolean or NaN:
    //    true  : if d is between start and end (inclusive)
    //    false : if d is before start or after end
    //    NaN   : if one or more of the dates is illegal.
    // NOTE: The code inside isFinite does an assignment (=).
    return isFinite((d = this.convert(d).valueOf())) &&
      isFinite((start = this.convert(start).valueOf())) &&
      isFinite((end = this.convert(end).valueOf()))
      ? start <= d && d <= end
      : NaN;
  }
};

module.exports = function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  if (req.query.ticker) {
    /* retrieve ticker info */
    var tickerData = {};

    var query = new azure.TableQuery().where(
      "PartitionKey eq ?",
      req.query.ticker
    );

    tableSvc.queryEntities(tbl_store, query, null, function(
      error,
      result,
      response
    ) {
      if (!error) {
        result.entries.forEach(element => {
          if (isEmpty(tickerData)) {
            context.log("Is Empty");
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
          } else {
            if (dates.compare(element.RowKey._, tickerData.TimeStamp) == 1) {
              context.log("Update tickerData");
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
            }
          }
        });

        context.res = {
          // status: 200, /* Defaults to 200 */
          body: tickerData
        };
      } else {
        context.res = {
          status: 404,
          body: "Not Found"
        };
      }
    });
  } else {
    context.res = {
      status: 400,
      body: "Please pass a market name in the  query string"
    };
  }

  context.done();
};
