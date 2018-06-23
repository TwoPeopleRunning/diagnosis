###
@author Meng G. <gaomeng1900@gmail.com>
@date 2016-03-19
@github https://github.com/gaomeng1900/requests.git
@ref XHR 2 ducoment: https://xhr.spec.whatwg.org/

A pack of useful ajax methods, 
including:
    GET
    POST (form/file)
    PUT (form/file)
    DELETE
    ** single file upload **

Support ADM/commonJS/global

@example:
    new Requests({
        url: 'http://server.com:9040?uid=admin&token=qwer#jiajiajia',
        params: {
            name: 'wahaha',
            file:ele.files[0]
        },
        load:function(args){
            console.warn('MY LOAD HANDLER: ', args)
        },
        progress:function(args){
            console.warn('MY progress HANDLER: ', args)
        }
    }).post()

    or:

    new Requests('http://server.com:9040?uid=admin&token=qwer#jiajiajia').post()
        .load(function(args) { console.log(args) })
        .error(function(args){ console.error(args) });

@class Requests
@constructor
    @param opt {Object} init params
        @key url {String}
        @key [params] {Object} k-v s in this will be mixed into the url (immediately when constructing)
        @key [form] {Object} k-v s in this will be mixed into the formData (if you use GET/DELETE, this will be ignored)
        @key [fileKey] {String} the form key of the file in form, default "file"
###

