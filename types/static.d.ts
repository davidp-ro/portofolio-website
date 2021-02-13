interface ImportMeta {
  hot: any;
}

// Global gtag functon
declare let gtag: function;

/**
 * Get a random (attractive) color
 * 
 * @url https://www.npmjs.com/package/randomcolor
 * 
 * @example randomColor() // will return a hex color
 * 
 * @example randomColor({luminosity: "dark"}) // options (see docs)
 */
declare let randomColor: function;

/* CSS MODULES */
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.styl" {
  const classes: { [key: string]: string };
  export default classes;
}

/* CSS */
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.less";
declare module "*.styl";

/* IMAGES */
declare module "*.svg" {
  const ref: string;
  export default ref;
}
declare module "*.bmp" {
  const ref: string;
  export default ref;
}
declare module "*.gif" {
  const ref: string;
  export default ref;
}
declare module "*.jpg" {
  const ref: string;
  export default ref;
}
declare module "*.jpeg" {
  const ref: string;
  export default ref;
}
declare module "*.png" {
  const ref: string;
  export default ref;
}