
var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var faker = require('faker');

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
		if (Math.random() >= 0.5)
		{
			profile['firstName'] = profile['firstName'] + String.fromCharCode(97+Math.floor(Math.random() * 26));
		}
		else
		{
			profile['firstName'] = String.fromCharCode(97+Math.floor(Math.random() * 26)) + profile['firstName'];
		}
	}
	if (profile['jigProfileLastNameLetter'] == true) {
		if (Math.random() >= 0.5)
		{
			profile['lastName'] = profile['lastName'] + String.fromCharCode(97+Math.floor(Math.random() * 26));
		}
		else
		{
			profile['lastName'] = String.fromCharCode(97+Math.floor(Math.random() * 26)) + profile['lastName'];
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

	if (profile['country'] != 'United States') {
		profile["stateProvince"] = 'none';
	}

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");

		// ********************************************* Add this only to sites with no address line 2 *********************************************
		profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining Raffle Page'
	});
	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Creating customer'
			});
			request({
				url: 'https://rise45-draw.herokuapp.com/customers/new',
				method: 'POST',
				headers: {
					'Accept': 'application/json, text/javascript, */*; q=0.01',
					'Referer': task['variant'],
					'Origin': 'https://crusoeandsons.com',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				formData: {
					'first_name': profile['firstName'],
					'last_name': profile['lastName'],
					'email': task['taskEmail']
				},
				agent: agent
			}, function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					try {
						var parsed = JSON.parse(body);
					} catch (e) {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
					}
					if (parsed.message == 'Customer created successfully') {
						var customerID = parsed.id;
						console.log('Customer created');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Customer created'
						});
						exports.submitRaffle(request, task, profile, customerID);
					} else {
						console.log(body);
					}
				} else {
					if (error) {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
					} else {
						try {
							var parsed = JSON.parse(body);
						} catch (e) {
							var proxy2 = getRandomProxy();
							task['proxy'] = proxy2;
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
							});
							return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
						}
						if (parsed['errors']['email'][0] == 'has already been taken') {
							console.log('Email used before');
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Email previously entered'
							});
						} else {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Make sure your profile is complete.'
							});
							console.log(`[${task.taskID}] ` + ' Error creating customer');
							console.log(body);
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						}
					}
				}
			});
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
	});

}


exports.submitRaffle = function (request, task, profile, customerID) {
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
		message: 'Creating entry'
	});

	console.log(`[${task.taskID}] ` + 'Country: ' + countryFormatter(profile['country']));
	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));

	request({
		url: 'https://rise45-draw.herokuapp.com/draws/entries/new',
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Referer': task['variant'],
			'Origin': 'https://crusoeandsons.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		formData: {
			'shipping_first_name': profile['firstName'],
			'shipping_last_name': profile['lastName'],
			'customer_id': customerID,
			'variant_id': task['taskSizeVariant'],
			'street_address': profile['address'],
			'city': profile['city'],
			'zip': profile['zipCode'],
			'state': profile['stateProvince'],
			'phone': profile['phoneNumber'],
			'country': countryFormatter(profile['country']),
			'delivery_method': 'online',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(`[${task.taskID}] ` + 'Country: ' + countryFormatter(profile['country']));
			console.log(`[${task.taskID}] ` + JSON.stringify({
				'shipping_first_name': profile['firstName'],
				'shipping_last_name': profile['lastName'],
				'customer_id': customerID,
				'variant_id': task['taskSizeVariant'],
				'street_address': profile['address'],
				'city': profile['city'],
				'zip': profile['zipCode'],
				'state': profile['stateProvince'],
				'phone': profile['phoneNumber'],
				'country': countryFormatter(profile['country']),
				'delivery_method': 'online',
			}));
			console.log(`[${task.taskID}] ` + JSON.stringify(profile));
			console.log(body);
			try {
				var parsed = JSON.parse(body);
			} catch (e) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile, customerID), global.settings.retryDelay);
			}
			if (parsed.message == 'Entry successfully created') {
				var entryID = parsed.id;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry created'
				});
				exports.tokenizeCard(request, task, profile, customerID, entryID);
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM Log'
				});
				console.log(body);
				return;
			}
		} else {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Unknown error. DM Log'
			});
			console.log(body);
			return;
		}
	});
}

