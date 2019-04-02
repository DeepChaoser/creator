/*jshint esversion:6 */
const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;
const gfx = renderEngine.gfx;
const Material = renderEngine.Material;
const shader = {    
    name: 'Dissolve',
    params: [
        { name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0 },
    ],

    start() {
        this.time = 0;
        this.flag = 1;
    },

    update(sprite, material, dt) {
        dt /= 3;
        if (this.flag) {
            this.time += dt;    
        } else {
            this.time -= dt;  
        }
       
        if (this.time >= 1.2) {
            this.flag = 0;
        } else if (this.time <= -0.2 ) {
            this.flag = 1;
        }

        material.setParamValue('time', this.time);
    },

    defines:[],

    vert: `
        uniform mat4 viewProj;
        attribute vec3 a_position;
        attribute vec2 a_uv0;
        varying vec2 uv0;
        void main () {
            vec4 pos = viewProj * vec4(a_position, 1);
            gl_Position = pos;
            uv0 = a_uv0;
        }`,

    frag:
        `
        uniform sampler2D texture;
uniform vec4 color;
uniform float time;
varying vec2 uv0;

void main()
{
    vec4 c = color * texture2D(texture,uv0);
    float height = c.g;
    if(height < time)
    {
        discard;
    }
    if(height < time+0.04)
    {
        c = vec4(1, 0, 0, c.a);
    }
    gl_FragColor = c;
}`,
};

class CustomMaterial  {
    
    constructor(shaderName, params, defines) {
        this.shaderName = shaderName;
        this.params = params;
        this.defines = defines;
    }
};

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let sprite = this.node.getComponent(cc.Sprite);
        let material = sprite.getMaterial();
        console.log('[TestShader onLoad] material = ', material);
        if(!material){
         // sprite.setMaterial 接口设置要渲染的图片的材质
        //  sprite.setMaterial(this._shaderObject.name, material);
        }


        // 设置纹理对象



    },

    

    start () {

    },

    

    // update (dt) {},
});
