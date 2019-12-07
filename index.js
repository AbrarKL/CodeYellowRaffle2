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

var currentVersion = '0.3.2';
global.currentVersion = currentVersion;
// LATER REMOVE EMAIL FROM if (fileExists('profiles.json')) {
const {
	machineId,
	machineIdSync
} = require('node-machine-id');
const open = require("open");
const electron = require('electron');
const squirrelWin32 = require('./squirrel');
const fs = require('fs');
const request = require('request');
const appDataDir = require('os').homedir() + "\\AppData\\Local\\CodeYellow_Raffle_V2";
const proxy = require('./proxy.js');
const crypto = require('crypto');

// WEBSITES SUPPORTED;
const websites = require('./websites');

initialfolderExistsOrMkDir();

var signUpURL = 'https://codeyellow.io/account.php?type=signup';

var trueLog = console.log;
console.log = function (msg) {
	fs.appendFile(appDataDir + "\\log.txt", msg + "\r\n", function (err) {
		if (err) {
			return trueLog(err);
		}
	});
	trueLog(msg);
}


global.websites = {
	'afewstore': {
		sitekey: '6Lexz1YUAAAAAJZknL3EkeY_xBlIKGKGfGwFHhjK',
		url: 'mc.us5.list-manage.com',
		name: 'AFewStore'
	},
	'woodwood': {
		sitekey: '6LcN9xoUAAAAAHqSkoJixPbUldBoHojA_GCp6Ims',
		url: 'woodwood.us4.list-manage.com',
		name: 'WoodWood'
	},
	'shinzoparis': {
		sitekey: '6LczOjoUAAAAABEfbqdtD11pFD5cZ0n5nhz89nxI',
		url: 'raffle.shinzo.paris',
		name: 'ShinzoParis'
	},
	'shoezgallery': {
		sitekey: '6LcBxjcUAAAAAIwov8vAg-HTPriSnUIQXYBBFweZ',
		url: 'raffle.shoezgallery.com',
		name: 'ShoezGallery'
	},
	'bstn': {
		sitekey: '6LeZJZEUAAAAAPLuYfMYiMOF7X7tKMz45xfEIXaZ',
		url: 'raffle.bstn.com',
		name: 'BSTN'
	},
	'asphaltgold': {
		sitekey: '6LcN9xoUAAAAAHqSkoJixPbUldBoHojA_GCp6Ims',
		url: 'asphaltgold.us1.list-manage.com',
		name: 'AsphaltGold'
	},
	'snipeskicks': {
		sitekey: '6Lf1zbMUAAAAANBwSjY8Mh5d0bTe4-ucx5Gt1UEz',
		url: 'raffle.snipesusa.com',
		name: 'SnipesKicks (Kicks)'
	},
	'kicksstore': {
		sitekey: '6LfQ36gUAAAAAJjVSZ15liCo0kXjEBH6Lcexwl6_',
		url: 'raffle.kicksstore.eu',
		name: 'KicksStore'
	},
	'dtlr': {
		sitekey: '6LeepqwUAAAAAKmQ_Dj-bY23bKZtThXNxlxFKp6F',
		url: 'blog.dtlr.com',
		name: 'DTLR'
	},
	'backdoor': {
		sitekey: '6LdVDAcTAAAAAP1Qr9EowXZi1gSYmGI9aqxiUFgD',
		url: 'back-door.it',
		name: 'Back-door.it'
	},
	'milk-store': {
		sitekey: '6LdJXYMUAAAAANBhbEps33IW7BJKBEu3xsWOkZ7Z',
		url: 'raffle.milk-store.com',
		name: 'Milk-store'
	},
	'chmielna': {
		sitekey: '6Lf14jgUAAAAAJ_xxyVSusFVOJY7yOR-wjpw-8nf',
		url: 'yeezy500.chmielna20.pl',
		name: 'Chmielna'
	},
	'vitkac': {
		sitekey: '6LfmiqkUAAAAAD_Fm-4KvgdtZhZbzXh2kdie0y2B',
		url: 'vitkac.com',
		name: 'Vitkac'
	},
	'skatedeluxe': {
		sitekey: '6LfKcSUUAAAAAKPsnPBeTOSxPfNB_8gXgf7mxeJS',
		url: 'skatedeluxe.com',
		name: 'SkateDeluxe'
	},
	'vooberlin': {
		sitekey: '6LcyNx4UAAAAAGF7EPoti8G18kv9j9kDeQWzcVec',
		url: 'raffle.vooberlin.com',
		name: 'VooBerlin'
	},
	'nakedcph': {
		sitekey: '6LeNqBUUAAAAAFbhC-CS22rwzkZjr_g4vMmqD_qo',
		url: 'nakedcph.com',
		name: 'NakedCPH'
	},
	'wishatl': {
		sitekey: '6LcN9xoUAAAAAHqSkoJixPbUldBoHojA_GCp6Ims',
		url: 'wishatl.us12.list-manage.com',
		name: 'WishATL'
	},
	'bdgastore': {
		sitekey: '6LdhYxYUAAAAAAcorjMQeKmZb6W48bqb0ZEDRPCl',
		url: 'app.viralsweep.com',
		name: 'BDGAStore'
	},
	'fearofgod': {
		sitekey: '6LdhYxYUAAAAAAcorjMQeKmZb6W48bqb0ZEDRPCl',
		url: 'app.viralsweep.com',
		name: 'FOG'
	},
	'dsmny': {
		sitekey: '6LetKEIUAAAAAPk-uUXqq9E82MG3e40OMt_74gjS',
		url: 'newyork.doverstreetmarket.com',
		name: 'DSMNY'
	},
	'dsml': {
		sitekey: '6LetKEIUAAAAAPk-uUXqq9E82MG3e40OMt_74gjS',
		url: 'london.doverstreetmarket.com',
		name: 'DSML'
	},
	'dsmla': {
		sitekey: '6LetKEIUAAAAAPk-uUXqq9E82MG3e40OMt_74gjS',
		url: 'losangeles.doverstreetmarket.com',
		name: 'DSMLA'
	},
	'dsms': {
		sitekey: '6LetKEIUAAAAAPk-uUXqq9E82MG3e40OMt_74gjS',
		url: 'singapore.doverstreetmarket.com',
		name: 'DSMS'
	},
	'supplystore': {
		sitekey: '6LfknFoUAAAAAGfMFlRb2qHvlH34AS6HWXGd9RwI',
		url: 'createsend.com',
		name: 'Supply Store'
	},
	'kodaiaio': {
		sitekey: '6LceuKAUAAAAANlszS-ySauzunmtpFRKPFPsReaB',
		url: 'raffles.kodai.io',
		name: 'KodaiAIO'
	}
};

// Captcha stuff
global.captchaQueue = [];



// Captcha stuff

module.exports.capWin;

module.exports.mainBotWin;



module.exports.capStatus = 'hidden';


module.exports.captchaBank = [];

// Port stuff for captcha harvester
var globalPort = 3336;

