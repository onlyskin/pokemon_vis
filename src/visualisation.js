const m = require('mithril');

const Visualisation = {
    oncreate: ({ dom, attrs: { draw, imageSet } }) => draw.render(
        dom, imageSet),
    onupdate: ({ dom, attrs: { draw, imageSet } }) => draw.render(
        dom, imageSet),
    view: () => m('svg.w-100.h-100'),
};

module.exports = {
    Visualisation,
};