exports.tokenizeCard = function (request, task, profile, customerID, entryID) {
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
		message: 'Tokenizing card'
	});

	request({
		url: 'https://api.stripe.com/v1/tokens',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': 'https://js.stripe.com/v3/controller-571ee0243997a1bf06218df88a6d7f84.html',
			'Origin': 'https://js.stripe.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		form: {
			key: 'pk_live_5YqD1Pf22sJtNGkFHlxoNOTr',
			'card[number]': profile['cardNumber'].split(" ").join(""),
			'card[cvc]': profile['CVV'],
			'card[exp_month]': profile['expiryMonth'],
			'card[exp_year]': profile['expiryYear'].substr(profile['expiryYear'].length - 2),
			payment_user_agent: 'stripe.js/0702fe39; stripe-js-v3/0702fe39',
			referrer: task['variant']
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			console.log(body);
			try {
				var parsed = JSON.parse(body);
			} catch (e) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Parsing error.'
				});
				console.log(`[${task.taskID}] ` + ' Parsing error');
				console.log(body);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			var cardToken = parsed['id'];
			if (!cardToken) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Make sure your card details are correct.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			request({
				url: 'https://rise45-draw.herokuapp.com/draws/entries/checkout',
				method: 'POST',
				headers: {
					'Accept': 'application/json, text/javascript, */*; q=0.01',
					'Referer': task['variant'],
					'Origin': 'https://crusoeandsons.com',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				formData: {
					'checkout_token': cardToken,
					'entry_id': entryID
				},
				agent: agent
			}, function callback(error, response, body) {
				if (!error) {
					if (body == "Your card was declined.") {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Card Declined'
						});
						console.log(`[${task.taskID}] ` + ' Card declined');
						console.log(body);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body == "Your card's security code is incorrect.") {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Incorrect CCV'
						});
						console.log(`[${task.taskID}] ` + ' Card declined');
						console.log(body);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body == '"Entry successfully finalized"') {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Entry submitted!'
						});
						registerEmail(task);
						mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM Log'
						});
						console.log(body);
						return;
					}
				}
			});
		} else {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Unknown error. DM Log'
			});
			console.log(body);
			return;
		}
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
			return 'United Kingdom';
			break;
		case 'United States':
			return 'United States';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'North Ireland':
			return 'Ireland';
			break;
		case 'Ireland':
			return 'Ireland';
			break;
		case 'Germany':
			return 'Germany';
			break;
		case 'Switzerland':
			return 'Switzerland';
			break;
		case 'France':
			return 'France';
			break;
		case 'Spain':
			return 'Spain';
			break;
		case 'Italy':
			return 'Italy';
			break;
		case 'Netherlands':
			return 'Netherlands';
			break;
		case 'Czech Republic':
			return 'Czech Republic';
			break;
		case 'Australia':
			return 'Australia';
			break;
		case 'Austria':
			return 'Austria';
			break;
		case 'Slovakia':
			return 'Slovakia';
			break;
		case 'Belgium':
			return 'Belgium';
			break;
		case 'Slovenia':
			return 'Slovenia';
			break;
		case 'Singapore':
			return 'Singapore';
			break;
		case 'Malaysia':
			return 'Malaysia';
			break;
		case 'Hong Kong':
			return 'Hong Kong';
			break;
		case 'China':
			return 'China';
			break;
		case 'Japan':
			return 'Japan';
			break;
		case 'Sweden':
			return 'Sweden';
			break;
		case 'Denmark':
			return 'Denmark';
			break;
		case 'Finland':
			return 'Finland';
			break;
		case 'Romania':
			return 'Romania';
			break;
	}
}





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}


/*

var sizes = '';
$('.DrawApp-SizeChartList li').each(function(i, obj) {
	sizes = sizes + "'"+$(this).html()+"' => '"+$(this).data('drawvariant-id')+"', ";
});
*/