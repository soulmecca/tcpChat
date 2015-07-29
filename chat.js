var net = require('net');
var fs = require('fs');
var port = 4000;
var userList = [];

var server = net.createServer(function(socket){
	read = fs.readFileSync('chat.json', 'utf8');

	//commands 
	var client = {
		// nick: function(arg){
		// 	userList.forEach(function(val){
		// 		if (val.name === arg){
		// 			userList.splice(userList.indexOf(val),1)
		// 			var newId = val;
		// 			newId.name = arg;
		// 			userList.push(newId);
		// 			c.write("Your id has been changed to "+arg);

		// 		} 
		// 	})
		// }
		list: function(){

		}
	}

	socket.name = socket.remoteAddress + ": " + socket.remotePort;
	nickName = socket.name;
	userList.push(socket);

	console.log("client connected");
	socket.write("Hello  "+ socket.name + '\n');
	socket.write(read+'\r\n')

	broadcast(socket.name + " joined the chat\n ", socket);
	
	socket.on('data', function(data){
		var read = fs.readFileSync('chat.json', 'utf8');
		console.log(data.toString().trim())
		// broadcast(socket.name + ">" + data, socket);
		message = data.toString().trim();

		if (message[0] === '/'){

			command = message.substring(1, message.length);
			command = command.replace('\r', '').replace('\n', '');

			arr = command.split(' ');
			command = arr[0];
			parameters = arr.splice(1, arr.length)[0];

			
			if(client[command]){
				client[command]();
			}else{
				console.log("no command found")
			}

		}else{
			if (read.length === 0){
				var arr = [];
				var obj = {};
				obj['"'+nickName+'"'] = message 
				
				arr.push(obj)
				fs.writeFile('chat.json', JSON.stringify(arr));
				broadcast(socket.name+ "> " + message, socket);
			}else{
				obj = {};
				obj['"'+nickName+'"'] = message 
			
				var parsed = JSON.parse(read);
				parsed.push(obj);
				fs.writeFile('chat.json', JSON.stringify(parsed))
				broadcast(socket.name+ "> " + message, socket);
			}
			
		}
		
	});

	socket.on('end', function(){
		console.log('client disconnected');
		userList.splice(userList.indexOf(socket),1);
		broadcast(socket.name + 'left the chat.\n', socket);
	})

	function broadcast(message, sender){
		userList.forEach(function(user){
			if(user === sender)return;
			user.write(message)
		})
		process.stdout.write(message)
	}


});

server.listen(port, function(){
	console.log("listen on" + port);
});






