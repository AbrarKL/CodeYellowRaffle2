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

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.phone.phoneNumberFormat(1);;
	}

	if(profile['country'] != 'United States')
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Raffle is US only'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	if(profile['stateProvince'] == null || profile['stateProvince'] == undefined || profile['stateProvince'] == '' || profile['stateProvince'] == 'none')
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a state'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	return exports.createRaffleForm(request, task, profile);
}



exports.createRaffleForm = function (request, task, profile) {
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}


	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating post information'
	});

	var postInputs = {};
	postInputs[task['dtlr']['firstName']] = profile['firstName'];
	postInputs[task['dtlr']['lastName']] = profile['lastName'];


	postInputs[task['dtlr']['email']] = task['taskEmail'];
	postInputs[task['dtlr']['confirmEmail']] = task['taskEmail'];
	postInputs[task['dtlr']['birthYear']] = getRandomInt(1982, 2000);
	postInputs[task['dtlr']['phoneNumber']] = profile['phoneNumber'];
	postInputs[task['dtlr']['address']] = profile['address'];
	postInputs[task['dtlr']['city']] = profile['city'];
	postInputs[task['dtlr']['state']] = stateFormatter(profile['stateProvince']);
	postInputs[task['dtlr']['zip']] = profile['zipCode'];
	postInputs[task['dtlr']['country']] = "United States";
	postInputs[task['dtlr']['gender']] = "Male";
	postInputs[task['dtlr']['size']] = task['taskSizeVariant'];




	postInputs[task['dtlr']['hiddenChecked']] = task['dtlr']['hiddenCheckedVal'];
	postInputs[task['dtlr']['gform0']] = task['dtlr']['gform0Val'];
	postInputs[task['dtlr']['gform1']] = task['dtlr']['gform1Val'];
	postInputs[task['dtlr']['gform2']] = task['dtlr']['gform2Val'];
	postInputs[task['dtlr']['gform3']] = task['dtlr']['gform3Val'];
	postInputs[task['dtlr']['gform4']] = task['dtlr']['gform4Val'];
	postInputs[task['dtlr']['gform5']] = task['dtlr']['gform5Val'];
	postInputs[task['dtlr']['gform6']] = task['dtlr']['gform6Val'];
	postInputs[task['dtlr']['gform7']] = task['dtlr']['gform7Val'];
	postInputs[task['dtlr']['gform8']] = task['dtlr']['gform8Val'];
	postInputs[task['dtlr']['gform9']] = task['dtlr']['gform9Val'];
	postInputs[task['dtlr']['gform10']] = task['dtlr']['gform10Val'];
	postInputs[task['dtlr']['gform11']] = task['dtlr']['gform11Val'];
	postInputs[task['dtlr']['gform12']] = task['dtlr']['gform12Val'];
	postInputs[task['dtlr']['gform13']] = task['dtlr']['gform13Val'];
	postInputs[task['dtlr']['gform14']] = task['dtlr']['gform14Val'];
	postInputs[task['dtlr']['gform15']] = task['dtlr']['gform15Val'];

	console.log(JSON.stringify(postInputs));
	console.log(JSON.stringify(task));
	console.log(JSON.stringify(profile));

	console.log('Got raffle information and saved');
	console.log('Now needs captcha');
	return exports.captchaWorker(request, task, profile, postInputs);
}


