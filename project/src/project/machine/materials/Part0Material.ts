import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

class Part0Material extends MeshBasicMaterial
{
    
    
    uniforms:any;
    onBeforeCompile:any;
    constructor(parameters:MeshBasicMaterialParameters)
    {
        parameters.alphaTest = 0.5;
        parameters.forceSinglePass = true;
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
                
    
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>

                vec2 tuv = vUv.xy *2.0 - 1.0; 
                float l = 1.0 - step(0.0, length(tuv) - 1.0 );
                //diffuseColor.rgb = vColor;
                diffuseColor.a = l;
                
          ` 
            );

            //console.log( shader.vertexShader);


        };
    }
}

export {Part0Material};