// This callback checks if the pre defined port is taken
var isPortTaken = function (port, fn) {
	var net = require('net')
	var tester = net.createServer()
		.once('error', function (err) {
			if (err.code != 'EADDRINUSE') return fn(err)
			fn(null, true)
		})
		.once('listening', function () {
			tester.once('close', function () {
					fn(null, false)
				})
				.close()
		})
		.listen(port)
}

// This function sets the port and initalises the captcha window
function initCapPortThenWin() {
	isPortTaken(globalPort, function (err, taken) {
		if (!taken && !err) {
			initCapWin();
		} else {
			globalPort = globalPort += 1;
			initCapPortThenWin()
		}
	})
}

initCapPortThenWin();

module.exports.taskCaptchas = {
	'oneclick': [],
	'mass': []
};




module.exports.taskStatuses = {
	'oneclick': [],
	'mass': []
};

module.exports.tasksAwaitingConfirm = {
	'oneclick': [],
	'mass': []
};



getUpcomingReleases();



function loadBot() {
	if (global.settings.key == "" || global.settings.key == null) {
		openActivation(false);
	} else {
		request({
			url: 'https://codeyellow.io/api/v2/verifyKey.php',
			method: 'post',
			headers: {
				'x-auth-key': exports.getAuthHeader(machineIdSync(), global.settings.token, global.settings.key)
			},
			formData: {
				'key': global.settings.key,
				'token': global.settings.token,
				'hwid': machineIdSync()
			},
		}, function (err, response, body) {
			try {
				var parsed = JSON.parse(body);
				// IF CREDENTIALS ARE VALID
				if (parsed.valid == true) {
					global.user = parsed.user;
					global.entries = parsed.entries;
					console.log("Saved key is valid. Opening Bot.")
					openBot(false);
				}
				// IF CREDENTIALS ARE NOT VALID
				else {
					console.log("Saved key is not valid. Opening activation.")
					openActivation(false);
				}
			} catch (error) {
				console.log('Error verifying key. Opening activation');
				openActivation(false);
			}
		});
	}
}




// THIS IS THE ACTIVATION WINDOW
function openActivation(onReady) {
	var win;
	const {
		app,
		BrowserWindow,
		ipcMain
	} = require('electron');
	// When released
	process.env.NODE_ENV = 'production';
	if (onReady) {
		app.on('ready', function () {
			win = new BrowserWindow({
				width: 640,
				height: 500,
				resizable: false,
				frame: false,
				transparent: true,
			});
			win.setMenu(null);
			win.loadURL(`file://${__dirname}/src/login.html`);
			//win.webContents.openDevTools()
		});
	} else {
		win = new BrowserWindow({
			width: 640,
			height: 500,
			resizable: false,
			frame: false,
			transparent: true,
		});
		win.setMenu(null);
		win.loadURL(`file://${__dirname}/src/login.html`);
		//win.webContents.openDevTools()
	}
	// WHEN A MESSAGE IS RECEIVED FROM THE APPLICATION
	win.on('close', function (event) {
		event.preventDefault();
		process.exit()
	});
	ipcMain.on('activateKey', function (e, activationKey) {
		console.log(activationKey);
		request({
			url: 'https://codeyellow.io/api/v2/activate.php',
			method: 'post',
			headers: {
				'x-auth-key': exports.getAuthHeader(machineIdSync(), '', activationKey)
			},
			formData: {
				'key': activationKey,
				'hwid': machineIdSync()
			},
		}, function (err, response, body) {
			console.log(body);
			var parsed = JSON.parse(body);
			if (parsed.valid == true) {
				console.log("Key: " + activationKey + " is valid and now activated!");
				global.settings.key = activationKey;
				global.settings.token = parsed.token;
				global.user = parsed.user;
				global.entries = parsed.entries;
				saveSettings();
				openBot();
				win.hide();
			} else {
				console.log("Key: " + activationKey + " is not valid. Notifying user");
				win.send('notify', {
					message: parsed.message,
					length: 2500
				});
			}
		});
	});

	// Opens sign up page
	ipcMain.on('signUp', function (e) {
		open(signUpURL);
	});

	// Utilities at the bottom
	ipcMain.on('minimizeM', function (e) {
		win.minimize();
	});
	ipcMain.on('closeM', function (e) {
		process.exit()
	});
}

function initCapWin() {
	var express = require('express');
	var bodyParser = require('body-parser');
	expressApp = express();
	var {
		app,
		BrowserWindow,
		ipcMain
	} = require('electron');
	process.env.NODE_ENV = 'production';
	app.on('ready', function () {
		module.exports.capWin = new BrowserWindow({
			height: 400,
			width: 770,
			resizable: false,
			frame: false,
			transparent: true,
			show: false
		});

		// Close captcha win
		module.exports.capWin.on('close', function (event) {
			event.preventDefault();
			module.exports.capWin.hide();
		});
		// Minimize captcha win
		ipcMain.on("minimize", (event) => {
			module.exports.capWin.hide();
		});
		ipcMain.on("updateCaptchaQueue", (event, token, task) => {
			/// TOMORROW CREATE VARIABLES FOR THINGS LIKE currCapQueue FOR global.captchaQueue[0]
			global.captchaQueue.shift();
			console.log('New captcha token received. Task ID:  ' + task['taskID'] + '. Captcha token: ' + token)

			module.exports.taskCaptchas[task['type']][task['taskID']] = token;
			/// NEED TO STOP SO IT DOESNT SHOW THE LAST CAPTCHA AGAIN AND AGAIN
			if (global.captchaQueue.length >= 1) {
				console.log('Website: ' + global.captchaQueue[0]['website']);
				console.log(global.captchaQueue[0]['task']);
				module.exports.requestCaptcha(global.captchaQueue[0]['website'], global.captchaQueue[0]['task'], true, false)
			} else {
				module.exports.capWin.hide();
			}
		});

		// Can add later
		ipcMain.on('login', function (event) {
			var win = new BrowserWindow({
				backgroundColor: '#283442',
				width: 600,
				height: 600,
				maxWidth: 600,
				maxHeight: 600,
				show: false
			});

			win.setMenu(null);
			win.loadURL('https://www.youtube.com/signin', {
				extraHeaders: `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.84 Safari/537.36\naccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\naccept-encoding: gzip, deflate, br\naccept-language: en-US,en;q=0.9,und;q=0.8\nreferer: https://www.google.com/\nupgrade-insecure-requests: 1`
			});

			win.once('ready-to-show', () => {
				win.show();
			});

		});

		expressApp.set('port', parseInt(globalPort));
		expressApp.use(bodyParser.json());
		expressApp.use(bodyParser.urlencoded({
			extended: true
		}));
		expressApp.get('/', function (req, res) {
			res.sendFile('src/captcha.html', {
				root: __dirname
			});
			module.exports.capWin.webContents.session.setProxy({
				proxyRules: ""
			}, function () {});
		})
		var server = expressApp.listen(expressApp.get('port'));
		server.on('error', function (e) {
			console.log(e);
		});


		module.exports.capWin.webContents.session.setProxy({
			proxyRules: 'http://127.0.0.1:' + globalPort
		}, function (r) {
			module.exports.capWin.loadURL('http://www.newyork.doverstreetmarket.com/'); // Domain
		});
	});

}

