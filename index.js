var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var Neural = require('./data/neural.json');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/webhook', function(req, res) {
  
  if(req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'minhasenha123'){
  	console.log('Validação ok!');
  	res.status(200).send(req.query['hub.challenge']);
  }
  else{
  	console.log('Validação falhou!');
  	res.sendStatus(403);
  }

});

app.post('/webhook', function(req, res){

	var data = req.body;

	if(data && data.object === 'page'){

		// PERCORRER TODAS AS ENTRADAS ENTRY
		data.entry.forEach(function(entry){
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// PERCORRER TODAS AS MENSAGENS 
			entry.messaging.forEach(function(event){
				if(event.message){
					trataMensagem(event);
				}
			})

		})

		res.sendStatus(200);
	}

});

function eventsTrigger(id, msg){

	const Neuros = Neural;
   	var m = msg.toLowerCase().trim();
  	if(m in Neuros){
  		sendTextMessage(id, Neural[m]);
  	}else{
  		sendTextMessage(id, "Ops!!! Ocorreu um erro em meu Banco De Dados, o Problema será Reparado !!");
  	}

}

function trataMensagem(msg){

	var senderID = msg.sender.id;
	var recipientID = msg.recipient.id;
	var timeOfMessage = msg.timestamp;
	var message = msg.message;
	var messageID = message.mid;
	var messageText = message.text;
	var attachments = message.attachments;

	eventsTrigger(senderID, messageText);

}

function sendTextMessage(recipientID, messageText){

	var messageData = {
		recipient: {
			id: recipientID
		},
		message: {
			text: messageText
		}
	};

	callSendApi(messageData);

}

function callSendApi(messageData){

	request({
		uri: "https://graph.facebook.com/v2.6/me/messages",
		qs: { access_token: 'EAAUuD5zW9uwBADZA13TI3LsoZAFMzvqewcdAtKhMVUezZC1prgf4DTbgGPINHZAaifmUFwAyX0S5ZBTsCmJ7hcZBpbklfMwmmUwCIw9yZA4SdbFWmxPS0KfVOsZCMYx88NLccCZABkjdfvQ8lh08BkKetyxfvGMqGnv5KExqMPPefXgZDZD' },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if(!error && response.statusCode == 200){
			console.log('Mensagem enviada com sucesso !');
			var recipientID = body.recipient_id;
			var messageID = body.message_id;
		}else{
			console.log('Nao foi possivel enviar a mensagem !');
			console.log(error);
		}
	})

}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});