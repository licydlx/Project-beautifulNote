let engine = require("../MatchvsLib/MatchvsDemoEngine");
let GLB = require("../Config/Glb");
let msg = require("../MatchvsLib/MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        userList :[],
    },

    onLoad () {
        this.initEvent();
        // roomID的全局赋值要慎重使用，离开房间记得置空
        if (GLB.roomID !== "") engine.prototype.getRoomDetail(GLB.roomID);

        let self = this;
        this.nameViewList = [this.labelUserName2];

        this.btnStartGame.node.on(cc.Node.EventType.TOUCH_END, function(){
            if (self.userList.length === GLB.MAX_PLAYER_COUNT-1) {
                let event = {
                    action: msg.EVENT_GAME_START,
                };
                engine.prototype.sendEventEx(0,JSON.stringify(event));
                engine.prototype.joinOver();
            } else {
                // self.labelLog('房间人数小于' + GLB.MAX_PLAYER_COUNT);
            }
        });
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
    },

    /**
     * 事件接收
     * @param event
     */
    onEvent (event){
        let eventData = event.data;
        switch(event.type) {
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(eventData.roomUserInfo);
                this.initUserView(eventData.roomUserInfo.userProfile,eventData.roomUserInfo.userID,0);
                break;
                
            case msg.MATCHVS_ROOM_DETAIL:
                this.joinRoom(eventData.rsp);
                for (let i in eventData.rsp.userInfos) {
                    if (GLB.userID !== eventData.rsp.userInfos[i].userID) {
                        this.initUserView(eventData.rsp.userInfos[i].userProfile,eventData.rsp.userInfos[i].userID,eventData.rsp.owner);
                        this.userList.push(eventData.rsp.userInfos[i]);
                    }
                }
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                let data = JSON.parse(eventData.eventInfo.cpProto);
                if (data.action == msg.EVENT_GAME_START) {
                    this.startGame();
                }
                break;
        }
    },

    startGame:function () {
        cc.director.loadScene('game')
    },

    /**
     * 房主是通过joinRoom ,非房主玩家是通过getRoomDetail 进来的
     * @param rsp
     */
    joinRoom: function (rsp) {
        if (rsp.owner === GLB.userID) {
            GLB.isRoomOwner = true;
        } else {
            GLB.isRoomOwner = false;
            this.btnStartGame.node.active = false;
        }
        if (GLB.roomID !== "") {
            this.labelMyRoomID.string = GLB.roomID;
        } else {
            this.labelMyRoomID.string = rsp.roomID;
            GLB.roomID = rsp.roomID;
        }

        this.labelUserName.string = GLB.name;
        GLB.mapType = rsp.roomProperty;
    },

    /**
     * 展示玩家信息
     */
    initUserView :function(userProfile,userID,owner){
        for(let i = 0; i < this.nameViewList.length; i++) {
            let info = JSON.parse(userProfile);
            console.log('initUserView');
            console.log(this.nameViewList[i]);
            if (this.nameViewList[i].string === "待加入") {
                this.nameViewList[i].string = info.name;
                return;
            }
        }
    },

    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent);
    },

    /**
     * 生命周期，销毁
     */
    onDestroy () {
        this.removeEvent();
        console.log("room页面销毁");
    },

});
