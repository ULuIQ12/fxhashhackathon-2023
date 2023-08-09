class Features {

    static feats:Object = {};

    static addFeature( featureName:string, value:any )
    {
        this.feats[featureName] = value;
    }
}

export {Features};