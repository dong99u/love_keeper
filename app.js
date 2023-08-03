const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')
const app = express()
const server = http.createServer(app)
const io = socket(server)
const mongoose = require('mongoose')
const bannedWordRouter = require('./routers/bannedWordRouter');
const messageRouter = require('./routers/messageRouter');

// MongoDB
mongoose.connect('mongodb+srv://qkrehdrb0813:ehdfprl77@cluster0.w9mqdtx.mongodb.net/love_keeper', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connected to mongodb'))
  .catch(e => console.error(e))

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))
app.use('/bannedWord', bannedWordRouter);
app.use('/message', messageRouter);

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/index.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})



io.sockets.on('connection', function(socket) {

  /* 새로운 유저가 접속했을 경우 */
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')

    /* 이름 저장 */
    socket.name = name

    /* 접속 공지 전송*/
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

// /*이미지용 socket 코드_주석 처리 가능*/
//   socket.on("upload", (file, callback) => {
//     console.log(file); // <Buffer 25 50 44 ...>

//     // save the content to the disk, for example
//     fs.writeFile("/tmp/upload", file, (err) => {
//       callback({ message: err ? "failure" : "success" });
//     });
//   });

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name
    
    console.log(data)
    const Message = require('./models/message');
    
    /* db 저장 */
    const message = new Message({ name: data.name, message: data.message })
    message.save()
      .then(() => console.log('Message saved'))
      .catch(e => console.error(e))

    /* 나 빼고 상대에게 메시지 전송*/
    socket.broadcast.emit('update', data);
  })

// 클라이언트 측 'update' 이벤트를 수신하고 처리하는 코드 필요
// socket.on('update', (data) => {
//   console.log(data);
// });

  

  /* 접속 종료 */
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 나가셨습니다.')

    /* 메시지 전송 */
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })
})

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

/* 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})