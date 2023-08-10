import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";

class StampMaterial extends MeshBasicMaterial
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

                varying float vAlpha;
                varying vec2 vUv;
                varying vec3 vPositionW;
    
          `
            );
            

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `#include <color_fragment>
                diffuseColor.a = vAlpha;
          ` 
            );



        };
    }
}

export { StampMaterial};