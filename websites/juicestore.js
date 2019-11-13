var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var faker = require('faker');
var cheerio = require('cheerio');

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}
	try {
		var sProxy = proxy.split(':');
	} catch (e) {
		return '';
	}
	var proxyHost = sProxy[0] + ":" + sProxy[1];
	if (sProxy.length == 2) {
		sProxy = "http://" + proxyHost;
		return (sProxy);
	} else {
		var proxyAuth = sProxy[2] + ":" + sProxy[3];
		sProxy = "http://" + proxyAuth.trimLeft().trimRight().toString() + "@" + proxyHost;
		return (sProxy);
	}
}

function getRandomProxy() {
	var proxies = global.proxies;
	if (proxies[0] != '') {
		var proxy = proxies[Math.floor(Math.random() * proxies.length)];
		return proxy;
	} else {
		return '';
	}
}

function getRandomIG() {
	var igs = global.instagrams.split('\n');
	if (igs[0] != '') {
		var ig = igs[Math.floor(Math.random() * igs.length)];
		return ig;
	} else {
		return '';
	}
}

exports.initTask = function (task, profile) {
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});

	if (profile['jigProfileFirstName'] == true) {
		profile['firstName'] = faker.fake("{{name.firstName}}");
	}
	if (profile['jigProfileLastName'] == true) {
		profile['lastName'] = faker.fake("{{name.lastName}}");
	}

	if (profile['jigProfileFirstNameLetter'] == true) {
		if (Math.random() >= 0.5) {
			profile['firstName'] = profile['firstName'] + String.fromCharCode(97 + Math.floor(Math.random() * 26));
		} else {
			profile['firstName'] = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + profile['firstName'];
		}
	}
	if (profile['jigProfileLastNameLetter'] == true) {
		if (Math.random() >= 0.5) {
			profile['lastName'] = profile['lastName'] + String.fromCharCode(97 + Math.floor(Math.random() * 26));
		} else {
			profile['lastName'] = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + profile['lastName'];
		}
	}

	if (task['taskTypeOfEmail'] == 'catchall') {
		if (task['catchallJigged'] == false || task['catchallJigged'] == undefined) {
			var pickEmail = Math.floor(Math.random() * 7) + 1;
			if (pickEmail == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 5) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 6) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else {
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			}
		}
	}

	if (task['taskEmail'] != null && task['taskEmail'].indexOf("'") > -1) {
		task['taskEmail'] = task['taskEmail'].replaceAll("'", '');
	}
	if (task['taskEmail'] != null && task['taskEmail'].indexOf(' ') > -1) {
		task['taskEmail'] = task['taskEmail'].replaceAll(' ', '');
	}

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}
	
	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'juice may not ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Posting raffle info'
	});
	var token = '';
	exports.postRaffleInfo(request, task, profile, token);
}

