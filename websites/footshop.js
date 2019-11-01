
var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var faker = require('faker');

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}
	try 
	{
		var sProxy = proxy.split(':');
	} catch (e)
	{
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
	if(checkEmail(task))
	{
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

	if(profile['jigProfileAddress'] == true)
	{
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if(profile['jigProfilePhoneNumber'] == true)
	{
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining Size ID'
	});
	
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: task['footshop']['sizesAPI'],
		headers: {
			'authority': 'releases.footshop.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
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
			var sizes = parsed['sizeSets']['Unisex']['sizes'];
			for (var i = 0; i < sizes.length; i++) {
				if (sizes[i]['us'] == task['taskSizeSelect']) {
					var sizeID = sizes[i]['id'];
					console.log('Got Size ID : ' + sizeID);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'GOT SIZE ID'
					});
					exports.getRaffle(request, task, profile, sizeID);
				}
			}
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


exports.getRaffle = function (request, task, profile, sizeID) {
	if (shouldStop(task) == true) {
        return;
    }
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	var raffleURL = 'https://releases.footshop.com/register/' + task['variant'] + '/Unisex/' + sizeID;
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle page'
	});

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: raffleURL,
		headers: {
			'authority': 'releases.footshop.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Got raffle page');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			request({
				url: 'https://releases.footshop.com/api/registrations/check-duplicity/' + task['variant'],
				method: 'POST',
				headers: {
					'origin': 'https://releases.footshop.com',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
					'content-type': 'application/json;charset=UTF-8',
					'accept': 'application/json, text/plain, */*',
					'cache-control': 'no-cache',
					'authority': 'releases.footshop.com',
					'referer': raffleURL
				},
				body: {
					email: task['taskEmail'],
					phone: profile['phoneNumber'],
					id: null
				},
				json: true,
				agent: agent
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body);
					if (body.email == true) {
						console.log('Email used before');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Email previously entered'
						});
					} else if (body.phone == true) {
						console.log('Phone number used before');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Phone number previously entered'
						});
					} else {
						exports.submitRaffle(request, task, profile, sizeID)
					}
				} else {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay);
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
			return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay);
		}
	});
}


