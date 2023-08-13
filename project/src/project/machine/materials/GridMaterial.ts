import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";
import { RandTexGen } from "../../../helpers/RandTexGen";

class GridMaterial extends MeshBasicMaterial
{
    transparent: boolean;
    opacity: number;
    uniforms:any;
    onBeforeCompile:any;
    constructor(parameters:MeshBasicMaterialParameters)
    {
        parameters.forceSinglePass = true;
        
        super(parameters);
        this.opacity = 1;
        this.transparent = true;
        this.uniforms = {
            //randTex:{value:RandTexGen.GetTex()},
            randTex:{value:RandTexGen.getAltTex()},
        }

        this.onBeforeCompile = (shader, renderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>

                attribute float alpha;
                varying float vAlpha;
                varying vec2 vUv;
                varying vec3 vPositionW;
                                              
          `

            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>

                vAlpha = alpha;
                vUv = uv;
                vPositionW = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
           
                
          `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                uniform sampler2D randTex;

                varying float vAlpha;
                varying vec2 vUv;
                varying vec3 vPositionW;

                #define ROTMAT mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                #define SHIFT vec2(100.0);

                float hash21B(vec2 x){ 
                    vec2 p = floor(x);
                    vec2 f = fract(x);
                    f = f*f*(3.0-2.0*f);
                    float a = textureLod(randTex,(p+vec2(0.5,0.5))/511.0,0.0).x;
                    float b = textureLod(randTex,(p+vec2(1.5,0.5))/511.0,0.0).x;
                    float c = textureLod(randTex,(p+vec2(0.5,1.5))/511.0,0.0).x;
                    float d = textureLod(randTex,(p+vec2(1.5,1.5))/511.0,0.0).x;
                    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);                
                }

                float cubicPulse( float c, float w, float x )
                {
                    x = abs(x - c);
                    if( x>w ) return 0.0;
                    x /= w;
                    return 1.0 - x*x*(3.0-2.0*x);
                }

                float fbm ( in vec2 _st, in int OCT) {
                    float v = 0.0;
                    float a = 0.5;
                    mat2 rot = ROTMAT;
                    for (int i = 0; i < OCT; ++i) {
                        v += a * (hash21B(_st) );
                        _st = rot * _st * 2.0 + SHIFT;
                        a *= 0.5;
                    }
                    return v;
                }

                
                float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
                {
                    r.xy = (p.x>0.0)?r.xy : r.zw;
                    r.x  = (p.y>0.0)?r.x  : r.y;
                    vec2 q = abs(p)-b+r.x;
                    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
                }

                vec2 rotateUV(vec2 uv, float rotation)
                {
                    float mid = 0.5;
                    return vec2(
                        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
                        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
                    );
                }
                vec2 rotateUV(vec2 uv, float rotation, vec2 mid)
                {
                    return vec2(
                      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
                      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
                    );
                }
                
                vec2 rotateUV(vec2 uv, float rotation, float mid)
                {
                    return vec2(
                      cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
                      cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
                    );
                }
    
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

               
                vec3 linecol = vec3(1.0);
                vec2 uv = vUv;
                vec2 uv2 = uv * 10000.0;
                vec2 cuv = vUv *2.0 - 1.0;
                float chalkDist = 0.0;
                //float n = hash21B(uv2);
                float d = length(cuv) * 1.5;
                
                //float n = fbm(uv2, 3);
                //diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * .8, n);
                
                vec2 chuv = rotateUV(uv, PI*.25) * 50.0;
                chuv.y *= 0.5;
                //chalkDist = fbm( chuv * 3.0, 3) * (1.0-n);
                //chalkDist = hash21B( chuv * 3.0)*.5 * (1.0-n);
                chalkDist = hash21B( chuv * 2.0)*.25 ;
                chalkDist = chalkDist * chalkDist * .5;

                //chalkDist = pow( smoothstep(0.0, 1.0 , chalkDist) , 2.0 )* .5;
                diffuseColor.rgb = mix( diffuseColor.rgb, linecol, chalkDist  );
                
                diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * .1, d);
                
                cuv += vec2(0.01);
                float box = sdRoundedBox(cuv, vec2(0.07), vec4(0.001));
                float hbox = step( 0.8,cubicPulse(0.002, 0.005, box) );

                vec2 duv = (vUv*2.0-1.0) * 1000.0;
                //duv.x += smoothstep(0.4, 0.6,n)*0.1;
                duv = rotateUV( duv, -PI*.25 , vec2(0.0) );
                float lines = step( 0.9, fract(duv.x) );

                diffuseColor.rgb = mix( diffuseColor.rgb, linecol, lines * hbox);

                vec2 small = vUv * 400.0;
                //float slx = cubicPulse(0.0, 0.01, fract(small.x + n*0.02)  );
                //float sly = cubicPulse(0.0, 0.01, fract(small.y + n*0.02) );
                float slx = cubicPulse(0.0, 0.01, fract(small.x) );
                float sly = cubicPulse(0.0, 0.01, fract(small.y) );
                diffuseColor.rgb = mix( diffuseColor.rgb, linecol, min(1.0,slx + sly) *(1.0-chalkDist));
                
                
                
          ` 
            );

            //console.log( shader.vertexShader);


        };
    }
}

export {GridMaterial};