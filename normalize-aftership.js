/*******************************/
/* Normalizer to prepare for various interfaces
/* MMM-Parcel
/* Martin Kooij 
/* 2021
/*******************************/
var moment = require('moment');

function normalize(rawList) {  // normalize for Aftership Interface
		const statMap = new Map();
		var list = [];
		if ( !Array.isArray(rawList)) { return (list)}
		setMap(statMap) ;
//		console.log('DEBUG normalize aftership');
//		printMap(statMap);
		for (const rawItem of rawList) {
			var item = {
				courier_name : "",
				courier_code : "no_courier",
				status : "exception",
				tobe_collected: false,
				substatus : null,
				tracking_code : "No track",			
				title : "" ,
				updated_time : "2000-01-01",
				expected_deliverytime : "2000-01-01",
				last_loc: null
				} ;
			try {
				var lastLoc = {} ;
				item.courier_name = null ;
				item.courier_code = rawItem.slug ;
				item.tobe_collected = (rawItem.tag === "AvailableForPickup") ;
				item.status = statMap.get(rawItem.tag)?statMap.get(rawItem.tag.toLowerCase()):"pending" ; // only known statuses are passed all others are mapped to "pending"
				item.tracking_code = rawItem.tracking_number ;			
				item.title = rawItem.title ;
				item.updated_time = rawItem.updated_at ;
				item.expected_deliverytime = rawItem.expected_delivery ;
				item.substatus = null ;
				const rawLoc = (rawItem.checkpoints && rawItem.checkpoints.length != 0)?
					rawItem.checkpoints[rawItem.checkpoints.length - 1] : null ;
					console.log('DEBUG aftership normalize', JSON.stringify(rawLoc));
				if (rawLoc) {
					lastLoc.time = rawLoc.checkpoint_time ;
					if (rawLoc.subtag_message && (rawLoc.subtag_message != "Delivered")) {
						lastLoc.info = rawLoc.message.trim() + ", " +rawLoc.subtag_message.trim();
					} else {
						lastLoc.info = rawLoc.message.trim()
					};
					var d = rawLoc.location ;
					if ( rawLoc.state && rawLoc.state != "" && !d.includes(rawLoc.state)) {
						d += ("," + rawLoc.state)
					}
					if ( rawLoc.country_name === "NLD") {rawLoc.country_name = "NL" ;} // to prevent double country info NL vs NLD
					if ( rawLoc.country_name && rawLoc.country_name != "" && !d.includes(rawLoc.country_name)) {
						d += ("," + rawLoc.country_name)
					}
					console.log('DEBUG normalize AS, d = ', d);
					lastLoc.details = d?d.trim():"" ;
					item.substatus = rawLoc.subtag ;  // note that this is moved to toplayer
				}
				item.last_loc = (Object.keys(lastLoc).length > 0)?lastLoc:null; ;
			} catch(e) { console.log ('[ERROR NORMALIZING Parcel in MMM-Parcel]', e, rawItem);} ;
			
			list.push(item) ;
		}
		return list ;
}

function setMap(map) {
	//defaults
	const statusList = ["exception","undelivered", "indelivery", "transit", "pending", "notfound", "delivered", "expired"] ;
	const aftershipList = ["exception","attemptfail","outfordelivery","intransit", "inforeceived","notfound","delivered","expired"]
	statusList.forEach( (v,i) => map.set(aftershipList[i],v) ) ;
	//extra mappings
	map.set("availableforpickup","delivered") ; // mark pickup as delivered. 
}

function printMap(map) {
	map.forEach( (v,k) => console.log('<',k,',',v,'>' )) ;
}

function adaptTime(item,t) {
	if (item.courier_code === "postnl-3s") {
		if (t && !t.includes("-", 11) && !t.includes("+", 11) ) {t = t.trim()+"+0700"}; // adjust time at postnl-3s if no TZ given
	}
	return t // no adjustments known for other couriers
}

function newest(loc1,loc2) {
	if (!loc1 && !loc2){ return null ;}
	if (!loc1 && loc2) { return loc2 ;}
	if (!loc2 && loc1) { return loc1 ;}
	if (moment(loc1.Date) < moment(loc2.Date)) {return loc2;}
	return loc1 ;
}
	

module.exports = normalize ;

/******************** DEFINITION of normalized RESULT ****************
/* 	[
/*  	{
/* 		courier_name : full text name of courier if available (not used in MMM-Parcel),
/* 		courier : short code of courier,
/*		status : one of "exception","undelivered", "indelivery", "transit", "pending", "notfound", "delivered", "expired",
/*		substatus : substatus (see internet, not (yet) used in MMM-Parcel)
/*		tobe_collected : if parcel can be collected by recipient
/*		tracking_code : tracking identifier ;			
/*		title : text title ,
/*		updated_time :last updated time of tracking item in interface ( parsable time string),
/*		expected_deliverytime : expected delivery time if available (parsable time string),
/*		last_loc : 
/*		  {
/*			time : time at this location event,
/*			info : textual description of status at location,
/*			details : extra details (city, state, country, etc. depending on availbility in API)
/*		  }
/*		} ,
/*		...
/*	]
/****************************************************************************/		
