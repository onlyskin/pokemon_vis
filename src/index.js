const m = require('mithril');
const stream = require('mithril/stream');

const { simulate } = require('./simulation');
const { draw } = require('./draw_force');

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
    oncreate: ({ dom, attrs: { threshold, simulate } }) => draw(dom, simulate, threshold),
    onupdate: ({ dom, attrs: { threshold, simulate } }) => draw(dom, simulate, threshold),
    view: ({ attrs: { threshold, simulate }}) => m('svg'),
};

const Page = {
    view: ({ attrs: { threshold, simulate }}) => m(
        '.avenir.flex.flex-column.items-center.bg-black.white.ma2',
        m('div#svg_container',
            m(Visualisation, { threshold, simulate }),
            m(
                '',
                'Link threshold:',
                m('input[number]', {
                    oninput: ({ target: { value } }) => threshold(value),
                    'min': '1',
                    'max': '20',
                })
            ),
        )
    ),
};

const threshold = stream(6);

m.route(document.body, '/', {
    '/': {
        render: () => m(Page, { threshold, simulate }),
    },
    '/about': About,
});
