/**
 * @description 基于 jquery 封装 ajax
 * @author milk
 */

(function(window, $) {
    // 方法将暴露到 window.ajax 下
    if (window.ajax != null) {
        console.error('window.ajax 被占用')
        return
    }
    window.ajax = {}

    // get 请求
    window.ajax.get = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('get', url, params, callback)
    }
    // post 请求
    window.ajax.post = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('post', url, params, callback)
    }
    // patch 请求
    window.ajax.patch = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('patch', url, params, callback)
    }
    // delete 请求
    window.ajax.delete = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('delete', url, params, callback)
    }
    // 上传文件
    window.ajax.upload = function (url, file, callback) {
        if (typeof callback !== 'function') {
            console.error('ajax.upload callback is not a function');
            return;
        }
        
        var formData = new FormData()
        formData.append('file', file)
        $.ajax({
            type: 'POST',
            url,
            contentType: false,
            processData: false,
            data: formData,
            xhrFields: {
                withCredentials: true
            },
            success: function(res) {
                if (res.errno !== 0) {
                    callback(res.message || '上传失败')
                    return
                }
                callback(null, res.data)
            },
            error: function(xhr, status, error) {
                var errorMsg = error || status || '上传失败';
                if (xhr && xhr.responseText) {
                    try {
                        var errRes = JSON.parse(xhr.responseText);
                        if (errRes.message) {
                            errorMsg = errRes.message;
                        }
                    } catch (e) {}
                }
                callback(errorMsg)
            }
        })
    }

    // 统一的处理
    function ajaxFn(method, url, params, callback) {
        if (typeof callback !== 'function') {
            console.error('ajax callback is not a function, method:', method, 'url:', url);
            return;
        }

        var isGet = method.toUpperCase() === 'GET';
        var ajaxOptions = {
            type: method.toUpperCase(),
            url: url,
            xhrFields: {
                withCredentials: true
            },
            success: function(res) {
                if (res.errno !== 0) {
                    callback(res.message || '请求失败')
                    return
                }
                callback(null, res.data)
            },
            error: function(xhr, status, error) {
                var errorMsg = error || status || '网络错误';
                if (xhr && xhr.responseText) {
                    try {
                        var errRes = JSON.parse(xhr.responseText);
                        if (errRes.message) {
                            errorMsg = errRes.message;
                        }
                    } catch (e) {}
                }
                callback(errorMsg)
            }
        };

        if (isGet) {
            if (params && Object.keys(params).length > 0) {
                ajaxOptions.data = params;
            }
        } else {
            ajaxOptions.contentType = 'application/json;charset=UTF-8';
            ajaxOptions.data = params ? JSON.stringify(params) : '';
        }

        $.ajax(ajaxOptions);
    }
})(window, jQuery)
