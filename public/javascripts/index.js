/**
 * 功能描述：
 * 使用方法：
 * 注意事项：
 * 引入来源：
 * 作用：
 * Create by YaoQiao on 2018/10/18
 */

'use strict';
$(function () {
    /*******************************************  聊天室欢迎互动效果部分 *************************************************/
    var tipsList = [
        '是否进入快乐的世界',
        '为何你要残忍拒绝我？',
        "还试，没用的。做个听话的孩子，乖",
        "有且只有一个做法，再不然就是强制关掉软件或重启机器吧！",
        "你看？",
        "你看！",
        "你再看。。。",
        "有木有感到一丝诡异？",
        "嘻嘻",
        "感到诡异就对了！",
        "什么，你知道有诈，故意点进来的？",
        "好吧，只能说我钦佩“偏向虎山行”的人。",
        "富有冒险精神的人比那些只会在嘴上嚷嚷的人强一百倍不是吗？嘎嘎。",
        "纳尼？你说你这种把戏见多了？",
        "好吧，你这是要退出去了吗？",
        "我猜你不会。因为你还不晓得我要怎么整你",
        "常言道，好奇心害死猫，这句话一点也不错，是吧。",
        "什么？你就是要退出？",
        "这种东西见多了，也没什么意思？",
        "好吧，我待会儿告诉你怎么快捷地退出。",
        "额，下面有亮点的，别觉得烦嘛。",
        "哎哟，还跟我犟，来咬我呀。",
        "好吧，开玩笑了。",
        "只要你听话，一会儿就能出去了，也不用玩强制！",
        "要是不听话嘛....呵呵.",
    ];
    var tipsIndex = 0;

    //有趣的弹窗
    function openDialog() {
        if (tipsIndex >= tipsList.length) tipsIndex = 0;
        layer.open({
            content: tipsList[tipsIndex]
            , btn: ['进入', '不要']
            , yes: function (index) {
                layer.close(index);
            },
            no: function (index) {
                layer.close(index);
                openDialog()
            }
        });
        tipsIndex += 1;
    }

    /*******************************************  聊天室 View 展示层 *************************************************/
    var domObj = {
        userNameEle: $('#role_name'), //用户名称
        systemNoticeEle: $('#system_notice'),//系统通知
        userListEle: $('#user_list'), //用户列表
        chatRoomEle: $('.chat-room'),//聊天室内容
        userMessage: $('#user_message'), //用户输入消息
    }
    var dataObj = {
        id: null,
        currentUserName: '', //当前用户名称
        userColor: '',//用户专属颜色
        currentInputMessage: '',//当前用户输入内容
    }

    var View = {
        //系统消息处理
        SystemNotice: function (notice, needHide) {
            domObj.systemNoticeEle.html(notice);
            if (needHide) {
                setTimeout(function () {
                    domObj.systemNoticeEle.html('');
                }, 5000);
            }
        },//更新用户列表
        UpdateUserList: function (userList) {
            //更新在线总人数
            $('#user_total').html(userList.length);
            //更新列表中数据
            var _html = '';
            for (var i = 0; i < userList.length; i++) {
                _html += '<li style="color:' + userList[i].color + ';">' + userList[i].username + '</li>';
            }
            domObj.userListEle.html(_html);
        },//更新聊天室消息数据
        UpdateChatRoomData: function (data) {
            var _html = '<p style="color:' + data.color + ';">' + data.username + ': ' + data.message + '</p>';
            domObj.chatRoomEle.append(_html);
            domObj.chatRoomEle[0].scrollTo(0, domObj.chatRoomEle.scrollTop() + domObj.chatRoomEle.height());
        },
        GetUserData: function () {
            dataObj.currentUserName = '用户' + Date.now();
            dataObj.userColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
            domObj.userNameEle.val(dataObj.currentUserName);
            return {
                username: dataObj.currentUserName,
                color: dataObj.userColor,
                id: localStorage.getItem("id")
            }
        },
        GetUserMessage: function () {
            if (!$.trim(domObj.userMessage.val())) {
                alert('不能发送空数据！请自重！！');
                return false;
            }
            if (dataObj.currentInputMessage == domObj.userMessage.val()) {
                alert('不能刷屏！请自重！！');
                return false;
            } else {
                dataObj.currentInputMessage = domObj.userMessage.val();
            }
            domObj.userMessage.val('');
            return {
                username: dataObj.currentUserName,
                color: dataObj.userColor,
                message: dataObj.currentInputMessage
            }
        }
    }
    /*******************************************  聊天室数据交互层（WebSocket-Client） *************************************************/

    var EVENT = {
        USER_JOIN: 'user_join',               //用户加入
        USER_INFO_UPDATE: 'user_info_update',  //更新用户信息
        UPDATE_USER_LIST: 'update_user_list', //更新用户列表
        SYSTEM_MESSAGE: 'system_message',     //系统消息
        CHAT_MESSAGE: 'chat_message'          //聊天消息
    }

    //连接websocket
    function socketInit() {
        View.SystemNotice('服务器连接中 ...');
        var socket = new io.connect('http://10.1.8.14:3000/', {'reconnect': false});
        var sendBtn = $('#input_btn');
        var changeBtn = $('#change_btn');

        //发送按钮点击处理事件
        sendBtn.on('click', function () {
            if (!socket) return false;
            var data = View.GetUserMessage();
            if (!data) return false;
            socket.emit(EVENT.CHAT_MESSAGE, data)
        });

        //change按钮点击处理事件
        changeBtn.on('click', function () {
            if (dataObj.currentUserName == domObj.userNameEle.val()) {
                domObj.userNameEle.val('用户' + Date.now());
            } else {
                dataObj.currentUserName = domObj.userNameEle.val();
            }
            dataObj.userColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
            dataObj.currentUserName = domObj.userNameEle.val();
            socket.emit(EVENT.USER_INFO_UPDATE, {
                username: dataObj.currentUserName,
                color: dataObj.userColor,
                id: dataObj.id
            });
        });

        //socket 监听事件
        socket.on('connect_error', function (err) {
            View.SystemNotice('服务器连接异常...', err);
            localStorage.clear();
            socket.close();
        });
        socket.on('disconnect', function () {
            localStorage.clear();
            View.SystemNotice('服务器连接断开...');
            socket.close();
        });
        socket.on('connect', function () {
            //发送加入房间请求
            socket.emit(EVENT.USER_JOIN, View.GetUserData())
            View.SystemNotice('加入房间中 ...');
        });

        //加入房间成功
        socket.on(EVENT.USER_JOIN, function (data) {
            dataObj.id = data.id;
            localStorage.setItem("id", data.id);
            domObj.userMessage.removeAttr('disabled');
            View.SystemNotice('数据已更新 ...', true);
        });

        //更新用户数据
        socket.on(EVENT.UPDATE_USER_LIST, function (data) {
            if (data && data.userList) {
                View.UpdateUserList(data.userList);
            }
        });

        //系统消息
        socket.on(EVENT.SYSTEM_MESSAGE, function (data) {
            View.SystemNotice(data.message, true);
        });

        //聊天消息更新
        socket.on(EVENT.CHAT_MESSAGE, function (data) {
            View.UpdateChatRoomData(data);
        });

    }

    /** 程序入口 **/
    socketInit();
    openDialog();
});