module.exports.requestCaptcha = function (site, task, refresh, addToQueue) {
	console.log('New captcha requested for ' + global.websites[site]['url'] + ' Task ID:' + task.taskID);
	module.exports.capWin.show();
	if (addToQueue != false) {
		global.captchaQueue.push({
			website: site,
			task: task
		});
	}
	if (global.captchaQueue.length == 1 || refresh == true) {
		console.log('Refreshing sitekey is true');
		module.exports.capWin.webContents.session.setProxy({
			proxyRules: 'http://127.0.0.1:' + globalPort
		}, function (r) {
			module.exports.capWin.loadURL('http://www.' + global.websites[site]['url']); // Domain
		});
	}

}




// THIS IS THE BOT WINDOW
function openBot(onReady) {
	const {
		app,
		BrowserWindow,
		ipcMain
	} = require('electron');
	// When released
	process.env.NODE_ENV = 'production';
	if (onReady) {
		app.on('ready', function () {
			module.exports.mainBotWin = new BrowserWindow({
				width: 1150,
				height: 705,
				resizable: false,
				frame: false,
				transparent: true,
			});
			//win.setMenu(null);
			module.exports.mainBotWin.loadURL(`file://${__dirname}/src/index.html`);
		});
	} else {
		module.exports.mainBotWin = new BrowserWindow({
			width: 1150,
			height: 705,
			resizable: false,
			frame: false,
			transparent: true
		});
		//win.setMenu(null);
		module.exports.mainBotWin.loadURL(`file://${__dirname}/src/index.html`);
	}
	// FOR DEBUGGING 
	//module.exports.mainBotWin.webContents.openDevTools()
	// WHEN A MESSAGE IS RECEIVED FROM THE APPLICATION

	module.exports.mainBotWin.on('close', function (event) {
		event.preventDefault();
		process.exit()
	});

	// Save retry delay
	ipcMain.on('saveRetryDelay', function (e, retryDelay) {
		global.settings.retryDelay = retryDelay;
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: 'Retry delay saved!'
		});
	});


	// Save sting settings
	ipcMain.on('saveStingSettings', function (e, settingsToSave) {
		console.log(settingsToSave);
		if (settingsToSave['stingProfiles'] == 'Example Profile') {
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'you can\'t use the example profile for tasks!'
			});
			return;
		}
		if (validateEmail('test@' + settingsToSave['stingCatchall']) != true) {
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'please input a valid catchall like example.com with no @'
			});
			return;
		}
		global.settings.stingProfiles = settingsToSave['stingProfiles'];
		global.settings.stingSize = settingsToSave['stingSize'];
		global.settings.stingQuantity = settingsToSave['stingQuantity'];
		global.settings.stingCaptcha = settingsToSave['stingCaptcha'];
		global.settings.stingIG = settingsToSave['stingIG'];
		global.settings.stingProxytype = settingsToSave['stingProxytype'];
		global.settings.stingCatchall = settingsToSave['stingCatchall'];
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: 'sting settings saved!'
		});
	});

	// Save entry settings
	ipcMain.on('saveEntrySettings', function (e, settingsToSave) {
		console.log(settingsToSave);
		global.settings.entryMode = settingsToSave['entryMode'];
		global.settings.entryDelay = settingsToSave['entryDelay'];
		global.settings.idleTime = settingsToSave['idleTime'];
		global.settings.minimumDelay = settingsToSave['minimumDelay'];
		global.settings.maximumDelay = settingsToSave['maximumDelay'];
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: 'entry settings saved!'
		});
	});
	ipcMain.on('deactivate', function (e) {
		request({
			url: 'https://codeyellow.io/api/v2/deactivate.php',
			method: 'post',
			headers: {
				'x-auth-key': exports.getAuthHeader(machineIdSync(), global.settings.token, global.settings.key)
			},
			formData: {
				'key': global.settings.key,
				'token': global.settings.token,
				'hwid': machineIdSync()
			},
		}, function (err, response, body) {
			try {
				var parsed = JSON.parse(body);
				// IF CREDENTIALS ARE VALID
				if (parsed.valid == true) {
					console.log("Saved key: " + global.settings.key + " is now deactivated. Closing Bot.")
					app.quit();
				}
				// IF CREDENTIALS ARE NOT VALID
				else {
					console.log("Saved key is not valid. Opening activation.")
					openActivation(false);
				}
			} catch (error) {
				console.log('Error verifying key details. Bot is not deactivated');
			}
		});
	});

	// Save webhook
	ipcMain.on('saveWebhook', function (e, webHook) {
		global.settings.discordWebhook = webHook;
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: 'Webhook saved!'
		});
		exports.sendWebhook('test')
	});
	ipcMain.on('saveAntiCapAPIKey', function (e, antiCapAPIKey) {
		global.settings.antiCapAPIKey = antiCapAPIKey;
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: 'AntiCaptcha API Key saved!'
		});
	});
	ipcMain.on('save2capAPIKey', function (e, twoCapAPIKey) {
		global.settings['2capAPIKey'] = twoCapAPIKey;
		saveSettings();
		module.exports.mainBotWin.send('notify', {
			length: 3000,
			message: '2Captcha API Key saved!'
		});
	});
	//Open captcha harvester
	ipcMain.on('openHarvester', function (e) {
		module.exports.capWin.show();
	});


	// Start Task
	ipcMain.on('startTask', function (e, task, profile) {
		//if (module.exports.taskStatuses[task.taskID] != 'active') {
		if (module.exports.taskStatuses[task['type']][task.taskID] == 'active' && task['taskSiteSelect'] != 'oneblockdown') {
			console.log('Task in progress');
			return;
		}
		if (module.exports.tasksAwaitingConfirm[task.type][task.taskID] != 'awaiting') {
			module.exports.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Starting'
			});
		}
		module.exports.taskStatuses[task['type']][task.taskID] = 'active';
		if (task['taskSiteSelect'] == 'nakedcph') {
			console.log('Nakedcph task started');
			websites.nakedcph.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'joyce') {
			if (task['type'] != 'mass') {
				module.exports.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'You can only mass enter on Joyce'
				});
				return;
			}
			console.log('Joyce task started');
			websites.joyce.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'vooberlin') {
			console.log('VooBerlin task started');
			websites.vooberlin.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'basketsstore') {
			console.log('BasketsStore task started');
			websites.basketsstore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'basket4ballers') {
			console.log('Basket4Ballers task started');
			websites.basket4ballers.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'opiumparis') {
			console.log('OpiumParis task started');
			websites.opiumparis.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'shoezgallery') {
			console.log('ShoezGallery task started');
			websites.shoezgallery.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'footshop') {
			console.log('Footshop task started');
			websites.footshop.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'ymeuniverse') {
			console.log('YMEuniverse task started');
			websites.ymeuniverse.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'solestory') {
			console.log('solestory task started');
			websites.solestory.initTask(task, profile)
		}  else if (task['taskSiteSelect'] == 'oneblockdown') {
			if (module.exports.tasksAwaitingConfirm[task.type][task.taskID] != 'awaiting') {
				console.log('Oneblockdown task started');
				websites.oneblockdown.initTask(task, profile)
			} else {
				module.exports.tasksAwaitingConfirm[task.type][task.taskID] = 'confirmed';
				module.exports.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Attempting login (6S)'
				});
			}
		} else if (task['taskSiteSelect'] == 'wishatl') {
			console.log('WishATL task started');
			websites.wishatl.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'bdgastore') {
			console.log('BDGAStore task started');
			websites.bdgastore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'fearofgod') {
			console.log('fearofgod task started');
			websites.fearofgod.initTask(task, profile)
		}  else if (task['taskSiteSelect'] == 'footpatroluk') {
			console.log('Footpatroluk task started');
			websites.footpatroluk.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'dsmny') {
			console.log('DSMNY task started');
			websites.dsmny.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'dsms') {
			console.log('DSMS task started');
			websites.dsms.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'dsml') {
			console.log('DSML task started');
			websites.dsml.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'mahaamsterdam') {
			console.log('mahaamsterdam task started');
			websites.mahaamsterdam.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'afewstore') {
			console.log('afewstore task started');
			websites.afewstore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'dsmla') {
			console.log('DSMLA task started');
			websites.dsmla.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'supplystore') {
			console.log('SupplyStore task started');
			websites.supplystore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'kodaiaio') {
			console.log('KodaiAIO task started');
			websites.kodaiaio.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'renarts') {
			console.log('Renarts task started');
			websites.renarts.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'stayrooted') {
			console.log('Stay-rooted task started');
			websites.stayrooted.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'extrabutter') {
			console.log('ExtraButter task started');
			websites.extrabutter.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'hervia') {
			console.log('Hervia task started');
			websites.hervia.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'lapstoneandhammer') {
			console.log('Lapstoneandhammer task started');
			websites.lapstoneandhammer.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'cityblueshop') {
			console.log('Cityblueshop task started');
			websites.cityblueshop.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'shelta') {
			console.log('Shelta task started');
			websites.shelta.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'vitkac') {
			console.log('Vitkac task started');
			websites.vitkac.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'chmielna') {
			console.log('Chmielna task started');
			websites.chmielna.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'crusoeandsons') {
			console.log('Crusoeandsons task started');
			websites.crusoeandsons.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'milk-store') {
			console.log('Milk-store task started');
			websites.milkstore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'backdoor') {
			console.log('Backdoor task started');
			websites.backdoor.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'skatedeluxe') {
			console.log('SkateDeluxe task started');
			websites.skatedeluxe.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'dtlr') {
			console.log('DTLR task started');
			websites.dtlr.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'snipeskicks') {
			console.log('SnipesKicks task started');
			websites.snipeskicks.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'kicksstore') {
			console.log('KicksStore task started');
			websites.kicksstore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'asphaltgold') {
			console.log('AsphaltGold task started');
			websites.asphaltgold.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'lsdls') {
			console.log('LSDLS task started');
			websites.lsdls.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'woodwood') {
			console.log('WoodWood task started');
			websites.woodwood.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'bstn') {
			console.log('BSTN task started');
			websites.bstn.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'okini') {
			console.log('okini task started');
			websites.okini.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'granit') {
			console.log('granit task started');
			websites.granit.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'deadstock') {
			console.log('Deadstock task started');
			websites.deadstock.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'shinzoparis') {
			console.log('ShinzoParis task started');
			websites.shinzoparis.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'juicestore') {
			console.log('juicestore task started');
			websites.juicestore.initTask(task, profile)
		} else if (task['taskSiteSelect'] == 'bouncewear') {
			console.log('BounceWear task started');
			websites.bouncewear.initTask(task, profile)
		}
	});

	// Delete Task
	ipcMain.on('deleteTask', function (e, task) {
		module.exports.taskStatuses[task['type']][task.taskID] = 'delete';
	});



	ipcMain.on('saveProxies', function (e, proxiesToSave) {
		global.proxies = proxiesToSave.split('\n');
		fs.writeFile(appDataDir + "\\proxies.txt", proxiesToSave, function (err) {
			if (err) {
				console.log('Error saving (saveProxies) proxies: ' + proxiesToSave + ' to file');
				return;
			}
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Proxies saved'
			});
		});
	});


	ipcMain.on('saveIGlist', function (e, igsToSave) {
		global.instagrams = igsToSave;
		fs.writeFile(appDataDir + "\\instagrams.txt", igsToSave, function (err) {
			if (err) {
				console.log('Error saving (instagrams) list: ' + igsToSave + ' to file');
				return;
			}
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'instagrams saved'
			});
		});
	});

	ipcMain.on('saveEmails', function (e, emailsToSave) {
		global.emails = emails;
		fs.writeFile(appDataDir + "\\emails.json", JSON.stringify(emailsToSave, null, 4), function (err) {
			if (err) {
				console.log('Error saving (saveEmails) emails: ' + emailsToSave + ' to file');
				return;
			}
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Emails saved'
			});
		});
	});


	ipcMain.on('testProxy', function (e, data) {
		module.exports.mainBotWin.send('proxyUpdate', {
			id: data.id,
			message: 'TESTING'
		});

		proxy.testProxy(data.proxy, function (response) {
			module.exports.mainBotWin.send('proxyUpdate', {
				id: data.id,
				message: response.message
			});
		});
	});




	// Save profiles
	ipcMain.on('saveProfiles', function (e, profilesToSave) {
		global.profiles = profilesToSave;
		saveProfiles()
	});

	// Import profiles
	ipcMain.on('importProfiles', function (e, path) {
		var fileContents = fs.readFileSync(path);
		try {
			parsed = JSON.parse(fileContents);
		} catch (e) {}
		profileKeys = Object.keys(parsed);
		var error1 = false;
		var error2 = false;
		var success = false;
		if (!profileKeys || profileKeys.length < 1) {
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Invalid profile format'
			});
			return;
		}
		for (var i = 0; i < profileKeys.length; i++) {
			var currProfileName = profileKeys[i];
			var currProfile = parsed[currProfileName];
			if (currProfile['CVV'] == undefined || currProfile['address'] == undefined || currProfile['aptSuite'] == undefined || currProfile['cardNumber'] == undefined || currProfile['cardType'] == undefined || currProfile['city'] == undefined || currProfile['country'] == undefined || currProfile['expiryMonth'] == undefined || currProfile['expiryYear'] == undefined || currProfile['firstName'] == undefined || currProfile['lastName'] == undefined || currProfile['phoneNumber'] == undefined || currProfile['zipCode'] == undefined) {
				console.log('Not a valid profile');
				error1 = true;
			} else {
				if (global.profiles[currProfileName] == undefined) {
					if (currProfileName != 'Example Profile') {
						global.profiles[currProfileName] = currProfile;
						console.log('Imported');
						console.log(global.profiles);
						success = true;
					}
				} else if (currProfileName != 'Example Profile') {
					error2 = true;
				}
			}
			if (i == profileKeys.length - 1 && success == true) {
				module.exports.mainBotWin.send('notify', {
					length: 3000,
					message: 'Profiles imported and saved'
				});
				module.exports.mainBotWin.send('profilesImported', global.profiles);
				saveProfiles()
			}
		}
		if (error1) {
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Some profiles were not valid and therefore not imported'
			});
		}
		if (error2) {
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Some profiles already exist with the same name and therefore were not imported'
			});
		}
	});

	// Export profiles
	ipcMain.on('exportProfiles', function (e, path) {
		fs.writeFile(path + "\\profiles.json", JSON.stringify(global.profiles, null, 4), function (err) {
			if (err) {
				module.exports.mainBotWin.send('notify', {
					length: 3000,
					message: 'Error exporting profiles'
				});
				console.log('Error exporting profiles (exportProfiles) to path: ' + path);
				return;
			}
			module.exports.mainBotWin.send('notify', {
				length: 3000,
				message: 'Profiles exported'
			});
		});

	});


	ipcMain.on('downloadUpdate', function (e) {
		open(global.downloadURL);
	});

	// For guides
	ipcMain.on('openPage', function (e, pageLink) {
		open(pageLink);
	});

	ipcMain.on('openGuides', function (e) {
		open('https://codeyellow.io/guides');
	});


	// Utilities at the bottom
	ipcMain.on('minimizeM', function (e) {
		module.exports.mainBotWin.minimize();
	});
	ipcMain.on('closeM', function (e) {
		process.exit()
	});
}


