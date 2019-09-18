## 基于 WebSocket 的多人聊天室 demo

#### 项目运行
* 安装 `npm install`
* 运行 `npm start`
* 访问 `http://localhost:3000/`

#### 项目说明

* 注意事项
    * 如果无法正常运行 `npm install` ,请尝试 `yarn install`
    * 请务必修改 `public/javascripts/index.js` 目录下的接口地址：
     ```
        // 修改 http://10.1.8.14:3000/ 为你本地服务启动后的实际地址
        var socket = new io.connect('http://10.1.8.14:3000/', {'reconnect': false});
     ```
* 技术栈
    * nodejs + express + socket.io
    * layer.js
    * html + css +js

* 目录
 
 ```
  -- public  //客户端静态文件
  -- views   //客户端模板页 
  -- app.js  //express + websocket 服务端主逻辑
 ``` 
