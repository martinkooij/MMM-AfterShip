## MMM-Parcel

Track deliveries . Supports >700 couriers worldwide based on tracktry.com API / AfterShip API

## Here's what you get

View parcel tracking status, for display on Magic Mirror.
Inspired by MMM-AfterShip by Mykle1.

## Examples

![](pictures/1.png)

Example of the same in the compact view:

![](pictures/2.png)

And in the very compact view (one-liner per shipment):

![](pictures/3.png)

## Installation / Getting Started

* Go into the `~/MagicMirror/modules` directory and do `git clone https://github.com/martinkooij/MMM-Parcel`.

* Go into the MMM-Parcel directory and do `npm install`

* EITHER

* - Get an account on tracktry.com (Free account is OK if you track less than 100 parcels per month)

* - Get your API Key from https://my.tracktry.com/ via settings -> API key (at bottom of webpage). 

* OR

* - Login into your account on aftership.com (legacy accounts works again with a newly generated key, see note further on in the documentation)

* - Get your API Key from https://admin.aftership.com/settings -> API Keys (at right hand top of webpage). 

* THEN Add your own trackings to display on the mirror: 

* - Tracktry: number and courier code necessary, courier codes can be found at tracktry.com website

* - AfterShip: press add tracking. It will guide you through entering the parcel. For deleting a tracking you have to open the parcel details and press the "delete"-icon. Only parcels entered via the Aftership website will be shown on the mirror. Parcels entered via the aftership mobile app are not displayed on the mirror. 

* Aftership is advised (if you still have access to an older free account). More reliable details are provided via this API.  

* Tell me what you like, or any issues you have.

## Updates
Do a `git pull` in the MMM-Parcel module directory. Running a `npm install` again in the same directory is recommended and does no harm. 
In case supporting features need new packages the `npm install` is mandatory. This will be indicated in the release notes.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
{
module: 'MMM-Parcel',
position: 'top_right',	// This can be any of the regions. Best results in left or right regions.
header: 'My Parcels',   // This is optional
config: {
	useAfterShip: 'Your API KEY goes here', // Your API Key from aftership.com, comment line otherwise
	useTrackTry: 'Your API KEY goes here', // Your API key from tracktry.com, comment line otherwise
	maxNumber: 10, //maximum number of Parcels to show
	showCourier: true,
	autoHide: false, // hide module on mirror when there are no deliveries to be shown
	isSorted: true,  // sort on delivery Status (most important ones first)
	compactness: -1, // 0 = elaborate, 1 = compact display, 2 = very compact, one-liner per shipment, -1 = automatic
	hideExpired: true, // don't show expired parcels
	hideDelivered: 15, // Hide delivered parcels after 15 days. 
	updateInterval: 30 * 60 * 1000, // 30 minutes = 30 * 60 * 1000 milliseconds.
                                    // The API refreshes info from couriers every three hours, so don't go too low
	parcelStatusText: ["Exception", "Failed Attempt", "In Delivery", "In Transit", 
	                    "Info Received", "Not Found", "Delivered", "Expired"], // This is the default. Enter your own language text
	parcelIconColor: ["red", "red", "green", "green", "cornflowerblue", "cornflowerblue", "grey", "grey"], // This is the default. Change for other icon colors
	onlyDaysFormat: {
	  lastDay : '[Yesterday]',
	  sameDay : '[Today]',
	  nextDay : '[Tomorrow]',
	  lastWeek : '[Last] dddd',
	  nextWeek : 'dddd',
	  sameElse : 'L'
	  }, // formatting when only days are shown and time is unknown, change to your preferred language. 
    expectedDeliveryText: 'Delivery Expected',  // Obsolete in tracktry Interface.
    lastUpdateText: 'last Updated: ',     // This is the default, change to your preferred language. 
    noParcelText: 'No Shipment Data'	  // This is the default, change to your preferred language. 
	}
},
````

The above example is a bit long. If you are OK with English texts and you do like the default colors and settings 
provided by the module the following simple config suffices!

