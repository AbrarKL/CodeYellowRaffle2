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
	if (task['captchaHandler'] == 'manual') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'You must use 2Cap or AntiCap for Maha'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
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

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'maha may not ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}


	if (profile['firstName'] == null || profile['firstName'] == undefined || profile['firstName'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a first name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	if (profile['lastName'] == null || profile['lastName'] == undefined || profile['lastName'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a last name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (profile['phoneNumber'] == null || profile['phoneNumber'] == undefined || profile['phoneNumber'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a number'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Getting registration page'
	});
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	var cheerio = require('cheerio');
	task['taskPassword'] = makePassword(15);


	request({
		url: 'https://shop.maha-amsterdam.com/us/account/register/',
		headers: {
			'authority': 'shop.maha-amsterdam.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-mode': 'navigate',
			'referer': 'https://shop.maha-amsterdam.com/us/services/challenge/',
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
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			$ = cheerio.load(body);
			var key = $('input[name="key"]').attr('value');
			request({
				url: 'https://shop.maha-amsterdam.com/us/account/registerPost/',
				method: 'POST',
				headers: {
					'authority': 'shop.maha-amsterdam.com',
					'cache-control': 'max-age=0',
					'origin': 'https://shop.maha-amsterdam.com',
					'upgrade-insecure-requests': '1',
					'content-type': 'application/x-www-form-urlencoded',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
					'sec-fetch-user': '?1',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'sec-fetch-site': 'same-origin',
					'sec-fetch-mode': 'navigate',
					'referer': 'https://shop.maha-amsterdam.com/us/account/register/',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
				},
				body: 'key=' + key + '&gender=male&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&email=' + task['taskEmail'] + '&type=private&phone_number_code=US%7C1&phone=&mobile=' + profile['phoneNumber'] + '&birthdate_d='+getRandomInt(1, 27)+'&birthdate_m='+getRandomInt(1, 9)+'&birthdate_y='+getRandomInt(1982, 2000)
				+'&format=international&streetname=' + profile['address'] + '&streetname2=&number=&house_extension=&zipcode=' + profile['zipCode'] + '&city=' + profile['city'] + '&region_id=&region=&country=' + profile['country'] + '&same_address=1&shipping_attention=&shipping_company=&shipping_format=default&shipping_zipcode=&shipping_number=&shipping_house_extension=&shipping_streetname=&shipping_streetname2=&shipping_city=&shipping_region_id=5722&shipping_region=&shipping_country=150&company=&cocnumber=&vatnumber=&password='+task['taskPassword']+'&password2='+task['taskPassword']+'&terms=1&newsletter=1',
				followAllRedirects: true,
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
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
					}
					$ = cheerio.load(body);
					key = $('input[name="key"]').attr('value');
					if (!key) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
					}

					if (response.request.href == 'https://shop.maha-amsterdam.com/us/services/challenge/') {
						// get captcha
						console.log('needs captcha');
						return exports.captchaWorker(request, task, profile, key);
					} else {
						console.log('mahaerrordmlog');
						console.log(JSON.stringify(profile));
						console.log(JSON.stringify(task));
						try {
							console.log(body);
						} catch (e) {

						}
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM log'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
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
					return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
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
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}

exports.captchaWorker = function (request, task, profile, key) {
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	if (task['captchaHandler'] == 'manual') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Awaiting captcha'
		});
		console.log(`[${task.taskID}] ` + ' Awaiting captcha');
		mainBot.requestCaptcha('mahaamsterdam', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				exports.submitRaffle(request, task, profile, key);
				return;
			}
		}
		capHandler();
	} else {
		agent = new HttpsProxyAgent(formatProxy(task['proxy']));
		if (task['captchaHandler'] == 'anticaptcha') {
			if (global.settings.antiCapAPIKey == '' || global.settings.antiCapAPIKey == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha API Key not set. Check settings.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
			request({
				url: 'https://api.anti-captcha.com/createTask',
				method: 'POST',
				body: {
					clientKey: global.settings.antiCapAPIKey,
					"softId": "924",
					"task": {
						"type": "NoCaptchaTaskProxyless",
						"websiteURL": "https://shop.maha-amsterdam.com/us/services/challenge/://mailchi.mp/afew-store/mim54y8lty",
						"websiteKey": "6LcSoR4UAAAAAO3mKqp729zO-PAz1m7DK9AqnONr"
					}
				},
				json: true,
				agent: agent
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'AntiCaptcha error. Retrying in 15s'
					});
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					return setTimeout(() => exports.captchaWorker(request, task, profile, key), 15000);
				}
				if (body.errorId != undefined && body.errorId == 0) {
					var taskId = body.taskId;
					console.log('Captcha task for Anti-Captcha queued. Task ID: ' + taskId)
					const capHandler = () => {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Checking AntiCaptcha every 5s'
						});
						console.log('Checking for Captcha token (Anti-Captcha Task ID: ' + taskId + ')');
						request({
							url: 'https://api.anti-captcha.com/getTaskResult',
							method: 'POST',
							body: {
								clientKey: global.settings.antiCapAPIKey,
								taskId: taskId
							},
							json: true,
							agent: agent
						}, function (error, response, body) {
							if (error) {
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'AntiCaptcha error'
								});
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								mainBot.taskCaptchas[task['type']][task['taskID']] = '';
							}
							if (body == undefined) {
								var proxy2 = getRandomProxy();
								task['proxy'] = proxy2;
								return setTimeout(() => capHandler(), 10000);
							}
							if (body.errorId == 0) {
								if (body.status == 'ready') {
									console.log(JSON.stringify(body));
									mainBot.taskCaptchas[task['type']][task['taskID']] = body.solution.gRecaptchaResponse;
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Submitting entry'
									});
									console.log('submitting');
									return exports.submitRaffle(request, task, profile, key);
								} else {
									return setTimeout(() => capHandler(), 5000);
								}
							} else {
								console.log(JSON.stringify(body));
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: antiCaptchaErrorFormatter(body.errorCode)
								});
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								mainBot.taskCaptchas[task['type']][task['taskID']] = '';
								return;
							}
						});
					}
					capHandler();
				} else {
					console.log(JSON.stringify(body));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: antiCaptchaErrorFormatter(body.errorCode)
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return;
				}
			});
		} else if (task['captchaHandler'] == '2captcha') {
			if (global.settings['2capAPIKey'] == '' || global.settings['2capAPIKey'] == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha API Key not set. Check settings.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
			request({
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LcSoR4UAAAAAO3mKqp729zO-PAz1m7DK9AqnONr&pageurl=https://shop.maha-amsterdam.com/us/services/challenge/&json=1&soft_id=2553',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, key), 15000);
				}
				if (body.status == 0) {
					console.log(JSON.stringify(body));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: twoCaptchaCreateErrorFormatter(body.request)
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return;
				} else {
					if (body.status == 1) {
						var taskId = body.request;
						console.log('Captcha task for 2Captcha queued. Task ID: ' + taskId)
						const capHandler = () => {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Checking 2Captcha every 5s'
							});
							console.log('Checking for Captcha token (2Captcha Task ID: ' + taskId + ')');
							request({
								url: 'https://2captcha.com/res.php?key=' + global.settings['2capAPIKey'] + '&action=get&id=' + taskId + '&json=1',
								method: 'GET',
								json: true
							}, function (error, response, body) {
								if (error) {
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: '2Captcha error'
									});
									mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
									mainBot.taskCaptchas[task['type']][task['taskID']] = '';
								}
								if (body == undefined) {
									return setTimeout(() => capHandler(), 10000);
								} else if (body.status == 0) {
									if (body.request == 'CAPCHA_NOT_READY') {
										return setTimeout(() => capHandler(), 5000);
									} else {
										console.log(JSON.stringify(body));
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: twoCaptchaResponseErrorFormatter(body.request)
										});
										mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
										mainBot.taskCaptchas[task['type']][task['taskID']] = '';
										return;
									}
								} else {
									if (body.status == 1) {
										console.log(JSON.stringify(body));
										mainBot.taskCaptchas[task['type']][task['taskID']] = body.request;
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Submitting entry'
										});
										console.log('submitting');
										return exports.submitRaffle(request, task, profile, key);
									} else {
										if (body.request == 'CAPCHA_NOT_READY') {
											return setTimeout(() => capHandler(), 5000);
										} else {
											console.log(JSON.stringify(body));
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: twoCaptchaResponseErrorFormatter(body.request)
											});
											mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
											mainBot.taskCaptchas[task['type']][task['taskID']] = '';
											return;
										}
									}
								}
							});
						}
						capHandler();
					} else {
						console.log(JSON.stringify(body));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: twoCaptchaCreateErrorFormatter(body.errorCode)
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						mainBot.taskCaptchas[task['type']][task['taskID']] = '';
						return;
					}
				}
			});
		}
	}
}

