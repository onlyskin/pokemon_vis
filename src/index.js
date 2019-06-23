const m = require('mithril');

const { simulate } = require('./simulation');
const { draw } = require('./draw');
const { Model } = require('./model');

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
    oncreate: ({ dom, attrs: { model, simulation } }) => draw(
        dom, simulation, model.threshold, model.data, model.spriteUrl),
    onupdate: ({ dom, attrs: { model, simulation } }) => draw(
        dom, simulation, model.threshold, model.data, model.spriteUrl),
    view: () => m('svg.w-100.h-100'),
};

const Page = {
    view: ({ attrs: { model, simulation }}) => m(
        '.avenir.flex.flex-column.white.pa2.w-100.h-100',
        {
            class: new Date().getHours() < 6 || new Date().getHours() > 18 ?
            'bg-near-black' :
            'bg-near-white',
        },
        m(
            '.f3',
            'Link threshold:',
            m('input[type=number].bg-transparent.white.b--transparent.tc', {
                value: model.threshold,
                oninput: ({ target: { value } }) => model.threshold = +value,
                min: 1,
                max: 20,
            })
        ),
        m(
            '.f3',
            'Generation:',
            m('input[type=number].bg-transparent.white.b--transparent.tc', {
                value: model.generation,
                oninput: ({ target: { value } }) => model.generation = +value,
                min: 1,
                max: 2,
            })
        ),
        m(
            '.f3',
            'Sprites',
            m(
                'select',
                {
                    onchange: ({ target: { value } }) => model.imageSet = value,
                },
                model.imageSets.map(name => m(
                    'option',
                    {
                        value: name,
                        selected: model.imageSet === name,
                    },
                    name,
                ))),
        ),
        m(Visualisation, { model, simulation }),
    ),
};

const simulation = simulate();
const model = new Model();

window.addEventListener('resize', () => {
    m.redraw();
});

m.route(document.body, '/', {
    '/': {
        render: () => m(Page, { model, simulation }),
    },
    '/about': About,
});
