// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        _speedX: 10,
        _speedY: 10,
        _g: -1,
        _start: false
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    init(pos, angle = 45, speed = 40, g = -1) {
        this.node.x = pos.x
        this.node.y = pos.y

        this._speedX = speed * Math.sin(angle / 180 * Math.PI)
        this._speedY = speed * Math.cos(angle / 180 * Math.PI)
        this._g = g
        this._start = true
    },

    onCollisionEnter(other, self) {
        // console.log('bullet enter')
        // self.node.removeFromParent()
    },

    onCollisionStay(other, self) {
        // console.log('bullet stay')
    },

    onCollisionExit(other, self) {
        // console.log('bullet exit')
    },

    update(dt) {
        if (this._start) {
            this._speedY += this._g
            this.node.x += this._speedX
            this.node.y += this._speedY

            if (this.node.x > cc.visibleRect.width / 2 || this.node.y < -cc.visibleRect.height / 2) {
                this.node.removeFromParent()
            }
        }
    },
});