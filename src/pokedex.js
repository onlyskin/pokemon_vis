const { Pokedex } = require('pokeapi-js-wrapper');

const ERROR = 'ERROR'
const SUCCESS = 'SUCCESS'
const LOADING = 'LOADING'

class AsyncPokedex {
    constructor(notify = () => {}) {
        this._pokedex = new Pokedex({ protocol: 'https' })
        this._notify = notify

        this._cache = new Map()
        this._pending = new Set()
    }

    getPokemonsList() {
        return this._fromCache(`api/v2/pokemon?limit=2000`, response =>
            response.results.map(resource => resource.name))
    }

    getPokemonByName(name) {
        return this._fromCache(`api/v2/pokemon/${name}`)
    }

    _fromCache(path, transform) {
        if (this._cache.has(path)) {
            return this._cache.get(path)
        }

        if (!this._pending.has(path)) {
            this._apiFetch(path, transform)
        }

        return {
            status: LOADING,
            value: null,
        }
    }

    async _apiFetch(path, transform = x => x) {
        this._pending.add(path)

        let status
        let value
        try {
            value = transform(await this._pokedex.resource(path))
            status = SUCCESS
        } catch (e) {
            try {
                value = e.response.status
            } catch (e) {
                value = null
            }
            status = ERROR
        }

        this._cache = this._cache.set(path, { status, value })

        this._pending.delete(path)

        this._notify()
    }

    _asSet(result) {
        if (result.status === SUCCESS) {
            return {
                status: result.status,
                value: new Set(result.value),
            }
        } else {
            return result
        }
    }
}

module.exports = {
    AsyncPokedex,
    ERROR,
    SUCCESS,
    LOADING,
}
