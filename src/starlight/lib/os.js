import { default as T } from '../Table';


const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		
const DATE_FORMAT_HANDLERS = {
	'%a': (d, utc) => DAYS[d['get' + (utc? 'UTC' : '') + 'Day']()].substr(0, 3),
	'%A': (d, utc) => DAYS[d['get' + (utc? 'UTC' : '') + 'Day']()],
	'%b': (d, utc) => MONTHS[d['get' + (utc? 'UTC' : '') + 'Month']()].substr(0, 3),
	'%B': (d, utc) => MONTHS[d['get' + (utc? 'UTC' : '') + 'Month']()],
	'%c': (d, utc) => d['to' + (utc? 'UTC' : '') + 'LocaleString'](),
	'%d': (d, utc) => ('0' + d['get' + (utc? 'UTC' : '') + 'Date']()).substr(-2),
	'%H': (d, utc) => ('0' + d['get' + (utc? 'UTC' : '') + 'Hours']()).substr(-2),
	'%I': (d, utc) => ('0' + ((d['get' + (utc? 'UTC' : '') + 'Hours']() + 11) % 12 + 1)).substr(-2),
	'%j': (d, utc) => {
		let result = d['get' + (utc? 'UTC' : '') + 'Date']();
		let m = d['get' + (utc? 'UTC' : '') + 'Month']();
			
		for (let i = 0; i < m; i++) {
			result += DAYS_IN_MONTH[i];
		}

		if (m > 1 && d['get' + (utc? 'UTC' : '') + 'FullYear']() % 4 === 0) {
			result +=1;
		}

		return ('00' + result).substr(-3);
	},
	'%m': (d, utc) => ('0' + (d['get' + (utc? 'UTC' : '') + 'Month']() + 1)).substr(-2),
	'%M': (d, utc) => ('0' + d['get' + (utc? 'UTC' : '') + 'Minutes']()).substr(-2),
	'%p': (d, utc) => (d['get' + (utc? 'UTC' : '') + 'Hours']() < 12)? 'AM' : 'PM',
	'%S': (d, utc) => ('0' + d['get' + (utc? 'UTC' : '') + 'Seconds']()).substr(-2),
	'%U': (d, utc) => getWeekOfYear(d, 0, utc),
	'%w': (d, utc) => '' + (d['get' + (utc? 'UTC' : '') + 'Day']()),
	'%W': (d, utc) => getWeekOfYear(d, 1, utc),
	'%x': (d, utc) => DATE_FORMAT_HANDLERS['%m'](d, utc) + '/' + DATE_FORMAT_HANDLERS['%d'](d, utc) + '/' + DATE_FORMAT_HANDLERS['%y'](d, utc),
	'%X': (d, utc) => DATE_FORMAT_HANDLERS['%H'](d, utc) + ':' + DATE_FORMAT_HANDLERS['%M'](d, utc) + ':' + DATE_FORMAT_HANDLERS['%S'](d, utc),
	'%y': (d, utc) => DATE_FORMAT_HANDLERS['%Y'](d, utc).substr (-2),
	'%Y': (d, utc) => '' + d['get' + (utc? 'UTC' : '') + 'FullYear'](),
	'%Z': (d, utc) => { let m; return (utc && 'UTC') || ((m = d.toString().match(/[A-Z][A-Z][A-Z]/)) && m[0]); },
	'%%': () => '%'
}


function isDST(date) {
	let year = date.getFullYear();
	let jan = new Date(year, 0);
		
	// ASSUMPTION: If the time offset of the date is the same as it would be in January of the same year, DST is not in effect.
	return (date.getTimezoneOffset() !== jan.getTimezoneOffset());
}


function getWeekOfYear (d, firstDay, utc) { 
	let dayOfYear = parseInt(DATE_FORMAT_HANDLERS['%j'](d), 10);
	let jan1 = new Date(d.getFullYear (), 0, 1, 12);
	let offset = (8 - jan1['get' + (utc? 'UTC' : '') + 'Day']() + firstDay) % 7;

	return ('0' + (Math.floor((dayOfYear - offset) / 7) + 1)).substr(-2);
}


export function date(format = '%c', time) {
	let utc,
		date = new Date();

	if (time) {
		date.setTime(time * 1000);
	}

	if (format.substr(0, 1) === '!') {
		format = format.substr(1);
		utc = true;
	}

	if (format === '*t') {		
		return new T ({
			year: parseInt(DATE_FORMAT_HANDLERS['%Y'](date, utc), 10),
			month: parseInt(DATE_FORMAT_HANDLERS['%m'](date, utc), 10),
			day: parseInt(DATE_FORMAT_HANDLERS['%d'](date, utc), 10),
			hour: parseInt(DATE_FORMAT_HANDLERS['%H'](date, utc), 10),
			min: parseInt(DATE_FORMAT_HANDLERS['%M'](date, utc), 10),
			sec: parseInt(DATE_FORMAT_HANDLERS['%S'](date, utc), 10),
			wday: parseInt(DATE_FORMAT_HANDLERS['%w'](date, utc), 10) + 1,
			yday: parseInt(DATE_FORMAT_HANDLERS['%j'](date, utc), 10),
			isdst: isDST(date)
		});	
	}

	for (let i in DATE_FORMAT_HANDLERS) {
		if (DATE_FORMAT_HANDLERS.hasOwnProperty(i) && format.indexOf(i) >= 0) {
			format = format.replace(i, DATE_FORMAT_HANDLERS[i](date, utc));
		}
	}

	return format;
}



export default new T({
	date
});
