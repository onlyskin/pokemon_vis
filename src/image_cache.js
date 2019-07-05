const LOW = 'low';
const HIGH = 'high';
const SHINY = 'shiny';

class ImageCache {
    constructor(request) {
        this._request = request;
        this._pending = new Set();
        this._loaded = {};
    }

    low(setPath, generation) {
        return this._loaded[this._imageKey(setPath, generation, LOW)];
    }

    high(setPath, generation, shiny) {
        return this._loaded[this._imageKey(setPath, generation, HIGH, shiny)];
    }

    get emptyUrl() {
        return URL.createObjectURL(new Blob());
    }

    loadedLow(setPath, generation) {
        return this._isLoaded(setPath, generation, LOW);
    }

    loadedHigh(setPath, generation, shiny) {
        return this._isLoaded(setPath, generation, HIGH, shiny);
    }

    _imageKey(setPath, generation, quality, shiny) {
        const shinyPart = shiny === true ? SHINY : '';
        return `${setPath}${generation}${quality}${shinyPart}`;
    }

    _isLoaded(setPath, generation, quality, shiny) {
        const imageKey = this._imageKey(setPath, generation, quality, shiny);

        if (this._pending[imageKey]) {
            return false;
        }

        if (this._loaded[imageKey] === undefined) {
            this._pending[imageKey] = true;

            this._request({
                url: this._urlFrom(setPath, generation, quality, shiny),
                config: xhr => {
                    xhr.responseType = 'blob';
                    return xhr;
                },
                extract: xhr => {
                    return {
                        status: xhr.status,
                        data: URL.createObjectURL(xhr.response),
                    };
                },
            }).then(extracted => {
                if (extracted.status === 200) {
                    this._loaded[imageKey] = extracted.data;
                } else if (extracted.status === 404) {
                    this._loaded[imageKey] = this.emptyUrl;
                }
                this._pending[imageKey] = false;
            });

            return false;
        }

        return true;
    }

    _urlFrom(setPath, generation, quality, shiny) {
        const shinyPart = shiny ? `-${SHINY}` : '';
        return `${env.IMAGES_URL}/${setPath}${shinyPart}/${generation}-${quality}.png`;
    }
}

module.exports = {
    ImageCache,
};
