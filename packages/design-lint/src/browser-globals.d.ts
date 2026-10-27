/* A function passed to RenderedPage.evaluate runs in the browser. This package
   does not load the DOM types, so the browser globals that those functions use
   are declared loosely here. */
declare const document: any;
declare const window: any; // window.axe is set by the axe wrapper
declare const getComputedStyle: any;
