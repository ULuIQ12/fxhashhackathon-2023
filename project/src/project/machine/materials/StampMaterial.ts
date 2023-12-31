import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";
import { RandTexGen } from "../../../helpers/RandTexGen";

class StampMaterial extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;
    constructor(parameters:MeshBasicMaterialParameters, variant:number = 0)
    {
        
        //parameters.depthWrite = false;
        //parameters.deptTest = false;
        parameters.alphaTest = 0.01;
        parameters.forceSinglePass = true;
        super(parameters);

        this.uniforms = {
            variant: { value: variant },
            randTex:{value:RandTexGen.GetTex()},
        }

        this.onBeforeCompile = (shader, renderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>

                attribute float alpha;
                attribute vec2 offset;
                varying float vAlpha;
                varying vec2 vOffset;
                varying vec2 vUv;
                varying vec3 vPositionW;
                varying vec3 vPosition2;      
          `

            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>

                vAlpha = alpha;
                vUv = uv;
                vOffset = offset;
                vPositionW = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
           
                
          `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                uniform sampler2D randTex;
                uniform float variant;
                varying float vAlpha;
                varying vec2 vUv;
                varying vec3 vPositionW;
                varying vec3 vPosition2;
                varying vec2 vOffset;

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

                float fbm ( in vec2 _st, in int OCT) {
                    float v = 0.0;
                    float a = 0.5;
                    mat2 rot = ROTMAT;
                    for (int i = 0; i < OCT; ++i) {
                        v += a * (hash21B(_st) );
                        _st = rot * _st * 2.0;// + SHIFT;
                        a *= 0.5;
                    }
                    return v;
                }

                float sdCircle( vec2 p, float r )
                {
                    return length(p) - r;
                }

                float sdBox( in vec2 p, in vec2 b )
                {
                    vec2 d = abs(p)-b;
                    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
                }

                float sdEquilateralTriangle( in vec2 p, in float r )
                {
                    const float k = sqrt(3.0);
                    p.x = abs(p.x) - r;
                    p.y = p.y + r/k;
                    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
                    p.x -= clamp( p.x, -2.0*r, 0.0 );
                    return -length(p)*sign(p.y);
                }

                float sdHexagon( in vec2 p, in float r )
                {
                    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
                    p = abs(p);
                    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
                    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
                    return length(p)*sign(p.y);
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
                diffuseColor.a = vAlpha;

                float l = 0.0;
                float n = fbm( vUv.xy * 20.0 , 2) * .025;
                vec2 tuv = vUv.xy *2.0 - 1.0;
                tuv += vec2(n);

                if( variant == 0.0 ) 
                    l = 1.0 - step(0.0, sdCircle(tuv, 0.85));
                else if( variant == 1.0 )
                    l = 1.0 - step(0.0, sdBox(tuv, vec2(0.85, 0.85)));
                else if( variant == 2.0 )
                    l = 1.0 - step(0.0, sdEquilateralTriangle(tuv, 0.7));
                else if( variant == 3.0 )
                    l = 1.0 - step(0.0, sdHexagon(tuv, 0.8));
                else if( variant == 4.0 )
                    l = 1.0 - step(0.0, sdBox(tuv, vec2(0.85 * .5, 0.85)));
                else if( variant == 5.0 )
                    l = 1.0;

                
                vec2 circUVs = rotateUV( vPositionW.xy*2.0 + vOffset , .78, 0.0);
                float csize = fbm( vPositionW.xy * .1, 2);
                float circle = sdCircle(fract( circUVs) * 2.0 - 1.0, csize);
                diffuseColor.a *= l * step( 0.0, circle );

          ` 
            );



        };
    }
}

export { StampMaterial};