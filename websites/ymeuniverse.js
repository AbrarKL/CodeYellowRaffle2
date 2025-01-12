
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

	if(task['proxy'] != '')
	{
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	}
	else
	{
		agent = '';
	}
	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		agent: agent
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'GOT RAFFLE PAGE'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle page');
			exports.getRaffleToken(request, task, profile);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}


exports.getRaffleToken = function (request, task, profile) {
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
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle token'
	});
	console.log(`[${task.taskID}] ` + ' Obtaining raffle token');

	if(task['proxy'] != '')
	{
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	}
	else
	{
		agent = '';
	}
	request({
		url: task['ymeuniverse']['raffleToken'],
		method: 'POST',
		headers: {
			'Origin': 'https://ymeuniverse.typeform.com',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Connection': 'keep-alive',
			'Content-Length': '0',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsed = JSON.parse(body);
			var raffleToken = parsed['token'];
			var landedAt = parsed['landed_at'];
			if (!raffleToken || !landedAt) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error obtaining token. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.getRaffleToken(request, task, profile), global.settings.retryDelay);
			}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle token');
			console.log('Raffle Token: ' + raffleToken);
			console.log('Landed at: ' + landedAt);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Submitting entry in ' + task['ymeuniverse']['submit_delay'] / 1000 + 's'
			});
			
			console.log(`[${task.taskID}] ` + 'Submitting entry in ' + task['ymeuniverse']['submit_delay'] / 1000 + 's');
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['ymeuniverse']['submit_delay']);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRaffleToken(request, task, profile), global.settings.retryDelay);
		}
	});
}


exports.submitRaffle = function (request, task, profile, raffleToken, landedAt) {
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
	var form = JSON.parse(
		`{"${task['ymeuniverse']['fullName']}": "${profile['firstName']} ${profile['lastName']}",
	"${task['ymeuniverse']['gender']}": "Man",
	"${task['ymeuniverse']['blank']}": "",
	"${task['ymeuniverse']['phoneNumber']}": "${profile['phoneNumber']}",
	"${task['ymeuniverse']['email']}": "${task['taskEmail']}",
	"${task['ymeuniverse']['city']}": "${profile['city']}",
	"${task['ymeuniverse']['country']}": "${profile['country']}",
	"form[token]": "${raffleToken}",
	"form[landed_at]": "${landedAt}",
	"form[language]": "en"}`);
	if(task['proxy'] != '')
	{
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	}
	else
	{
		agent = '';
	}
	request({
		url: task['ymeuniverse']['submitRaffle'],
		method: 'POST',
		headers: {
			'Origin': 'https://ymeuniverse.typeform.com',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Connection': 'keep-alive'
		},
		formData: form,
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			try {
				parsed = JSON.parse(body);
			} catch (e) {}
			var message = parsed['message'];
			if (message == 'success') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		} else {
			console.log(body);
			try {
				parsed = JSON.parse(body);
			} catch (e) {}
			var error = parsed['error_code'];
			if (!error) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. Please contact the developers'
				});
				console.log(`[${task.taskID}] ` + body);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			if (error == 'invalid-token') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Raffle not found'
				});
				console.log(`[${task.taskID}] ` + ' Raffle not found');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
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


// Needed for size variants being different per site

function sizeFormatter(taskSize) {
	switch (taskSize) {
		case '4':
			return 'UK 3.5 / EU 36';
			break;
		case '4.5':
			return 'UK 4 / EU 36 2/3';
			break;
		case '5':
			return 'UK 4.5 / EU 37 1/3';
			break;
		case '5.5':
			return 'UK 5 / EU 38';
			break;
		case '6':
			return 'UK 5.5 / EU 38 2/3';
			break;
		case '6.5':
			return 'UK 6 / EU 39 1/3';
			break;
		case '7':
			return 'UK 6.5 / EU 40';
			break;
		case '7.5':
			return 'UK 7 / EU 40 2/3';
			break;
		case '8':
			return 'UK 7.5 / EU 41 1/3';
			break;
		case '8.5':
			return 'UK 8 / EU 42';
			break;
		case '9':
			return 'UK 8.5 / EU 42 2/3';
			break;
		case '9.5':
			return 'UK 9 / EU 43 1/3';
			break;
		case '10':
			return 'UK 9.5 / EU 44';
			break;
		case '10.5':
			return 'UK 10 / EU 44 2/3';
			break;
		case '11':
			return 'UK 10.5 / EU 45 1/3';
			break;
		case '11.5':
			return 'UK 11 / EU 46';
			break;
		case '12':
			return 'UK 11.5 / EU 46 2/3';
			break;
		case '12.5':
			return 'UK 12 / EU 47 1/3';
			break;
	}
}
