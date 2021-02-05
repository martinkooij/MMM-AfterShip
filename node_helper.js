/* Magic Mirror
 * Module: MMM-PARCEL
 *
 * By MartinKooij
 * adapted to use tracktry.com
 *
 */
const NodeHelper = require('node_helper');
const apifetch = require('node-fetch') ;
const {Translate} = require('@google-cloud/translate').v2;
const fs = require('fs').promises;
const normalize_tr = require('./normalize-tracktry') ;
const normalize_as = require('./normalize-aftership') ;

//Global variables used by the helper

var updateInterval = 30 * 60 * 1000; // if sending the updateInterval fails set to 30 minutes
var updateLowerBound = 10 * 60 * 1000; //lower bound is normally 10 minutes. Only change during debugging
var translationErrcount = 0;
const transMap = new Map();


module.exports = NodeHelper.create({
	
	start: function() {
		console.log("Starting node_helper for: " + this.name);
		transMap.set("","");
		transMap.set(" ", " ");
	},

	
	translate: async function(data,lang) {
		//sanitized parcel list expected in data parameter, shortcode language in target language. 
		var origstrings = [];
		
		for (var i = 0; i < data.length; i++) {
			const ll = data[i].last_loc ;
			if ( ll ) {
				origstrings.push(ll.info);
				origstrings.push(ll.details);	
			}	
		}
		
		var leftoverstrings = [] ;
		origstrings.forEach(
			(value) => { if (!transMap.get(value)) { leftoverstrings.push(value) ;}}
		);
		
//		console.log("[leftoverstrings =]", leftoverstrings) ;
		
		if (leftoverstrings.length != 0 && this.config.useGoogleTranslate) {
			const translateAPI = new Translate( {keyFilename : "modules/" + this.name + "/parceltranslate-credentials.json"} ) ;
			try{
				let [translation] = await translateAPI.translate(leftoverstrings,lang);
				var translations = Array.isArray(translation)?translation:[translation] ;
				if (this.config.debug) {
					console.log('MMM-Parcel GOOGLE TRANSLATIONS:', leftoverstrings, translations)} ;
				translations.forEach ( (v,i) => {
					transMap.set(leftoverstrings[i],v);
					});
				} catch (err) {
					console.log('PARCELTRANS ERROR No:', translationErrcount++, ", error: ", err);
				}
		};
		
		for (var i = 0; i < data.length; i++) {
			if ( data[i].last_loc ) {
				var tr;
				tr = transMap.get(data[i].last_loc.info) ;
				data[i].last_loc.info = tr?tr:data[i].last_loc.info;
				tr = transMap.get(data[i].last_loc.details) ;
				data[i].last_loc.details = tr?tr:data[i].last_loc.details ;	
			}
		}		
	return data ;
	},
					
	fetchShipments: async function() {
		var parcelList = [] ;
		if (this.config.apiKey || this.config.useTrackTry) {
			var ttResult = await this.fetchTracktry(this.config.apiKey || this.config.useTrackTry);
			parcelList = parcelList.concat(ttResult);
		}
		if (this.config.useAfterShip) {
			var asResult = await this.fetchAfterShip(this.config.useAfterShip);
			parcelList = parcelList.concat(asResult);
		}
		return parcelList;
	},
			
	fetchTracktry: async function(apiKey) {
		var apiurl = 'https://api.tracktry.com/v1' + '/trackings' ;
		var apiurlget = apiurl + '/get?page=1&limit=25';
		console.log('[DEBUG] In Fetch Tracktry Shipments') ;
		try {
			var body ;
			if (!this.config.testRead) {
				let result = await apifetch(apiurlget, {
					headers: { 
						'Content-Type': 'application/json',
						'Tracktry-Api-Key': apiKey
					},
					method: 'GET'
				});
				body = await result.json() ;
			} else {
				body = await this.testRead('modules/'+this.name+'/testparcels.json') ;
			}
			
			if (body.meta.code == 4031) { return [] ;};
			if (body.meta.code != 200) { throw (body) };
			if (this.config.debug) {
				console.log('MMM-Parcel RECEIVED FROM TRACKTRY API', JSON.stringify(body,undefined,2))};
			var resultL = normalize_tr(body.data.items) ;
			if (this.config.autoTranslate) {
				let result = await this.translate(resultL, this.config.autoTranslate);
				return result ;
			} else {
				return resultL
			}				
		} catch (err) {
			console.log('[MMM-Parcelfetcherror]',Date(), err );
			return [] ;
		}
	},			
				
	fetchAfterShip: async function(apiKey) {
		var apiurlget = 'https://api.aftership.com/v4' + '/trackings' ;
		console.log('[DEBUG] In Fetch AfterShip Shipments') ;
		try {
			var body ;
			if (!this.config.testRead) {
				let result = await apifetch(apiurlget, {
					headers: { 
						'Content-Type': 'application/json',
						'aftership-api-key': apiKey
					},
					method: 'GET'
				});
				body = await result.json() ;
			} else {
				body = await this.testRead('modules/'+this.name+'/testparcels-aftership.json') ;
			}
			if (body.meta.code != 200) { throw (body) };
			if (this.config.debug) {
				console.log('MMM-Parcel RECEIVED FROM Aftership API', JSON.stringify(body,undefined,2))};
			var resultL = normalize_as(body.data.trackings) ;
			if (this.config.autoTranslate) {
				let result = await this.translate(resultL, this.config.autoTranslate);
				return result ;
			} else {
				return resultL
			}				
		} catch (err) {
			console.log('[MMM-Parcelfetcherror]',Date(), err );
			return [] ;
		}
	},			

	broadcastShipments: function(payload) {
		if (this.config.debug) {
			console.log('BROADCAST shipments TO MMM-Parcel MODULE ', JSON.stringify(payload,undefined,2))};
		this.sendSocketNotification('API_RESULT', payload);
	},

	
	addmanualtrans : async function() {
			try {
				var data = await fs.readFile('modules/'+this.name+'/manualtrans/' + this.config.autoTranslate + '.json', 'utf8');
				var forceTrans = JSON.parse(data);
				Object.keys(forceTrans).forEach(function(key) {
					transMap.set(key,forceTrans[key]) ;});
				console.log('Message ' + this.name + ': "manualtrans/' + this.config.autoTranslate + '.json" translation file is active');
			} catch (error) {
				console.log('Message ' + this.name + ': "manualtrans/' + this.config.autoTranslate + '.json" translation file could not be found/read. Skipped file entry and continued operations');
			}
	},
	
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'CONFIG') {
			this.config = payload;
		} else if (notification === 'API_FETCHER') {
			(async () => {
				if (this.config.autoTranslate) { await this.addmanualtrans() ;}
				this.startFetcher();
			})();
		} else if (notification === 'INTERVAL_SET') {
			if (this.config.updateLowerBound) {updateLowerBound = this.config.updateLowerBound}
			updateInterval = (payload<updateLowerBound)?updateLowerBound:payload; // 10 minutes minimal
		} else {
			console.log("MMM-Parcel DEBUG arriving FROM Module:", notification, payload);
		}
	},
	
	startFetcher: function() {
		var self = this ;
		(async () => {
			var shipments;
			shipments = await this.fetchShipments();
			this.broadcastShipments(shipments);
		})();
		setTimeout(function(){ self.startFetcher();}, updateInterval )
	},
	
	
	testRead: async function(file) {
		try {
			var data = await fs.readFile(file, 'utf8');
			var json = data ;
			var body = JSON.parse(json);
//			console.log('[DEBUG TESTREAD]:', JSON.stringify(body, undefined, 2));
			return (body) ;
		} catch(e) {
			console.log('testRead ERROR',e); 
			return ( null ) ;
		}
	}
	
});
