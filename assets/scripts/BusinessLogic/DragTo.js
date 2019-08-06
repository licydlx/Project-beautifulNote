
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    },

    start() {
        this.otherTag = null;
        this.selfTag = null;
        //缓存原始父节点
        this._oldPosition = this.node.position;
        this._oldParent = this.node.parent;
    },

    sendMessage(addScore){
        let message = new cc.Event.EventCustom('changeScore', true);
        message.setUserData({ addScore: addScore});
        this.node.dispatchEvent(message);
    },

    _onTouchStart(touchEvent) {
        let location = touchEvent.getLocation();
        this._offset = this.node.convertToNodeSpaceAR(location);
        if (this.node.parent === this._oldParent) {
            return;
        }
        let point = this._oldParent.convertToNodeSpaceAR(location);
        this.node.parent = this._oldParent;
        this.node.position = point.sub(this._offset);
    },

    _onTouchMove(touchEvent) {
        let location = touchEvent.getLocation();
        this.node.position = this.node.parent.convertToNodeSpaceAR(location).sub(this._offset);
    },

    _onTouchEnd(touchEvent) {
        console.log('_onTouchEnd');
        console.log(this.otherTag);
        console.log(this.selfTag);
        if(this.otherTag && this.selfTag && parseInt(this.otherTag) == parseInt(this.selfTag)){
            this.sendMessage(true);
            this.node.destroy();
        } else {
            this.sendMessage(false);
            this.node.position = this._oldPosition;
        }
    },

    _onTouchCancel(touchEvent) {
        if(this.otherTag && this.selfTag && parseInt(this.otherTag) == parseInt(this.selfTag)){
            this.sendMessage(true);
            this.node.destroy();
        } else {
            this.sendMessage(false);
            this.node.position = this._oldPosition;
        }
    },

    // 碰撞 生命周期
    onCollisionEnter: function (other, self) {
        console.log('onCollisionEnter');
        let a = other.world.aabb;
        let b = self.world.aabb;
        if (cc.Intersection.rectRect(a, b)) {
            console.log('已碰到！');
            this.otherTag = other.tag;
            this.selfTag = self.tag;
        }
    },

    onCollisionStay: function (other, self) {
        
    },

    onCollisionExit: function (other, self) {
        console.log('退出碰撞！');
        // this.otherTag = null;
        // this.selfTag = null;
    },

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }
    // update (dt) {},
});
