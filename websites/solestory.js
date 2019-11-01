

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

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	// PERFORM ALL CHECKS HERE

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory doesn\'t ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['firstName'] == '' || profile['firstName'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires a name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['lastName'] == '' || profile['lastName'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires a last name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['address'] == '' || profile['address'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires an address'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['city'] == '' || profile['city'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires a city'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['cardNumber'] == '' || profile['cardNumber'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires a card'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['cardNumber'] != null && profile['cardNumber'].indexOf(" ") > -1) {
		profile['cardNumber'] = profile['cardNumber'].replaceAll(" ", "");
	}

	if (profile['CVV'] == '' || profile['CVV'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires a cvv'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['expiryYear'] == '' || profile['expiryYear'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires an expiry year'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['expiryMonth'] == '' || profile['expiryMonth'] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'SoleStory requires an expiry month'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if(profile['stateProvince'] == undefined)
	{
		profile['stateProvince'] = '';
	}
	
	if(profile['stateProvince'] == 'none')
	{
		profile['stateProvince'] = '';
	}

	if(task['taskSizeVariant'].split('|') == undefined)
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'invalid size'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	// PERFORM ALL CHECKS HERE



	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'adding to cart'
	});
	request({
		url: task['variant'],
		method: 'POST',
		headers: {
			'sec-fetch-mode': 'cors',
			'origin': 'https://launch.solestory.se',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'x-requested-with': 'XMLHttpRequest',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': '*/*',
			'referer': task['variant'],
			'authority': 'launch.solestory.se',
			'sec-fetch-site': 'same-origin'
		},
		body: 'attribute_pa_size='+task['taskSizeVariant'].split('|')[0]+'&quantity=1&add-to-cart=201803&product_id=201803&variation_id='+task['taskSizeVariant'].split('|')[1],
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'added to cart'
			});
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'creating checkout'
			});
			request({
				url: 'https://launch.solestory.se/checkout/',
				headers: {
					'authority': 'launch.solestory.se',
					'upgrade-insecure-requests': '1',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
					'sec-fetch-mode': 'nested-navigate',
					'sec-fetch-user': '?1',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'sec-fetch-site': 'same-origin',
					'referer': task['variant'],
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
					var wpnonce = $('input[name="_wpnonce"]').attr('value');
					var shipping = $('input[name="shipping_method[0]"]').attr('value');
					if (wpnonce == undefined || shipping == undefined) {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
					}
					console.log('Checkout created');
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'checkout created'
					});
					exports.submitRaffle(request, task, profile, wpnonce, shipping);

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


exports.submitRaffle = function (request, task, profile, wpnonce, shipping) {
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
		message: 'submitting card information'
	});

	console.log(`[${task.taskID}] ` + 'Country: ' + countryFormatter(profile['country']));
	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	request({
		url: 'https://api.stripe.com/v1/sources',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': 'https://js.stripe.com/v3/controller-e08d3e8af0bafe4c577856e7edb44f16.html',
			'Origin': 'https://js.stripe.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
			'Sec-Fetch-Mode': 'cors',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'type=card&owner[name]=' + profile['firstName'] + '+' + profile['lastName'] + '&owner[address][line1]=' + profile['address'] + '&owner[address][line2]=' + profile['aptSuite'] + '&owner[address][state]=' + stateFormatter(profile) + '&owner[address][city]=' + profile['city'] + '&owner[address][postal_code]=' + profile['zipCode'] + '&owner[address][country]=' + countryFormatter(profile['country']) + '&owner[email]=' + task['taskEmail'] + '&owner[phone]=' + profile['phoneNumber'] + '&card[number]=' + profile['cardNumber'] + '&card[cvc]=' + profile['CVV'] + '&card[exp_month]=' + profile['expiryMonth'] + '&card[exp_year]=' + profile['expiryYear'].substr(profile['expiryYear'].length - 2) + '&payment_user_agent=stripe.js%2Ff35e1238%3B+stripe-js-v3%2Ff35e1238&referrer=https://launch.solestory.se/checkout/&key=pk_live_zx9TnJtIJSbDmKECdwaPeM5I',
		agent: agent
	}, function callback(error, response, body) {
		console.log(body);
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
		}
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
			return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
		}
		var source = JSON.parse(body).id;
		if (!source) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
		}
		console.log(source);
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'submitting entry'
		});
		request({
			url: 'https://launch.solestory.se/?wc-ajax=checkout',
			method: 'POST',
			headers: {
				'sec-fetch-mode': 'cors',
				'origin': 'https://launch.solestory.se',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'x-requested-with': 'XMLHttpRequest',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'accept': 'application/json, text/javascript, */*; q=0.01',
				'referer': 'https://launch.solestory.se/checkout/',
				'authority': 'launch.solestory.se',
				'sec-fetch-site': 'same-origin'
			},
			body: 'billing_first_name=' + profile['firstName'] + '&billing_last_name=' + profile['lastName'] + '&billing_country=' + countryFormatter(profile['country']) + '&billing_address_1=' + profile['address'] + '&billing_address_2=' + profile['aptSuite'] + '&billing_city=' + profile['city'] + '&billing_state=' + stateFormatter(profile) + '&billing_postcode=' + profile['zipCode'] + '&billing_phone=' + profile['phoneNumber'] + '&billing_email=' + task['taskEmail'] + '&account_password=&shipping_first_name=&shipping_last_name=&shipping_company=&shipping_country=' + countryFormatter(profile['country']) + '&shipping_address_1=&shipping_address_2=&shipping_city=&shipping_state=&shipping_postcode=&order_comments=&shipping_method[0]=' + shipping + '&payment_method=stripe&terms=on&terms-field=1&_wpnonce=' + wpnonce + '&_wp_http_referer=/?wc-ajax=update_order_review&stripe_source=' + source,
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
					return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
				}
				try {
					console.log(body);
					var parsed = JSON.parse(body);
				} catch (e) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
				}
				if (parsed.result == 'success') {
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
						message: parsed.messages
					});
					console.log(body);
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
			} else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile, wpnonce, shipping), global.settings.retryDelay);
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
			return 'GB';
			break;
		case 'United States':
			return 'US';
			break;
		case 'Canada':
			return 'CA';
			break;
		case 'Ireland':
			return 'IE';
			break;
		case 'Germany':
			return 'DE';
			break;
		case 'Portugal':
			return 'PT';
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
		case 'China':
			return 'CN';
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
		case 'Hungary':
			return 'HU';
			break;
		case 'Russia':
			return 'RU';
			break;
		case 'Luxembourg':
			return 'LU';
			break;
		default:
			return 'noexist';
			break;
	}
}


