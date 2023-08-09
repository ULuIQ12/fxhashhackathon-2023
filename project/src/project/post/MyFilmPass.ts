
import { ShaderMaterial, UniformsUtils } from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { MyFilmShader } from './MyFilmShader';
//import { MyFilmShader } from 'three/examples/jsm/shaders/FilmShader.js';

class MyFilmPass extends Pass {

	uniforms:any;
	material:any;
	fsQuad:any;
	renderToScreen:any;
	clear:any;

	constructor( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

		super();

		MyFilmShader
		if ( MyFilmShader === undefined ) console.error( 'no film shader ?' );

		const shader = MyFilmShader;

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
		if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
		if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
		if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		//this.uniforms[ 'time' ].value += deltaTime;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			this.fsQuad.render( renderer );

		}

	}

}

export { MyFilmPass };
