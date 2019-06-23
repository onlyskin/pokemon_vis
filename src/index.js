const m = require('mithril');
const stream = require('mithril/stream');

const { simulate } = require('./simulation');
const { draw } = require('./draw_force');
const { loadForceData } = require('./pokedex');

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
    oncreate: ({ dom, attrs: { data, threshold, simulation } }) => draw(
        dom, simulation, threshold, data),
    onupdate: ({ dom, attrs: { data, threshold, simulation } }) => draw(
        dom, simulation, threshold, data),
    view: () => m('svg'),
};

const Page = {
    view: ({ attrs: { data, threshold, simulation }}) => m(
        '.avenir.flex.flex-column.items-center.bg-black.white.pa2.w-100.h-100',
        m(Visualisation, { data, threshold: threshold(), simulation }),
        m(
            '',
            'Link threshold:',
            m('input[type=number]', {
                value: threshold(),
                oninput: ({ target: { value } }) => threshold(+value),
                min: 1,
                max: 20,
            })
        ),
    ),
};

const threshold = stream(6);
const data = stream({ nodes: [], links: [] });
loadForceData()
    .then(forceData => {
        data(forceData);
        m.redraw();
    });

const simulation = simulate();

window.addEventListener('resize', () => {
    m.redraw();
});

m.route(document.body, '/', {
    '/': {
        render: () => m(Page, { data: data(), threshold, simulation }),
    },
    '/about': About,
});
