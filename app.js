var net = require('net');
var inquirer = require("inquirer");
var ngrok = require('ngrok');
var ngrok1 = require('ngrok');
var os = require('os');
var express = require('express');
var app = express();
var clients = [];
var authtoken1 = '5bRPC5Lap33S7pHKZ7VsC_4cZWU3KkWELDnowrHwowo';
var authtoken2 = 'QxfKMHe7fqRbeynYCYMC_5BFCWGsjKfq6dvshx5JJg';


// ------------------------------   IP Servidor  ------------------------------
// Esse código é só para mostrar o ip da sua máquina na rede local.
var interfaces = os.networkInterfaces();

for (var k in interfaces)
  for (var k2 in interfaces[k])
    if (interfaces[k][k2].family === 'IPv4' && !interfaces[k][k2].internal)
      console.log("\nIP local: %s", interfaces[k][k2].address);

// -------------------------------   Servidor   -------------------------------
var PORT =  process.env.PORT || 8080;
var IP =  process.env.IP || "0.0.0.0";

var server = net.createServer(function(socket) {
  // Qunado um cliente entra no servidor, salvamos ele na lista (data em UNIX)
  socket.date =  (new Date).getTime();

  // Adiciona ele na lista
  clients.push(socket);

  // Quando um clientes desconectar, tiramos ele da lista
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
  });

  // Quando um cliente manda uma informação
  socket.on('data', function (data) {
    console.log(data);
  });
});

server.on('error', function(err){
  console.log(err);
});

/*
// Solucao alternativa
server.listen(PORT, function() {
  address = server.address();
  //console.log("\nServidor em %s\n", url);
  console.log('Informações sobre conexão: %j \n', server.address());
  pergunta();
});
*/


ngrok.connect({proto: 'tcp', addr: PORT, authtoken:authtoken2}, function (err, url) {
  server.listen(PORT, function() {
    address = server.address();
    console.log("\nServidor em %s\n", url);
    pergunta();
  });
});

ngrok1.connect({proto: 'tcp', addr: 3211, authtoken:authtoken1}, function (err, urls) {
  app.listen(3211, function() {
	console.log("\nServidor web %s\n", urls);
	});
});

app.use(express.static('template'));


app.get('/', function (req, res) {
  res.redirect('index.html');
});

app.get('/0', function (req, res) {
  clients.forEach(function (client) {
	client.write("{0}");
	client.write("\n");
});
	res.end("desligar");
});

app.get('/1', function (req, res) {
  clients.forEach(function (client) {
	client.write("{1}");
	client.write("\n");
});
	res.end("ligar");
});


// -------------------------------     Menu     -------------------------------
var pergunta = function () {
  inquirer.prompt([{
    type: "list",
    name: "opcao",
    message: "O que você quer saber?",
    choices: [
      {"name": "Lista de clientes conectados.", "value": 1},
      {"name": "Número de clientes conectados.", "value": 2},
      {"name": "Desligar Servidor", "value": 3},
    ]
  }], function( answers ) {
    switch(answers.opcao) {
    case 2:
        console.log("\nExistem %s clientes conectados.\n", clients.length);
        break;
    case 3:
        process.exit();
        break;
    case 1:
        if (clients.length > 0) {
          var data_atual = (new Date).getTime();
          console.log("\nCliente \t\t\t Tempo Conexão");
          clients.forEach(function (client) {
            console.log("%s:%s \t\t %d s", client.remoteAddress, client.remotePort, (data_atual-client.date)/1000);
          });
          console.log("\n");
        } else {
          console.log("\nNão existem clientes conectados!\n");
        }
        break;
    default:
    }
    pergunta();
  });
}