exports.submitRaffle = function (request, task, profile, sizeID) {
	if (shouldStop(task) == true) {
        return;
    }
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	console.log('Submitting entry');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	try 
	{
		var cardNumber = profile['cardNumber'].split(" ").join("");
	} catch (e)
	{
		try 
		{
			var cardNumber = profile['cardNumber'];
		} catch (e)
		{
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Card error. DM Log'
			});
			console.log(`[${task.taskID}] ` + 'Card error. DM Log');
			console.log(`[${task.taskID}] ` + profile['cardNumber']);
			try
			{
			console.log(`[${task.taskID}] ` + JSON.stringify(profile));
			}
			catch (e)
			{
			}
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
	}
	request({
		url: 'https://api2.checkout.com/v2/tokens/card',
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Referer': 'https://js.checkout.com/frames/?v=1.0.16&publicKey=pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187&localisation=EN-GB&theme=standard',
			'Origin': 'https://js.checkout.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'AUTHORIZATION': 'pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187',
			'Content-Type': 'application/json'
		},
		body: {
			number: cardNumber,
			expiryMonth: profile['expiryMonth'],
			expiryYear: profile['expiryYear'].substr(profile['expiryYear'].length - 2),
			cvv: profile['CVV'],
			requestSource: 'JS'
		},
		json: true,
		agent: agent
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var cardToken = body['id'];
			console.log(cardToken + ' Card token received');
			request({
				url: 'https://releases.footshop.com/api/registrations/create/' + task['variant'],
				method: 'POST',
				headers: {
					'origin': 'https://releases.footshop.com',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
					'content-type': 'application/json;charset=UTF-8',
					'accept': 'application/json, text/plain, */*',
					'cache-control': 'no-cache',
					'authority': 'releases.footshop.com',
					'referer': 'https://releases.footshop.com/register/' + task['variant'] + '/Unisex/' + sizeID
				},
				body: {
					"id": null,
					"sizerunId": sizeID,
					"account": "New Customer",
					"email": task['taskEmail'],
					"phone": profile['phoneNumber'],
					"gender": "Mr",
					"firstName": profile['firstName'],
					"lastName": profile['lastName'],
					"birthday": `${getRandomInt(1982, 2000)}-0${getRandomInt(1, 9)}-0${getRandomInt(1, 9)}`,
					"deliveryAddress": {
						"country": countryFormatter(profile['country']),
						"state": profile['stateProvince'],
						"county": "",
						"city": profile['city'],
						"street": profile['address'],
						"houseNumber": profile['address'],
						"additional": profile['aptSuite'],
						"postalCode": profile['zipCode']
					},
					"consents": ["privacy-policy-101"],
					"cardToken": cardToken,
					"cardLast4": profile['cardNumber'].substr(profile['cardNumber'].length - 4)
				},
				json: true,
				agent: agent
			}, function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(JSON.stringify(body));
					if (!body['secure3DRedirectUrl']) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.submitRaffle(request, task, profile, sizeID), global.settings.retryDelay);
					} else {
						var open = require("open");
						registerEmail(task);
						mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], body['secure3DRedirectUrl'], '', task, profile);	
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Open ' + body['secure3DRedirectUrl']
						});
						open(body['secure3DRedirectUrl']);
						console.log(JSON.stringify(body));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					}
				} else {
					if (JSON.stringify(body).toLowerCase().indexOf('the email domain') > -1 && JSON.stringify(body).toLowerCase().indexOf('is forbidden') > -1) {	
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Catchall domain banned'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
					else if (JSON.stringify(body).toLowerCase().indexOf('user is already registered') > -1) {	
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Already registered (Check if jigged)'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
					else if (JSON.stringify(body).toLowerCase().indexOf('the card data is invalid') > -1) {	
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Card limit reached / Card error'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
					else
					{
						console.log(JSON.stringify(body));
						console.log(JSON.stringify(profile));
						console.log(JSON.stringify(task));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Make sure all your profile details are filled correct.'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
				}
			});
		}
		else
		{
			try
			{
				console.log(JSON.stringify(body));
				if(body['errors'].length >= 1)
				{
					for(var i = 0; i < body['errors'].length; i++)
					{
						var error = body['errors'][i];
						if(error == 'Invalid card number')
						{
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Invalid card number'
							});
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						}
						else if(error == "Invalid 'expiryMonth' in 'card'")
						{
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Invalid expiry month'
							});
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						}
						else if(error == "Invalid 'expiryYear' in 'card'")
						{
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Invalid expiry year'
							});
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						}
						else
						{
							console.log(body['errors'][i]);	
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Unknown error. DM Log'
							});
							return;
						}
					}
				}
				else
				{
					console.log(body);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown error. DM Log'
					});
					return;
				}
			} catch (e)
			{
				console.log(body);
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM Log'
				});
				return;
			}
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
function checkEmail(task)
{
	if(task['taskTypeOfEmail'] == 'saved')
	{
		if(global.emails[task['taskEmail']] == undefined)
		{
			return false;
		}
		if(global.emails[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] == true && task['type'] == 'mass')
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}
// Saves email in emails.json to show email was entered 
function registerEmail(task)
{
	if(task['taskTypeOfEmail'] == 'saved')
	{
		if(global.emails[task['taskEmail']] == undefined)
		{
			return;
		}
		var variantName = task['taskSiteSelect'] + '_' + task['filterID'];
		global.emails[task['taskEmail']][variantName] = true;
		mainBot.saveEmails(global.emails);
	}
}


// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	// Footshop does not ship to china
	switch (profileCountry) {
		case 'United Kingdom':
			return 'GB';
			break;
		case 'United States':
			return 'US';
			break;
		case 'Canada':
			return 'CA';
			break;
		case 'North Ireland':
			return 'Ireland';
			break;
		case 'Ireland':
			return 'IE';
			break;
		case 'Germany':
			return 'DE';
			break;
		case 'Switzerland':
			return 'CH';
			break;
		case 'France':
			return 'FR';
			break;
		case 'Spain':
			return 'ES';
			break;
		case 'Italy':
			return 'IT';
			break;
		case 'Netherlands':
			return 'NL';
			break;
		case 'Czech Republic':
			return 'CZ';
			break;
		case 'Australia':
			return 'AU';
			break;
		case 'Austria':
			return 'AT';
			break;
		case 'Slovakia':
			return 'SK';
			break;
		case 'Belgium':
			return 'BE';
			break;
		case 'Slovenia':
			return 'SI';
			break;
		case 'Singapore':
			return 'SG';
			break;
		case 'Malaysia':
			return 'MY';
			break;
		case 'Hong Kong':
			return 'HK';
			break;
		case 'Japan':
			return 'JP';
			break;
		case 'Sweden':
			return 'SE';
			break;
		case 'Denmark':
			return 'DK';
			break;
		case 'Finland':
			return 'FI';
			break;
		case 'Romania':
			return 'RO';
			break;
		case 'Poland':
			return 'PL';
			break;
	}
}





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}