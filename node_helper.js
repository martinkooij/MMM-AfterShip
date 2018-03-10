/* Magic Mirror
 * Module: MMM-PARCEL
 *
 * By MartinKooij
 *
 */
const NodeHelper = require('node_helper');
const aftershipSDK = require('aftership');
var mmparcelResult = {trackings:[]} ;
var mmparcelUpdateInterval = 30000 ;

module.exports = NodeHelper.create({
	
    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },
	
	fetchShipments: function() {
        var aftershipAPI = new aftershipSDK(this.config.apiKey);
        aftershipAPI.GET('/trackings', function(err, result) {
			if (!err) {
				mmparcelResult = result.data ;	
			} else {
				console.log(Date(), err);
			}
		});		
    },
	
    broadcastShipments: function() {
		this.sendSocketNotification('AFTERSHIP_RESULT', mmparcelResult);
    },

    socketNotificationReceived: function(notification, payload) {
    	 if (notification === 'CONFIG') {
            this.config = payload;
		} else if (notification === 'AFTERSHIP_FETCHER') {
            this.startUpdateNext() ;
		} else if (notification === 'INTERVAL_SET') {
			mmparcelUpdateInterval = (payload<30000)?30000:payload;
			console.log(notification, " <== ", payload, "; ", mmparcelUpdateInterval) ;
        } else {
			console.log("OOPS. ", notification, payload) ;
		}
	},
	
	startUpdateNext: function() {
		var self = this ;
		this.fetchShipments();
		setTimeout(function(){ self.UpdateNext();}, 3000 ) ; // give the API some time to return
	},
		
	UpdateNext: function(){
		var self = this ;
		this.broadcastShipments();
		setTimeout(function () {
					self.startUpdateNext();
					},mmparcelUpdateInterval);
	},
	
});
