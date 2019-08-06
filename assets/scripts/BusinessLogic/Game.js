
let GameData = require("../MatchvsLib/GameData");
let mvs = require("../MatchvsLib/Matchvs");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatchvsMessage");
let response = require("../MatchvsLib/MatchvsResponse");
let engineLog = require("../MatchvsLib/MatchvsLog");

// 算法
const algorithms = require("./algorithms");
// 排行榜
const leaderboard = require("./leaderboard");

cc.Class({
    extends: cc.Component,
    properties: {
        scoreText: {
            default: null,
            type: cc.Label,
            displayName: '我的得分'
        },

        countText: {
            default: null,
            type: cc.Label,
            displayName: '倒计时'
        },

        videoList: {
            default: [],
            type: [cc.Node],
            displayName: '小视频列表'
        },

        poemList: {
            default: [],
            type: [cc.Node],
            displayName: '诗词列表'
        },

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.initMatchvsEvent(this);
        engine.prototype.getRoomDetail(GameData.roomID);
        this.node.on('changeScore', this._changeScore, this);
    },

    _changeScore(v) {
        let addScore = v.detail.addScore;
        this.scoreText.string = addScore ? parseInt(this.scoreText.string) + 1 : parseInt(this.scoreText.string) - 1;
    },

    start() {
        // 排名榜集合
        this.rankingList = [];
        this.curPoem = 1;
        // this.initGame();
    },

    initGame() {
        // 我的得分
        this.scoreText.string = 0;
    },

    startCount() {
        // 倒计时
        this.totalTime = 30;
        this.schedule(this._shcheduleCallback, 1, 29, 0);
    },

    _shcheduleCallback() {
        this.totalTime--;
        this.countText.string = this.totalTime;
        switch (this.totalTime) {
            case 0:
                this.unschedule(this._shcheduleCallback);

                this.videoList[this.curPoem].active = true;
                this.poemList[this.curPoem - 1].destroy();
                this.poemList[this.curPoem].active = true;
                break;
        }
    },

    onVideoPlayerEvent(videoplayer, eventType, customEventData) {
        // videoplayer元信息加载完毕
        if (eventType === cc.VideoPlayer.EventType.META_LOADED) {
            console.log('videoplayer元信息加载完毕');
        }

        // videoplayer已准备好
        if (eventType === cc.VideoPlayer.EventType.READY_TO_PLAY) {
            console.log('videoplayer已准备好');
            console.log(customEventData);
            // if (customEventData == 1) {
            //     videoplayer.play();
            // }
            videoplayer.play();
        }

        // videoplayer正在播放
        if (eventType === cc.VideoPlayer.EventType.PLAYING) {
            console.log('videoplayer正在播放');
        }

        // videoplayer暂停
        if (eventType === cc.VideoPlayer.EventType.PAUSED) {
            console.log('videoplayer暂停');
        }

        // videoplayer关闭
        if (eventType === cc.VideoPlayer.EventType.STOPPED) {
            console.log('videoplayer关闭');
        }

        // videoplayer播放完毕
        if (eventType === cc.VideoPlayer.EventType.COMPLETED) {
            console.log('videoplayer播放完毕');
            // videoplayer.destroy();
            this.videoList[customEventData - 1].destroy();
            this.startCount();
        }

        // videoplayer被点击
        if (eventType === cc.VideoPlayer.EventType.CLICKED) {
            console.log('videoplayer被点击');
        }
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ROOM_DETAIL, this.getRoomDetail, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);

        this.node.on(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
        this.node.on(msg.MATCHVS_LOGOUT, this.logoutResponse, this);
    },

    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_ROOM_DETAIL, this.getRoomDetail, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP, this.sendEventResponse, this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.sendEventNotify, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.errorResponse, this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP, this.joinOverResponse, this);
        this.node.off(msg.MATCHVS_LOGOUT, this.logoutResponse, this);

        this.node.off(msg.MATCHVS_LEAVE_ROOM, this.leaveRoomResponse, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY, this.leaveRoomNotify, this);
    },

    /**
     * 房间详情回调
     * @param eventData
     */
    getRoomDetail(eventData) {
        if (eventData.userID == GameData.userID) engine.prototype.JoinOver();
        // 初始化排行榜
        this.rankingList = leaderboard.initRankingData(eventData.userInfos);
    },

    /**
     * 关闭房间成功
     * @param joinOverRsp
     */
    joinOverResponse(joinOverRsp) {
        if (joinOverRsp.status == 200) {
            console.log('joinOverResponse: 关闭房间成功');
        } else if (joinOverRsp.status == 400) {
            console.log('joinOverResponse: 客户端参数错误 ');
        } else if (joinOverRsp.status == 403) {
            console.log('joinOverResponse: 该用户不在房间 ');
        } else if (joinOverRsp.status == 404) {
            console.log('joinOverResponse: 用户或房间不存在');
        } else if (joinOverRsp.status == 500) {
            console.log('joinOverResponse: 服务器内部错误');
        }
    },

    /**
     * 离开房间回调
     * @param leaveRoomRsp
     */
    leaveRoomResponse(leaveRoomRsp) {
        if (leaveRoomRsp.status == 200) {
            console.log('leaveRoomResponse：离开房间成功，房间ID是' + leaveRoomRsp.roomID);
            engine.prototype.logout();
        } else if (leaveRoomRsp.status == 400) {
            console.log('leaveRoomResponse：客户端参数错误,请检查参数');
        } else if (leaveRoomRsp.status == 404) {
            console.log('leaveRoomResponse：房间不存在')
        } else if (leaveRoomRsp.status == 500) {
            console.log('leaveRoomResponse：服务器错误');
        }
    },

    /**
     * 其他离开房间通知
     * @param leaveRoomInfo
     */
    leaveRoomNotify(leaveRoomInfo) {
        console.log('leaveRoomNotify：' + leaveRoomInfo.userID + '离开房间，房间ID是' + leaveRoomInfo.roomID);
    },

    /**
     * 注销回调
     * @param status
     */
    logoutResponse(status) {
        if (status == 200) {
            console.log('logoutResponse：注销成功');
            let result = engine.prototype.unInit();
            engineLog(result, 'unInit');
        } else if (status == 500) {
            console.log('logoutResponse：注销失败，服务器错误');
        }
    },

    /**
     * 发送消息回调
     * @param sendEventRsp
     */
    sendEventResponse(sendEventRsp) {
        if (sendEventRsp.status == 200) {
            console.log('sendEventResponse：发送消息成功');
        } else {
            console.log('sendEventResponse：发送消息失败');
        }
    },

    /**
     * 接收到其他用户消息通知
     * @param eventInfo
     */
    sendEventNotify(eventInfo) {
        this._onGameEvent(eventInfo);
    },

    /**
     * 错误信息回调
     * @param errorCode
     * @param errorMsg
     */
    errorResponse(errorCode, errorMsg) {
        console.log('errorMsg:' + errorMsg + 'errorCode:' + errorCode);
    },

    // 接受命令
    _onGameEvent: function (info) {
        if (info && info.cpProto) {
            let event = JSON.parse(info.cpProto);
            switch (event.action) {
                case 'gainScore':
                    // 更新实时排行榜
                    this._showRankingData(event);
                    break;
                case 'gameStart':
                    // 重新开始
                    this.initGame();
                    break;

                default:
                    break;
            }
        }
    },

    // 更新实时排行榜
    _showRankingData: function (event) {
        let modifyRankingList = leaderboard.modifyRankingData(this.rankingList, event);
        this.rankingList = algorithms.bubbleSort(modifyRankingList).reverse();
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        //cc.director.getCollisionManager().enabledDebugDraw = false;
    },
    /**
     * 生命周期，页面销毁
     */
    onDestroy() {
        this.removeEvent();
        console.log("game页面销毁");
    },

    update(dt) { },

});