function saveSettings() {
	fs.writeFile(appDataDir + "\\settings.json", JSON.stringify(global.settings, null, 4), function (err) {
		if (err) {
			console.log('Error saving (fn saveSettings) settings: ' + JSON.stringify(global.settings) + ' to path: ' + appDataDir + "\\settings.json");
			return;
		}
		console.log("Settings saved.");
	});
}

function saveProfiles() {
	fs.writeFile(appDataDir + "\\profiles.json", JSON.stringify(global.profiles, null, 4), function (err) {
		if (err) {
			console.log('Error saving (fn saveProfiles) profiles: ' + JSON.stringify(global.profiles) + ' to path: ' + appDataDir + "\\profiles.json");
			return;
		}
		console.log("Profiles saved.");
	});
}

exports.saveEmails = function (emails) {
	global.emails = emails;
	fs.writeFile(appDataDir + "\\emails.json", JSON.stringify(emails, null, 4), function (err) {
		if (err) {
			console.log('Error saving (fn saveEmails) emails: ' + JSON.stringify(global.profiles) + ' to path: ' + appDataDir + "\\profiles.json");
			return;
		}
		console.log('Emails saved')
	});
}
// Sending webhook function
exports.sendWebhook = function (website, email, additional, password, task, profile) {
	var webhook = global.settings.discordWebhook;
	if (website != 'test') {
		console.log(task);
		request({
			url: 'https://codeyellow.io/api/v2/entry.php',
			method: 'post',
			headers: {
				'x-auth-key': exports.getAuthHeader(machineIdSync(), global.settings.token, global.settings.key)
			},
			formData: {
				'key': global.settings.key,
				'token': global.settings.token,
				'hwid': machineIdSync(),
				'website': website,
				'additional': additional,
				'password': password,
				'name': task['filterID'],
				'email': task['taskEmail'],
				'profileFName': profile['firstName'] + ' ' + profile['lastName'],
				'zipCode': profile['zipCode'],
				'address': profile['address'],
				'aptSuite': profile['aptSuite']
			},
		}, function (err, response, body) {
			try {
				var parsed = JSON.parse(body);
			} catch (e) {
				console.log('Our servers may be down. Entry not saved');
				return;
			}
			if (parsed.valid == true) {
				console.log("Entry saved")
			} else {
				console.log(body)
				console.log(response.statusCode);
			}
		});
	}
	if (/^(ftp|http|https):\/\/[^ "]+$/.test(webhook) == true) {
		if (website == 'test') {
			try {
				request({
						url: webhook,
						json: {
							"embeds": [{
								"description": "This webhook was sent to make sure the webhook is valid!",
								"color": 978261,
								"author": {
									"name": 'Webhook test successful!'
								},
								"footer": {
									"icon_url": "https://i.imgur.com/l7JZQqs.png",
									"text": "CodeYellow"
								}
							}]
						},
						method: 'POST'
					},
					function (error, response, body) {
						if (error || response.statusCode != 204) {
							module.exports.mainBotWin.send('notify', {
								length: 2500,
								message: 'Webhook test failed! This webhook may not be valid'
							});
						} else {
							module.exports.mainBotWin.send('notify', {
								length: 2500,
								message: 'Webhook test successful!'
							});
						}
					});
			} catch (e) {
				return;
			}
		} else if (additional) {
			try {
				request({
						url: webhook,
						json: {
							"embeds": [{
								"color": 978261,
								"author": {
									"name": 'Entry submitted!'
								},
								"fields": [{
										"name": "Website",
										"value": website
									},
									{
										"name": "Email",
										"value": email
									},
									{
										"name": "Additional:",
										"value": additional
									}
								],
								"footer": {
									"icon_url": "https://i.imgur.com/l7JZQqs.png",
									"text": "CodeYellow"
								}
							}]
						},
						method: 'POST'
					},
					function (error, response, body) {
						if (error || response.statusCode != 204) {
							return;
						} else {
							// Success
							return;
						}
					});
			} catch (e) {
				return;
			}
		} else {
			try {
				request({
						url: webhook,
						json: {
							"embeds": [{
								"color": 978261,
								"author": {
									"name": 'Entry submitted!'
								},
								"fields": [{
										"name": "Website",
										"value": website
									},
									{
										"name": "Email",
										"value": email
									}
								],
								"footer": {
									"icon_url": "https://i.imgur.com/l7JZQqs.png",
									"text": "CodeYellow"
								}
							}]
						},
						method: 'POST'
					},
					function (error, response, body) {
						if (error || response.statusCode != 204) {
							return;
						} else {
							// Success
							return;
						}
					});
			} catch (e) {
				return;
			}
		}
	} else {
		return;
	}
}



// Below is not relevant to read / modify

function initialfolderExistsOrMkDir() {
	fs.mkdir(appDataDir, function (err) {
		if (err) {
			if (err.code == 'EEXIST') {
				console.log("Folder path: " + appDataDir + " exists")
				createOrGetFiles();
				loadBot();
			} else {
				console.log('Error (fn initialfolderExistsOrMkDir) error: ' + err);
			}
		} else {
			createOrGetFiles();
			loadBot();
		}
	});
}

function createOrGetFiles() {
	request.get({
			json: true,
			url: 'https://codeyellow.io/api/v2/version.php'
		},
		function (error, response, body) {
			if (error) {
				console.log('Error getting version');
				global.updateRequired = false;
			}
			if (body.version == undefined) {
				console.log('Failed to get latest version');
				global.updateRequired = false;
				global.downloadURL = '';
				return;
			}
			if (currentVersion != body.version) {
				console.log('Update required. Latest version: ' + body.version);
				global.updateRequired = true;
				global.downloadURL = body.downloadURL;
			}
		});
	if (fileExists('settings.json')) {
		var fileContents = fs.readFileSync(appDataDir + "\\settings.json", 'utf8');
		console.log("settings.json exists Contents:");
		console.log(fileContents);
		if (fileContents == '' || fileContents == null || fileContents == undefined) {
			console.log("fileContents == '' || fileContents == null || fileContents == undefined so creating a blank new canvas for settings.json");
			var parsed = JSON.parse('{"token": "","key": "", "retryDelay": "500", "discordWebhook": "", "antiCapAPIKey": "", "2capAPIKey": ""}', null, 4);
			makeFile('settings.json', JSON.stringify(parsed, null, 4))
			global.settings = parsed;
		} else {
			console.log("settings already has data");
			global.settings = JSON.parse(fileContents);
			if (global.settings.retryDelay == '') {
				// maybe remove this
				global.settings.retryDelay = 500;
			}
		}
	} else {
		var parsed = JSON.parse('{"token": "","key": "", "retryDelay": "500", "discordWebhook": "", "antiCapAPIKey": "", "2capAPIKey": ""}', null, 4);
		makeFile('settings.json', JSON.stringify(parsed, null, 4))
		global.settings = parsed;
	}

	if (fileExists('profiles.json')) {
		var fileContents = fs.readFileSync(appDataDir + "\\profiles.json", 'utf8');
		console.log("profiles.json exists Contents:")
		console.log(fileContents);
		if (fileContents == '' || fileContents == null || fileContents == undefined) {
			console.log("fileContents == '' || fileContents == null || fileContents == undefined so creating a blank new canvas for profiles.json");
			var parsed = JSON.parse('{"Example Profile":{"email":"example@gmail.com","firstName":"John", "lastName": "Doe", "address":"21 Cresent Road","aptSuite":"","zipCode":"UB3 1RJ","city":"London","country":"Country","country":"United Kingdom","stateProvince":"","phoneNumber": "07700900087","email":"johndoe@gmail.com","cardType":"visa","cardNumber":"4242424242424242","expiryMonth":"06","expiryYear":"2023","CVV":"361", "jigProfileName": true, "jigProfileAddress": false, "jigProfilePhoneNumber": true}}', null, 4);
			makeFile('profiles.json', JSON.stringify(parsed, null, 4))
			global.profiles = parsed;
		} else {
			global.profiles = JSON.parse(fileContents);
		}
	} else {
		var parsed = JSON.parse('{"Example Profile":{"email":"example@gmail.com","firstName":"John", "lastName": "Doe", "address":"21 Cresent Road","aptSuite":"","zipCode":"UB3 1RJ","city":"London","country":"Country","country":"United Kingdom","stateProvince":"","phoneNumber": "07700900087","email":"johndoe@gmail.com","cardType":"visa","cardNumber":"4242424242424242","expiryMonth":"06","expiryYear":"2023","CVV":"361", "jigProfileName": true, "jigProfileAddress": false, "jigProfilePhoneNumber": true}}', null, 4);
		makeFile('profiles.json', JSON.stringify(parsed, null, 4))
		global.profiles = parsed;
	}


	if (fileExists('emails.json')) {
		var fileContents = fs.readFileSync(appDataDir + "\\emails.json", 'utf8');
		console.log("emails.json exists Contents:")
		console.log(fileContents);
		if (fileContents == '' || fileContents == null || fileContents == undefined) {
			console.log("fileContents == '' || fileContents == null || fileContents == undefined so creating a blank new canvas for emails.json");
			var parsed = JSON.parse('{}', null, 4);
			makeFile('emails.json', JSON.stringify(parsed, null, 4))
			global.emails = parsed;
		} else {
			global.emails = JSON.parse(fileContents);
		}
	} else {
		var parsed = JSON.parse('{}', null, 4);
		makeFile('emails.json', JSON.stringify(parsed, null, 4))
		global.emails = parsed;
	}

	if (fileExists('proxies.txt')) {
		var proxyFile = fs.readFileSync(appDataDir + "\\proxies.txt", 'utf8').split('\n');
		console.log("proxies.txt exists Contents:");
		console.log(proxyFile);
		global.proxies = proxyFile == '' ? [] : proxyFile;
	} else {
		makeFile('proxies.txt', '')
		global.proxies = [];
	}

	if (fileExists('instagrams.txt')) {
		var igFile = fs.readFileSync(appDataDir + "\\instagrams.txt", 'utf8');
		console.log("instagrams.txt exists Contents:");
		console.log(igFile);
		global.instagrams = igFile == '' ? [] : igFile;
	} else {
		makeFile('instagrams.txt', '')
		global.instagrams = '';
	}
}

function getUpcomingReleases() {
	request.get({
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
			},
			json: true,
			url: 'https://codeyellow.io/api/releases_80.php'
		},
		function (error, response, body) {
			global.releases = body;
		});
}

