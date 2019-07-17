const m = require('mithril');

// d3-selection must be required separately first to ensure live-bound
// reference to d3-selection.event works
const d3 = require('d3-selection');
Object.assign(d3, require('d3-force'), require('d3-drag'));

const { Pokedex } = require('pokeapi-js-wrapper');

const { About } = require('./about');
const { Simulation } = require('./simulation');
const { Draw } = require('./draw');
const { Visualisation } = require('./visualisation');
const { Model } = require('./model');
const { TYPES, LOAD_INTERVAL } = require('./constant');
const { GENERATIONS, Generation } = require('./generation');
const { ImageCache } = require('./image_cache');
const { Image } = require('./image');
const { Data } = require('./data');
const { ForceData } = require('./force_data');
const { Search } = require('./search');
const { DoubleClickButton } = require('./double_click_button');
const { Shiny } = require('./shiny');

function isNight() {
    return new Date().getHours() < 6 || new Date().getHours() > 18;
}

const ThresholdSelect = {
    view: ({ attrs: { model, data_provider } }) => m(
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
};

const GenerationSelect = {
    view: ({ attrs: { model } }) => m(
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
};

const TypeSelect = {
    view: ({ attrs: { model } }) => m(
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
};

const SpriteSelect = {
    view: ({ attrs: { model, image } }) => m(
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
            )),
        ),
    ),
};

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
            m(ThresholdSelect, { model, data_provider }),
            data_provider.isLoading() ? m('', 'Loading') : null,
            m(GenerationSelect, { model }),
            m(SpriteSelect, { model, image }),
            m(TypeSelect, { model }),
        ),
        m(Visualisation, { draw, imageSet: model.imageSet }),
    ),
};

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
