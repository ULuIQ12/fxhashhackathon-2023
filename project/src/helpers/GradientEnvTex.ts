    import { Vector2, Vector3, Spherical, Color, RGBAFormat, FloatType, EquirectangularReflectionMapping, RepeatWrapping, ClampToEdgeWrapping,LinearFilter, DataTexture } from "three";
    // adapted from https://github.com/gkjohnson/three-gpu-pathtracer
    const _uv = new Vector2();
	const _coord = new Vector2();
	const _polar = new Spherical();
	const _color = new Color();
	class ProceduralEquirectTexture extends DataTexture {

        generationCallback:any;
        image:any;
        needsUpdate:any;
        dispose:any;
        
		constructor( width, height ) {

			super(
				new Float32Array( width * height * 4 ),
				width, height, RGBAFormat, FloatType, EquirectangularReflectionMapping,
				RepeatWrapping, ClampToEdgeWrapping, LinearFilter, LinearFilter,
			);
			this.generationCallback = null;

		}

		update() {

			this.dispose();
			this.needsUpdate = true;

			const { data, width, height } = this.image;
			for ( let x = 0; x < width; x ++ ) {

				for ( let y = 0; y < height; y ++ ) {

					_coord.set( width, height );

					_uv.set( x / width, y / height );
					_uv.x -= 0.5;
					_uv.y = 1.0 - _uv.y;

					_polar.theta = _uv.x * 2.0 * Math.PI;
					_polar.phi = _uv.y * Math.PI;
					_polar.radius = 1.0;

					this.generationCallback( _polar, _uv, _coord, _color );

					const i = y * width + x;
					const i4 = 4 * i;
					data[ i4 + 0 ] = _color.r;
					data[ i4 + 1 ] = _color.g;
					data[ i4 + 2 ] = _color.b;
					data[ i4 + 3 ] = 1.0;

				}

			}

		}

		copy( other ) {

			super.copy( other );
			this.generationCallback = other.generationCallback;
			return this;

		}

	}

	const _direction = new Vector3();
	class GradientEnvTex extends ProceduralEquirectTexture {

        topColor:Color;
        bottomColor:Color;
        exponent:number;

		constructor( resolution = 512 ) {

			super( resolution, resolution );

			this.topColor = new Color().set( 0xffffff );
			this.bottomColor = new Color().set( 0x000000 );
			this.exponent = 2;
			this.generationCallback = ( polar, uv, coord, color ) => {

				_direction.setFromSpherical( polar );

				const t = _direction.y * 0.5 + 0.5;
				color.lerpColors( this.bottomColor, this.topColor, t ** this.exponent );

			};

		}

		copy( other ) {

			super.copy( other );

			this.topColor.copy( other.topColor );
			this.bottomColor.copy( other.bottomColor );
			return this;

		}

	}

    export {GradientEnvTex, ProceduralEquirectTexture};