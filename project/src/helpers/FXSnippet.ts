class FXSnippet
{
  hash: String; // a random 64 characters hexadecimal string. This particular variable will be hardcoded with a static hash when someone mints a token from your GT
  rand: () => Number; // a PRNG function seeded with the hash, that generates deterministic PRN between 0 and 1
  minter: String; // The string of the wallet address of the minter injected into the iteration
  context:string;
  randminter: () => Number; // a PRNG function seeded with the minter address that generates deterministic PRN between 0 and 1
  preview: () => void; // trigger for capture module
  isPreview: Boolean; // is TRUE when capture module is running the project
  params: (definitions) => void; // sets your projects fx(params) definitions
  getParam: (id: String) => any; // get transformed fx(params) value by id
  getParams: () => any; // get all transformed fx(params) values
  getRawParam: (id: String) => any; // get raw fx(params) value by id
  getRawParams: () => any; // get all raw fx(params) values
  getDefinitions: () => any; // get all fx(params) definitions
  features: (features) => void; // sets your projects features
  getFeature: (id: String) => any; // get feature by id
  getFeatures: () => any; // get all features
  stringifyParams: (definitions) => string; // JSON.stringify that can handle bigint
  iteration:number;
  emit:any;
  on:any;
}

enum FXContext 
{
  MINTING = "minting",
  STANDALONE = "standalone",
  CAPTURE = "capture",
}

export {FXSnippet, FXContext};