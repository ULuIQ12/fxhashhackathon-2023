import { MeshBasicMaterial, MeshBasicMaterialParameters, Texture } from "three";
import { RandTexGen } from "../../../helpers/RandTexGen";


class RibbonMaterial extends MeshBasicMaterial
{
    uniforms:any;
    onBeforeCompile:any;
    randTex:Texture;
    constructor(parameters:MeshBasicMaterialParameters, perlinOptions:any = null)
    {
        parameters.alphaTest = 0.05;
        parameters.forceSinglePass = true;
        //parameters.depthWrite = false;
        //parameters.depthTest = false;
        //parameters.wireframe = true;
        super(parameters);

        

        if( perlinOptions == null)
        {
            this.randTex = RandTexGen.GetTex();
            this.uniforms = {
                randTex:{value:this.randTex},
                usePerlin:{value:0},
                perlinFreq:{value:0},
                perlinAmp:{value:0},
                perlinOct:{value:0},
            }
        }
        else 
        {
            this.randTex = RandTexGen.GetUniqueTex();
            this.uniforms = {
                randTex:{value:this.randTex},
                usePerlin:{value:1},
                perlinFreq:{value:perlinOptions.frequency},
                perlinAmp:{value:perlinOptions.amplitude},
                perlinOct:{value:perlinOptions.octaves},
            }
        }

        this.onBeforeCompile = (shader, renderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>

                attribute float alpha;
                attribute float width;
                varying float vAlpha;
                varying float vWidth;
                varying vec2 vUv;
                varying vec3 vPositionW;
                                              
          `

            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>

                vAlpha = alpha;
                vWidth = width;
                vUv = uv;
                vPositionW = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
           
                
          `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                uniform sampler2D randTex;
                uniform float usePerlin;
                uniform float perlinFreq;
                uniform float perlinAmp;
                uniform float perlinOct;

                varying float vAlpha;
                varying float vWidth;
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
                        _st = rot * _st * 2.0;// + SHIFT;
                        a *= 0.5;
                    }
                    return v;
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

                float sdCircle( vec2 p, float r )
                {
                    return length(p) - r;
                }
    
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>
                
                vec2 tuv = vUv * 2.0 - 1.0;
                
                float mWidth =vWidth;
                if( vWidth > 0.0 ) 
                    tuv.x /= mWidth;
                
                tuv.x *= 100.0;
                tuv.y *= 100.0;
                float n = fbm(tuv, 2);

                /*
                vec2 suv = rotateUV( vPositionW.xy, .78, vec2(0.0) );
                vec2 suv2 = suv.xy;
                suv *=.05;
                suv2.y *= 100.0;
                float sn = (fbm(suv, 2) + fbm(suv2, 3)) * 0.5;
                */
                
                vec2 widthNoiseUV = vUv * 500.0;
                float widthNoise =  step( 0.1, cubicPulse(0.5, (0.5 - fbm(widthNoiseUV, 2)*.2) * vWidth, vUv.x ) );

                float amp = widthNoise;
                amp -= step(0.55, n);
                //amp -= step( 0.6, sn);

                if( usePerlin > 0.0 )
                {
                    int o = int(perlinOct);
                    vec2 guv = vPositionW.xy * perlinFreq * 20.0;
                    float pat = fbm(guv, o);
                    amp -= step( perlinAmp , fract( pat*10.0) );
                }

                diffuseColor.a = vAlpha * max(0.0,amp);

                //diffuseColor.rgb = vec3( vUv.x,0.0, 0.0);

          ` 
            );




            //console.log( shader.vertexShader);


        };
    }

    dispose() 
    {
        this.randTex.dispose();
        super.dispose();
    }

}

export { RibbonMaterial };