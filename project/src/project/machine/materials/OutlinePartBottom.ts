import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

class OutlinePartBottom extends MeshBasicMaterial
{
    
    
    uniforms:any;
    onBeforeCompile:any;
    constructor(parameters:MeshBasicMaterialParameters, variant:number = 0)
    {
        parameters.alphaTest = 0.5;

        super(parameters);
        this.uniforms = {
            variant: { value: variant },
            
        }

        this.onBeforeCompile = (shader, renderer) => {
            
            for (const uniformName of Object.keys(this.uniforms)) {
                shader.uniforms[uniformName] = this.uniforms[uniformName];
            }

            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>

                
                varying vec2 vUv;
                varying vec3 vPositionW;
                
                                              
          `

            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>

                vUv = uv; 
                vPositionW = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
           
                
          `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                `#include <common>

                uniform float variant;
                varying vec2 vUv;
                varying vec3 vPositionW;
                
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
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

                vec2 tuv = vUv.xy *2.0 - 1.0;
                float l = 0.0;
                if( variant == 0.0 ) 
                    l = 1.0 - step(0.0, sdCircle(tuv, 0.95));
                else if( variant == 1.0 )
                    l = 1.0 - step(0.0, sdBox(tuv, vec2(0.95, 0.95)));
                else if( variant == 2.0 )
                    l = 1.0 - step(0.0, sdEquilateralTriangle(tuv, 0.9));
                else if( variant == 3.0 )
                    l = 1.0 - step(0.0, sdHexagon(tuv, 0.9));
                
                diffuseColor.a = l;
                
          ` 
            );

            //console.log( shader.vertexShader);


        };
    }
}

export {OutlinePartBottom};