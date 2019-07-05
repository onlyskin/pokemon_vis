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
const { Generation } = require('./generation');
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
            m(
                '.f5.flex.flex-wrap',
                generation.generations.map(gen => m(
                    '.black.br-pill.ba.b--purple.pa2.ma1',
                    {
                        class: model.isActiveGeneration(gen) ?
                        'bg-white' :
                        'bg-gray',
                        onclick: () => model.toggleGeneration(gen),
                    },
                    `${generation.toString(gen)}`,
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
                '.f5.flex.flex-wrap',
                TYPES.map(type => m(TypeButton, { type, model })),
            ),
        ),
        m(Visualisation, { draw, imageSet: model.imageSet }),
    ),
};

const TypeButton = {
    oninit: ({ state }) => state.pendingClick = null,
    view: ({ state, attrs: { type, model } }) => m(
        '.black.br-pill.ba.b--purple.pa2.ma1',
        {
            class: model.isActiveType(type) ?
            'bg-white' :
            'bg-gray',
            onclick: e => {
                if (state.pendingClick !== null) {
                    clearTimeout(state.pendingClick);
                    state.pendingClick = null;
                }

                if (e.detail === 1) {
                    state.pendingClick = setTimeout(() => {
                        model.toggleType(type);
                        m.redraw();
                    }, 200);
                } else {
                    model.focusType(type);
                }
            },
        },
        type
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
