const express = require('express');
const { check, validationResult, matchedData } = require('express-validator');
const router = express.Router();
const apirequest = require('request');
var apiKey = require('./apikey') ;

router.get('/', (req, res) => {
  res.render('choose', { title: "MMM-Parcel" } );
});

router.post('/', [], (req, res) => {
  res.render('choose', { title: "MMM-Parcel" } );
});

router.get('/parcel', (req, res) => {
  res.render('parcel', {
    data: {},
    errors: {},
	title: 'MMM-Parcel'
  });
});

router.get('/getonce', (req, res) => {
  res.render('getonce', {
    data: {},
    errors: {},
	title: 'MMM-Parcel'
  });
});

router.post('/parcel', [
  check('trackingcode')
    .isLength({ min: 1 })
    .withMessage('Tracking Code is required')
    .trim(),
  check('handler')
    .isLength({ min: 1})
    .withMessage('Courier Code is required')
    .trim(),
  check('postalcode')
    .trim(),
  check('title')
     .trim()  
], (req, res) => {
  const regex = /^[0-9]{4}[A-Z]{2}$/ ;
  var errors = validationResult(req).mapped();

  if ( (req.body["postalcode"] === "" )&& (req.body["handler"] === "postnl-3s") ) {
	  errors.postalcode = {
		value: "",
		msg: "Postal code is required at postnl-3s",
		param: "postalcode",
		location: "body"
		}
  }	else if (req.body["postalcode"] != "" && req.body["handler"] != "postnl-3s") {
	  errors.postalcode = {
		value: "",
		msg: "Postal code only valid for postnl-3s, leave empty otherwise",
		param: "postalcode",
		location: "body"
		}
  } else if ( (!req.body["postalcode"].match(regex) ) && req.body["handler"] === "postnl-3s") {
	  errors.postalcode = {
		value: "",
		msg: "Postal code has wrong format: use 1234AB",
		param: "postalcode",
		location: "body"
		}
  }	
  
  if (Object.keys(errors).length != 0) {
    return res.render('parcel', {
      data: req.body,
      errors: errors,
	  title : 'MMM-Parcel'
    });
  }
  
    const data = matchedData(req);
    var apiurl = 'https://api.tracktry.com/v1' + '/trackings' ;
	var apiurlpost = apiurl + '/post';
	var apiurlrealtime = apiurl + '/realtime';
	apirequest.post({
			url: apiurlpost,
			json: { tracking_number: data.trackingcode,
					carrier_code: data.handler,
					tracking_postal_code: data.postalcode,
					destination: data.postalcode,
					title: data.title,	
			},
			headers: { 
				'Content-Type': 'application/json',
				'Tracktry-Api-Key': apiKey
			},
			method: 'POST'
			},
		function (e, r, body) {
			if (!e && body.meta.code == 200) {
//				console.log('API e:',e);
//				console.log('API b:', body);
				var bodyrequest = { tracking_number: data.trackingcode,
									carrier_code: data.handler,
									tracking_postal_code: data.postalcode,
									destination: data.postalcode,
									title: data.title
				};
				if (data.postalcode != "") { bodyrequest.destination_code = "nl" } ;
//				console.log('bodyrequest realtime:', JSON.stringify(bodyrequest,undefined,2));
				apirequest.post({  // kick the retrieval by executing once realtime retrieval when entering
					url: apiurlrealtime,
					json: bodyrequest,
					headers: { 
						'Content-Type': 'application/json',
						'Tracktry-Api-Key': apiKey
					},
					method: 'POST'
					},
					function (e, r, body) {     
						if (!e && body.meta.code == 200) {
//							console.log('API e2:',e);
//							console.log('API b2:', JSON.stringify(body, undefined,2));	
							;
						} else {
							console.log('API e3:',e);
							console.log('API b3:', body);
						}
					});
				req.flash('success', 'Entered '+ data.trackingcode + ' to Tracktry.com');
				res.redirect('/');
			} else {
				console.log('API e4:',e);
				console.log('API b4:', body);
				if (!e) {
					req.flash('success', 'Failed to enter '+ data.trackingcode + ' to Tracktry.com:' + body.meta.code + ", "+ body.meta.message);
				} else {
					req.flash('success', 'Failed to enter '+ data.trackingcode + ' to Tracktry.com:' + e.errno + ", "+ e.code);
				}					
				res.redirect('/');
			}
		});
});