````javascript
{
module: 'MMM-Parcel',
position: 'top_right',	// This can be any of the regions. Best results in left or right regions.
header: 'My Parcels',   // This is optional
config: {
	useTrackTry: 'Your API KEY goes here' // Your API Key from tracktry.com
	}
},
````

## Basic configuration options

The following properties can be configured:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>apiKey</code></td>
			<td>DEPRECATED: Your Tracktry API access token, you can get it via <a href="https://tracktry.com">tracktry.com</a>. This parameter is for backwards compatibility with version 2. Is basically the same as the <code>useTrackTry</code> parameter<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>none</code>
			</td>
		</tr>
			<td><code>useTrackTry</code> or <code>useAfterShip</td>
			<td>Your Tracktry and/or AfterShip API access token. Use <em>one</em> of the two. Aftership is has the better API, they have restored free API access for legacy users. NOTE: The module will technically work with both keys present, in that case the list of parcels will be combined list of the entered parcels from both companies.<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>none</code>
			</td>		
		<tr>
			<td><code>maxNumber</code></td>
			<td>Maximum number of parcels that are shown<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>10</code>
			</td>
		</tr>
		</tr>
		<tr>
			<td><code>showCourier</code></td>
			<td> Determines whether  the shortcode of the courier in the Parcel header is shown<br>
				<br><b>Possible values:</b> <code>true</code>, <code>false</code>
				<br><b>Default value:</b> <code>true</code>
				<br><b>Example:</b> "3DT123456789(In transit, fedex)" is shown when <code>showCourier: true</code> 
				and "3DT123456789(In transit)" is shown when <code>showCourier: false</code>
			</td>
		</tr>
		<tr>
			<td><code>hideDelivered</code></td>
			<td>Determines how many days parcels with status "Delivered" should be shown.<br>
				<br><b>Possible values:</b> <code>integer</code> or <code>boolean</code>
				<br><b>Default value:</b> <code>false</code>
				<br><b>Examples:</b> When `boolean` the config parameter determines whether delivered packages are hidden. The default is 
				<code>false</code> which means "not hidden". When using an `integer` the parameter value indicates for how many days delivered parcels should be shown.  A value of <code>10</code> means "hide the Delivered Packages after 10 days".
			</td>
		</tr>
		<tr>
			<td><code>updateInterval</code></td>
			<td>Time between requests to the API in milliseconds<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>1800000</code> =30 minutes.
				<br><b>Note:</b> Internally the module sets 90000 (1.5 minute) as an absolute lower bound, whatever the config value is. Don't overload the API! The values are only updated by tracktry every 2 to 3 hours anyway.  
			</td>
		</tr>
				<tr>
			<td><code>maxWidth</code></td>
			<td>Set the  width of your module on the screen in pixels.<br>
				<br><b>Possible values:</b> <code>string</code> 
				<br><b>Default value:</b> <code>"450px"</code>
				<br><b>Note:</b> The module will automatically adapt the layout to fit better in a narrower space, when the space given 
				in maxWidth is narrower than 400px.
			</td>
		</tr>
	</tbody>
</table>

## Advanced Options and Language Options

