
const mailgun = require("mailgun-js");
const DOMAIN = 'https://api.mailgun.net/v3/sandbox71adfa44c9814f53b758442a7fde8893.mailgun.org';
const API_KEY = '82b80482742dd8b98189e7a4eda890c2-f8faf5ef-298dceda';
const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

function sendEmail(){
const data = {
	from: 'Excited User <me@samples.mailgun.org>',
	to: 'bar@example.com, setareh.hd00@gmail.com',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomness!'
};
mg.messages().send(data, function (error, body) {
	console.log(body);
});
}
module.exports.sendEmail = sendEmail;