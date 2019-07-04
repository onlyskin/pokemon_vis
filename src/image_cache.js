const LOW = 'low';
const HIGH = 'high';

class ImageCache {
    constructor(request) {
        this._request = request;
        this._pending = new Set();
        this._loaded = {};
    }

    low(setPath, generation) {
        return this._loaded[this._imageKey(setPath, generation, LOW)];
    }

    high(setPath, generation) {
        return this._loaded[this._imageKey(setPath, generation, HIGH)];
    }

    get emptyUrl() {
        return URL.createObjectURL(new Blob());
    }

    loadedLow(setPath, generation) {
        return this._isLoaded(setPath, generation, LOW);
    }

    loadedHigh(setPath, generation) {
        return this._isLoaded(setPath, generation, HIGH);
    }

    _imageKey(setPath, generation, quality) {
        return `${setPath}${generation}${quality}`;
    }

    _isLoaded(setPath, generation, quality) {
        const imageKey = this._imageKey(setPath, generation, quality);

        if (this._pending[imageKey]) {
            return false;
        }

        if (this._loaded[imageKey] === undefined) {
            this._pending[imageKey] = true;

            this._request({
                url: this._urlFrom(setPath, generation, quality),
                config: xhr => {
                    xhr.responseType = 'blob';
                    return xhr;
                },
                extract: xhr => {
                    return URL.createObjectURL(xhr.response);
                },
            }).then(data => {
                this._loaded[imageKey] = data;
                this._pending[imageKey] = false;
            }).catch(e => {
                console.warn(e);
                this._pending[imageKey] = false;
            });

            return false;
        }

        return true;
    }

    _urlFrom(setPath, generation, quality) {
        return `${env.IMAGES_URL}/${setPath}/${generation}-${quality}.png`;
    }
}

module.exports = {
    ImageCache,
};
