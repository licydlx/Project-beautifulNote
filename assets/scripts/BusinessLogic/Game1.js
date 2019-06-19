let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        players: {
            default: [],
            type: [cc.Node]
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.initEvent();
        engine.prototype.getRoomDetail(GLB.roomID);
        var cannons = this.node.children;
        // this.node.on(cc.Node.EventType.TOUCH_START, this.playerMoveStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.playerMoveMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, this.playerMoveEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.playerMoveCancel, this);

        this.playerIsMove = false;
        this.curPlayer = null;
        this.curPlayers = {};
        this.moveToPosition = null;
    },

    // 节点坐标系转换
    curNodeCoordinate(event, context) {
        // 鼠标世界空间坐标系位置
        let location = event.getLocation();
        // 转为该节点的空间坐标系位置
        let nodeSpacePos = context.convertToNodeSpaceAR(location);
        return nodeSpacePos;
    },

    // playerMoveStart(event) {
    //     this.curPlayer = this.curPlayers[GLB.userID];
    //     this.moveToPosition = this.curNodeCoordinate(event, this.node);
    //     this.playerIsMove = true;
    //     this.createPositionEmit();
    // },

    // playerMoveMove(event) {
    //     this.moveToPosition = this.curNodeCoordinate(event, this.node);
    //     this.createPositionEmit();
    // },

    // playerMoveEnd(event) {
    //     this.moveToPosition = this.curNodeCoordinate(event, this.node);
    //     this.playerIsMove = false;
    //     // 传送终止时状态
    //     this.createPositionEmit();
    // },

    // playerMoveCancel(event) {
    //     this.moveToPosition = this.curNodeCoordinate(event, this.node);
    //     this.playerIsMove = false;
    //     // 传送终止时状态
    //     this.createPositionEmit();
    // },

    update(dt) {

    },

    /**
    * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
    */
    initEvent: function () {
        cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent, this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent: function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_ROOM_DETAIL:
                console.log('MATCHVS_ROOM_DETAIL');
                GLB.ownew = eventData.rsp.owner;
                for (let i = 0; i < eventData.rsp.userInfos.length; i++) {
                    let usrID = eventData.rsp.userInfos[i].userID;
                    this.curPlayers[usrID] = this.players[i];
                    if (GLB.userID === usrID){
                        this.curPlayer = this.players[i];
                        if(i == 0){
                            let ra2 = this.node.getChildByName("raptorAction2");
                            ra2.active = false;
                        } else {
                            let ra1 = this.node.getChildByName("raptorAction1");
                            ra1.active = false;
                        }
                    } 
                }
                break;
            case msg.MATCHVS_SEND_EVENT_RSP:
                console.log('MATCHVS_SEND_EVENT_RSP');
                break;

            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                console.log('MATCHVS_SEND_EVENT_NOTIFY');
                this.onNewWorkGameEvent(eventData.eventInfo);
                break;
        }
    },

    onNewWorkGameEvent: function (info) {
        if (info && info.cpProto) {
            let event = JSON.parse(info.cpProto);
            if (event.action === msg.EVENT_PLAYER_POSINTON_CHANGED) {
                this.updatePlayerMoveDirection(event);
            }
        }
    },

    // 更新每个玩家的移动方向
    updatePlayerMoveDirection: function (event) {
        console.log('updatePlayerMoveDirection');
        if (event.userID !== GLB.userID) {
            let curPlayer = this.curPlayers[event.userID];
            let curPlayerJs = curPlayer.getComponent(event.js);
            curPlayerJs[event.toAction]();
        }
    },

    /**
     * 移除监听
     */
    removeEvent: function () {
        // cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL, this.onEvent);
        // cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_RSP, this.onEvent);
        // cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("game页面销毁");
    },
    // update (dt) {},
});
