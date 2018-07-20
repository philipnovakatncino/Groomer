let timeEnd, timeLeft, timeLeftCurrentTicket, ticketsLeft, timePerTicket, timerInstance;

function startMeeting(tickets, timeInMinutes) {
	const timeTotal = timeInMinutes * MINUTES_TO_MILLISECONDS;
	timeEnd = Date.now() + timeTotal;
	timeLeft = timeTotal;
	ticketsLeft = tickets;
	recalculateTimePerTicket();
	timeLeftCurrentTicket = timePerTicket;
	loadIntoLocalStorage();
	refreshView();
	startTimer();
}

function detectStorage() {
	chrome.storage.local.get('state', function(result) {
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
}

function refreshView() {
	refreshTimerDisplay();
	refreshTimePerTicket();
	refreshTicketsLeft();
	setView('timer-view');
}

function nextTicket() {
	ticketsLeft--;
	if (ticketsLeft > 0) {
		recalculateTimePerTicket();
		timeLeftCurrentTicket = timePerTicket;
		refreshView();
		loadIntoLocalStorage();
	} else {
		endMeeting();
	}
}

function recalculateTimeLeft() {
	timeLeft = timeEnd - Date.now();
}

function recalculateTimePerTicket() {
	timePerTicket = timeLeft / ticketsLeft;
}

function recalculateTimeLeftCurrentTicket() {
	timeLeftCurrentTicket = timeLeft - (timePerTicket * (ticketsLeft - 1));
}

function endMeeting() {
	stopTimer();
	setView('end-view');
	clearLocaleStorage();
}

function startOver() {
	setView('start-view');
}

function tick() {
	timeLeft -= ONE_SECOND;
	timeLeftCurrentTicket -= ONE_SECOND;
	refreshTimerDisplay();
}

function startTimer() {
	timerInstance = setInterval(tick, ONE_SECOND);
}

function stopTimer() {
	if (timerInstance) {
		clearInterval(timerInstance);
	}
}

function setView(view) {
	document.querySelectorAll('.view-page').forEach(function(page) {
		page.classList.add(view == page.id ? 'slds-show' : 'slds-hide');
		page.classList.remove(view == page.id ? 'slds-hide' : 'slds-show');
	});
}

function refreshTimerDisplay() {
	const timer = document.getElementById('timer');
	if (timeLeftCurrentTicket <= 30 * ONE_SECOND) {
		timer.classList.add('slds-text-color--error');
	} else {
		timer.classList.remove('slds-text-color--error');
	}
	timer.innerText = getDisplayTime(timeLeftCurrentTicket);
}

function refreshTimePerTicket() {
	document.getElementById('time-per-ticket').innerText = getDisplayTime(timePerTicket);
}

function refreshTicketsLeft() {
	document.getElementById('tickets-left').innerText = ticketsLeft;
}

function toggleConfirmation() {
	document.getElementById('button-bar').classList.toggle('slds-hide');
	document.getElementById('button-confirmation').classList.toggle('slds-hide');
}

function verifyFormAndSubmit() {
	let foundErrors = false;
	const tickets = document.getElementById('tickets');
	const time = document.getElementById('time');

	const ticketsValue = parseInt(tickets.value);
	if (isNaN(ticketsValue) || ticketsValue < 1) {
		addInputError(tickets);
		foundErrors = true;
	} else {
		removeInputError(tickets);
	}

	const timeValue = parseFloat(time.value);
	if (isNaN(timeValue) || timeValue < 1) {
		addInputError(time);
		foundErrors = true;
	} else {
		removeInputError(time);
	}

	if (!foundErrors) {
		startMeeting(ticketsValue, timeValue);
	}
}

function addInputError(inputElement) {
	inputElement.classList.add('slds-has-error');
}

function removeInputError(inputElement) {
	inputElement.classList.remove('slds-has-error');
}

function getDisplayTime(timestamp) {
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
	const timeString = (hours > 0 ? (hours + ':') : '') +
		getDisplayNumber(minutes) + ':' +
		getDisplayNumber(seconds);
	return timestamp < 0 ? ('-' + timeString) : timeString;
}

function getDisplayNumber(number) {
	if (number < 10) {
		return '0' + number;
	}
	return number;
}

function loadFromLocalStorage(state) {
	timeEnd = state.timeEnd;
	ticketsLeft = state.ticketsLeft;
	timePerTicket = state.timePerTicket;
}

function loadIntoLocalStorage() {
	const state = {
		timeEnd: timeEnd,
		ticketsLeft: ticketsLeft,
		timePerTicket: timePerTicket
	};
	chrome.storage.local.set({state: state}, function() {
		console.log('Set state:', state);
	});
}

function clearLocaleStorage() {
	chrome.storage.local.set({state: null}, function() {
		console.log('State cleared');
	});
}

document.getElementById('start-button').onclick = verifyFormAndSubmit;
document.getElementById('next-ticket').onclick = nextTicket;
document.getElementById('stop-button').onclick = toggleConfirmation;
document.getElementById('confirmation-cancel').onclick = toggleConfirmation;
document.getElementById('confirmation-end-meeting').onclick = endMeeting;
document.getElementById('start-over').onclick = startOver;

const ONE_SECOND = 1000;
const MINUTES_TO_MILLISECONDS = 60 * 1000;
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

detectStorage();
