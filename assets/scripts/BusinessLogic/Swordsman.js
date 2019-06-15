// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var NORMAL_ANIMATION_GROUP = "normal";
var AIM_ANIMATION_GROUP = "aim";
var ATTACK_ANIMATION_GROUP = "attack";
var JUMP_SPEED = -20;
var NORMALIZE_MOVE_SPEED = 3.6;
var MAX_MOVE_SPEED_FRONT = NORMALIZE_MOVE_SPEED * 1.4;
var MAX_MOVE_SPEED_BACK = NORMALIZE_MOVE_SPEED * 1.0;
var WEAPON_R_LIST = ["weapon_1502b_r", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d", "weapon_1005e"];
var WEAPON_L_LIST = ["weapon_1502b_l", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d"];
var GROUND = -200;
var G = -0.6;

cc.Class({
    extends: cc.Component,

    properties: {
        // bullet: {
        //     default: null,
        //     type: cc.Prefab
        // },
        speed: 10,

        _bullets: [],
        _left: false,
        _right: false,
        _isJumping: false,
        _isAttackingA: false,
        _isAttackingB: false,
        _faceDir: 1,
        _aimDir: 0,
        _moveDir: 0,
        _aimRadian: 0,
        _speedX: 0,
        _speedY: 0,
        _armature: null,
        _armatureDisplay: null,
        _aimState: null,
        _walkState: null,
        _jumpState: null,
        _attackState: null,
        _target: cc.v2(0, 0),
        _attack: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._armatureDisplay = this.getComponent(dragonBones.ArmatureDisplay);
        this._armature = this._armatureDisplay.armature();

        this._armatureDisplay.addEventListener(dragonBones.EventObject.LOOP_COMPLETE, this._animationEventHandler, this);
        this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, this._animationEventHandler, this);

        this._updateAnimation();

        // keyboard events
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            this._keyHandler(event.keyCode, true);
        }, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
            this._keyHandler(event.keyCode, false);
        }, this);
    },

    _animationEventHandler(event) {
        if (event.type === dragonBones.EventObject.LOOP_COMPLETE) {
            if (event.animationState.name === "jump") {
                console.log(event)
                this._isJumping = false;
                this._jumpState = null;
                this._updateAnimation();
            } else if (event.animationState.name === "atc") {
                this._attack = false
                this._attackState = null
                this._updateAnimation()
            }
        }
    },

    _keyHandler(keyCode, isDown) {
        switch (keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this._left = isDown;
                this._updateMove(-1);
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this._right = isDown;
                this._updateMove(1);
                break;
                // case cc.macro.KEY.w:
                // case cc.macro.KEY.up:
                //     if (isDown) {
                //         this.jump();
                //     }
                //     break;
            case cc.macro.KEY.space:
                if (isDown) {
                    this.attack();
                }
                break;
            default:
                return;
        }
    },

    _updateMove(dir) {
        if (this._left && this._right) {
            // 左右方向同时按，以后按为主
            this.move(dir);
        } else if (this._left) {
            this.move(-1);
        } else if (this._right) {
            this.move(1);
        } else {
            this.move(0);
        }
    },

    move(dir) {
        if (this._moveDir === dir) return;

        this._moveDir = dir;
        this._updateAnimation();
    },

    jump() {
        if (this._isJumping) return;

        this._isJumping = true;
        this._updateAnimation();
    },

    attack() {
        if (this._attack) return;

        this._attack = true;
        this._updateAnimation();
    },

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)
    },

    update(dt) {
        this._updatePosition();
        // this._updateAim();
        // this._updateAttack();
        // this._enterFrameHandler(dt);
    },

    _updateAnimation() {
        if (this._isJumping) {
            if (!this._jumpState) {
                this._jumpState = this._armature.animation.fadeIn("jump", -1, -1, 0, NORMAL_ANIMATION_GROUP);
                this._walkState = null;
            }
            return;
        }

        if (this._attack) {
            if (!this._attackState) {
                this._attackState = this._armature.animation.fadeIn("atc", -1, -1, 0, NORMAL_ANIMATION_GROUP);
                this._walkState = null;
                this.node.game.fire({
                    x: this.node.position.x + 50,
                    y: this.node.position.y + 50
                }, Math.random() * 20 + 30, Math.random() * 10 + 10, -0.25);
            }
            return;
        }

        if (this._moveDir === 0) {
            this._speedX = 0;
            this._armature.animation.fadeIn("stand", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            this._walkState = null;
        } else {
            if (!this._walkState) {
                this._walkState = this._armature.animation.fadeIn("walk", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            }

            if (this._moveDir * this._faceDir > 0) {
                this._walkState.timeScale = MAX_MOVE_SPEED_FRONT / NORMALIZE_MOVE_SPEED;
            } else {
                this._walkState.timeScale = -MAX_MOVE_SPEED_BACK / NORMALIZE_MOVE_SPEED;
            }

            if (this._moveDir * this._faceDir > 0) {
                this._speedX = MAX_MOVE_SPEED_FRONT * this._faceDir;
            } else {
                this._speedX = -MAX_MOVE_SPEED_BACK * this._faceDir;
            }
        }
    },

    _updatePosition() {
        if (this._speedX !== 0) {
            this.node.x += this._speedX;
            var minX = -cc.visibleRect.width / 2;
            var maxX = cc.visibleRect.width / 2;
            if (this.node.x < minX) {
                this.node.x = minX;
            } else if (this.node.x > maxX) {
                this.node.x = maxX;
            }
        }

        if (this._speedY != 0) {
            // if (this._speedY > 5 && this._speedY + G <= 5) {
            //     this._armature.animation.fadeIn("jump_3", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            // }

            this._speedY += G;

            this.node.y += this._speedY;
            if (this.node.y < GROUND) {
                this.node.y = GROUND;
                this._isJumping = false;
                this._speedY = 0;
                this._speedX = 0;
                this._armature.animation.fadeIn("steady", -1, -1, 0, NORMAL_ANIMATION_GROUP);
                if (this._isSquating || this._moveDir) {
                    this._updateAnimation();
                }
            }
        }
    },
});