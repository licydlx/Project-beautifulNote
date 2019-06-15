let GLB = require("../Config/Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,
    properties: {
        roarAudio: {
            default: null,
            type: cc.AudioClip
        },

        walkAudio: {
            default: null,
            type: cc.AudioClip
        },

        jumpAudio: {
            default: null,
            type: cc.AudioClip
        },

        actionButton: {
            default: [],
            type: [cc.Node]
        },
        
        shell: {
            default: null,
            type: cc.Prefab
        },

        score: {
            default: null,
            type: cc.Label
        },  
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.haveAnima = false;
        this.window = Math.floor(cc.find("Canvas").width);
        this._spine = this.getComponent('sp.Skeleton');
        this._spine.setCompleteListener(function(e){
            console.log('aniComplet');
            this.defaultConfig();
        }.bind(this));

        this._spine.setStartListener(function(e){
            console.log('aniStart');
            this.haveAnima = true;
        }.bind(this));
        for (let index = 0; index < this.actionButton.length; index++) {
            this.actionButton[index].on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, false);
            this.actionButton[index].on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveCallback, this, false);
            this.actionButton[index].on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this, false);
            this.actionButton[index].on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelCallback, this, false);
        }
    },

    createPositionEmit(toAction) {
        let frameData = JSON.stringify({
            "userID": GLB.userID,
            "js":'Raptor',
            "action": msg.EVENT_PLAYER_POSINTON_CHANGED,
            "toAction": toAction,
        });

        if (GLB.syncFrame === true) {
            engine.prototype.sendFrameEvent(frameData);
        } else {
            engine.prototype.sendEvent(frameData);
        }
    },

    defaultConfig(){
        this.haveAnima = false;
    },

    changeConfig(){
        this.haveAnima = true;
    },

    toLeft(){
        cc.audioEngine.play(this.walkAudio, false, 1);
        this._spine.setAnimation(0, 'walk', false);
        this.walkAction(-100);
    },

    toRight(){
        cc.audioEngine.play(this.walkAudio, false, 1);
        this._spine.setAnimation(0, 'walk', false);
        this.walkAction(100);
    },

    toUp(){
        cc.audioEngine.play(this.jumpAudio, false, 1);
        this._spine.setAnimation(0, 'jump', false);
    },

    px(){
        cc.audioEngine.play(this.roarAudio, false, 1);
        this._spine.setAnimation(0, 'roar', false);
    },

    sj(){
        let shell = cc.instantiate(this.shell);
        shell.parent = cc.find("Canvas");
        let shellPos = this.node.getPosition();
        shell.setPosition(shellPos.x + 50, shellPos.y + 100);
    },

    onTouchStartCallback(e){
        console.log('start');
        if(!this.haveAnima) {
            this.createPositionEmit('changeConfig');
            this.changeConfig();
            let label = e.currentTarget.children[0].getComponent(cc.Label);
            switch (label.string) {
                case '左':
                    this.createPositionEmit('toLeft');
                    this.toLeft();
                    break;
                case '右':
                    this.createPositionEmit('toRight');
                    this.toRight();
                    break;
                case '上':
                    this.createPositionEmit('toUp');
                    this.toUp();
                    break;
                case '咆哮':
                    this.createPositionEmit('px');
                    this.px();
                    break;
                case '射击':
                    this.createPositionEmit('sj');
                    this.sj();
                    break;
            } 
        };
    },

    onTouchMoveCallback(){},
    onTouchEndCallback(e){
        console.log('end');
        let label = e.currentTarget.children[0].getComponent(cc.Label);
        switch (label.string) {
            case '左':
                break;

            case '右':
                break;

            case '上':

                break;

            case '咆哮':

                break;

            case '射击':
                    this.createPositionEmit('defaultConfig');
                    this.defaultConfig();
                break;
        }
    },
    onTouchCancelCallback(){
        console.log('cancel');
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        //cc.director.getCollisionManager().enabledDebugDraw = false;
    },
    
    walkAction(speed){
        this.node.runAction(cc.moveTo(1,cc.v2(this.node.x + speed,this.node.y)));
    },

    onCollisionEnter: function (other, self) {
        let a = { position: other.world.position, radius: other.world.radius };
        let b = { position: self.world.position, radius: self.world.radius };
        if(a.radius){
            if (cc.Intersection.circleCircle(a, b)) {
                this.score.string = parseInt(this.score.string) + 1;
            }
        };
    },

    update(dt){
        // 恐龙左右移动
        if(this.node.x > 0){
            this.node.x = -50;
        }

        if(this.node.x < -480){
            this.node.x = -480;
        }
        // if(this.window/2 > Math.abs(this.node.x) && this.node.x < 0){      
        //     if(this.leftState) {
        //         console.log('左移')
        //         this.node.x += -400*dt;
        //     }
        //     if(this.rightState){
        //         console.log('右移')
        //         this.node.x += 400*dt;
        //     } 
        // }
    }
});