((global, factory)->
    if typeof exports == 'object' && typeof module != 'undefined' 
        module.exports = factory()
    else
        if typeof define == 'function' && define.amd
            define(factory) 
        else global.Requests = factory()
)(this, ()->

    __DEBUG_REQUESTS = false

    class Requests

        constructor: (cus_opt) ->
            if not cus_opt or (typeof cus_opt == 'object' and !cus_opt.url)
                throw new Error 'url is needed!!'
            @opt = {}
            @opt.url = cus_opt.url || cus_opt
            @opt.params = cus_opt.params || {}
            @opt.url = @_mixURL @opt.url, @opt.params
            @opt.form = cus_opt.form || {}
            @opt.fileKey = cus_opt.fileKey || 'file'
            @cus_opt = if typeof cus_opt == 'string' then {url:cus_opt} else cus_opt


        ###
        Use this method to upload a file directly.
        @example:
            html:
                <input type="file" onchange="upfile(this)">
            js:
                function upfile(ele) {
                    new Requests({
                        url: 'http://server.com:9040?uid=admin&token=qwer#jiajiajia',
                        params: {
                            name: 'wahaha'
                        },
                        load:function(args){
                            console.warn('MY LOAD HANDLER: ', args)
                        },
                        progress:function(args){
                            console.warn('MY progress HANDLER: ', args)
                        }
                    }).upload(ele.files[0]);
                };
            or:
                function upfile2(ele) {
                    new Requests('http://server.com:9040?uid=admin&token=qwer#jiajiajia')
                        .upload(ele.files[0]);
                };
        
        @method upload
        @param fileObj {File} file you want to upload
        @return undefined
        ###
        upload: (fileObj) =>
            # _form = {}
            # (_form[k] = v) for k, v of @opt.form if @opt.form
            @opt.form[@opt.fileKey] = fileObj
            # @_upload(_form)
            @_http('post')
            return @


        ###
        These four methods are for handler calling.
        They will execute the default handler and then call your handlers \
        (seted in the constructor or Method chaining).
        Your customer callback args will be mixed into the param of callback calling, \
        and a warning will be raised if there is a key conflict

        ** You shouldn't use this unless it's for debug **

        @method load/error/progress/abort
        @param handler {Function} 
        @return this {Requests}
        ###
        _updateProgress: (e)=> # 'this' here means Requests, 'e' here means XMLHttpRequestProgressEvent
            # if __DEBUG_REQUESTS
                # console.log '_updateProgress: ', @xhr
                # console.log '_updateProgress: ', e
            if e.lengthComputable
                @opt.uploadPercent = e.loaded / e.total
            @cus_opt.progress (@_extend {progress:@opt.uploadPercent}, @cus_opt.progress_arg) if @cus_opt.progress
        
        _xhrOnloadend: (e)=> # 'this' here means the Requests, 'e' here means XMLHttpRequestProgressEvent
            # HACK: load and error is quite confusing
            # so we check the xhr.status to decide
            if @xhr.status > 399
                console.warn 'xhr failed'
                @_xhrOnerror(e)
                return
            try
                __response = JSON.parse @xhr.response
            catch e
                console.error 'not json!!'
                __response = @xhr.response
            
            if __DEBUG_REQUESTS
                console.log 'Onload: this: ', @xhr
                console.log __response
            @cus_opt.load (@_extend @cus_opt.load_arg, __response) if @cus_opt.load

        _xhrOnerror: (e)=> # 'this' here means the Requests, 'e' here means XMLHttpRequestProgressEvent
            console.error 'XHR FAILED', @xhr
            try
                __response = if @xhr.response then JSON.parse @xhr.response else {}
            catch e
                __response = @xhr.response
            
            if @cus_opt.error
                @cus_opt.error (@_extend @cus_opt.error_arg, __response) 
            else
                throw new Error 'XHR FAILED'

        _xhrOnabort: (e)=> # 'this' here means the Requests, 'e' here means XMLHttpRequestProgressEvent
            console.error 'XHR ABORT'
            @cus_opt.abort (@cus_opt.abort_arg) if @cus_opt.abort


        ###
        Just like jQuery.extend, mix tow or more object
        ** Shallow copy ** 

        @method _extend
        @param ... {Object} 
        @return undefined
        ###
        _extend: ()=> # 'this' here means the Requests
            __id = ''
            new_obj = {}
            for obj in arguments
                if typeof obj == 'string'
                    console.error 'cannot extend string!!'
                    new_obj['__string'+__id] = obj
                    __id += '_'
                else
                    for k, v of obj
                        if new_obj[k]
                            console.warn 'extend conflict: ', obj, k
                        new_obj[k] = v 
            return new_obj


        ###
        Add params into queryString of URL.
        ** This won't check if the key is already in the queryString **

        @method _mixURL
        @param url {String} 
        @param params {Object} 
        @return undefined
        ###
        _mixURL: (url, params)=>
            param_str = ''
            param_str += k.toString() + '=' + v.toString() + '&' for k, v of params
            __index_query = url.indexOf '?'
            __index_hash = url.indexOf '#'
            if __index_query <0 and __index_hash <0
                return url + '?' + param_str.slice 0, param_str.length-1
            if __index_query <0 and __index_hash >= 0
                return (url.slice 0, __index_hash) + '?' + (param_str.slice 0, param_str.length-1) + (url.slice __index_hash)
            if __index_query >=0 and __index_hash <0
                return (url.slice 0, __index_query+1) + (param_str) + (url.slice __index_query+1)
            if __index_query >=0 and __index_hash >=0
                return (url.slice 0, __index_query+1) + (param_str) + (url.slice __index_query+1)


        ###
        Method that handel all the XHR
        ** you shouldn't use this unless it's for debug **

        @method _http
        @param method {String} [get|post|put|delete]  ** case-insensitive **
        @return undefined
        ###
        _http: (method)->
            # init xhr
            @xhr = new XMLHttpRequest()
            @xhr.upload.addEventListener("progress", @_updateProgress, false)
            # @xhr.addEventListener("error", @_xhrOnerror, false)
            # @xhr.addEventListener("load", @_xhrOnload, false)
            @xhr.addEventListener("loadend", @_xhrOnloadend, false)
            @xhr.addEventListener("abort", @_xhrOnabort, false)
            @xhr.open(method, @opt.url)

            if method.toLowerCase() == 'post' or method.toLowerCase() == 'put'
                # init form
                try
                    formData = new FormData()
                catch e
                    throw new Error 'your browser is out dated (formData not supported)'
                
                formData.append(k, v) for k, v of @opt.form if @opt.form
                # formData.append( @opt.fileKey, fileObj)
                # formData.append("original_filename", fileObj.fileName || fileObj.name)

                # send
                @xhr.send(formData)
            else
                @xhr.send()


        ###
        @example:
        new Requests({
            url: 'http://server.com:9040?uid =admin&token=qwer',
            params: {ssid:"piupiupi"},
            error: function(args){console.warn('MY ERROR HANDLER: ', args)},
            load: function(args){console.warn('MY LOAD HANDLER: ', args)}
        }).get()
        @method get
        @return undefined
        ###
        get: ()->
            @_http('get')
            return @


        ###
        @example:
            new Requests({
                url: 'http://server.com:9040?uid=admin&token=qwer',
                form:{
                    ha:"hahahha",
                    hei:'heihie',
                    file:ele.files[0]
                },
                error:function(args){
                    console.warn('MY ERROR HANDLER: ', args)
                },
                load:function(args){
                    console.warn('MY LOAD HANDLER: ', args)
                },
                progress:function(args){
                    console.warn('MY progress HANDLER: ', args)
                }
            }).post();
        @method post
        @return undefined
        ###
        post: ()->
            @_http('post')
            return @


        ###
        @method put
        @return undefined
        ###
        put: ()->
            @_http('put')
            return @


        ###
        @method delete
        @return undefined
        ###
        delete: ()->
            @_http('delete')
            return @


        ###
        These four methods are for ** Method chaining **
        ** These will cover the functions you set in the constructor opt **

        @method load/error/progress/abort
        @param handler {Function} 
        @return this {Requests}
        ###
        load: (load_handler)=>
            @cus_opt.load = load_handler
            return @


        error: (error_handler)=>
            @cus_opt.error = error_handler
            return @


        progress: (progress_handler)=>
            @cus_opt.progress = progress_handler
            return @


        abort: (abort_handler)=>
            @cus_opt.abort = abort_handler
            return @
)