<table>
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>compactness</code></td>
			<td>Determines whether the expected delivery time (if known for the parcel) is shown on a separate line or on the same line 
			     as the parcel header (see example pictures). <br>
				<br><b>Possible values:</b> <code>-1</code>, <code>0</code>, <code>1</code> or <code>2</code>
				<br><b>Default value:</b> <code>-1</code>
				<br><b>Note:</b> <code>0</code> displays the shipment with expected delivery time (if present) on a separate line.
				it also displays a separate info line on the latest checkpoint (if present).
				<code>1</code> shows a more compact version and <code>2</code> effectively makes it a one-liner per shipment. 
				<code>-1</code> (=automatic) takes a compactness depending on the #parcels shown 
				   (<code>0</code> when <=3, <code>1</code> when <=6, <code>2</code> in case of long lists). 
				   It mostly has a "vertical" effect (the higher the compactness level, the less lines it takes on the mirror). 
			</td>
		</tr>
		<tr>
			<td><code>forceNarrow, forceWide</code></td>
	<td> Manually set the layout for the width. Set <em>one</em> of the two or <em>none</em> (default).<br>
				<br><b>Possible values:</b> <code>true</code> (or <code>false</code>)
				<br><b> Default value:</b> None set. 
				<br><b>Example:</b> <code>forceNarrow: true</code>, when set forces a "narrow" layout (= the layout used when maxWidth <400px) even 
				when the module is give a space of 400 pixels or wider. Setting <code>forceWide: true</code> does the reverse. 
				The "narrow" vs "wide" layout mainly has a "horizontal" effect. It changes the layout to fit better in narrow spaces or wider spaces
				respectively.
				<br><b>Note:</b> Playing with manually set compactness and "narrowness" is possible, however the default automatic behavior should 
				be working for most. 
			</td>
		</tr>
		<tr>
			<td><code>isSorted</code></td>
			<td>Parcels are shown in a sorted order depending on status. The module implements a fixed --non-configurable-- sort order 
			    for the parcel statuses from the API. The order is:	<code>Exception</code>, <code>AttemptFail</code>,
			    <code>OutForDelivery</code>, <code>InTransit</code>, <code>InfoReceived</code>, 
				<code>Pending</code>, <code>Delivered</code>, <code>Expired</code><br>
				<br><b>Possible values:</b> <code>true</code>, <code>false</code> 
				<br><b>Default value:</b> <code>true</code>
				<br><b>Note:</b> Exceptions first, Expired last. Sort is according to urgency of action needed from the receiver. If not sorted 
				the ordering is the random ordering as received by the API. 
			</td>
		</tr>
		<tr>
			<td><code>autoHide</code></td>
			<td>The module hides itself when there are no parcels found<br>
				<br><b>Possible values:</b> <code>true</code>, <code>false</code> 
				<br><b>Default value:</b> <code>false</code>
				<br><b>Note:</b> Hide module from the mirror when there are no Parcels to be shown. Also reduces the update interval 
				to minimally every 15 minutes or else 2 times the configured <code>updateInterval</code> whichever one is the longest. 
				Also it unhides itself and shows "No Shipment Data" on the mirror at a random time between 6AM and 10.30PM for half an hour everyday. This cannot 
				be surpressed. 
			</td>
		</tr>
		<tr>
			<td><code>hideExpired</code></td>
			<td>Determines whether parcels with status "Expired" should be shown.<br>
				<br><b>Possible values:</b> <code>true</code>, <code>false</code> 
				<br><b>Default value:</b> <code>true</code>.
			</td>
		</tr>
		<tr>
			<td><code>parcelIconColor</code></td>
			<td>Colors of the parcel status icons in the header<br>
				<br><b>Possible values:</b> <code>[string,...,string]</code>. Array of 8 strings defining the icon colors. 
				<br><b>Default value:</b> <code>["red","red","green","green","cornflowerblue","cornflowerblue","grey","grey"]</code>. 8 colors.
				<br><b>Note:</b> The colors are icon colors of the Parcel Status in the same order as the texts in the <code>isSorted</code> option above.
				When you are comfortable with the above mentioned colors you do not need to specify this item in the module-config. 
				<br><b>Note:</b> If the extra info line (whether visible or not) contains the text "to be collected" the parcel is marked as delivered but should still be collected. 
				To make that visible the icon color of the delivered icon changes in that case
				to the color of <code>OutforDelivery</code> status. 
			</td>
		</tr>	
		<tr>
			<td><code>parcelStatusText</code></td>
			<td>Text to show for the statuses of the Parcel<br>
				<br><b>Possible values:</b> <code>[string,...,string]</code>. Array of exactly 8 strings defining the names for the statuses in the order mentioned in the
				       <code>isSorted</code> option above. 
				<br><b>Default value:</b> <code>["Exception",...,"Expired"]</code>. English is default. Choose your own language descriptions.
				<br><b>Example:</b> <code> parcelStatusText: ["Fout", "Mislukte bezorging","In bezorging","Onderweg", 
                				"Ingevoerd", "Niet Gevonden", "Afgeleverd", "Te oud"],</code> for Dutch Status texts. 
                                If you trust the colored status icons to guide you,you can leave all
								(or some) of these texts empty by defining empty strings (<code>""</code>). Just take care to specify an array of total exactly 8 strings! 
								Default are English texts, if you are happy with the English descriptions you may leave this item out of your module-config.  
			</td>
		</tr>			
		<tr>
			<td><code>onlyDaysFormat</code></td>
			<td>Format for delivery time when only date, and no hour is yet known for the Parcel. In moment.js calendar format<br>
				<br><b>Possible values:</b> <code>moment.js calendar locale specification</code>
				<br><b>Default value:</b> 
				<br><code>{lastDay : '[Yesterday]',</code>
				<br> <code>sameDay : '[Today]',</code>
				<br> <code>nextDay : '[Tomorrow]',</code>
				<br> <code>lastWeek : '[Last] dddd',</code>
				<br> <code>nextWeek : 'dddd',</code>
				<br> <code>sameElse : 'L'}</code>
				<br><b>Example:</b> Fill in your language preference. English is default. Only relevant when <code>compactness: 0</code>. 
				 This option does nothing otherwise. 
			</td>
		</tr>
		<tr>
			<td><code>expectedDeliveryText</code></td>
			<td>Text to show before showing the expected delivery date<br>
				<br><b>Possible values:</b> None
				<br><b>Default value:</b> "Expected Delivery:"
				<br><b>Example:</b> Use "Bezorging verwacht:" in case you are Dutch. Only useful if compactness is 0 or -1. 
			</td>
		</tr>
		<tr>
			<td><code>lastUpdateText>
			<td>Text to show when there are no trackings to show<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>"Last Updated:"</code>
				<br><b>Example:</b> Use "Bijgewerkt:" in Dutch for example. Only useful if compactness is 0 or -1.
			</td>
		</tr>
		<tr>
			<td><code>noParcelTextde></td>
			<td>Text to show when there are no trackings to show<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>"No Shipment Data"</code>
				<br><b>Example:</b> Use "Geen pakketten weer te geven" in Dutch for example.
			</td>
		</tr>
		<tr> 
		    <td><code>autoTranslate</code></td>
			<td>Translate text shown on the infoline into your own language of choice via Google Translate API<br>
				<br><b>Possible values:</b> <code>language string</code>. 
				<br><b>Default value:</b> <code>false</code>
				<br><b>Example:</b> See description below for use. The Google API is not called/used if <code>false</code> or if the option is absent. See below for setting the autoTranslate feature. 
			</td>
		</tr>
	</tbody>