router.post('/getonce', [
  check('trackingcode')
    .isLength({ min: 1 })
    .withMessage('Tracking Code is required')
    .trim(),
  check('handler')
    .isLength({ min: 1})
    .withMessage('Courier Code is required')
    .trim(),
  check('postalcode')
    .trim(),
  check('title')
     .trim()  
], (req, res) => {
  var self = this ;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('getonce', {
      data: req.body,
      errors: errors.mapped(),
	  title : 'MMM-Parcel'
    });
  }
  const data = matchedData(req);
    var apiurl = 'https://api.tracktry.com/v1' + '/trackings' ;
	var apiurlpost = apiurl + '/post';
	var apiurlrealtime = apiurl + '/realtime';
	var bodyrequest = { tracking_number: data.trackingcode,
					carrier_code: data.handler,
					tracking_postal_code: data.postalcode,
					destination: data.postalcode,
					title: data.title
			};
	if (data.postalcode != "") { bodyrequest.destination_code = "nl" } ;
	apirequest.post({
			url: apiurlrealtime,
			json: bodyrequest,
			headers: { 
				'Content-Type': 'application/json',
				'Tracktry-Api-Key': apiKey
			},
			method: 'POST'
			},
		function (e, r, body) {
			if (!e && body.meta.code == 200) {
				console.log('API e:',e);
				console.log('API b:', JSON.stringify(body, undefined,2));			
				req.flash('success', 'shown '+ data.trackingcode + ' to console.log');
				res.redirect('/');
			} else {
				console.log('API e:',e);
				console.log('API b:', body);
				if (!e) {
					req.flash('success', 'Failed to enter '+ data.trackingcode + ' to Tracktry.com:' + body.meta.code + ", "+ body.meta.message);
				} else {
					req.flash('success', 'Failed to enter '+ data.trackingcode + ' to Tracktry.com:' + e.errno + ", "+ e.code);
				}					
				res.redirect('/');
			}
		});
});


router.get('/getlist', (req, res) => {
    var apiurl = 'https://api.tracktry.com/v1' + '/trackings' ;
	var apiurlget = apiurl + '/get?page=1&limit=25';
	apirequest.get({
			url: apiurlget,
			headers: { 
				'Content-Type': 'application/json',
				'Tracktry-Api-Key': apiKey
			},
			method: 'GET'
			},
		function (e, r, body) {
				var parcelList = {items : []};
//				console.log('E--------------------------');
//				console.log(e);
//				console.log('R--------------------------');	
//				console.log(r);
//				console.log('B--------------------------');					
				if ( (!e) && ((JSON.parse(body)).meta.code == 200)) {
					var json = JSON.parse(body);
					var itemList = [] ;
//					console.log(JSON.stringify(parcelList,undefined,2));
//					console.log(JSON.stringify(json,undefined,2));
					parcelList.items = json.data.items ;
					console.log(JSON.stringify(parcelList,undefined,2));					
//					parcelList.items.forEach((item,index) => {
						itemList.push({tracking_number : item.tracking_number, carrier_code : item.carrier_code, index : index, status : item.status });
					});
					res.render('getlist', {plpl : itemList, title: 'MMM-Parcel' }) ;
				} else {
				res.render('getlist', {plpl : [], title: 'MMM-Parcel' }) ;					
				console.log(Date(), e, body);
				}
		});
	}
);

module.exports = router;
