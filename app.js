var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');


var app = express();

var io = require('socket.io')({});
app.io = io;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/*******************************************  websokcet - 聊天室  相关逻辑部分(Server) *************************************************/
const EVENT = {
    USER_JOIN: 'user_join',               //用户加入
    USER_INFO_UPDATE: 'user_info_update',  //更新用户信息
    UPDATE_USER_LIST: 'update_user_list', //更新用户列表
    SYSTEM_MESSAGE: 'system_message',     //系统消息
    CHAT_MESSAGE: 'chat_message'          //聊天消息
}

//用户列表
const userList = [];
const roomName = 'happy_room';

app.io.of('/').on('connection', function (socket) {
    console.log('新客户端连接....');
    //用户端开连接，将其踢出房间
    socket.on('disconnect', function () {
        socket.leave(roomName, function () {
            DeleteUser(socket.id);
        });
    });
    //用户加入
    socket.on(EVENT.USER_JOIN, function (data) {
        //如果已经存在id,则释放原有的id
        if(data.id){
            DeleteUser(data.id);
        }
        socket.join(roomName);
        //向客户端反馈登录成功，并发送当前用户唯一的id
        data.id = socket.id;
        userList.push(data);
        socket.emit(EVENT.USER_JOIN, {id: socket.id});
        SystemNotice(data.username + ' 加入房间');
        UpdateUserList();
        console.log(data.username + ' 加入房间');
    });
    //接受消息并处理
    socket.on(EVENT.CHAT_MESSAGE, function (msg) {
        app.io.sockets.in(roomName).emit(EVENT.CHAT_MESSAGE, msg);
    });
    socket.on(EVENT.USER_INFO_UPDATE, function (msg) {
       if(msg.id){
           for(let i=0;i<userList.length;i++){
               if(userList[i].id == msg.id){
                   userList[i].username = msg.username;
                   userList[i].color = msg.color;
               }
           }
           UpdateUserList();
       }
    });
})

//系统消息
function SystemNotice(notice) {
    app.io.to(roomName).emit(EVENT.SYSTEM_MESSAGE, {message: notice});
}

//更新用户列表
function UpdateUserList() {
    app.io.to(roomName).emit(EVENT.UPDATE_USER_LIST, {userList: userList});
}

//删除用户
function DeleteUser(id){
    let index = null;
    for (let i = 0; i < userList.length; i++) {
        if (userList[i].id == id) {
            index = i;
        }
    }
    if (index != null) {
        //发送系统通知
        SystemNotice(userList[index].username + "已退房");
        userList.splice(index, 1);
        //更新用户列表
        UpdateUserList();
    }
}

module.exports = app;