</table>

## Managing the parcels

You can manage the parcels to be tracked on the mirror by managing the list in the website of the provider (Tracktry or AfterShip). 

For Tracktry: use https://my.tracktry.com/shipments. Here you can enter new parcels to be tracked and delete selected parcels from the list again if no longer relevant. Tracking number and courier code are mandatory. In this webarea you will also find your monthly usage and your API key. 

Works about the same for the AfterShip API. Manage you trackings via the website (https://admin.aftership.com/shipments). Here you can add and delete shipments. The shipments in this list will shown on the mirror. 

## Auto Translation
Many couriers enter checkpoint message in the language of the country of origin. The MMM-Parcel module contains a translation feature of these information texts based on the Google Translate API, with a free 500.000 characters per month. 

To get the Google Translate API to work you need to set up quite a structure in google cloud platform (GCP). Just leave it to English if you don't want to go down this road. 
Basically the steps are as follows ( Additional help documents with detailed explanations are available at GCP). 
* Make a GCP account, and activate billing
* create a project (e.g. MagicMirror) and enable the translate API on this project
* create a service account and generate and download the json service account key-file.
* copy the key file to parceltranslate-credentials.json in the MMM-Parcel directory. 

The code is efficient in calling this API. Already translated sentences are stored in memory for retrieval, so the translate API is used for new translations only, or after a reboot. With 100 Parcels / month it will be practically impossible to surpass the maximum free Google Translate tier of 500.000 characters per month. 

<code>autoTranslate</code> should be set to a valid language string (see https://cloud.google.com/translate/docs/languages).  Translation services will not be called if <code>autoTranslate</code> is absent or set to <code>false</code>. 
 
An example of a non-translated view on the mirror: 
 
![](pictures/4.png)

The infotexts can be automatically translated via Google translate API. 
Add for example <code>autoTranslate : "en",</code> in the <code>config.js</code> file in the MMM-Parcel descriptions. 
 Restart the mirror and off you go! The translation API is only called when there is a change in the deliveries.  
 
 ![](pictures/5.png)

I adapted my mirror module to be a Dutch mirror by setting Dutch language settings and autoTranslate to <code>"nl"</code> in the config:
````javascript
{
module: 'MMM-Parcel',
position: 'top_right',
header: 'Pakjes',   
config: {
	apiKey: 'XXXXXXXXXXXXXX', // API key of Aftership
	compactness: -1,
	autoTranslate: "nl",
	parcelStatusText: ["Fout", "Mislukte bezorging","In bezorging","Onderweg", "Ingevoerd", "Wachtend", "Afgeleverd", "Te oud"],
	onlyDaysFormat: 
		{lastDay : '[gisteren]',
		 sameDay : '[vandaag]',
		 nextDay : '[morgen]',
		 lastWeek : '[afgelopen] dddd',
		 nextWeek : 'dddd',
		 sameElse : 'L'},
    lastUpdateText: 'Bijgewerkt: ',
    noParcelText: 'Geen Pakketten weer te geven'
	}
},
````

And Yo, see the Dutch mirror:

![](pictures/6.png)


<em>Advanced users:</em> When you don't like certain automated translations you can put a forced translation JSON file in a MMM-Parcel module subdirectory  <code>manualtrans/xx.json</code>, where "xx" is the selected language ("manualtrans/nl.json" for Dutch). 
Don't worry, all files in the `manualtrans/` directory are ignored by `git pull` so will not be overwritten by a normal update of the module; except in the case of a clean re-install, of course. The file is a JSON formatted text file (don't make any JSON syntax errors!) of translation pairs of original texts (full sentences) and translated texts. The translation translates complete message lines only. 
Example:
````
{
"Departed" : "Vertrokken", 
"Processed Through Facility": "Verwerkt in sorteercentrum"
}
````

## A note on AfterShip usage versus tracktry.com
It's all about the money. 

Aftership has changed their commercial offerings for API usage. In 2020 they restricted API use to the >199$/month plans only, but after user request they have now improved some. You can login on aftership.com => setting => billing and see if you have a legacy plan (it used to be free till 100 parcels/month). Probably you have that plan if you have created a plan before May 2020. You are in luck in that case. Don't change this plan(!). A newly generated API key (at settings => API keys) will in that case work. And it will still be free! The earlier generated keys still have problems at my account, but your mileage may vary. 

If you are a new user tot AfterShip and want API access you're stuck with the <em>9$/month plan</em> or more. Alas, I checked, for new users the free tier does not work anymore! However, if you choose <em>any</em> paid plan you can now generate an API key and use it. This starts from 9$/month. Choosing plans works via aftership.com => login account => settings => billing. 

For the moment <em>tracktry.com</em> is still free. The API is a less informative and accurate, but at least it works with the free tier (although that is not officially advertised at their site). 

## Usage with Post NL (postnl-3s)
THIS PARAGRAPH ONLY FOR POSTNL USERS ON TRACKTRY.COM. Aftership works fine as is. 

For Dutch users, the web interface at tracktry.com does not allow for entering the receiver postal code, necessary to get a valid response other than "pending" from postnl-3s (all postnl parcels that start with 3Sxxxxxxxxxxx).   

To work around this problem the MMM-Parcel package also installs a very basic extra webinterface to tracktry.com. This MMM-Parcel web interface comes *with* a possibility to enter the receiver postal code necessary for your postnl-3s packages. Note that once entered they are counted towards your tracktry.com tier. Also you will be able to see, manage and delete the items on the my.tracktry.com => Shipments page.

To start this local MMM-Parcel webinterface you will need to go to the <code>MMM-Parcel/webinterface</code> directory. You have to enter your own tracktry API key in the `src/apikey.js` code and subsequently start the website with <code>npm start parcelweb &</code> in that directory. Or preferrably use the <code>pm2</code> feature for that, so it will start automatically at boot time or when it crashes for whatever reason. For this to work goto `webinterface/src` directory. Enter `pm2 start parcelweb.js`. It will now prompt you as a reminder to execute `pm2 save`. All set now. You can check with `pm2 list` if everything went well.  

You can then use the interface by pointing a browser to http://xxx.yyy.zzz.aaa:3000 where xxx.yyy.zzz.aaa is the local IP adress of the raspberry pi serving the mirror. You can now manage entering the postnl-3s parcels via this web interface. My advice is not to expose this interface to the outside world, for security reasons. 

## Give your Tracking a title
THIS PARAGRAPH ONLY FOR TRACKTRY.COM. Aftership works fine as is. 

The tracktry.com website does not allow you to enter a title for the parcels. 

If this is needed/wanted badly you can also install and use the MMM-Parcel webinterface mentioned above. 

Note: the interface does not (yet) allow to modify or enter the title for an already entered item, only new ones can be entered. I found out that you can in that case delete the item and re-enter it from the MMM-Parcel webinterface without it being upcounted against your monthly quota.  

## Dependencies
* MMM-Parcel
automatically installed via `npm install`
````
    "@google-cloud/translate": "latest",
    "node-fetch": "latest"
````
* MMM-Parcel Web interface
automatically installed via `npm install`
````
    "cookie-parser": "^1.4.4",
    "csurf": "^1.10.0",
    "ejs": "^3.0.1",
    "express": "^4.17.1",
    "express-flash": "^0.0.2",
    "express-layout": "^0.1.0",
    "express-session": "^1.17.0",
    "express-validator": "^6.3.1",
    "helmet": "^3.21.2",
    "multer": "^1.4.2",
    "node-fetch": "^2.6.1",
    "serve-favicon": "^2.5.0"
```` 

## Newest features

- VERSION 3 Handles Tracktry.com *and* AfterShip.com (free API restored for legacy plans). 
- Problem with progress in tracktry solved
- Problem with hideDelivered solved
- version 3 is backwards compatbile with version 2. 


## Latest Releases
- version 3.0.0 Choice of Tracktry or AfterShip (AfterShip  restored free API access for legacy free plan users). 
- version 2.1.x bug fixing (user feedback)
- version 2.1.0
````
- Refactor of handling code, replaced deprecated "request" with "node-fetch", cleaned code by using async/await
- Created a middleware "api normalizer" to prepare for ever changing API's and making display module more robust
- Depends on nodejs >= V10 ( newer than 2nd quarter of 2018)
````
- version 2.0.1  *last version working with nodejs < V10. Deprecated.* 
- version 2.0.0  Tracktry & webinterface. 
- version 1.3.0. Added Narrow layout, hideDelivered in days + editorials on Readme. Removed bug of showing "undefined" when the parcellist is empty. 
- version 1.2.2. Bug fixed, code linting, now displays time of latest checkpoint when no expected delivery is (yet) known. 
                 Message line before clock line.
- version 1.2.1. Removed spurious debug info to log files
- version 1.2.0. Functional release (adding translations, autohide and automatic compactness)

## Known issues
- The integrators do a reasonably good job in collecting  information from the couriers (with some delays) but are not perfect. Use the mirror presentation as a hint. Often the websites of the couriers give more specific information that is not accessible via the API.  


