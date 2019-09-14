/*
	Copyright (C) 2019 Code Yellow
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	You should have received a copy of the GNU General Public License
	along with this program (license.md).  If not, see <http://www.gnu.org/licenses/>.
*/

var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var cheerio = require('cheerio');
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
		message: 'Getting raffle page'
	});
	request({
		url: 'https://bouncewear.com/en/register',
		headers: {
			'authority': 'bouncewear.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'none',
			'referer': 'https://bouncewear.com/en/login',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
			}
			$ = cheerio.load(body);
			var token = $('input[name="_token"]').attr('value');
			console.log('Got token: ' + token);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});

			console.log(`[${task.taskID}] ` + ' Creating account');
			task['taskPassword'] = makePassword(15);
			request({
				url: 'https://bouncewear.com/en/register',
				method: 'POST',
				headers: {
					'authority': 'bouncewear.com',
					'cache-control': 'max-age=0',
					'origin': 'https://bouncewear.com',
					'upgrade-insecure-requests': '1',
					'content-type': 'application/x-www-form-urlencoded',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-user': '?1',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'sec-fetch-site': 'same-origin',
					'referer': 'https://bouncewear.com/en/register',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				},
				followAllRedirects: true,
				body: '_token=' + token + '&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&mobile_number=' + profile['phoneNumber'] + '&email=' + task['taskEmail'] + '&password=' + task['taskPassword'] + '&password_confirmation=' + task['taskPassword'],
				agent: agent
			}, function callback(error, response, body) {
				if (error) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
				}
				if (response.statusCode != 200 && response.statusCode != 500) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
				}
				if (response.statusCode == 500) {
					console.log(body)
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Catchall domain banned'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				if (response.request.href == 'https://bouncewear.com/en/register') {
					if (body.toLowerCase().indexOf('The mobile number field is required') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Missing first name'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('The e-mailadres has already been taken.') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Email already registered'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('the mobile number field is required') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Missing mobile number'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('The e-mailadres field is required.') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Please enter an email'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else {
						console.log(JSON.stringify(profile))
						console.log(JSON.stringify(task))
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM Log'
						});
						console.log(body);
						return;
					}
				} else {
					return exports.submitRaffle(request, task, profile)
				}
			});
		} else {
			console.log(body);
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


exports.submitRaffle = function (request, task, profile) {
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
	console.log(`[${task.taskID}] ` + 'Getting raffle page');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Getting raffle page'
	});

	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: task['variant'],
		headers: {
			'authority': 'bouncewear.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'none',
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
			$ = cheerio.load(body);
			var token = $('input[name="_token"]').attr('value');
			console.log('Got token: ' + token);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got second token'
			});
			request({
				url: 'https://bouncewear.com/en/raffles/aj1-unc',
				method: 'POST',
				headers: {
					'authority': 'bouncewear.com',
					'cache-control': 'max-age=0',
					'origin': 'https://bouncewear.com',
					'upgrade-insecure-requests': '1',
					'content-type': 'application/x-www-form-urlencoded',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-user': '?1',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'sec-fetch-site': 'same-origin',
					'referer': task['variant'],
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
				},
				followAllRedirects: true,
				body: '_token=' + token + '&variation_id='+task['taskSizeVariant']+'&email=' + task['taskEmail'] + '&terms=on',
				agent: agent
			}, function callback(error, response, body) {
				if (error) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
				}
				if (response.statusCode != 200) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
				}
				if (body.toLowerCase().indexOf('you joined the raffle.') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Entry submitted!'
					});
					registerEmail(task);
					mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', task['taskPassword']);
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else {
					console.log(JSON.stringify(profile))
					console.log(JSON.stringify(task))
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
	});


















	/*
		request({
			url: 'https://www.oneblockdown.it/index.php',
			method: 'POST',
			headers: {
				'origin': 'https://www.oneblockdown.it',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'accept': 'application/json, text/javascript, /*; q=0.01',
				'referer': task['variant'],
				'authority': 'www.oneblockdown.it',
				'x-requested-with': 'XMLHttpRequest'
			},
			formData: {
				'extension': 'raffle',
				'controller': 'raffles',
				'action': 'subscribe',
				'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
				'userId': userId,
				'stockItemId': task['taskSizeVariant'],
				'itemId': task['oneblockdown']['itemId'],
				'raffleId': task['oneblockdown']['raffleId'],
				'inStore': '',
				'addressId': 'n',
				'address[countryId]': countryFormatter(profile['country']),
				'address[first_name]': profile['firstName'],
				'address[last_name]': profile['lastName'],
				'address[street_address]': profile['address'],
				'address[zipcode]': profile['zipCode'],
				'address[cityName]': profile['city'],
				'address[phone_number]': profile['phoneNumber'],
				'address[statecode]': profile['stateProvince'],
				'version': '112'
			},
			agent: agent
		}, function callback(error, response, body) {
			console.log(JSON.stringify({
				'extension': 'raffle',
				'controller': 'raffles',
				'action': 'subscribe',
				'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
				'userId': userId,
				'stockItemId': task['taskSizeVariant'],
				'itemId': task['oneblockdown']['itemId'],
				'raffleId': task['oneblockdown']['raffleId'],
				'inStore': '',
				'addressId': 'n',
				'address[countryId]': countryFormatter(profile['country']),
				'address[first_name]': profile['firstName'],
				'address[last_name]': profile['lastName'],
				'address[street_address]': profile['address'],
				'address[zipcode]': profile['zipCode'],
				'address[cityName]': profile['city'],
				'address[phone_number]': profile['phoneNumber'],
				'address[statecode]': profile['stateProvince'],
				'version': '112'
			}));
			console.log(body)
			console.log(`[${task.taskID}]` + response.statusCode);
			if (error) {
				var proxy2 = getRandomProxy();`
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
			}
			try {
				parsed = JSON.parse(body)
			} catch (e) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Parsing error.'
				});
				return;
			}
			if (parsed.success) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', task['taskPassword']);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else {
				if (parsed['error']['message'] == 'INVALID_ADDRESS') {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Invalid address.'
					});
					return;
				} else if (parsed.error.message == "You are already subscribed to this raffle") {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Already entered!'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else {
					console.log(body);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown error.'
					});
					return;
				}
			}
		});*/
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
			return '77';
			break;
		case 'United States':
			return '233';
			break;
		case 'Canada':
			return '38';
			break;
		case 'North Ireland':
			return '77';
			break;
		case 'Ireland':
			return '102';
			break;
		case 'Germany':
			return '57';
			break;
		case 'Switzerland':
			return '43';
			break;
		case 'France':
			return '75';
			break;
		case 'Spain':
			return '68';
			break;
		case 'Italy':
			return '110';
			break;
		case 'Netherlands':
			return '166';
			break;
		case 'Czech Republic':
			return '56';
			break;
		case 'Australia':
			return '13';
			break;
		case 'Austria':
			return '12';
			break;
		case 'Slovakia':
			return '202';
			break;
		case 'Belgium':
			return '20';
			break;
		case 'Slovenia':
			return '200';
			break;
		case 'Singapore':
			return '198';
			break;
		case 'Malaysia':
			return '158';
			break;
		case 'Hong Kong':
			return '95';
			break;
		case 'China':
			return '48';
			break;
		case 'Japan':
			return '114';
			break;
		case 'Sweden':
			return '197';
			break;
		case 'Denmark':
			return '59';
			break;
		case 'Finland':
			return '70';
			break;
		case 'Romania':
			return '189';
			break;
		case 'Poland':
			return '179';
			break;
	}
}





//stockItemId = size
/* code to extract sizes from https://www.oneblockdown.it/en/footwear-sneakers/nike/men-unisex/nike-mars-yard-overshoe/12339
var sizeList = '';
for(var i = 0; i < preloadedStock.length; i++)
{
	var size = preloadedStock[i]['variant'];
	size = parseFloat(size.match(/[\d\.]+/));
	var stockItemId = preloadedStock[i]['stockItemId'];
	sizeList = sizeList + `'${size}' => '${stockItemId}',`;
}*/


// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}


function makePassword(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}