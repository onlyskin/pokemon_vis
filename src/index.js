const m = require('mithril');
const { Pokedex } = require('pokeapi-js-wrapper');

const { Simulation } = require('./simulation');
const { draw } = require('./draw');
const { Model } = require('./model');
const { TYPES } = require('./constant');
const { Generation } = require('./generation');
const { Image } = require('./image');
const { Data } = require('./data');
const { ForceData } = require('./force_data');
const { Search } = require('./search');

const About = {
    view: () => m(
        '.avenir.flex.flex-column.bg-black.white.ma2',
        m(
            '.fw5.f3',
            'A force directed graph created with D3.js: visually mapping links between Pokémon based on the number of shared moves in their movesets.'
        ),
        m('.mv2',
            [
                'Two Pokémon will have a link drawn between them if the number of moves they share is',
                m('em',
                    'more than or equal to'
                ),
                'the threshold. For example, as Bulbasaur, Ivysaur and Venusaur all share the same 14 moves in their moveset, if you set the threshold to 14 or less, they will have links drawn between them, but if the threshold is set any higher than 14 there will be no link drawn.'
            ]
        ),
        m('.mv2',
            'Hover over a specific link to find out which moves the two pokemon share!'
        ),
        m('.mv2',
            'The higher you set the threshold, the fewer links will be drawn. This is because fewer Pokémon share so many of their moves with other Pokémon.'
        ),
        m('.mv2',
            'You can adjust the threshold for the number of shared moves needed using the input box below.'
        ),
        m('.mv2',
        ),
        m('.mv2',
            'You can drag Pokémon around using the mouse.'
        ),
    ),
};

const Visualisation = {
    oncreate: ({ dom, attrs: { model, simulation, data_provider } }) => draw(
        dom, simulation, model, data_provider ),
    onupdate: ({ dom, attrs: { model, simulation, data_provider } }) => draw(
        dom, simulation, model, data_provider ),
    view: () => m('svg.w-100.h-100'),
};

const Page = {
    view: ({ attrs: { model, simulation, generation, data_provider }}) => m(
        '.avenir.flex.flex-column.pa2.w-100.h-100',
        {
            class: new Date().getHours() < 6 || new Date().getHours() > 18 ?
            'bg-near-black near-white' :
            'bg-near-white near-black',
        },
        m(
            '.flex.flex-wrap.justify-between',
            m(
                '.f3',
                'Link threshold:',
                m('input[type=number].bg-transparent.b--transparent.tc.f4', {
                    class: new Date().getHours() < 6 || new Date().getHours() > 18 ?
                    'near-white' :
                    'near-black',
                    value: model.threshold,
                    oninput: ({ target: { value } }) => model.threshold = +value,
                    min: 1,
                    max: 20,
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
                        class: new Date().getHours() < 6 || new Date().getHours() > 18 ?
                        'near-white' :
                        'near-black',
                        onchange: ({ target: { value } }) =>
                        model.imageSet = value,
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
                TYPES.map(type => m(
                    '.black.br-pill.ba.b--purple.pa2.ma1',
                    {
                        class: model.isActiveType(type) ? 'bg-white' : 'bg-gray',
                        onclick: () => model.toggleType(type),
                    },
                    type
                )),
            ),
        ),
        m(Visualisation, { model, simulation, data_provider }),
    ),
};

const generation = new Generation();
const image = new Image();
const search = new Search(generation);
const model = new Model(m.redraw, generation, image);
const forceData = new ForceData();
const pokedex = new Pokedex({ protocol: 'https' });
const data_provider = new Data(pokedex, m.redraw, model, search);
const simulation = new Simulation(forceData);

window.addEventListener('resize', () => {
    m.redraw();
});

m.route(document.body, '/', {
    '/': {
        render: () => m(Page, { model, simulation, generation, data_provider }),
    },
    '/about': About,
});
