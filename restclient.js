const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retryDelay: () => 20, retries: 3, retryCondition: axiosRetry.isRetryableError });

class RestClient {
    constructor(options) {
        this.baseURL = options.baseURL;
        this.headers = options.headers;
    }

    buildPath(path) {
        return [this.baseURL, path].join('/');
    }

    buildPathToSyncAPI(path) {
        return [this.baseURL.replace('/v2', '/v1'), path].join('/');
    }

    static request(method, url, data, options = {}) {
        console.log("******************************************************")
        console.log(method)
        console.log(url)
        console.log(data)
        console.log("******************************************************")

        // Sometimes, its observed that Import operation takes time. So setting timeout to 60 seconds
        return axios({
            method,
            url,
            headers: options.headers,
            data, timeout: 120000
        })
            .then(response => response.data)
            .catch((error) => {
                const errorMessage = error.message;
                const responseData = error.response && error.response.data;
                throw new Error(`${errorMessage}${
                    responseData
                    && typeof responseData === 'object'
                        ? `: ${JSON.stringify(responseData)}`
                        : ''}`);
            });
    }

    create(path, data, options = { headers: this.headers }) {
        return RestClient.request('POST', this.buildPath(path), data, options);
    }

    retrieve(path, options = { headers: this.headers }) {
        return RestClient.request('GET', this.buildPath(path), {}, options);
    }

    update(path, data, options = { headers: this.headers }) {
        return RestClient.request('PUT', this.buildPath(path), data, options);
    }

    delete(path, data, options = { headers: this.headers }) {
        return RestClient.request('DELETE', this.buildPath(path), data, options);
    }

    retrieveSyncAPI(path, options = { headers: this.headers }) {
        return RestClient.request('GET', this.buildPathToSyncAPI(path), {}, options);
    }
}

module.exports = RestClient;