function stateFormatter(profile) {
	if (profile['country'] == 'Australia') {
		if (profile['stateProvince'] == 'ASA') {
			return 'SA';
		} else {
			return profile['stateProvince'];
		}
	}
	else if (profile['country'] == 'Canada') {
		if (profile['stateProvince'] == 'NF') {
			return 'NL';
		} else {
			return profile['stateProvince'];
		}
	} else if (profile['country'] == 'United States') {
		return profile['stateProvince'];
	} else if (profile['country'] == 'Italy') {
		switch (profile['stateProvince']) {
			case "Bari":
				return "BA";
				break;
			case "Bologna":
				return "BO";
				break;
			case "Catania":
				return "CT";
				break;
			case "Firenze":
				return "FI";
				break;
			case "Genova":
				return "GE";
				break;
			case "MOD":
				return "MO";
				break;
			case "MEB":
				return "MB";
				break;
			case "Napoli":
				return "NA";
				break;
			case "Olbia":
				return "OT";
				break;
			case "Palermo":
				return "PA";
				break;
			case "Rieti":
				return "RI";
				break;
			case "Torino":
				return "TO";
				break;
			case "Venezia":
				return "VE";
				break;
			case "MIL":
				return "MI";
				break;
			default:
				return profile['stateProvince'];
				break;
		}
	} else {
		return '';
	}
}




String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}