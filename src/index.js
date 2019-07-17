const m = require('mithril');

// d3-selection must be required separately first to ensure live-bound
// reference to d3-selection.event works
const d3 = require('d3-selection');
Object.assign(d3, require('d3-force'), require('d3-drag'));

const { Pokedex } = require('pokeapi-js-wrapper');

const { About } = require('./about');
const { Simulation } = require('./simulation');
const { Draw } = require('./draw');
const { Model } = require('./model');
const { TYPES, LOAD_INTERVAL } = require('./constant');
const { GENERATIONS, Generation } = require('./generation');
const { ImageCache } = require('./image_cache');
const { Image } = require('./image');
const { Data } = require('./data');
const { ForceData } = require('./force_data');
const { Search } = require('./search');

const Visualisation = {
    oncreate: ({ dom, attrs: { draw, imageSet } }) => draw.render(
        dom, imageSet),
    onupdate: ({ dom, attrs: { draw, imageSet } }) => draw.render(
        dom, imageSet),
    view: () => m('svg.w-100.h-100'),
};

function isNight() {
    return new Date().getHours() < 6 || new Date().getHours() > 18;
}

const Page = {
    view: ({ attrs: { model, draw, generation, data_provider }}) => m(
        '.avenir.flex.flex-column.pa2.w-100.h-100.no-select',
        {
            class: isNight() ?
            'bg-near-black near-white' :
            'bg-near-white near-black',
        },
        m(
            '.flex.flex-wrap.justify-between',
            m(
                '.f3',
                'Link threshold:',
                m('input[type=number].bg-transparent.b--transparent.tc.f4', {
                    class: isNight() ?  'near-white' : 'near-black',
                    value: model.threshold,
                    oninput: e => model.threshold = +e.target.value,
                    min: 1,
                    max: data_provider.maxSharedMoves(),
                })
            ),
            data_provider.isLoading() ? m('', 'Loading') : null,
            m(
                '.f7.f5-ns.flex.flex-wrap',
                GENERATIONS.map(gen => m(
                    DoubleClickButton,
                    {
                        text: `${generation.toString(gen)}`,
                        isActive: model.isActiveGeneration(gen),
                        onclick: () => model.toggleGeneration(gen),
                        ondoubleclick: () => model.focusGeneration(gen),
                    },
                )),
            ),
            m(
                '.f3',
                'Sprites',
                m(
                    'select.bg-transparent.b--transparent.f4',
                    {
                        class: isNight() ?
                        'near-white' :
                        'near-black',
                        onchange: e => model.imageSet = e.target.value,
                    },
                    image.validImageSets(model.generations).map(imageSet => m(
                        'option',
                        {
                            value: imageSet,
                            selected: model.imageSet === imageSet,
                        },
                        image.toString(imageSet),
                    ))),
            ),
            m(
                '.f7.f5-ns.flex.flex-wrap',
                TYPES.map(type => m(
                    DoubleClickButton,
                    {
                        text: type,
                        isActive: model.isActiveType(type),
                        onclick: () => model.toggleType(type),
                        ondoubleclick: () => model.focusType(type),
                    }
                )),
            ),
        ),
        m(Visualisation, { draw, imageSet: model.imageSet }),
    ),
};

const DoubleClickButton = {
    oninit: ({ state }) => state.pendingClick = null,
    view: ({ state, attrs: { text, isActive, onclick, ondoubleclick } }) => m(
        '.black.br-pill.ba.b--purple.pa1.pa2-ns.ma1',
        {
            class: isActive ? 'bg-white' : 'bg-gray',
            onclick: e => {
                if (state.pendingClick !== null) {
                    clearTimeout(state.pendingClick);
                    state.pendingClick = null;
                }

                if (e.detail === 1) {
                    state.pendingClick = setTimeout(() => {
                        onclick();
                        m.redraw();
                    }, 200);
                } else {
                    ondoubleclick();
                }
            },
        },
        text
    ),
};

class Shiny {
    constructor() {
        this._shinyIndex = Math.floor(Math.random() * 8000);
    }

    check(pokemonId) {
        return pokemonId === this._shinyIndex;
    }
}

const shiny = new Shiny();
const generation = new Generation();
const imageCache = new ImageCache(m.request);
const image = new Image(generation, imageCache, shiny);
const search = new Search(generation);
const model = new Model(m.redraw, generation, image);
const forceData = new ForceData();
const pokedex = new Pokedex({ protocol: 'https' });
const data_provider = new Data(pokedex, m.redraw, model, search, generation,
    requestAnimationFrame.bind(window), LOAD_INTERVAL);
const simulation = new Simulation(d3, forceData, model);
const draw = new Draw(d3, simulation, model, data_provider, image);

window.addEventListener('resize', () => {
    m.redraw();
});

m.route(document.body, '/', {
    '/': {
        render: () => m(
            Page,
            { model, draw, generation, data_provider }
        ),
    },
    '/about': About,
});