exports.submitRaffle = function (request, task, profile, key) {
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

	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: 'https://shop.maha-amsterdam.com/us/account/registerPost/',
		method: 'POST',
		headers: {
			'authority': 'shop.maha-amsterdam.com',
			'cache-control': 'max-age=0',
			'origin': 'https://shop.maha-amsterdam.com',
			'upgrade-insecure-requests': '1',
			'content-type': 'application/x-www-form-urlencoded',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-mode': 'navigate',
			'referer': 'https://shop.maha-amsterdam.com/us/services/challenge/',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		body: 'key=' + key + '&g-recaptcha-response=' + mainBot.taskCaptchas[task['type']][task['taskID']],
		followAllRedirects: true,
		agent: agent
	}, function callback(error, response, body) {
		console.log(response.request.href);
		if (!error) {
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
			if (response.request.href == 'https://shop.maha-amsterdam.com/us/account/information/') {
				require('request')({
					url: 'https://api.codeyellow.io/instagram/get?type=maha',
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
						url: 'https://apps.shopmonkey.nl/maha/raffle/raffle.php',
						method: 'POST',
						headers: {
							'Connection': 'keep-alive',
							'Accept': '*/*',
							'Origin': 'https://shop.maha-amsterdam.com',
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'Sec-Fetch-Site': 'cross-site',
							'Sec-Fetch-Mode': 'cors',
							'Referer': 'https://shop.maha-amsterdam.com/us/nike-air-force-1-07-para-noise-black.html',
							'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
						},
						body: 'product=Nike+Air+Force+1+\'07+Para-Noise+Black&productImage=https%3A%2F%2Fcdn.webshopapp.com%2Fshops%2F171311%2Ffiles%2F310039021%2F112x132x1%2Fimage.jpg&productId=104438143&dontfill=&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&phone=' + profile['phoneNumber'] + '&shoeSize=' + task['taskSizeVariant'] + '&email=' + task['taskEmail'] + '&country=' + profile['country'] + '&instagram=' + profile['instagram'] + '&shipping=shipping&keepMePosted=on',
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
								return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
							}
							if (body.toLowerCase().indexOf('raffle-succes-message') > -1) {
								console.log('Entered');
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'entry submitted!'
								});
								console.log(`[${task.taskID}] ` + ' Entry submitted!');
								registerEmail(task);
								mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', task['taskPassword'], task, profile);
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								return;
							} else {
								try {
									console.log(body);
								} catch (e) {

								}
								console.log(`[${task.taskID}] ` + JSON.stringify(task));
								console.log(`[${task.taskID}] ` + JSON.stringify(profile));
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'make sure your profile is complete'
								});
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							}
						} else {
							var proxy2 = getRandomProxy();
							task['proxy'] = proxy2;
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
							});
							return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
						}
					});
				});
			} else if (response.request.href == 'https://shop.maha-amsterdam.com/us/account/register/') {
				// PARSE ERRORS MAYBE
				console.log('mahaerrordmlog');
				console.log(JSON.stringify(profile));
				console.log(JSON.stringify(task));
				try {
					console.log(body);
				} catch (e) {

				}
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'make sure your profile is valid.'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
				// error in registration
			}
			//console.log(body);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
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
			return '225';
			break;
		case 'United States':
			return '226';
			break;
		case 'Canada':
			return '38';
			break;
		case 'Ireland':
			return '103';
			break;
		case 'Germany':
			return '80';
			break;
		case 'Portugal':
			return '172';
			break;
		case 'Switzerland':
			return '206';
			break;
		case 'France':
			return '73';
			break;
		case 'Spain':
			return '199';
			break;
		case 'Italy':
			return '105';
			break;
		case 'Netherlands':
			return '150';
			break;
		case 'Czech Republic':
			return '57';
			break;
		case 'Australia':
			return '13';
			break;
		case 'Austria':
			return '14';
			break;
		case 'Slovakia':
			return '193';
			break;
		case 'Belgium':
			return '21';
			break;
		case 'Slovenia':
			return '194';
			break;
		case 'Singapore':
			return '192';
			break;
		case 'Malaysia':
			return '129';
			break;
		case 'Hong Kong':
			return '96';
			break;
		case 'China':
			return '44';
			break;
		case 'Japan':
			return '107';
			break;
		case 'Sweden':
			return '205';
			break;
		case 'Denmark':
			return '58';
			break;
		case 'Finland':
			return '72';
			break;
		case 'Romania':
			return '176';
			break;
		case 'Poland':
			return '171';
			break;
		case 'Hungary':
			return '97';
			break;
		case 'Russia':
			return '177';
			break;
		case 'Luxembourg':
			return '124';
			break;
		default:
			return 'noexist';
			break;
	}
}






