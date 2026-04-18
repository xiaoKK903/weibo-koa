/**
 * @description 基于 jquery 封装 ajax
 * @author milk
 */

(function(window, $) {
    if (window.ajax != null) {
        console.error('window.ajax 被占用')
        return
    }
    window.ajax = {}

    var ERROR_TYPES = {
        SENSITIVE: 16002,
        DUPLICATE: 16001,
        NETWORK: 'network',
        UNKNOWN: 'unknown'
    };

    function parseError(errno, message) {
        var errorType = ERROR_TYPES.UNKNOWN;
        var displayMessage = message || '操作失败，请重试';
        var icon = 'error';
        
        if (errno === ERROR_TYPES.SENSITIVE) {
            errorType = 'sensitive';
            displayMessage = '⚠️ 内容违规提示：' + message;
            icon = 'warning';
        } else if (errno === ERROR_TYPES.DUPLICATE) {
            errorType = 'duplicate';
            displayMessage = '⏰ 频繁操作提示：' + message;
            icon = 'info';
        } else if (errno === 10005) {
            errorType = 'login';
            displayMessage = '请先登录';
            icon = 'info';
        }
        
        return {
            errno: errno,
            message: displayMessage,
            originalMessage: message,
            errorType: errorType,
            icon: icon
        };
    }

    window.ajax.get = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('get', url, params, callback)
    }
    
    window.ajax.post = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('post', url, params, callback)
    }
    
    window.ajax.patch = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('patch', url, params, callback)
    }
    
    window.ajax.delete = function (url, params, callback) {
        if (typeof params === 'function') {
            callback = params
            params = {}
        }
        ajaxFn('delete', url, params, callback)
    }
    
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
            timeout: 30000,
            success: function(res) {
                if (res.errno !== 0) {
                    var errorInfo = parseError(res.errno, res.message);
                    callback(errorInfo);
                    return
                }
                callback(null, res.data)
            },
            error: function(xhr, status, error) {
                var errorMsg = '网络连接失败，请检查网络后重试';
                if (xhr && xhr.responseText) {
                    try {
                        var errRes = JSON.parse(xhr.responseText);
                        if (errRes.message) {
                            errorMsg = errRes.message;
                        }
                        if (errRes.code === -1) {
                            errorMsg = '服务器繁忙，请稍后重试';
                        }
                    } catch (e) {}
                }
                var errorInfo = parseError(ERROR_TYPES.NETWORK, errorMsg);
                callback(errorInfo);
            }
        })
    }

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
            timeout: 30000,
            success: function(res) {
                try {
                    if (res.errno !== 0) {
                        var errorInfo = parseError(res.errno, res.message);
                        callback(errorInfo);
                        return
                    }
                    callback(null, res.data)
                } catch (ex) {
                    console.error('处理响应数据出错:', ex);
                    var errorInfo = parseError(ERROR_TYPES.UNKNOWN, '数据处理失败，请重试');
                    callback(errorInfo);
                }
            },
            error: function(xhr, status, error) {
                try {
                    var errorMsg = '网络连接失败，请检查网络后重试';
                    
                    if (xhr) {
                        if (xhr.status === 0) {
                            errorMsg = '无法连接服务器，请检查网络';
                        } else if (xhr.status === 408) {
                            errorMsg = '请求超时，请稍后重试';
                        } else if (xhr.status >= 500) {
                            errorMsg = '服务器繁忙，请稍后重试';
                        }
                        
                        if (xhr.responseText) {
                            try {
                                var errRes = JSON.parse(xhr.responseText);
                                if (errRes.message) {
                                    errorMsg = errRes.message;
                                }
                                if (errRes.code === -1) {
                                    errorMsg = '服务器繁忙，请稍后重试';
                                }
                                if (errRes.errno) {
                                    var errorInfo = parseError(errRes.errno, errorMsg);
                                    callback(errorInfo);
                                    return;
                                }
                            } catch (e) {}
                        }
                    }
                    
                    var errorInfo = parseError(ERROR_TYPES.NETWORK, errorMsg);
                    callback(errorInfo);
                } catch (ex) {
                    console.error('处理错误响应出错:', ex);
                    var errorInfo = parseError(ERROR_TYPES.UNKNOWN, '操作失败，请重试');
                    callback(errorInfo);
                }
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

    window.ajax.ERROR_TYPES = ERROR_TYPES;
    window.ajax.parseError = parseError;
    
    window.ajax.isSensitiveError = function(error) {
        return error && error.errorType === 'sensitive';
    };
    
    window.ajax.isDuplicateError = function(error) {
        return error && error.errorType === 'duplicate';
    };
    
    window.ajax.isNetworkError = function(error) {
        return error && (error.errorType === 'network' || error.errno === 'network');
    };
    
    window.ajax.isLoginError = function(error) {
        return error && error.errorType === 'login';
    };
})(window, jQuery)
