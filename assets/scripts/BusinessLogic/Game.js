let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        explain:{
            default:null,
            type:cc.Label
        },
        time:{
            default:null,
            type:cc.Label
        },
        peTotal:{
            default:null,
            type:cc.Label
        },
        zbTotal:{
            default:null,
            type:cc.Label
        },

        startButton:{
            default:null,
            type:cc.Button
        },
        zbButton:{
            default:null,
            type:cc.Button
        },
        progress:{
            default:null,
            type:cc.ProgressBar
        },
        items:{
            default:[],
            type:[cc.Node]
        }

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.zbList = [];
        this.initEvent();
        engine.prototype.getRoomDetail(GLB.roomID);
        if(GLB.isRoomOwner){
            this.startButton.node.active = true;
            this.peTotal.node.active = true;
            this.zbTotal.node.active = true;
        } else {
            this.zbButton.node.active = true;
        }
    },

    update(dt) {

    },

    createEmit(obj) {
        let frameData = JSON.stringify({
            "userID": GLB.userID,
            "action": obj.action,
            "toAction": obj.toAction,
        });

        if (GLB.syncFrame === true) {
            engine.prototype.sendFrameEvent(frameData);
        } else {
            engine.prototype.sendEvent(frameData);
        }
    },

    zb(){
        this.explain.destroy();
        this.zbButton.node.destroy();
        this.progress.node.active = true;
        this.createEmit({
            action:msg.EVENT_PLAYER_ZB
        })
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

                console.log(event);
                GLB.ownew = eventData.rsp.owner;
                this.peTotal.string = '总人数：' + eventData.rsp.userInfos.length;
                // for (let i = 0; i < eventData.rsp.userInfos.length; i++) {
                //     let usrID = eventData.rsp.userInfos[i].userID;
                //     this.curPlayers[usrID] = this.players[i];
                //     if (GLB.userID === usrID){
                //         this.curPlayer = this.players[i];
                //         if(i == 0){
                //             let ra2 = this.node.getChildByName("raptorAction2");
                //             ra2.active = false;
                //         } else {
                //             let ra1 = this.node.getChildByName("raptorAction1");
                //             ra1.active = false;
                //         }
                //     } 
                // }
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

    // 接受命令
    onNewWorkGameEvent: function (info) {
        if (info && info.cpProto) {
            let event = JSON.parse(info.cpProto);
            console.log(event);
            if (event.action === msg.EVENT_PLAYER_START) {
                this.items[0].active = true; 
            }
            if (event.action === msg.EVENT_PLAYER_ZB) {
                this.zbList.push(event.userID)
                console.log(this.zbList);
                this.zbTotal.string = '准备人数：' + this.zbList.length;
            }
            
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