function antiCaptchaErrorFormatter(message) {
	switch (message) {
		case 'ERROR_ZERO_BALANCE':
			return 'AntiCaptcha balance 0';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_NO_SLOT_AVAILABLE':
			return 'No AntiCaptcha workers available';
			break;
		case 'ERROR_RECAPTCHA_INVALID_SITEKEY':
			return 'Invalid SiteKey. DM Devs';
			break;
		case 'ERROR_RECAPTCHA_INVALID_DOMAIN':
			return 'Invalid website. DM Devs';
			break;
		default:
			return 'AntiCaptcha error. DM Log';
			break;
	}
}

function twoCaptchaCreateErrorFormatter(message) {
	switch (message) {
		case 'ERROR_ZERO_BALANCE':
			return 'AntiCaptcha balance 0';
			break;
		case 'ERROR_WRONG_USER_KEY':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_NO_SLOT_AVAILABLE':
			return 'No 2Captcha workers available';
			break;
		case 'ERROR_BAD_TOKEN_OR_PAGEURL':
			return 'Invalid token or url. DM Devs';
			break;
		case 'ERROR_PAGEURL':
			return 'Invalid website. DM Devs';
			break;
		default:
			return '2Captcha error. DM Log';
			break;
	}
}

function twoCaptchaResponseErrorFormatter(message) {
	switch (message) {
		case 'ERROR_CAPTCHA_UNSOLVABLE':
			return 'Captcha was unsolvable';
			break;
		case 'ERROR_WRONG_USER_KEY':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		default:
			return '2Captcha error. DM Log';
			break;
	}
}

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