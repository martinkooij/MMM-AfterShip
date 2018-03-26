/* Magic Mirror
 * Module: MMM-PARCEL
 *
 * By MartinKooij
 *
 */
const NodeHelper = require('node_helper');
const aftershipSDK = require('aftership');
const FREEtranslate = require('google-translate-api');
const fs = require('fs');

//Global variables used by the helper
var parcelResult = {trackings:[]};
var updateInterval = 30000;
var translationErrcount = 0;
var lastTexts = [];
var lastTrans = [];
var forceTrans = {};



module.exports = NodeHelper.create({
	
	start: function() {
		console.log("Starting node_helper for: " + this.name);
		fs.readFile('modules/'+this.name+'/force_trans.json', 'utf8', function (err, data) {
			if (!err) {
				forceTrans = JSON.parse(data);
			} else {
				console.log('Message ' + this.name + ': no "force_trans.json" translation file found. This is no problem');
			}
		});
	},

	equalsarray: function(a,b) {
		if (a.length != b.length) {return false;}
		for (var i=0; i<a.length; i++) {
			if (a[i] != b[i]) {return false;}
		}
		return true;
	},
	
	translateMessage: function(orig,lang,mplace,i) {
		FREEtranslate(orig, {to: lang}).then(res => {
			var trans = forceTrans[orig] || res.text;
//			console.log("TRANSLATED: ", orig, 'into ', trans);
			parcelResult.trackings[mplace.p].checkpoints[mplace.cp].translated_message = trans;
			lastTrans[i] = trans;
			translationErrcount = 0;
		}).catch(err => {
			translationErrcount++;
			console.error(err);
		});
	},
	
	translate: function(data,lang) {
		if (translationErrcount > 100) {return;}
		if (translationErrcount > 90) { 
			console.log(Date(), "Too many translation API call errors, translations will be stopped (soon) ", 100 - translationErrcount);
		}
		
		if (data.trackings.length == undefined) {return;}
		var mstrings = [];
		var mplaces = [];
		for (var i = 0; i < data.trackings.length; i++) {
			var j = data.trackings[i].checkpoints.length;

			if ( j == undefined) {break;}	

			mstrings.push(data.trackings[i].checkpoints[j-1].message);
			mplaces.push({p:i,cp: j-1});
		}
		if (this.equalsarray(lastTexts,mstrings)) {
			for (i = 0; i < mplaces.length; i++ ) {
				parcelResult.trackings[mplaces[i].p].checkpoints[mplaces[i].cp].translated_message = lastTrans[i];
			}
			return;
		}
			
		lastTexts = mstrings.slice();
		lastTrans = mstrings.slice();
		for (i = 0; i < mplaces.length; i++ ) {
			this.translateMessage(mstrings[i],lang, mplaces[i],i);
		}
	},
			
				
	
	fetchShipments: function() {
		var self = this;
		var aftershipAPI = new aftershipSDK(this.config.apiKey);
		aftershipAPI.GET('/trackings', function(err, result) {
			if (!err) {
				if (self.config.autoTranslate) {
					parcelResult = result.data;
					self.translate(parcelResult, self.config.autoTranslate);
				} else {
					parcelResult = result.data;
				}
			} else {
				console.log(Date(), err);
			}
		});		
	},
	
	broadcastShipments: function() {
		this.sendSocketNotification('AFTERSHIP_RESULT', parcelResult);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === 'CONFIG') {
			this.config = payload;
		} else if (notification === 'AFTERSHIP_FETCHER') {
			this.startUpdateNext();
		} else if (notification === 'INTERVAL_SET') {
			updateInterval = (payload<30000)?30000:payload;
		} else {
			console.log("OOPS. ", notification, payload);
		}
	},
	
	startUpdateNext: function() {
		var self = this;
		this.fetchShipments();
		setTimeout(function(){ self.UpdateNext();}, 3000 ); // give the API some time to return
	},
		
	UpdateNext: function(){
		var self = this;
		this.broadcastShipments();
		setTimeout(function () {
			self.startUpdateNext();
			},updateInterval);
	},
	
});


