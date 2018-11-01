let timeEnd,
	timeLeft,
	timeLeftCurrentTicket,
	ticketsLeft,
	timePerTicket,
	timerInstance;

const startMeeting = (tickets, timeInMinutes) => {
	const timeTotal = timeInMinutes * MINUTES_TO_MILLISECONDS;
	timeEnd = Date.now() + timeTotal;
	timeLeft = timeTotal;
	ticketsLeft = tickets;
	recalculateTimePerTicket();
	timeLeftCurrentTicket = timePerTicket;
	loadIntoLocalStorage();
	refreshView();
	startTimer();
	chrome.runtime.sendMessage('start-meeting');
};

const detectStorage = () => {
	chrome.storage.local.get('state', result => {
		if (!result.state) {
			startOver();
		} else {
			loadFromLocalStorage(result.state);
			recalculateTimeLeft();
			recalculateTimeLeftCurrentTicket();
			refreshView();
			startTimer();
		}
	});
};

const refreshView = () => {
	refreshTimerDisplay();
	refreshTimePerTicket();
	refreshTicketsLeft();
	setView('timer-view');
};

const nextTicket = () => {
	ticketsLeft--;
	if (ticketsLeft > 0) {
		recalculateTimePerTicket();
		timeLeftCurrentTicket = timePerTicket;
		refreshView();
		loadIntoLocalStorage();
		chrome.runtime.sendMessage('next-ticket');
	} else {
		endMeeting();
	}
};

const recalculateTimeLeft = () => {
	timeLeft = timeEnd - Date.now();
};

const recalculateTimePerTicket = () => {
	timePerTicket = timeLeft / ticketsLeft;
};

const recalculateTimeLeftCurrentTicket = () => {
	timeLeftCurrentTicket = timeLeft - timePerTicket * (ticketsLeft - 1);
};

const endMeeting = () => {
	stopTimer();
	setView('end-view');
	clearLocaleStorage();
	chrome.runtime.sendMessage('end-meeting');
};

const startOver = () => {
	setView('start-view');
};

const tick = () => {
	timeLeft -= ONE_SECOND;
	timeLeftCurrentTicket -= ONE_SECOND;
	refreshTimerDisplay();
};

const startTimer = () => {
	timerInstance = setInterval(tick, ONE_SECOND);
};

const stopTimer = () => {
	if (timerInstance) {
		clearInterval(timerInstance);
	}
};

const setView = view => {
	document.querySelectorAll('.view-page').forEach(page => {
		if (page.id == view) {
			page.classList.remove('is-hidden');
		} else {
			page.classList.add('is-hidden');
		}
	});
};

const refreshTimerDisplay = () => {
	const timer = document.getElementById('timer');
	if (timeLeftCurrentTicket <= 30 * ONE_SECOND) {
		timer.classList.add('has-text-danger');
	} else {
		timer.classList.remove('has-text-danger');
	}
	timer.innerText = getDisplayTime(timeLeftCurrentTicket);
};

const refreshTimePerTicket = () => {
	document.getElementById('time-per-ticket').innerText = getDisplayTime(
		timePerTicket
	);
};

const refreshTicketsLeft = () => {
	document.getElementById('tickets-left').innerText = ticketsLeft;
};

const toggleConfirmation = () => {
	document.getElementById('button-bar').classList.toggle('is-hidden');
	document.getElementById('button-confirmation').classList.toggle('is-hidden');
};

const verifyFormAndSubmit = () => {
	const tickets = validateInput('tickets');
	const time = validateInput('time');
	if (tickets && time) {
		startMeeting(tickets, time);
	}
};

const validateInput = elementId => {
	const element = document.getElementById(elementId);
	const value = parseInt(element.value);
	if (isNaN(value) || value < 1) {
		addInputError(element);
		return false;
	} else {
		removeInputError(element);
		return value;
	}
};

const addInputError = inputElement => {
	inputElement.classList.add('is-danger');
};

const removeInputError = inputElement => {
	inputElement.classList.remove('is-danger');
};

const getDisplayTime = timestamp => {
	let timeValues = [];
	let timeValue;
	let remainingTime = Math.floor(timestamp / 1000);
	for (let i = 0; i < 3; i++) {
		timeValue = remainingTime % 60;
		timeValues.push(timeValue);
		remainingTime -= timeValue;
		remainingTime /= 60;
	}
	const seconds = Math.abs(timeValues[0]);
	const minutes = Math.abs(timeValues[1]);
	const hours = Math.abs(timeValues[2]);
	const timeString =
		(hours > 0 ? hours + ':' : '') +
		getDisplayNumber(minutes) +
		':' +
		getDisplayNumber(seconds);
	return timestamp < 0 ? '-' + timeString : timeString;
};

const getDisplayNumber = number => {
	if (number < 10) {
		return '0' + number;
	}
	return number;
};

const loadFromLocalStorage = state => {
	timeEnd = state.timeEnd;
	ticketsLeft = state.ticketsLeft;
	timePerTicket = state.timePerTicket;
};

const loadIntoLocalStorage = () => {
	const state = {
		timeEnd: timeEnd,
		ticketsLeft: ticketsLeft,
		timePerTicket: timePerTicket
	};
	chrome.storage.local.set({ state }, () => {
		console.log('Set state:', state);
	});
};

const clearLocaleStorage = () => {
	chrome.storage.local.set({ state: null }, () => {
		console.log('State cleared');
	});
};

document.getElementById('start-button').onclick = verifyFormAndSubmit;
document.getElementById('next-ticket').onclick = nextTicket;
document.getElementById('stop-button').onclick = toggleConfirmation;
document.getElementById('confirmation-cancel').onclick = toggleConfirmation;
document.getElementById('confirmation-end-meeting').onclick = () => {
	endMeeting();
	toggleConfirmation();
};
document.getElementById('start-over').onclick = startOver;
document.onkeydown = event => {
	if (event.key == 'Enter') {
		document.getElementById('start-button').classList.add('is-active');
	}
};
document.onkeyup = event => {
	if (event.key == 'Enter') {
		document.getElementById('start-button').classList.remove('is-active');
		verifyFormAndSubmit();
	}
};

const ONE_SECOND = 1000;
const MINUTES_TO_MILLISECONDS = 60 * 1000;
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

detectStorage();
