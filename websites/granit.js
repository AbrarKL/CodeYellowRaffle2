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

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'granit may not ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	if (stateFormatter(profile) == 'dontcontinue') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'please contact us (state)'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
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

		// ********************************************* Add this only to sites with no address line 2 *********************************************
		//profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
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
		message: 'Obtaining raffle page'
	});

	//task['variant'] = url below
	request({
		url: 'https://raffles.granit-shop.com/gb/raffles/916-3100-adidas-yeezy-boost-350-v2-yecheil.html',
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Sec-Fetch-Site': 'none',
			'Sec-Fetch-Mode': 'navigate',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
			}
			// SIZE BELOW AND RELEASE ID

			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'creating order'
			});
			request({
				url: 'https://raffles.granit-shop.com/gb/module/oneclickcheckout/oneclickcheckout',
				method: 'POST',
				headers: {
					'Connection': 'keep-alive',
					'Accept': '*/*',
					'Origin': 'https://raffles.granit-shop.com',
					'X-Requested-With': 'XMLHttpRequest',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'Sec-Fetch-Site': 'same-origin',
					'Sec-Fetch-Mode': 'cors',
					'Referer': 'https://raffles.granit-shop.com/gb/raffles/916-3113-adidas-yeezy-boost-350-v2-yecheil.html',
					'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
				},
				body: 'id=916&group[1]='+task['taskSizeVariant']+'&qty=1',
				agent: agent
			}, function callback(error, response, body) {
				if (!error) {
					if (response.statusCode != 200) {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						console.log('New proxy: ' + formatProxy(task['proxy']));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
					}
					if (body.toLowerCase().indexOf('//raffles.granit-shop.com/gb/order') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Obtaining entry page'
						});
						request({
							url: 'https://raffles.granit-shop.com/gb/order',
							headers: {
								'Connection': 'keep-alive',
								'Upgrade-Insecure-Requests': '1',
								'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
								'Sec-Fetch-User': '?1',
								'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
								'Sec-Fetch-Site': 'same-origin',
								'Sec-Fetch-Mode': 'navigate',
								'Referer': 'https://raffles.granit-shop.com/fr/raffles/916-3115-adidas-yeezy-boost-350-v2-yecheil.html',
								'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
							},
							agent: agent
						}, function callback(error, response, body) {
							if (!error) {
								if (response.statusCode != 200) {
									var proxy2 = getRandomProxy();
									task['proxy'] = proxy2;
									console.log('New proxy: ' + formatProxy(task['proxy']));
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
									});
									return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
								}
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'submitting email'
								});
								return exports.submitRaffle(request, task, profile);
							} else {
								var proxy2 = getRandomProxy();
								task['proxy'] = proxy2;
								console.log('New proxy: ' + formatProxy(task['proxy']));
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
								});
								return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
							}
						});
					} else {
						try {
							console.log(body);
							console.log(response.request.href);
						} catch (e) {

						}
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM log'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						console.log('unknown error dm log granit step1')
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
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
					return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
				}
			});
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
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

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	request({
		url: 'https://raffles.granit-shop.com/gb/order',
		method: 'POST',
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Origin': 'https://raffles.granit-shop.com',
			'Upgrade-Insecure-Requests': '1',
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-Mode': 'navigate',
			'Referer': 'https://raffles.granit-shop.com/gb/order',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		body: 'id_customer=&id_gender=1&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&email=' + task['taskEmail'] + '&submitCreate=1&continue=1',
		followAllRedirects: true,
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
			}
			$ = cheerio.load(body);
			var token = $('input[name="token"]').attr('value');
			if (!token) {
				if ($('.alert.error')) {
					try {
						console.log(body);
					} catch (e) {

					}
					if (body.toLowerCase().indexOf('required field') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please complete your profile'
						});
						console.log('please complete your profile');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('invalid format') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'invalid email format'
						});
						console.log('invalid zip code');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
				}
				try {
					console.log(body);
					console.log(response.request.href);
				} catch (e) {

				}
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM log'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				console.log('unknown error dm log granit step2')
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'got token'
			});
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'submitting address'
			});
			console.log('Token: ' + token);
			request({
				url: 'https://raffles.granit-shop.com/gb/order?id_address=0',
				method: 'POST',
				headers: {
					'Connection': 'keep-alive',
					'Cache-Control': 'max-age=0',
					'Origin': 'https://raffles.granit-shop.com',
					'Upgrade-Insecure-Requests': '1',
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
					'Sec-Fetch-User': '?1',
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
					'Sec-Fetch-Site': 'same-origin',
					'Sec-Fetch-Mode': 'navigate',
					'Referer': 'https://raffles.granit-shop.com/gb/order',
					'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
				},
				body: 
				'id_address=&id_customer=&back=&token=' + token + '&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&address1='+profile['address']+'&address2='+profile['aptSuite']+'&city=' + profile['city'] + '&postcode='+profile['zipCode']+'&id_country='+countryFormatter(profile['country'])+'&phone='+profile['phoneNumber']+'&saveAddress=delivery&use_same_address=1&submitAddress=1&confirm-addresses=1' + stateFormatter(profile),
				followAllRedirects: true,
				agent: agent
			}, function callback(error, response, body) {
				$ = cheerio.load(body);
				if ($('.alert.error') && $('#checkout-addresses-step').hasClass('-current')) {
					try {
						console.log(body);
					} catch (e) {

					}
					if (body.toLowerCase().indexOf('required field') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'please complete your profile'
						});
						console.log('please complete your profile');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('invalid format') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'invalid email format'
						});
						console.log('invalid zip code');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('invalid postcode') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'invalid zip code'
						});
						console.log('invalid zip code');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if (body.toLowerCase().indexOf('address is incomplete') > -1) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'address is incomplete'
						});
						console.log('address is incomplete');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}  else {
						try {
							console.log(body);
							console.log(response.request.href);
						} catch (e) {

						}
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM log'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						console.log('unknown error dm log granit step3')
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
				}
				if (!error) {
					if (response.statusCode != 200) {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						console.log('New proxy: ' + formatProxy(task['proxy']));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
					}
					$ = cheerio.load(body);
					var addressID = $('input[name="id_address_delivery"]').attr('value');
					var deliveryMethod = $('input[name="delivery_option[' + addressID + ']"]').attr('value')
					console.log(deliveryMethod);
					console.log('Address ID: ' + addressID);
					console.log('Delivery method: ' + deliveryMethod);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'finalizing details'
					});
					request({
						url: 'https://raffles.granit-shop.com/gb/order',
						method: 'POST',
						headers: {
							'Connection': 'keep-alive',
							'Cache-Control': 'max-age=0',
							'Origin': 'https://raffles.granit-shop.com',
							'Upgrade-Insecure-Requests': '1',
							'Content-Type': 'application/x-www-form-urlencoded',
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
							'Sec-Fetch-User': '?1',
							'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
							'Sec-Fetch-Site': 'same-origin',
							'Sec-Fetch-Mode': 'navigate',
							'Referer': 'https://raffles.granit-shop.com/gb/order',
							'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
						},
						body: 'delivery_option[' + addressID + ']=' + deliveryMethod + '&confirmDeliveryOption=1&delivery_message=',
						followAllRedirects: true,
						agent: agent
					}, function callback(error, response, body) {
						if (!error) {
							if (response.statusCode != 200) {
								var proxy2 = getRandomProxy();
								task['proxy'] = proxy2;
								console.log('New proxy: ' + formatProxy(task['proxy']));
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
								});
								return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
							}
							request({
								url: 'https://raffles.granit-shop.com/gb/module/ps_cashondelivery/validation',
								method: 'POST',
								headers: {
									'Connection': 'keep-alive',
									'Content-Length': '0',
									'Cache-Control': 'max-age=0',
									'Origin': 'https://raffles.granit-shop.com',
									'Upgrade-Insecure-Requests': '1',
									'Content-Type': 'application/x-www-form-urlencoded',
									'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
									'Sec-Fetch-User': '?1',
									'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
									'Sec-Fetch-Site': 'same-origin',
									'Sec-Fetch-Mode': 'navigate',
									'Referer': 'https://raffles.granit-shop.com/gb/order',
									'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
								},
								followAllRedirects: true,
								agent: agent
							}, function callback(error, response, body) {		
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'submitting entry'
								});
								if (!error) {
									if (response.statusCode != 200) {
										var proxy2 = getRandomProxy();
										task['proxy'] = proxy2;
										console.log('New proxy: ' + formatProxy(task['proxy']));
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
										});
										return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
									}
									if (response.request.href.toLowerCase().indexOf('order-confirmation') > -1) {
										console.log(body);
										console.log('Entered');
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Entry submitted!'
										});
										console.log(`[${task.taskID}] ` + ' Entry submitted!');
										registerEmail(task);
										mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
										mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
										mainBot.taskCaptchas[task['type']][task['taskID']] = '';
										return;
									}
								} else {
									var proxy2 = getRandomProxy();
									task['proxy'] = proxy2;
									console.log('New proxy: ' + formatProxy(task['proxy']));
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
									});
									return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
								}
							});
						} else {
							var proxy2 = getRandomProxy();
							task['proxy'] = proxy2;
							console.log('New proxy: ' + formatProxy(task['proxy']));
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
							});
							return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
						}
					});
				} else {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					console.log('New proxy: ' + formatProxy(task['proxy']));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
				}
			});
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
		}
	});
}




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
		case 'United States':
			return '21';
			break;
		case 'United Kingdom':
			return '17';
			break;
		case 'Ireland':
			return '26';
			break;
		case 'Germany':
			return '1';
			break;
		case 'Portugal':
			return '15';
			break;
		case 'Switzerland':
			return '19';
			break;
		case 'France':
			return '8';
			break;
		case 'Spain':
			return '6';
			break;
		case 'Italy':
			return '10';
			break;
		case 'Netherlands':
			return '13';
			break;
		case 'Czech Republic':
			return '16';
			break;
		case 'Australia':
			return '24';
			break;
		case 'Austria':
			return '2';
			break;
		case 'Slovakia':
			return '37';
			break;
		case 'Belgium':
			return '3';
			break;
		case 'Slovenia':
			return '193';
			break;
		case 'Singapore':
			return '25';
			break;
		case 'Malaysia':
			return '136';
			break;
		case 'Hong Kong':
			return '22';
			break;
		case 'China':
			return '5';
			break;
		case 'Japan':
			return '11';
			break;
		case 'Sweden':
			return '18';
			break;
		case 'Denmark':
			return '20';
			break;
		case 'Finland':
			return '7';
			break;
		case 'Romania':
			return '36';
			break;
		case 'Poland':
			return '14';
			break;
		case 'Hungary':
			return '143';
			break;
		case 'Russia':
			return '177';
			break;
		case 'Luxembourg':
			return '12';
			break;
		default:
			return 'noexist';
			break;
	}
}


