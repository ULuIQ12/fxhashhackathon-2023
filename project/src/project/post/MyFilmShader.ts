import { RandTexGen } from "../../helpers/RandTexGen";

const MyFilmShader = {

	uniforms: {


		'tDiffuse': { value: null },
		'time': { value: 0.0 },
		'nIntensity': { value: 0.5 },
		'sIntensity': { value: 0.05 },
		'sCount': { value: 4096 },
		'grayscale': { value: 1 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		#include <common>

		// control parameter
		uniform float time;

		uniform bool grayscale;

		// noise effect intensity value (0 = no effect, 1 = full effect)
		uniform float nIntensity;

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		uniform float sIntensity;

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		uniform float sCount;

		uniform sampler2D tDiffuse;


		varying vec2 vUv;


        float gain(float x, float k) 
        {
            float a = 0.5*pow(2.0*((x<0.5)?x:1.0-x), k);
            return (x<0.5)?a:1.0-a;
        }

		void main() {

		// sample the source
			vec4 cTextureScreen = texture2D( tDiffuse, vUv );

		// make some noise
			float dx = rand( vUv + time );
			

		// add noise
			vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );


		// interpolate between source and result by intensity

			cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );

		// convert to grayscale if desired
			if( grayscale ) {

				cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );

			}
			gl_FragColor =  vec4( cResult, cTextureScreen.a ) ;

		}`,

};

export { MyFilmShader };