const m = require('mithril');

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

module.exports = {
    DoubleClickButton,
};