/* This is for testing */
const parcelTestAnswer = JSON.parse( '{\
        "page": 1,\
        "limit": 100,\
        "count": 3,\
        "keyword": "",\
        "slug": "",\
        "origin": [],\
        "destination": [],\
        "tag": "",\
        "fields": "",\
        "created_at_min": "2014-03-27T07:36:14+00:00",\
        "created_at_max": "2014-06-25T07:36:14+00:00",\
        "trackings": [\
            {\
                "id": "53aa7b5c415a670000000021",\
                "created_at": "2014-06-25T07:33:48+00:00",\
                "updated_at": "2014-06-25T07:33:55+00:00",\
                "tracking_number": "123456789",\
                "tracking_account_number": null,\
                "tracking_postal_code": null,\
                "tracking_ship_date": null,\
                "slug": "dhl",\
                "active": false,\
                "custom_fields": {\
                    "product_price": "USD19.99",\
                    "product_name": "iPhone Case"\
                },\
                "customer_name": null,\
                "destination_country_iso3": null,\
                "emails": [\
                    "email@yourdomain.com",\
                    "another_email@yourdomain.com"\
                ],\
                "expected_delivery": null,\
                "note": null,\
                "order_id": "ID 1234",\
                "order_id_path": "http://www.aftership.com/order_id=1234",\
                "origin_country_iso3": null,\
                "shipment_package_count": 0,\
                "shipment_type": null,\
                "signed_by": "raul",\
                "smses": [],\
                "source": "api",\
                "tag": "Delivered",\
                "title": "Pakje met iPhone",\
                "tracked_count": 1,\
                "unique_token": "xy_fej9Llg",\
                "checkpoints": [\
                    {\
                        "slug": "dhl",\
                        "city": null,\
                        "created_at": "2014-06-25T07:33:53+00:00",\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested",\
                        "country_iso3": null,\
                        "tag": "InTransit",\
                        "checkpoint_time": "2014-05-12T12:02:00",\
                        "coordinates": [],\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DT123456789",\
                "expected_delivery": null,\
                "tag": "InfoReceived",\
				"slug": "fedex",\
                "title": null,\
				"checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": "Denver",\
                        "country_name": "US",\
                        "message": "Waiting for packet",\
						"checkpoint_time": "2018-03-26T09:02:00",\
                        "state": "CO",\
                        "zip": null\
                   }\
                ]\
			},\
			{\
                "tracking_number": "3DS12111111",\
                "expected_delivery": "2018-03-29",\
                "tag": "InTransit",\
                "title": null,\
				"slug": "postnl",\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - ADAM",\
                        "message": "Onderweg uit sorteercentrum",\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DS12111111",\
                "expected_delivery": "",\
                "tag": "Pending",\
				"slug": "fedex",\
                "title": "Electronics spul"\
            },\
			{\
                "tracking_number": "3DT123456789",\
                "expected_delivery": null,\
                "tag": "AttemptFail",\
                "title": null,\
				"slug": "postnl",\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - Ldorp",\
                        "message": "Niet thuis, handtekening benodigd",\
 						"checkpoint_time": "2018-03-26T09:02:00",\
						"state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DT123456789",\
                "expected_delivery": "2018-04-02",\
                "tag": "OutForDelivery",\
				"slug": "postnl",\
                "title": null,\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - Ldorp",\
                        "message": "Onderweg",\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DT11111111",\
                "expected_delivery": "2018-03-26T07:33:55+00:00",\
                "tag": "Delivered",\
                "updated_at": "2018-03-26T07:33:55+00:00",\
				"slug": "postnl",\
                "title": null,\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - Ldorp",\
                        "message": "Onderweg",\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DT122222222",\
                "expected_delivery": "2018-03-23T07:33:55+00:00",\
                "updated_at": "2018-03-23T07:33:55+00:00",\
                "tag": "Delivered",\
				"slug": "postnl",\
                "title": null,\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - Ldorp",\
                        "message": "Onderweg",\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            },\
			{\
                "tracking_number": "3DT123333333333",\
                "expected_delivery": "2018-02-26T07:33:55+00:00",\
                "updated_at": "2018-02-26T07:33:55+00:00",\
                "tag": "Delivered",\
				"slug": "postnl",\
                "title": null,\
                "checkpoints": [\
					{\
                        "country_name": "VALENCIA - SPAIN",\
                        "message": "Awaiting collection by recipient as requested"\
					},\
				    {\
                        "city": null,\
                        "country_name": "POSTNL - Ldorp",\
                        "message": "Onderweg",\
                        "state": null,\
                        "zip": null\
                    }\
                ]\
            }\
        ]\
    }');