exports.postRaffleInfo = function (request, task, profile, token) {
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Posting raffle information'
	});
	require('request')({
		url: 'https://api.codeyellow.io/instagram/get?type=juicestore',
		method: 'get'
	}, function (err, response, body) {
		try {
			var parsedAPI = JSON.parse(body);
		} catch (e) {
			var pickIG = Math.floor(Math.random() * 7) + 1;
			if (pickIG == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 5) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else {
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase();
			}
		}
		if (parsedAPI == undefined || parsedAPI.valid != true) {
			var pickIG = Math.floor(Math.random() * 7) + 1;
			if (pickIG == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 5) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else {
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase();
			}
		} else {
			if (task['igHandler'] == 'mylist') {
				var ig = getRandomIG();
				if (ig == '' || ig == undefined) {
					profile['instagram'] = parsedAPI.instagram;
				} else {
					profile['instagram'] = getRandomIG();
				}
			} else {
				profile['instagram'] = parsedAPI.instagram;
			}
		}
		console.log('Instagram used: ' + profile['instagram'])

		request({
			url: 'https://juicestore.us5.list-manage.com/subscribe/post-json?u=79db5a8ad215b2f787d68cb55&id=c7fd97f847&c=jQuery19005428593779189539_1573658947778&EMAIL=' + task['taskEmail'] + '&FNAME=' + profile['firstName'] + '&LNAME=' + profile['lastName'] + '&MMERGE4=' + profile['phoneNumber'] + '&MMERGE6%5Baddr1%5D=' + profile['address'] + '&MMERGE6%5Baddr2%5D=' + profile['aptSuite'] + '&MMERGE6%5Bcity%5D=' + profile['city'] + '&MMERGE6%5Bstate%5D=' + profile['stateProvince'] + '&MMERGE6%5Bzip%5D=' + profile['zipCode'] + '&MMERGE6%5Bcountry%5D='+countryFormatter(profile['country'])+'&MMERGE3=Male&MMERGE5%5Bday%5D=' + getRandomInt(1, 25) + '&MMERGE5%5Bmonth%5D=' + getRandomInt(1, 9) + '&MMERGE5%5Byear%5D=' + getRandomInt(1982, 2000) + '&MMERGE8=' + task['taskSizeVariant'] + '&MMERGE7=' + profile['instagram'] + '&LANGUAGEP=English&b_79db5a8ad215b2f787d68cb55_c7fd97f847=&subscribe=Join+The+Raffle&_=' + new Date().getTime(),
			headers: {
				'authority': 'juicestore.us5.list-manage.com',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'accept': '*/*',
				'sec-fetch-site': 'cross-site',
				'sec-fetch-mode': 'no-cors',
				'referer': 'https://juicestore.com/blogs/editorial/travis-scott-x-nike-releases-brand-new-air-force-1-low-cactus-jack?utm_medium=email&utm_source=newsletter&utm_campaign=travis-scott-nike-cactus-jack-raffle&utm_content=button&utm_term=edm-raffle&utm_source=JUICESTORE+Newsletter&utm_campaign=6c6dbbbeff-EMAIL_CAMPAIGN_2019_11_11_07_06&utm_medium=email&utm_term=0_354ed87645-6c6dbbbeff-109021089&goal=0_354ed87645-6c6dbbbeff-109021089&mc_cid=6c6dbbbeff&mc_eid=9458d28cc9',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
			},
			agent: agent
		}, function callback(error, response, body) {
			//change below line to be separate
			if (!error) {
				if (response.statusCode != 200) {
					console.log(JSON.stringify(profile));
					console.log(JSON.stringify(task));
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					console.log('New proxy: ' + formatProxy(task['proxy']));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
				}
				//code here
				try {
					console.log(body);
				} catch (e) {}
				try {
					if (body.toLowerCase().indexOf('thank you for subscribing') !== -1) {
						console.log('entry submitted');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Entry submitted!'
						});
						console.log(`[${task.taskID}] ` + ' Entry submitted!');
						registerEmail(task);
						mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
						return;
					} else if (body.toLowerCase().indexOf('is already subscribed to list') !== -1) {
						console.log('already entered');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'already entered!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('1 - please enter a value') !== -1) {
						console.log('please save a first name');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please save a first name!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('2 - please enter a value') !== -1) {
						console.log('please save a last name');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please save a last name!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('4 - please enter a value') !== -1) {
						console.log('please save a number');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please save a phone number!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('6 - please enter a complete address') !== -1) {
						console.log('please save an address');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please save an address!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else {
						try {
							console.log(body);
							console.log('unknown error. dm logjuice');
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'unknown error. dm log!'
							});
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						} catch (e) {

						}
					}
				} catch (e) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					console.log('New proxy: ' + formatProxy(task['proxy']));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
				}
			} else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
			}
		});
	});
}


// Check if task should stop, for example if deleted
function shouldStop(task) {
	if (mainBot.taskStatuses[task['type']][task['taskID']] == 'stop') {
		mainBot.taskStatuses[task['type']][task['taskID']] = 'idle';
		return true;
	} else if (mainBot.taskStatuses[task['type']][task['taskID']] == 'delete') {
		mainBot.taskStatuses[task['type']][task['taskID']] = '';
		return true;
	} else {
		return false;
	}
}

// Checks if this email was already entered into a raffle
function checkEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']] == undefined) {
			return false;
		}
		if (global.emails[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] == true && task['type'] == 'mass') {
			return true;
		} else {
			return false;
		}
	}
}
// Saves email in emails.json to show email was entered 
function registerEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']] == undefined) {
			return;
		}
		var variantName = task['taskSiteSelect'] + '_' + task['filterID'];
		global.emails[task['taskEmail']][variantName] = true;
		mainBot.saveEmails(global.emails);
	}
}


// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	switch (profileCountry) {
		case 'United Kingdom':
			return '262';
			break;
		case 'United States':
			return '164';
			break;
		case 'Canada':
			return '30';
			break;
		case 'Ireland':
			return '74';
			break;
		case 'Germany':
			return '59';
			break;
		case 'Portugal':
			return '124';
			break;
		case 'Switzerland':
			return '149';
			break;
		case 'France':
			return '54';
			break;
		case 'Spain':
			return '143';
			break;
		case 'Italy':
			return '76';
			break;
		case 'Netherlands':
			return '109';
			break;
		case 'Czech Republic':
			return '42';
			break;
		case 'Australia':
			return '8';
			break;
		case 'Austria':
			return '9';
			break;
		case 'Slovakia':
			return '138';
			break;
		case 'Belgium':
			return '16';
			break;
		case 'Slovenia':
			return '139';
			break;
		case 'Singapore':
			return '137';
			break;
		case 'Malaysia':
			return '96';
			break;
		case 'Hong Kong':
			return '67';
			break;
		case 'China':
			return '36';
			break;
		case 'Japan':
			return '78';
			break;
		case 'Sweden':
			return '148';
			break;
		case 'Denmark':
			return '43';
			break;
		case 'Finland':
			return '53';
			break;
		case 'Romania':
			return '128';
			break;
		case 'Poland':
			return '123';
			break;
		case 'Hungary':
			return '68';
			break;
		case 'Russia':
			return '129';
			break;
		case 'Luxembourg':
			return '92';
			break;
		default:
			return 'noexist';
			break;
	}
}














// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}