/*jshint esversion:6 */
const renderEngine = cc.renderer.renderEngine;
const Material = renderEngine.Material;
let ShaderMaterial = cc.Class({
    extends: Material,
    callfunc(name, vert, frag, defines) {
        let renderer = cc.renderer;
        let lib = renderer._forward._programLib;
        lib.define(name, vert, frag, defines);
        this.init(name);
    },

    init(name) {
        let renderer = renderEngine.renderer;
        let gfx = renderEngine.gfx;

        // 将shader 的programName放进pass中进行保存
        let pass = new renderer.Pass(name);
        pass.setDepth(false, false);
        pass.setCullMode(gfx.CULL_NONE);
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
        );

        // Technique()构造函数的第二个入参表示 需要渲染的属性参数，需要在technique中定义在effect中赋值 该入参的每一个参数可以有一个val表示默认值
        let mainTech = new renderer.Technique(
            ['transparent'],
            [{
                    name: 'texture',
                    type: renderer.PARAM_TEXTURE_2D
                },
                {
                    name: 'color',
                    type: renderer.PARAM_COLOR4
                },
                {
                    name: 'pos',
                    type: renderer.PARAM_FLOAT3
                },
                {
                    name: 'size',
                    type: renderer.PARAM_FLOAT2
                },
                {
                    name: 'time',
                    type: renderer.PARAM_FLOAT,
                    defaultValue: 0
                },
                {
                    name: 'num',
                    type: renderer.PARAM_FLOAT
                }
            ],
            [pass]
        );

        this._texture = null;
        this._color = {
            r: 1.0,
            g: 1.0,
            b: 1.0,
            a: 1.0
        };
        this._pos = {
            x: 0.0,
            y: 0.0,
            z: 0.0
        };
        this._size = {
            x: 0.0,
            y: 0.0
        };
        this._time = 0.0;
        this._num = 0.0;
        this._effect = this.effect = new renderer.Effect([mainTech], {
            'color': this._color,
            'pos': this._pos,
            'size': this._size,
            'time': this._time,
            'num': this._num
        }, []);
        this._mainTech = mainTech;
    },

    setTexture(texture) {
        this._texture = texture;
        this._texture.update({
            flipY: false,
            mipmap: false
        });
        this._effect.setProperty('texture', texture.getImpl());
        this._texIds['texture'] = texture.getId();
    },

    setColor(r, g, b, a) {
        this._color.r = r;
        this._color.g = g;
        this._color.b = b;
        this._color.a = a;
        this._effect.setProperty('color', this._color);
    },

    setPos(x, y, z) {
        this._pos.x = x;
        this._pos.y = y;
        this._pos.z = z;
        this._effect.setProperty('pos', this._pos);
    },

    setSize(x, y) {
        this._size.x = x;
        this._size.y = y;
        this._effect.setProperty('size', this._size);
    },

    setTime(time) {
        this._time = time;
        this._effect.setProperty('time', this._time);
    },

    setNum(num) {
        this._num = num;
        this._effect.setProperty('num', this._num);
    },
});
cc.Class({
    extends: cc.Component,

    properties: {
        Texture1: {
            default: null,
            type: cc.RenderTexture
        },
    },
    onLoad() {

    },


    // 组件的渲染移至start
    start() {
        if (!this.node.getComponent(cc.Sprite)) {
            return;
        }
        let vert = `
       uniform mat4 viewProj;
       attribute vec3 a_position;
       attribute vec2 a_uv0;
       varying vec2 uv0;
       void main () {
           vec4 pos = viewProj * vec4(a_position, 1);
           gl_Position = pos;
           uv0 = a_uv0;
       }`;

        let frag = `
       uniform sampler2D texture;
       uniform vec4 color;
       varying vec2 uv0;
       void main () {
           vec4 c = color * texture2D(texture, uv0);
           float clrbright = (c.r + c.g + c.b) * (1. / 3.);
           float gray = (0.6) * clrbright;
           gl_FragColor = vec4(gray, gray, gray, c.a);
       }
       `;
        this.lab = {
            vert: vert,
            frag: frag,
            name: "test"
        }
        this.sprite = this.node.getComponent(cc.Sprite);

    },

    update(dt) {
        this.useShader(this.sprite, this.lab);
    },

    useShader(sprite, lab) {
        // cavas模式下不能使用shader
        if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
            console.warn('Shader not surpport for canvas');
            return;
        }
        // 不存在图片的texture对象时无法使用shader
        if (!sprite || !sprite.spriteFrame || sprite.lab == lab) {
            return;
        }
        if (lab) {
            if (lab.vert == null || lab.frag == null) {
                console.warn('Shader not defined', lab);
                return;
            }


            let material = new ShaderMaterial();
            let name = lab.name ? lab.name : "None";
            material.callfunc(name, lab.vert, lab.frag, lab.defines || []);
            let texture = sprite.spriteFrame.getTexture();
            material.setTexture(texture);
            material.setTime(0);
            material.updateHash();

            sprite._material = material;
            sprite._renderData.material = material;
            sprite.lab = lab;
            return material;
        } else {
            console.log('[utils userShader ] sprite, lib = ', sprite, lib);
        }
    },
});