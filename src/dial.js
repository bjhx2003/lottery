import assign from './modules/assign';
import Events from './modules/events';
import setStyle from './modules/setStyle';
import {requestAnimationFrame, cancelAnimationFrame} from './modules/requestAnimationFrame';

class Dial extends Events {
    constructor(pointer, options) {
        super();

        this.options = Object.assign({
            speed: 30, //每帧速度
            areaNumber: 8 //奖区数量
        }, options);
        this.pointer = pointer;

        this.init();
    }

    init() {
        //初始化样式设定
        this._transform = setStyle(this.pointer, 'transform', 'translate3d(0,0,0)');
        setStyle(this.pointer, 'backfaceVisibility', 'hidden');
        setStyle(this.pointer, 'perspective', '1000px');

        this._raf = null;
        this._runAngle = 0;
        this._targetAngle = -1;
    }

    reset(event = 'reset') {
        if (!this._raf) return;
        cancelAnimationFrame(this._raf);
        this._raf = null;
        this._runAngle = 0;
        this._targetAngle = -1;
        this.trigger(event);
        if (event == 'reset') setStyle(this.pointer, this._transform, 'translate3d(0,0,0) rotate(0deg)');
    }

    setResult(index) {
        //得到中奖结果 index:中奖奖区下标
        var singleAngle = 360 / this.options.areaNumber, //单个奖区角度值
            endAngle = Math.ceil((Math.random() * singleAngle) + (index * singleAngle)); //随机得出结果角度

        this._runAngle = 0;
        this._targetAngle = endAngle + (Math.floor(Math.random() * 4) + 4) * 360; //随机旋转几圈再停止
    }

    draw() {
        if (this._raf) return;

        var _draw = () => {
            var angle = 0,
                step = () => {
                    //如果没有设置结束点 就匀速不停旋转
                    //如果设置了结束点 就减速到达结束点
                    if (this._targetAngle == -1) {
                        this._runAngle += this.options.speed;
                    } else {
                        angle = (this._targetAngle - this._runAngle) / this.options.speed;
                        angle = angle > this.options.speed ? this.options.speed : angle < 0.5 ? 0.5 : angle;
                        this._runAngle += angle;
                        this._runAngle = this._runAngle > this._targetAngle ? this._targetAngle : this._runAngle;
                    }
                    //指针旋转
                    setStyle(this.pointer, this._transform, 'translate3d(0,0,0) rotate(' + (this._runAngle % 360) + 'deg)');

                    if (this._runAngle == this._targetAngle) {
                        this.reset('end');
                    } else {
                        this._raf = requestAnimationFrame(step);
                    }
                };

            this._raf = requestAnimationFrame(step)
        };

        this.has('start') ? this.trigger('start', _draw) : _draw();
    }
}

export default Dial;