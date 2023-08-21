import { AdditiveBlending, Color, MeshBasicMaterial, MultiplyBlending, Vector3 } from "three";
import { RandTexGen } from "../../../helpers/RandTexGen";

/**
 * Lifted nearly straight from Clutch at the last minute
 */
class OverlayDistressMat extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;

    constructor(parameters)
    {
        parameters.transparent = true;
        //parameters.alphaTest = 0.9;
        parameters.depthTest = false;
        parameters.depthWrite = false;
        super(parameters);
        
        this.uniforms = {
            randTex:{value:RandTexGen.GetTex()},
            aspect:{value:1},
        }

        this.onBeforeCompile = (shader, renderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>
                attribute vec2 roffset;
                varying vec2 vUv;
                varying vec4 vPosition;
                varying vec3 vPositionW;
          `

            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>

                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                vPosition = gl_Position;
                vPositionW = (vec3(modelMatrix * vec4(position, 1.0)).xyz);
          
          `


            );

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                varying vec2 vUv;
                varying vec4 vPosition;
                varying vec3 vPositionW;
                uniform sampler2D randTex;
                uniform float aspect;
                uniform vec3 noiseTint;

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

                float gain(float x, float k) 
                {
                    float a = 0.5*pow(2.0*((x<0.5)?x:1.0-x), k);
                    return (x<0.5)?a:1.0-a;
                }

                float cubicPulse( float c, float w, float x )
                {
                    x = abs(x - c);
                    if( x>w ) return 0.0;
                    x /= w;
                    return 1.0 - x*x*(3.0-2.0*x);
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

                #define ROTMAT mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                #define SHIFT vec2(100.0);

                float fbm ( in vec2 _st) {
                    float v = 0.0;
                    float a = 0.5;
                    mat2 rot = ROTMAT;
                    for (int i = 0; i < 5; ++i) {
                        v += a * abs( hash21B(_st) * 2.0 - 1.0);
                        _st = rot * _st * 2.25 + SHIFT;
                        a *= 0.5;
                    }
                    return v;
                }

                float fbmline( in vec2 _st) {
                    float v = 0.0;
                    float a = 0.5;
                    mat2 rot = ROTMAT;
                    for (int i = 0; i < 5; ++i) {
                        v += a * hash21B(_st);
                        _st = rot * _st * 2.5 + SHIFT;
                        a *= 0.4;
                    }
                    return v;
                }
          `
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>
                                
                vec2 holeDistSt = vPositionW.xy * 0.005;
                holeDistSt = rotateUV(holeDistSt, 0.0, PI / 8.0);
                float holeDist = fbm( holeDistSt);
                holeDist = smoothstep( 0.25,1.25,holeDist);

                vec2 holesSt = vPositionW.xy * 500.0;
                holesSt = rotateUV(holesSt, 0.5, PI / 8.0);
                float holes = step( holeDist, hash21B(holesSt) );                
                
                int myindex = 0;
                float totalLines = 0.0;
                int nbLines = 5;
                for( myindex=0;myindex<nbLines;myindex++)
                {
                    vec2 lineSt = vPositionW.xy * 1.5 ;
                    float fi = float( myindex);
                    lineSt = rotateUV(lineSt,( fi*10.0 ), 0.5  );
                    
                    float lineOffset = fbmline(lineSt + vec2(fi, fi*0.5) );
                    lineOffset = gain( lineOffset, 0.5) * 2.0 - 1.0;
                    float cx = ((fi/float(nbLines)) *2.0 -1.0) * 15.0;
                    //float lineFactor = step( 0.5, cubicPulse( cx, 0.005, lineSt.x + lineOffset * 1.0) );
                    float lineFactor = step( 0.5, cubicPulse( cx, 0.01, lineSt.x + lineOffset * 1.0) );
                    totalLines = min(1.0, totalLines + lineFactor);
                }
                
                diffuseColor.a = clamp(1.0 - holes + totalLines, 0.0, 1.0 );
                
          `
            );



        };

    }
}

export {OverlayDistressMat};