exports.captchaWorker = function (request, task, profile, postInputs) {
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
		mainBot.requestCaptcha('dtlr', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				exports.submitRaffle(request, task, profile, postInputs);
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
					message: 'AntiCaptcha API Key not set. Check settings.'
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
						"websiteURL": task["variant"],
						"websiteKey": "6LeepqwUAAAAAKmQ_Dj-bY23bKZtThXNxlxFKp6F"
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
					return setTimeout(() => exports.captchaWorker(request, task, profile, postInputs), 15000);
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
							if(body == undefined)
							{
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
									return exports.submitRaffle(request, task, profile, postInputs);
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
					message: '2Captcha API Key not set. Check settings.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
			request({
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LeepqwUAAAAAKmQ_Dj-bY23bKZtThXNxlxFKp6F&pageurl=' + task["variant"] + '&json=1&soft_id=2553',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, postInputs), 15000);
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
								if(body == undefined)
								{
									return setTimeout(() => capHandler(), 10000);
								}
								else if (body.status == 0) {
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
										return exports.submitRaffle(request, task, profile, postInputs);
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

exports.submitRaffle = function (request, task, profile, postInputs) {
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
	if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
		// NEEDS CAPTCHA AGAIN
		return setTimeout(() => exports.captchaWorker(request, task, profile, postInputs), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
	}

	postInputs["g-recaptcha-response"] = mainBot.taskCaptchas[task['type']][task['taskID']];

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting raffle'
	});
	//You still have one more step before you’re registered for the Air Jordan 1 Black Toe Raffle.              Click the button in the email sent to [email protected] to finish registration.


	//This field is required. Please enter a complete address
	//The reCAPTCHA was invalid. Go back and try it again.
	//This field is required. Please enter the first and last name
	//Please enter a valid email address
	request({
		url: task['variant'],
		method: 'POST',
		headers: {
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
		},
		formData: postInputs,
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
			return setTimeout(() => exports.submitRaffle(request, task, profile, postInputs), global.settings.retryDelay);
		}
		if (response.statusCode != 200) {	
			if (body.toLowerCase().indexOf('your ip is blocked due to too many ') > -1) {	
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Too many requests. Use proxies'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, postInputs), global.settings.retryDelay);
		}
		if (body.toLowerCase().indexOf('you still have one more step before you’re registered for the') > -1) {
			mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Check Email!'
			});
			console.log(`[${task.taskID}] ` + ' Entry submitted (Check Email)!');
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
		else if (body.toLowerCase().indexOf('this field is required. please enter the first and last name') > -1) { 
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Missing first name'
			});
			console.log(`[${task.taskID}] ` + JSON.stringify(profile));
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
		else if (body.toLowerCase().indexOf('please enter a valid email address') > -1) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Invalid email'
			});
			console.log(`[${task.taskID}] ` + JSON.stringify(profile));
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			console.log(task);
			return;
		}
		else if (body.toLowerCase().indexOf('this field requires a unique entry and the values you entered have already been used') > -1) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Email previously entered'
			});
			console.log(`[${task.taskID}] ` + JSON.stringify(profile));
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
		else if (body.toLowerCase().indexOf('the recaptcha was invalid. go back and try it again.') > -1) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Cap error. Retrying'
			});
			mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			return exports.captchaWorker(request, task, profile, postInputs);
		}
		else
		{
			console.log(body);
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


// Needed for state localizations being different per site
function stateFormatter(profileState) {
	switch (profileState) {
		case 'AL':
			return 'Alabama';
			break;
		case 'AK':
			return 'Alaska';
			break;
		case 'AZ':
			return 'Arizona';
			break;
		case 'AR':
			return 'Arkansas';
			break;
		case 'CA':
			return 'California';
			break;
		case 'CO':
			return 'Colorado';
			break;
		case 'CT':
			return 'Connecticut';
			break;
		case 'DE':
			return 'Delaware';
			break;
		case 'FL':
			return 'Florida';
			break;
		case 'GA':
			return 'Georgia';
			break;
		case 'HI':
			return 'Hawaii';
			break;
		case 'ID':
			return 'Idaho';
			break;
		case 'IL':
			return 'Illinois';
			break;
		case 'IN':
			return 'Indiana';
			break;
		case 'IA':
			return 'Iowa';
			break;
		case 'KS':
			return 'Kansas';
			break;
		case 'KY':
			return 'Kentucky';
			break;
		case 'LA':
			return 'Louisiana';
			break;
		case 'ME':
			return 'Maine';
			break;
		case 'MD':
			return 'Maryland';
			break;
		case 'MA':
			return 'Massachusetts';
			break;
		case 'MI':
			return 'Michigan';
			break;
		case 'MN':
			return 'Minnesota';
			break;
		case 'MS':
			return 'Mississippi';
			break;
		case 'MO':
			return 'Missouri';
			break;
		case 'MT':
			return 'Montana';
			break;
		case 'NE':
			return 'Nebraska';
			break;
		case 'NV':
			return 'Nevada';
			break;
		case 'NH':
			return 'New Hampshire';
			break;
		case 'NJ':
			return 'New Jersey';
			break;
		case 'NM':
			return 'New Mexico';
			break;
		case 'NY':
			return 'New York';
			break;
		case 'NC':
			return 'North Carolina';
			break;
		case 'ND':
			return 'North Dakota';
			break;
		case 'OH':
			return 'Ohio';
			break;
		case 'OK':
			return 'Oklahoma';
			break;
		case 'OR':
			return 'Oregon';
			break;
		case 'PA':
			return 'Pennsylvania';
			break;
		case 'RI':
			return 'Rhode Island';
			break;
		case 'SC':
			return 'South Carolina';
			break;
		case 'SD':
			return 'South Dakota';
			break;
		case 'TN':
			return 'Tennessee';
			break;
		case 'TX':
			return 'Texas';
			break;
		case 'UT':
			return 'Utah';
			break;
		case 'VT':
			return 'Vermont';
			break;
		case 'VA':
			return 'Virginia';
			break;
		case 'WA':
			return 'Washington';
			break;
		case 'WV':
			return 'West Virginia';
			break;
		case 'WI':
			return 'Wisconsin';
			break;
		case 'WY':
			return 'Wyoming';
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