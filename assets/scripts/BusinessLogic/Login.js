let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,
    properties: {
        loginButton: cc.Button,
        inputName: {
            default: null,
            type: cc.EditBox
        }
    },

    /**
     * load 显示页面
     */
    onLoad: function () {
        this.initEvent();
        this.identity = null;

        this.loginButton.node.on(cc.Node.EventType.TOUCH_END, function () {
            // 获取用户输入的参数
            engine.prototype.init(GLB.channel, GLB.platform, GLB.gameID);
        },this);
    },
    
    /**
     * 登录
     * @param id
     * @param token
     */
    login: function (id, token) {
        // 设置姓名
        GLB.name = this.identity || Math.random() * 1000;
        GLB.userID = id;

        engine.prototype.login(id, token);
    },

    // 设置个人身份
    changeIdentity(value) {
        this.identity = value;
    },
    
    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent: function () {
        cc.systemEvent.on(msg.MATCHVS_INIT, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_REGISTER_USER, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_LOGIN, this.onEvent, this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent: function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_INIT:
                engine.prototype.registerUser();
                break;
            case msg.MATCHVS_REGISTER_USER:
                this.login(eventData.userInfo.id, eventData.userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                cc.director.loadScene("hall");
                break;
        }
    },

    /**
     * 移除监听
     */
    removeEvent: function () {
        cc.systemEvent.off(msg.MATCHVS_INIT, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_REGISTER_USER, this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_LOGIN, this.onEvent);
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("Login页面销毁");
    },

});