function stateFormatter(profile) {
    if (profile['country'] == 'Italy') {
        switch (profile['stateProvince']) {
            case "AG":
                return "&id_state=126";
                break;
            case "AL":
                return "&id_state=127";
                break;
            case "AN":
                return "&id_state=128";
                break;
            case "AO":
                return "&id_state=129";
                break;
            case "AR":
                return "&id_state=130";
                break;
            case "AP":
                return "&id_state=131";
                break;
            case "AT":
                return "&id_state=132";
                break;
            case "AV":
                return "&id_state=133";
                break;
            case "Bari":
                return "&id_state=134";
                break;
            case "BT":
                return "&id_state=135";
                break;
            case "BL":
                return "&id_state=136";
                break;
            case "BN":
                return "&id_state=137";
                break;
            case "BG":
                return "&id_state=138";
                break;
            case "BI":
                return "&id_state=139";
                break;
            case "Bologna":
                return "&id_state=140";
                break;
            case "BZ":
                return "&id_state=141";
                break;
            case "BS":
                return "&id_state=142";
                break;
            case "BR":
                return "&id_state=143";
                break;
            case "Cagliari":
                return "&id_state=144";
                break;
            case "CL":
                return "&id_state=145";
                break;
            case "CB":
                return "&id_state=146";
                break;
            case "CE":
                return "&id_state=148";
                break;
            case "Catania":
                return "&id_state=149";
                break;
            case "CZ":
                return "&id_state=150";
                break;
            case "CH":
                return "&id_state=151";
                break;
            case "CO":
                return "&id_state=152";
                break;
            case "CS":
                return "&id_state=153";
                break;
            case "CR":
                return "&id_state=154";
                break;
            case "KR":
                return "&id_state=155";
                break;
            case "CN":
                return "&id_state=156";
                break;
            case "EN":
                return "&id_state=157";
                break;
            case "FM":
                return "&id_state=158";
                break;
            case "FE":
                return "&id_state=159";
                break;
            case "Firenze":
                return "&id_state=160";
                break;
            case "FG":
                return "&id_state=161";
                break;
            case "FC":
                return "&id_state=162";
                break;
            case "FR":
                return "&id_state=163";
                break;
            case "Genova":
                return "&id_state=164";
                break;
            case "GO":
                return "&id_state=165";
                break;
            case "GR":
                return "&id_state=166";
                break;
            case "IM":
                return "&id_state=167";
                break;
            case "IS":
                return "&id_state=168";
                break;
            case "AQ":
                return "&id_state=169";
                break;
            case "SP":
                return "&id_state=170";
                break;
            case "LT":
                return "&id_state=171";
                break;
            case "LE":
                return "&id_state=172";
                break;
            case "LC":
                return "&id_state=173";
                break;
            case "LI":
                return "&id_state=174";
                break;
            case "LO":
                return "&id_state=175";
                break;
            case "LU":
                return "&id_state=176";
                break;
            case "MC":
                return "&id_state=177";
                break;
            case "MN":
                return "&id_state=178";
                break;
            case "MS":
                return "&id_state=179";
                break;
            case "MT":
                return "&id_state=180";
                break;
            case "ME":
                return "&id_state=182";
                break;
            case "MIL":
                return "&id_state=183";
                break;
            case "MOD":
                return "&id_state=184";
                break;
            case "MEB":
                return "&id_state=185";
                break;
            case "Napoli":
                return "&id_state=186";
                break;
            case "NO":
                return "&id_state=187";
                break;
            case "NU":
                return "&id_state=188";
                break;
            case "Olbia":
                return "&id_state=190";
                break;
            case "OR":
                return "&id_state=191";
                break;
            case "PD":
                return "&id_state=192";
                break;
            case "Palermo":
                return "&id_state=193";
                break;
            case "PR":
                return "&id_state=194";
                break;
            case "PV":
                return "&id_state=195";
                break;
            case "PG":
                return "&id_state=196";
                break;
            case "PU":
                return "&id_state=197";
                break;
            case "PE":
                return "&id_state=198";
                break;
            case "PC":
                return "&id_state=199";
                break;
            case "PI":
                return "&id_state=200";
                break;
            case "PT":
                return "&id_state=201";
                break;
            case "PN":
                return "&id_state=202";
                break;
            case "PZ":
                return "&id_state=203";
                break;
            case "PO":
                return "&id_state=204";
                break;
            case "RG":
                return "&id_state=205";
                break;
            case "RA":
                return "&id_state=206";
                break;
            case "REC":
                return "&id_state=207";
                break;
            case "RE":
                return "&id_state=208";
                break;
            case "Rieti":
                return "&id_state=209";
                break;
            case "RN":
                return "&id_state=210";
                break;
            case "Roma":
                return "&id_state=211";
                break;
            case "RO":
                return "&id_state=212";
                break;
            case "SA":
                return "&id_state=213";
                break;
            case "SS":
                return "&id_state=214";
                break;
            case "SV":
                return "&id_state=215";
                break;
            case "SI":
                return "&id_state=216";
                break;
            case "SR":
                return "&id_state=217";
                break;
            case "SO":
                return "&id_state=218";
                break;
            case "TA":
                return "&id_state=219";
                break;
            case "TE":
                return "&id_state=220";
                break;
            case "TR":
                return "&id_state=221";
                break;
            case "TOR":
                return "&id_state=222";
                break;
            case "TP":
                return "&id_state=223";
                break;
            case "TN":
                return "&id_state=224";
                break;
            case "TV":
                return "&id_state=225";
                break;
            case "TS":
                return "&id_state=226";
                break;
            case "UD":
                return "&id_state=227";
                break;
            case "VA":
                return "&id_state=228";
                break;
            case "Venezia":
                return "&id_state=229";
                break;
            case "VB":
                return "&id_state=230";
                break;
            case "VC":
                return "&id_state=231";
                break;
            case "VR":
                return "&id_state=232";
                break;
            case "VV":
                return "&id_state=233";
                break;
            case "VI":
                return "&id_state=234";
                break;
            case "VT":
                return "&id_state=235";
                break;
            default:
                return 'dontcontinue';
                break;
        }
    } else if (profile['country'] == 'Japan') {
        switch (profile['stateProvince']) {
            case "Aichi":
                return "&id_state=270";
                break;
            case "Akita":
                return "&id_state=271";
                break;
            case "Aomori":
                return "&id_state=272";
                break;
            case "Chiba":
                return "&id_state=273";
                break;
            case "Ehime":
                return "&id_state=274";
                break;
            case "Fukui":
                return "&id_state=275";
                break;
            case "Fukuoka":
                return "&id_state=276";
                break;
            case "Fukushima":
                return "&id_state=277";
                break;
            case "Gifu":
                return "&id_state=278";
                break;
            case "Gunma":
                return "&id_state=279";
                break;
            case "Hiroshima":
                return "&id_state=280";
                break;
            case "Hokkaido":
                return "&id_state=281";
                break;
            case "Hyogo":
                return "&id_state=282";
                break;
            case "Ibaraki":
                return "&id_state=283";
                break;
            case "Ishikawa":
                return "&id_state=284";
                break;
            case "Iwate":
                return "&id_state=285";
                break;
            case "Kagawa":
                return "&id_state=286";
                break;
            case "Kagoshima":
                return "&id_state=287";
                break;
            case "Kanagawa":
                return "&id_state=288";
                break;
            case "Kochi":
                return "&id_state=289";
                break;
            case "Kumamoto":
                return "&id_state=290";
                break;
            case "Kyoto":
                return "&id_state=291";
                break;
            case "Mie":
                return "&id_state=292";
                break;
            case "Miyagi":
                return "&id_state=293";
                break;
            case "Miyazaki":
                return "&id_state=294";
                break;
            case "Nagano":
                return "&id_state=295";
                break;
            case "Nagasaki":
                return "&id_state=296";
                break;
            case "Nara":
                return "&id_state=297";
                break;
            case "Niigata":
                return "&id_state=298";
                break;
            case "Oita":
                return "&id_state=299";
                break;
            case "Okayama":
                return "&id_state=300";
                break;
            case "Okinawa":
                return "&id_state=301";
                break;
            case "Osaka":
                return "&id_state=302";
                break;
            case "Saga":
                return "&id_state=303";
                break;
            case "Saitama":
                return "&id_state=304";
                break;
            case "Shiga":
                return "&id_state=305";
                break;
            case "Shimane":
                return "&id_state=306";
                break;
            case "Shizuoka":
                return "&id_state=307";
                break;
            case "Tochigi":
                return "&id_state=308";
                break;
            case "Tokushima":
                return "&id_state=309";
                break;
            case "Tokyo":
                return "&id_state=310";
                break;
            case "Tottori":
                return "&id_state=311";
                break;
            case "Toyama":
                return "&id_state=312";
                break;
            case "Wakayama":
                return "&id_state=313";
                break;
            case "Yamagata":
                return "&id_state=314";
                break;
            case "Yamaguchi":
                return "&id_state=315";
                break;
            case "Yamanashi":
                return "&id_state=316";
                break;
            default:
                return 'dontcontinue';
                break;
        }
    } else if (profile['country'] == 'United States') {
        switch (profile['stateProvince']) {
            case 'AL':
                return '&id_state=4';
                break;
            case 'AK':
                return '&id_state=5';
                break;
            case 'AZ':
                return '&id_state=6';
                break;
            case 'AR':
                return '&id_state=7';
                break;
            case 'CA':
                return '&id_state=8';
                break;
            case 'CO':
                return '&id_state=9';
                break;
            case 'CT':
                return '&id_state=10';
                break;
            case 'DE':
                return '&id_state=11';
                break;
            case 'FL':
                return '&id_state=12';
                break;
            case 'GA':
                return '&id_state=13';
                break;
            case 'HI':
                return '&id_state=14';
                break;
            case 'ID':
                return '&id_state=15';
                break;
            case 'IL':
                return '&id_state=16';
                break;
            case 'IN':
                return '&id_state=17';
                break;
            case 'IA':
                return '&id_state=18';
                break;
            case 'KS':
                return '&id_state=19';
                break;
            case 'KY':
                return '&id_state=20';
                break;
            case 'LA':
                return '&id_state=21';
                break;
            case 'ME':
                return '&id_state=22';
                break;
            case 'MD':
                return '&id_state=23';
                break;
            case 'MA':
                return '&id_state=24';
                break;
            case 'MI':
                return '&id_state=25';
                break;
            case 'MN':
                return '&id_state=26';
                break;
            case 'MS':
                return '&id_state=27';
                break;
            case 'MO':
                return '&id_state=28';
                break;
            case 'MT':
                return '&id_state=29';
                break;
            case 'NE':
                return '&id_state=30';
                break;
            case 'NV':
                return '&id_state=31';
                break;
            case 'NH':
                return '&id_state=32';
                break;
            case 'NJ':
                return '&id_state=33';
                break;
            case 'NM':
                return '&id_state=34';
                break;
            case 'NY':
                return '&id_state=35';
                break;
            case 'NC':
                return '&id_state=36';
                break;
            case 'ND':
                return '&id_state=37';
                break;
            case 'OH':
                return '&id_state=38';
                break;
            case 'OK':
                return '&id_state=39';
                break;
            case 'OR':
                return '&id_state=40';
                break;
            case 'PA':
                return '&id_state=41';
                break;
            case 'RI':
                return '&id_state=42';
                break;
            case 'SC':
                return '&id_state=43';
                break;
            case 'SD':
                return '&id_state=44';
                break;
            case 'TN':
                return '&id_state=45';
                break;
            case 'TX':
                return '&id_state=46';
                break;
            case 'UT':
                return '&id_state=47';
                break;
            case 'VT':
                return '&id_state=48';
                break;
            case 'VA':
                return '&id_state=49';
                break;
            case 'WA':
                return '&id_state=50';
                break;
            case 'WV':
                return '&id_state=51';
                break;
            case 'WI':
                return '&id_state=52';
                break;
            case 'WY':
                return '&id_state=53';
                break;
            default:
                return 'dontcontinue';
                break;
        }
    } else if (profile['country'] == 'Canada') {
        switch (profile['stateProvince']) {
            case 'ON':
                return '&id_state=89';
                break;
            case 'BC':
                return '&id_state=91';
                break;
            case 'AB':
                return '&id_state=92';
                break;
            case 'MB':
                return '&id_state=93';
                break;
            case 'SK':
                return '&id_state=94';
                break;
            case 'NS':
                return '&id_state=95';
                break;
            case 'NB':
                return '&id_state=96';
                break;
            case 'NF':
                return '&id_state=97';
                break;
            case 'PE':
                return '&id_state=98';
                break;
            case 'NT':
                return '&id_state=99';
                break;
            case 'YT':
                return '&id_state=100';
                break;
            case 'NU':
                return '&id_state=101';
                break;
            default:
                return 'dontcontinue';
                break;
        }
    } else if (profile['country'] == 'Australia') {
        switch (profile['stateProvince']) {
            case 'ACT':
                return '&id_state=317';
                break;
            case 'NSW':
                return '&id_state=318';
                break;
            case 'NT':
                return '&id_state=319';
                break;
            case 'QLD':
                return '&id_state=320';
                break;
            case 'ASA':
                return '&id_state=321';
                break;
            case 'TAS':
                return '&id_state=322';
                break;
            case 'VIC':
                return '&id_state=323';
                break;
            case 'WA':
                return '&id_state=324';
                break;
            default:
                return 'dontcontinue';
                break;
        }
    } else {
        return '';
    }
}