function fileExists(name) {
	const fileExists = fs.existsSync(appDataDir + "\\" + name);
	if (fileExists) {
		return true;
	} else {
		return false;
	}
}

function makeFile(name, data) {
	fs.writeFile(appDataDir + "\\" + name, data, function (err) {
		if (err) {
			console.log("Error creating inital file (fn makeFile)");
			return console.log(err);
		}
	});
}

exports.getAuthHeader = function (hwid, token, key) {
	var salts = [
		'472D4B6150645367566B58703273357638792F423F4528482B4D6251655468576D5A7133743677397A24432646294A404E635266556A586E3272357537782141',
		'743777217A25432646294A404E635266556A586E3272357538782F413F4428472D4B6150645367566B5970337336763979244226452948404D6251655468576D',
		'6250655368566B5970337336763979244226452948404D635166546A576E5A7134743777217A25432A462D4A614E645267556B58703273357638782F413F4428',
		'635266556A586E3272357538782F413F4428472B4B6250655367566B5970337336763979244226452948404D635166546A576D5A7134743777217A25432A462D',
		'4A404E635166546A576E5A7234753778214125442A472D4B6150645367556B58703273357638792F423F4528482B4D6251655468576D597133743677397A2443',
		'26452948404D6351655468576D5A7134743777217A25432A462D4A614E645267556A586E3272357538782F413F4428472B4B6250655368566D59703373367639',
		'792F423F4528482B4D6250655368566D597133743677397A24432646294A404E635266546A576E5A7234753778214125442A472D4B6150645367566B58703273',
		'357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D6351665468576D5A7134743777217A25432A462D4A614E645267556B58',
		'6E5A7234753778214125442A472D4B6150645267556B58703273357638792F423F4528482B4D6251655468566D597133743677397A24432646294A404E635266',
		'5468576D5A7134743777217A25432A462D4A614E645266556A586E3272357538782F413F4428472B4B6250655368566B5970337336763979244226452948404D',
		'6250655368566D597133743677397A24432646294A404E635166546A576E5A7234753778214125442A472D4B6150645367566B58703273357638792F423F4528',
		'472B4B6150645367566B5970337336763979244226452948404D6351655468576D5A7134743777217A25432A462D4A614E645267556A586E3272357538782F41',
		'25442A472D4B614E645267556B58703273357638792F423F4528482B4D6251655368566D597133743677397A24432646294A404E635266556A576E5A72347537',
		'77217A25432A462D4A614E635266556A586E3272357538782F413F4428472B4B6250655367566B5970337336763979244226452948404D635166546A576D5A71',
		'33743677397A24432646294A404E635166546A576E5A7234753778214125442A472D4B6150645367556B58703273357638792F423F4528482B4D625165546857',
		'6B5970337336763979244226452948404D6251655468576D5A7134743777217A25432A462D4A614E645266556A586E3272357538782F413F4428472B4B625065',
		'5267556B58703273357638792F423F4528482B4D6250655368566D597133743677397A24432646294A404E635266546A576E5A7234753778214125442A472D4B',
		'404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D6351665468576D5A7134743777217A25432A',
		'46294A404D635166546A576E5A7234753778214125442A472D4B6150645267556B58703273357638792F423F4528482B4D6251655468566D597133743677397A',
		'2442264529482B4D6251655468576D5A7134743777217A25432A462D4A614E635266556A586E3272357538782F413F4428472B4B6250655367566B5970337336',
		'7638792F423F4528482B4B6250655368566D597133743677397A24432646294A404E635166546A576E5A7234753778214125442A472D4B6150645367556B5870',
		'3272357538782F413F4428472B4B6150645367566B5970337336763979244226452948404D6351655468576D5A7134743777217A25432A462D4A614E64526755',
		'6A576E5A7234753778214125442A472D4B614E645267556B58703273357638792F423F4528482B4D6251655368566D597133743677397A24432646294A404E63',
		'51655468576D5A7134743777217A25432A462D4A404E635266556A586E3272357538782F413F4428472B4B6250655367566B5970337336763979244226452948',
		'2B4B6250655368566D597133743677397A24432646294A404D635166546A576E5A7234753778214125442A472D4B6150645267556B58703273357638792F423F',
		'4428472D4B6150645367566B5970337336763979244226452948404D6251655468576D5A7134743777217A25432A462D4A614E645266556A586E327235753878',
		'214125442A472D4A614E645267556B58703273357638792F423F4528482B4D6250655368566D597133743677397A24432646294A404E635266546A576E5A7234',
		'743777217A25432A462D4A404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D6351665468576D',
		'597133743677397A244326462948404D635166546A576E5A7234753778214125442A472D4B614E645267556B58703273357638792F423F4528482B4D62516553',
		'67566B59703373367639792442264529482B4D6251655468576D5A7134743777217A25432A462D4A614E635266556A586E3272357538782F413F4428472B4B62',
		'4E645267556B58703273357638792F423F4528482B4B6250655368566D597133743677397A24432646294A404E635166546A576E5A7234753778214125442A47',
		'294A404E635266556A586E3272357538782F413F4428472B4B6150645367566B5970337336763979244226452948404D6351655468576D5A7134743777217A25',
		'4326452948404D635166546A576E5A7234753778214125442A472D4A614E645267556B58703273357638792F423F4528482B4D6250655368566D597133743677',
		'39792442264528482B4D6251655468576D5A7134743777217A25432A462D4A404E635266556A586E3272357538782F413F4428472B4B6250645367566B597033',
		'73357638792F423F4528472B4B6250655368566D597133743677397A24432646294A404D635166546A576E5A7234753778214125442A472D4B6150645267556B',
		'586E3272357538782F413F4428472D4B6150645367566B5970337336763979244226452948404D6251655468576D5A7134743777217A25432A462D4A614E6452',
		'66546A576E5A7234753778214125442A462D4A614E645267556B58703273357638792F423F4528482B4B6250655368566D597133743677397A24432646294A40',
		'4D6251655468576D5A7134743777217A25432A46294A404E635266556A586E3272357538782F413F4428472B4B6150645367566B597033733676397924422645',
		'28472B4B6250655368566D597133743677397A244326462948404D635166546A576E5A7234753778214125442A472D4B614E645267556B58703273357638792F',
		'413F442A472D4B6150645367566B59703373367639792442264529482B4D6251655468576D5A7134743777217A25432A462D4A614E635266556A586E32723575',
		'3778214125442A462D4A614E645267556B58703273357638792F423F4528482B4B6250655368566D597133743677397A24432646294A404E635166546A576E5A',
		'7134743777217A25432646294A404E635266556A586E3272357538782F413F4428472D4B6150645367566B5970337336763979244226452948404D6251655468',
		'566D597133743677397A244326452948404D635166546A576E5A7234753778214125442A472D4A614E645267556B58703273357638792F423F4528482B4D6250',
		'645367566B59703373367639792442264528482B4D6251655468576D5A7134743777217A25432A462D4A404E635266556A586E3272357538782F413F4428472B',
		'4A614E645267556B58703273357638792F423F4528472B4B6250655368566D597133743677397A24432646294A404D635166546A576E5A723475377821412544',
		'2646294A404E635266556A586E3272357538782F413F442A472D4B6150645367566B59703373367639792442264529482B4D6251655468576D5A713474377721',
		'7A244226452948404D635166546A576E5A7234753778214125442A462D4A614E645267556B58703273357638792F423F4528482B4B6250655368566D59713374',
		'3676397924423F4528482B4D6251655468576D5A7134743777217A25432A46294A404E635266556A586E3272357538782F413F4428472B4B6150645367566B59',
		'703273357638792F423F4428472B4B6250655368566D597133743677397A244326462948404D635166546A576E5A7234753778214125442A472D4B614E645267',
		'556A586E3272357538782F4125442A472D4B6150645367566B59703373367639792442264528482B4D6251655468576D5A7134743777217A25432A462D4A614E',
		'635166546A576E5A7234753778214125432A462D4A614E645267556B58703273357638792F423F4528472B4B6250655368566D597133743677397A2443264629',
		'482B4D6251655468576D5A7134743777217A25432646294A404E635266556A586E3272357538782F413F4428472D4B6150645367566B59703373367639792442',
		'3F4428472B4B6250655368566D597133743677397A244326452948404D635166546A576E5A7234753778214125442A472D4A614E645267556B58703273357638',
		'78214125442A472D4B6150645367566B59703373367639792442264528482B4D6251655468576D5A7134743777217A25432A462D4A404E635266556A586E3272',
		'34753778217A25432A462D4A614E645267556B58703273357638792F423F4428472B4B6250655368566D597133743677397A244326462948404D635166546A57',
		'6D5A7134743777217A24432646294A404E635266556A586E3272357538782F413F442A472D4B6150645367566B59703373367639792442264529482B4D625165',
		'5368566D597133743677397A244226452948404D635166546A576E5A7234753778214125442A462D4A614E645267556B58703273357638792F423F4528482B4B',
		'6150645367566B597033733676397924423F4528482B4D6251655468576D5A7134743777217A25432A46294A404E635266556A586E3272357538782F413F4428',
		'462D4A614E645267556B58703273357638792F413F4428472B4B6250655368566D597133743677397A244326452948404D635166546A576E5A72347537782141',
		'24432646294A404E635266556A586E3272357538782F4125442A472D4B6150645367566B59703373367639792442264528482B4D6251655468576D5A71347437',
		'773979244226452948404D635166546A576E5A7234753778214125432A462D4A614E645267556B58703273357638792F423F4528472B4B6250655368566D5971',
		'3373367639792F423F4528482B4D6251655468576D5A7134743777217A25432646294A404E635266556A586E3272357538782F413F4428472D4B615064536756',
		'6B58703273357638782F413F4428472B4B6250655368566D597133743677397A244226452948404D635166546A576E5A7234753778214125442A472D4A614E64',
		'5266556A586E327235753878214125442A472D4B6150645367566B597033733676397924423F4528482B4D6251655468576D5A7134743777217A25432A46294A',
		'404D635166546A576E5A7234753778217A25432A462D4A614E645267556B58703273357638792F423F4428472B4B6250655368566D597133743677397A244326',
		'4528482B4D6251655468576D5A7134743777217A24432646294A404E635266556A586E3272357538782F413F442A472D4B6150645367566B5970337336763979',
		'2F413F4428472B4B625065536856597133743677397A244226452948404D635166546A576E5A7234753778214125442A462D4A614E645267556B587032733576',
		'3778214125442A472D4B6150645367566B59703373367639792F423F4528482B4D6251655468576D5A7134743777217A25432646294A404E635266556A586E32',
		'7234753777217A25432A462D4A614E645267556B58703273357638792F413F4428472B4B6250655368566D597133743677397A244326452948404D635166546A',
		'576D5A7134743777397A24432646294A404E635266556A586E3272357538782F4125442A472D4B6150645367566B59703373367639792442264528482B4D6251',
		'655368566D5971337436773979244226452948404D635166546A576E5A7234753778214125432A462D4A614E645267556B58703273357638792F423F4528472B',
		'4B6150645367566B59703373367638792F423F4528482B4D6251655468576D5A7134743777217A24432646294A404E635266556A586E3272357538782F413F44',
		'2A462D4A614E645267556B58703273357638782F413F4428472B4B6250655368566D597133743677397A244226452948404D635166546A576E5A723475377821',
		'7A24432646294A404E635266556A586E327235753878214125442A472D4B6150645367566B597033733676397924423F4528482B4D6251655468576D5A713474',
		'36763979244226452948404D635166546A576E5A7234753778217A25432A462D4A614E645267556B58703273357638792F423F4428472B4B6250655368566D59',
		'703373357638792F423F4528482B4D6251655468576D5A7134743777397A24432646294A404E635266556A586E3272357538782F4125442A472D4B6150645367',
		'556B58703273357538782F413F4428472B4B6250655368566D5971337436773979244226452948404D635166546A576E5A7234753778214125432A462D4A614E',
		'635266556A586E327235753778214125442A472D4B6150645367566B59703373367639792F423F4528482B4D6251655468576D5A7134743777217A2543264629',
		'48404D635166546A576E5A7234753777217A25432A462D4A614E645267556B58703273357638792F413F4428472B4B6250655368566D597133743677397A2443',
		'3F4528482B4D6251655468576D5A7134743677397A24432646294A404E635266556A586E3272357538782F4125442A472D4B6150645367566B59703373367639',
		'782F413F4428472B4B6250655368566D5971337436763979244226452948404D635166546A576E5A7234753778217A25432A462D4A614E645267556B58703273',
		'34753778214125442A472D4B6150645367566B59703373367638792F423F4528482B4D6251655468576D5A7134743777217A24432646294A404E635266556A58',
		'6E5A7234743777217A25432A462D4A614E645267556B58703273357638782F413F4428472B4B6250655368566D597133743677397A244226452948404D635166',
		'5468576D5A7134743677397A24432646294A404E635266556A586E327235753878214125442A472D4B6150645367566B597033733676397924423F4528482B4D',
		'6250655368566D5971337336763979244226452948404D635166546A576E5A7234753777217A25432A462D4A614E645267556B58703273357638792F413F4428',
		'472D4B6150645367566B59703373357638792F423F4528482B4D6251655468576D5A7134743777397A24432646294A404E635266556A586E3272357538782F41',
		'25432A462D4A614E645267556B58703273357538782F413F4428472B4B6250655368566D5971337436773979244226452948404D635166546A576E5A72347537',
		'77397A24432646294A404E635266556A586E327235753778214125442A472D4B6150645367566B59703373367639792F423F4528482B4D6251655468576D5A71',
		'337336763979244226452948404D635166546A576E5A7234743777217A25432A462D4A614E645267556B58703273357638782F413F4428472B4B625065536856',
		'6B59703273357638792F423F4528482B4D6251655468576D5A7134743677397A24432646294A404E635266556A586E327235753878214125442A472D4B615064',
		'5267556B58703272357538782F413F4428472B4B6250655368566D5971337436763979244226452948404D635166546A576E5A7234753778217A25432A462D4A',
		'404E635266556A586E327234753778214125442A472D4B6150645367566B59703373367638792F423F4528482B4D6251655468576D5A7134743777217A244326',
		'452948404D635166546A576E5A7134743777217A25432A462D4A614E645267556B58703273357638782F413F4428472B4B6250655368566D597133743677397A',
		'2F423F4528482B4D6251655468576D5A7133743677397A24432646294A404E635266556A586E327235753778214125442A472D4B6150645367566B5970337336',
		'7538782F413F4428472B4B6250655368566D5971337336763979244226452948404D635166546A576E5A7234753777217A25432A462D4A614E645267556B5870',
		'5A7234753778214125442A472D4B6150645367566B59703373357638792F423F4528482B4D6251655468576D5A7134743777397A24432646294A404E63526655',
		'6A576E5A7134743777217A25432A462D4A614E645267556B58703273357538782F413F4428472B4B6250655368566D5971337436773979244226452948404D63',
		'51655468576D597133743677397A24432646294A404E635266556A586E327234753778214125442A472D4B6150645367566B59703373367638792F423F452848',
		'2B4B6250655368566D5970337336763979244226452948404D635166546A576E5A7234743777217A25432A462D4A614E645267556B58703273357638782F413F',
		'442A472D4B6150645367566B59703273357638792F423F4528482B4D6251655468576D5A7134743677397A24432646294A404E635266556A586E327235753878',
		'217A25432A462D4A614E645267556B58703272357538782F413F4428472B4B6250655368566D5971337436763979244226452948404D635166546A576E5A7234',
		'743677397A24432646294A404E635266556A586E5A7234753778214125442A472D4B6150645367566B59703373357638792F423F4528482B4D6251655468576D',
		'5970337336763979244226452948404D635166546A576E5A7134743777217A25432A462D4A614E645267556B58703273357538782F413F4428472B4B62506553'
	];
	rawndom = Math.floor(Math.random() * salts.length);
	if (rawndom >= 0) {
		return (crypto.createHash('sha256').update(token + key + hwid + salts[rawndom] + rawndom).digest('hex') + rawndom);
	} else {
		rawndom = Math.floor(Math.random() * salts.length);
		return (crypto.createHash('sha256').update(token + key + hwid + salts[rawndom] + rawndom).digest('hex') + rawndom);
	}
}

// Email validation
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}