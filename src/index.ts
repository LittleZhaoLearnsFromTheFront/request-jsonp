const defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null,
};

function getRandomCallbackName() {
    return `jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
}

function clearFunction(functionName: string) {

    try {
        delete window[functionName];
    } catch (e) {
        window[functionName] = undefined;
    }
}

function removeScript(scriptId) {
    const script = document.getElementById(scriptId);
    if (script) {
        document.getElementsByTagName('head')[0].removeChild(script);
    }
}
export type JsonpOptions = {
    timeout?: number
    jsonpCallback?: string
    jsonpCallbackName?: string
    params?: { [key: string]: string }
}
function requestJsonp(_url: string, options: JsonpOptions = {}) {
    //请求地址
    let url = _url;
    const timeout = options.timeout || defaultOptions.timeout;
    const jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    let timeoutId;

    return new Promise((resolve, reject) => {
        const jsonpCallbackName = options.jsonpCallbackName || getRandomCallbackName();
        const scriptId = `${jsonpCallback}_${jsonpCallbackName}`;

        window[jsonpCallbackName] = (response: any) => {
            resolve(response);

            if (timeoutId) clearTimeout(timeoutId);

            removeScript(scriptId);

            clearFunction(jsonpCallbackName);
        };


        const jsonpScript = document.createElement('script');
        const query = new URLSearchParams()
        query.append(jsonpCallback, jsonpCallbackName)
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                query.append(key, value)
            })
        }
        jsonpScript.setAttribute('src', `${url}?${query.toString()}`);

        jsonpScript.id = scriptId;
        document.getElementsByTagName('head')[0].appendChild(jsonpScript);

        timeoutId = setTimeout(() => {
            reject(new Error(`JSONP request to ${_url} timed out`));

            clearFunction(jsonpCallbackName);
            removeScript(scriptId);
            window[jsonpCallbackName] = () => {
                clearFunction(jsonpCallbackName);
            };
        }, timeout);

        jsonpScript.onerror = () => {
            reject(new Error(`JSONP request to ${_url} failed`));

            clearFunction(jsonpCallbackName);
            removeScript(scriptId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    });
}

export default requestJsonp;
