import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

class ModuleMaterial extends MeshBasicMaterial
{
    
    
    uniforms:any;
    onBeforeCompile:any;
    constructor(parameters:MeshBasicMaterialParameters)
    {
        super(parameters);
        this.uniforms = {
            
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

                varying vec2 vUv;
                varying vec3 vPositionW;

                float sdTriangleIsosceles( in vec2 p, in vec2 q )
                {
                    p.x = abs(p.x);
                    vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
                    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
                    float s = -sign( q.y );
                    vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                                vec2( dot(b,b), s*(p.y-q.y)  ));
                    return -sqrt(d.x)*sign(d.y);
                }
    
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

                vec2 tuv = vUv.xy *2.0 - 1.0; 
                tuv.y*= -1.0;
                tuv.y += 0.75;
                
                float triangle = sdTriangleIsosceles( tuv.xy, vec2(0.8, 1.5) );
                diffuseColor.rgb = mix( vec3(1.0), diffuseColor.rgb, step(0.0, triangle) );
                
          ` 
            );

            //console.log( shader.vertexShader);


        };
    }
}

export {ModuleMaterial};