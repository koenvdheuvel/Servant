import config from './config'
import fetch from 'node-fetch';
import process from 'process';

if (!config.errorUrl) {
	throw new Error('No exception handling url set');
}

export async function sendError(origin, exception, message, stacktrace) {
	await fetch(config.errorUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			clientId: 'servant',
			logType: origin,
			exception: exception,
			message: message,
			stacktrace: stacktrace.toString(),
		}),
	}).then(res => res.text()).then(text => console.log('response', text)).catch(err => console.log('error', err));
}

process.on('unhandledRejection', async (reason, promise) => {
	await sendError('unhandledRejection', '', '', promise?.toString() + '\n' + (<any>reason)?.stack);
});
process.on('uncaughtException', async err => {
	await sendError('uncaughtException', err.name, err.message, err.stack);
});

