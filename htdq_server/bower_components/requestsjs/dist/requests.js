
/*
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
 */
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    return module.exports = factory();
  } else {
    if (typeof define === 'function' && define.amd) {
      return define(factory);
    } else {
      return global.Requests = factory();
    }
  }
})(this, function() {
  var Requests, __DEBUG_REQUESTS;
  __DEBUG_REQUESTS = false;
  return Requests = (function() {
    function Requests(cus_opt) {
      this.abort = bind(this.abort, this);
      this.progress = bind(this.progress, this);
      this.error = bind(this.error, this);
      this.load = bind(this.load, this);
      this._mixURL = bind(this._mixURL, this);
      this._extend = bind(this._extend, this);
      this._xhrOnabort = bind(this._xhrOnabort, this);
      this._xhrOnerror = bind(this._xhrOnerror, this);
      this._xhrOnloadend = bind(this._xhrOnloadend, this);
      this._updateProgress = bind(this._updateProgress, this);
      this.upload = bind(this.upload, this);
      if (!cus_opt || (typeof cus_opt === 'object' && !cus_opt.url)) {
        throw new Error('url is needed!!');
      }
      this.opt = {};
      this.opt.url = cus_opt.url || cus_opt;
      this.opt.params = cus_opt.params || {};
      this.opt.url = this._mixURL(this.opt.url, this.opt.params);
      this.opt.form = cus_opt.form || {};
      this.opt.fileKey = cus_opt.fileKey || 'file';
      this.cus_opt = typeof cus_opt === 'string' ? {
        url: cus_opt
      } : cus_opt;
    }


    /*
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
     */

    Requests.prototype.upload = function(fileObj) {
      this.opt.form[this.opt.fileKey] = fileObj;
      this._http('post');
      return this;
    };


    /*
    These four methods are for handler calling.
    They will execute the default handler and then call your handlers \
    (seted in the constructor or Method chaining).
    Your customer callback args will be mixed into the param of callback calling, \
    and a warning will be raised if there is a key conflict
    
    ** You shouldn't use this unless it's for debug **
    
    @method load/error/progress/abort
    @param handler {Function} 
    @return this {Requests}
     */

    Requests.prototype._updateProgress = function(e) {
      if (e.lengthComputable) {
        this.opt.uploadPercent = e.loaded / e.total;
      }
      if (this.cus_opt.progress) {
        return this.cus_opt.progress(this._extend({
          progress: this.opt.uploadPercent
        }, this.cus_opt.progress_arg));
      }
    };

    Requests.prototype._xhrOnloadend = function(e) {
      var __response, error;
      if (this.xhr.status > 399) {
        console.warn('xhr failed');
        this._xhrOnerror(e);
        return;
      }
      try {
        __response = JSON.parse(this.xhr.response);
      } catch (error) {
        e = error;
        console.error('not json!!');
        __response = this.xhr.response;
      }
      if (__DEBUG_REQUESTS) {
        console.log('Onload: this: ', this.xhr);
        console.log(__response);
      }
      if (this.cus_opt.load) {
        return this.cus_opt.load(this._extend(this.cus_opt.load_arg, __response));
      }
    };

    Requests.prototype._xhrOnerror = function(e) {
      var __response, error;
      console.error('XHR FAILED', this.xhr);
      try {
        __response = this.xhr.response ? JSON.parse(this.xhr.response) : {};
      } catch (error) {
        e = error;
        __response = this.xhr.response;
      }
      if (this.cus_opt.error) {
        return this.cus_opt.error(this._extend(this.cus_opt.error_arg, __response));
      } else {
        throw new Error('XHR FAILED');
      }
    };

    Requests.prototype._xhrOnabort = function(e) {
      console.error('XHR ABORT');
      if (this.cus_opt.abort) {
        return this.cus_opt.abort(this.cus_opt.abort_arg);
      }
    };


    /*
    Just like jQuery.extend, mix tow or more object
    ** Shallow copy ** 
    
    @method _extend
    @param ... {Object} 
    @return undefined
     */

    Requests.prototype._extend = function() {
      var __id, i, k, len, new_obj, obj, v;
      __id = '';
      new_obj = {};
      for (i = 0, len = arguments.length; i < len; i++) {
        obj = arguments[i];
        if (typeof obj === 'string') {
          console.error('cannot extend string!!');
          new_obj['__string' + __id] = obj;
          __id += '_';
        } else {
          for (k in obj) {
            v = obj[k];
            if (new_obj[k]) {
              console.warn('extend conflict: ', obj, k);
            }
            new_obj[k] = v;
          }
        }
      }
      return new_obj;
    };


    /*
    Add params into queryString of URL.
    ** This won't check if the key is already in the queryString **
    
    @method _mixURL
    @param url {String} 
    @param params {Object} 
    @return undefined
     */

    Requests.prototype._mixURL = function(url, params) {
      var __index_hash, __index_query, k, param_str, v;
      param_str = '';
      for (k in params) {
        v = params[k];
        param_str += k.toString() + '=' + v.toString() + '&';
      }
      __index_query = url.indexOf('?');
      __index_hash = url.indexOf('#');
      if (__index_query < 0 && __index_hash < 0) {
        return url + '?' + param_str.slice(0, param_str.length - 1);
      }
      if (__index_query < 0 && __index_hash >= 0) {
        return (url.slice(0, __index_hash)) + '?' + (param_str.slice(0, param_str.length - 1)) + (url.slice(__index_hash));
      }
      if (__index_query >= 0 && __index_hash < 0) {
        return (url.slice(0, __index_query + 1)) + param_str + (url.slice(__index_query + 1));
      }
      if (__index_query >= 0 && __index_hash >= 0) {
        return (url.slice(0, __index_query + 1)) + param_str + (url.slice(__index_query + 1));
      }
    };


    /*
    Method that handel all the XHR
    ** you shouldn't use this unless it's for debug **
    
    @method _http
    @param method {String} [get|post|put|delete]  ** case-insensitive **
    @return undefined
     */

    Requests.prototype._http = function(method) {
      var e, error, formData, k, ref, v;
      this.xhr = new XMLHttpRequest();
      this.xhr.upload.addEventListener("progress", this._updateProgress, false);
      this.xhr.addEventListener("loadend", this._xhrOnloadend, false);
      this.xhr.addEventListener("abort", this._xhrOnabort, false);
      this.xhr.open(method, this.opt.url);
      if (method.toLowerCase() === 'post' || method.toLowerCase() === 'put') {
        try {
          formData = new FormData();
        } catch (error) {
          e = error;
          throw new Error('your browser is out dated (formData not supported)');
        }
        if (this.opt.form) {
          ref = this.opt.form;
          for (k in ref) {
            v = ref[k];
            formData.append(k, v);
          }
        }
        return this.xhr.send(formData);
      } else {
        return this.xhr.send();
      }
    };


    /*
    @example:
    new Requests({
        url: 'http://server.com:9040?uid =admin&token=qwer',
        params: {ssid:"piupiupi"},
        error: function(args){console.warn('MY ERROR HANDLER: ', args)},
        load: function(args){console.warn('MY LOAD HANDLER: ', args)}
    }).get()
    @method get
    @return undefined
     */

    Requests.prototype.get = function() {
      this._http('get');
      return this;
    };


    /*
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
     */

    Requests.prototype.post = function() {
      this._http('post');
      return this;
    };


    /*
    @method put
    @return undefined
     */

    Requests.prototype.put = function() {
      this._http('put');
      return this;
    };


    /*
    @method delete
    @return undefined
     */

    Requests.prototype["delete"] = function() {
      this._http('delete');
      return this;
    };


    /*
    These four methods are for ** Method chaining **
    ** These will cover the functions you set in the constructor opt **
    
    @method load/error/progress/abort
    @param handler {Function} 
    @return this {Requests}
     */

    Requests.prototype.load = function(load_handler) {
      this.cus_opt.load = load_handler;
      return this;
    };

    Requests.prototype.error = function(error_handler) {
      this.cus_opt.error = error_handler;
      return this;
    };

    Requests.prototype.progress = function(progress_handler) {
      this.cus_opt.progress = progress_handler;
      return this;
    };

    Requests.prototype.abort = function(abort_handler) {
      this.cus_opt.abort = abort_handler;
      return this;
    };

    return Requests;

  })();
});

//# sourceMappingURL=data:application/json;base64,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QUFEO01BQ0YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULEdBQWdCO0FBQ2hCLGFBQU87SUFGTDs7dUJBS04sS0FBQSxHQUFPLFNBQUMsYUFBRDtNQUNILElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxHQUFpQjtBQUNqQixhQUFPO0lBRko7O3VCQUtQLFFBQUEsR0FBVSxTQUFDLGdCQUFEO01BQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEdBQW9CO0FBQ3BCLGFBQU87SUFGRDs7dUJBS1YsS0FBQSxHQUFPLFNBQUMsYUFBRDtNQUNILElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxHQUFpQjtBQUNqQixhQUFPO0lBRko7Ozs7O0FBeFJQLENBUFIiLCJmaWxlIjoicmVxdWVzdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbkBhdXRob3IgTWVuZyBHLiA8Z2FvbWVuZzE5MDBAZ21haWwuY29tPlxuQGRhdGUgMjAxNi0wMy0xOVxuQGdpdGh1YiBodHRwczovL2dpdGh1Yi5jb20vZ2FvbWVuZzE5MDAvcmVxdWVzdHMuZ2l0XG5AcmVmIFhIUiAyIGR1Y29tZW50OiBodHRwczovL3hoci5zcGVjLndoYXR3Zy5vcmcvXG5cbkEgcGFjayBvZiB1c2VmdWwgYWpheCBtZXRob2RzLCBcbmluY2x1ZGluZzpcbiAgICBHRVRcbiAgICBQT1NUIChmb3JtL2ZpbGUpXG4gICAgUFVUIChmb3JtL2ZpbGUpXG4gICAgREVMRVRFXG4gICAgKiogc2luZ2xlIGZpbGUgdXBsb2FkICoqXG5cblN1cHBvcnQgQURNL2NvbW1vbkpTL2dsb2JhbFxuXG5AZXhhbXBsZTpcbiAgICBuZXcgUmVxdWVzdHMoe1xuICAgICAgICB1cmw6ICdodHRwOi8vc2VydmVyLmNvbTo5MDQwP3VpZD1hZG1pbiZ0b2tlbj1xd2VyI2ppYWppYWppYScsXG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgbmFtZTogJ3dhaGFoYScsXG4gICAgICAgICAgICBmaWxlOmVsZS5maWxlc1swXVxuICAgICAgICB9LFxuICAgICAgICBsb2FkOmZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNWSBMT0FEIEhBTkRMRVI6ICcsIGFyZ3MpXG4gICAgICAgIH0sXG4gICAgICAgIHByb2dyZXNzOmZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNWSBwcm9ncmVzcyBIQU5ETEVSOiAnLCBhcmdzKVxuICAgICAgICB9XG4gICAgfSkucG9zdCgpXG5cbiAgICBvcjpcblxuICAgIG5ldyBSZXF1ZXN0cygnaHR0cDovL3NlcnZlci5jb206OTA0MD91aWQ9YWRtaW4mdG9rZW49cXdlciNqaWFqaWFqaWEnKS5wb3N0KClcbiAgICAgICAgLmxvYWQoZnVuY3Rpb24oYXJncykgeyBjb25zb2xlLmxvZyhhcmdzKSB9KVxuICAgICAgICAuZXJyb3IoZnVuY3Rpb24oYXJncyl7IGNvbnNvbGUuZXJyb3IoYXJncykgfSk7XG5cbkBjbGFzcyBSZXF1ZXN0c1xuQGNvbnN0cnVjdG9yXG4gICAgQHBhcmFtIG9wdCB7T2JqZWN0fSBpbml0IHBhcmFtc1xuICAgICAgICBAa2V5IHVybCB7U3RyaW5nfVxuICAgICAgICBAa2V5IFtwYXJhbXNdIHtPYmplY3R9IGstdiBzIGluIHRoaXMgd2lsbCBiZSBtaXhlZCBpbnRvIHRoZSB1cmwgKGltbWVkaWF0ZWx5IHdoZW4gY29uc3RydWN0aW5nKVxuICAgICAgICBAa2V5IFtmb3JtXSB7T2JqZWN0fSBrLXYgcyBpbiB0aGlzIHdpbGwgYmUgbWl4ZWQgaW50byB0aGUgZm9ybURhdGEgKGlmIHlvdSB1c2UgR0VUL0RFTEVURSwgdGhpcyB3aWxsIGJlIGlnbm9yZWQpXG4gICAgICAgIEBrZXkgW2ZpbGVLZXldIHtTdHJpbmd9IHRoZSBmb3JtIGtleSBvZiB0aGUgZmlsZSBpbiBmb3JtLCBkZWZhdWx0IFwiZmlsZVwiXG4jIyNcblxuKChnbG9iYWwsIGZhY3RvcnkpLT5cbiAgICBpZiB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnIFxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuICAgIGVsc2VcbiAgICAgICAgaWYgdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcbiAgICAgICAgICAgIGRlZmluZShmYWN0b3J5KSBcbiAgICAgICAgZWxzZSBnbG9iYWwuUmVxdWVzdHMgPSBmYWN0b3J5KClcbikodGhpcywgKCktPlxuXG4gICAgX19ERUJVR19SRVFVRVNUUyA9IGZhbHNlXG5cbiAgICBjbGFzcyBSZXF1ZXN0c1xuXG4gICAgICAgIGNvbnN0cnVjdG9yOiAoY3VzX29wdCkgLT5cbiAgICAgICAgICAgIGlmIG5vdCBjdXNfb3B0IG9yICh0eXBlb2YgY3VzX29wdCA9PSAnb2JqZWN0JyBhbmQgIWN1c19vcHQudXJsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAndXJsIGlzIG5lZWRlZCEhJ1xuICAgICAgICAgICAgQG9wdCA9IHt9XG4gICAgICAgICAgICBAb3B0LnVybCA9IGN1c19vcHQudXJsIHx8IGN1c19vcHRcbiAgICAgICAgICAgIEBvcHQucGFyYW1zID0gY3VzX29wdC5wYXJhbXMgfHwge31cbiAgICAgICAgICAgIEBvcHQudXJsID0gQF9taXhVUkwgQG9wdC51cmwsIEBvcHQucGFyYW1zXG4gICAgICAgICAgICBAb3B0LmZvcm0gPSBjdXNfb3B0LmZvcm0gfHwge31cbiAgICAgICAgICAgIEBvcHQuZmlsZUtleSA9IGN1c19vcHQuZmlsZUtleSB8fCAnZmlsZSdcbiAgICAgICAgICAgIEBjdXNfb3B0ID0gaWYgdHlwZW9mIGN1c19vcHQgPT0gJ3N0cmluZycgdGhlbiB7dXJsOmN1c19vcHR9IGVsc2UgY3VzX29wdFxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIFVzZSB0aGlzIG1ldGhvZCB0byB1cGxvYWQgYSBmaWxlIGRpcmVjdGx5LlxuICAgICAgICBAZXhhbXBsZTpcbiAgICAgICAgICAgIGh0bWw6XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJmaWxlXCIgb25jaGFuZ2U9XCJ1cGZpbGUodGhpcylcIj5cbiAgICAgICAgICAgIGpzOlxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHVwZmlsZShlbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlcXVlc3RzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9zZXJ2ZXIuY29tOjkwNDA/dWlkPWFkbWluJnRva2VuPXF3ZXIjamlhamlhamlhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3YWhhaGEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZDpmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01ZIExPQUQgSEFORExFUjogJywgYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczpmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01ZIHByb2dyZXNzIEhBTkRMRVI6ICcsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLnVwbG9hZChlbGUuZmlsZXNbMF0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBvcjpcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGZpbGUyKGVsZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgUmVxdWVzdHMoJ2h0dHA6Ly9zZXJ2ZXIuY29tOjkwNDA/dWlkPWFkbWluJnRva2VuPXF3ZXIjamlhamlhamlhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC51cGxvYWQoZWxlLmZpbGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgQG1ldGhvZCB1cGxvYWRcbiAgICAgICAgQHBhcmFtIGZpbGVPYmoge0ZpbGV9IGZpbGUgeW91IHdhbnQgdG8gdXBsb2FkXG4gICAgICAgIEByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgICMjI1xuICAgICAgICB1cGxvYWQ6IChmaWxlT2JqKSA9PlxuICAgICAgICAgICAgIyBfZm9ybSA9IHt9XG4gICAgICAgICAgICAjIChfZm9ybVtrXSA9IHYpIGZvciBrLCB2IG9mIEBvcHQuZm9ybSBpZiBAb3B0LmZvcm1cbiAgICAgICAgICAgIEBvcHQuZm9ybVtAb3B0LmZpbGVLZXldID0gZmlsZU9ialxuICAgICAgICAgICAgIyBAX3VwbG9hZChfZm9ybSlcbiAgICAgICAgICAgIEBfaHR0cCgncG9zdCcpXG4gICAgICAgICAgICByZXR1cm4gQFxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIFRoZXNlIGZvdXIgbWV0aG9kcyBhcmUgZm9yIGhhbmRsZXIgY2FsbGluZy5cbiAgICAgICAgVGhleSB3aWxsIGV4ZWN1dGUgdGhlIGRlZmF1bHQgaGFuZGxlciBhbmQgdGhlbiBjYWxsIHlvdXIgaGFuZGxlcnMgXFxcbiAgICAgICAgKHNldGVkIGluIHRoZSBjb25zdHJ1Y3RvciBvciBNZXRob2QgY2hhaW5pbmcpLlxuICAgICAgICBZb3VyIGN1c3RvbWVyIGNhbGxiYWNrIGFyZ3Mgd2lsbCBiZSBtaXhlZCBpbnRvIHRoZSBwYXJhbSBvZiBjYWxsYmFjayBjYWxsaW5nLCBcXFxuICAgICAgICBhbmQgYSB3YXJuaW5nIHdpbGwgYmUgcmFpc2VkIGlmIHRoZXJlIGlzIGEga2V5IGNvbmZsaWN0XG5cbiAgICAgICAgKiogWW91IHNob3VsZG4ndCB1c2UgdGhpcyB1bmxlc3MgaXQncyBmb3IgZGVidWcgKipcblxuICAgICAgICBAbWV0aG9kIGxvYWQvZXJyb3IvcHJvZ3Jlc3MvYWJvcnRcbiAgICAgICAgQHBhcmFtIGhhbmRsZXIge0Z1bmN0aW9ufSBcbiAgICAgICAgQHJldHVybiB0aGlzIHtSZXF1ZXN0c31cbiAgICAgICAgIyMjXG4gICAgICAgIF91cGRhdGVQcm9ncmVzczogKGUpPT4gIyAndGhpcycgaGVyZSBtZWFucyBSZXF1ZXN0cywgJ2UnIGhlcmUgbWVhbnMgWE1MSHR0cFJlcXVlc3RQcm9ncmVzc0V2ZW50XG4gICAgICAgICAgICAjIGlmIF9fREVCVUdfUkVRVUVTVFNcbiAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nICdfdXBkYXRlUHJvZ3Jlc3M6ICcsIEB4aHJcbiAgICAgICAgICAgICAgICAjIGNvbnNvbGUubG9nICdfdXBkYXRlUHJvZ3Jlc3M6ICcsIGVcbiAgICAgICAgICAgIGlmIGUubGVuZ3RoQ29tcHV0YWJsZVxuICAgICAgICAgICAgICAgIEBvcHQudXBsb2FkUGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbFxuICAgICAgICAgICAgQGN1c19vcHQucHJvZ3Jlc3MgKEBfZXh0ZW5kIHtwcm9ncmVzczpAb3B0LnVwbG9hZFBlcmNlbnR9LCBAY3VzX29wdC5wcm9ncmVzc19hcmcpIGlmIEBjdXNfb3B0LnByb2dyZXNzXG4gICAgICAgIFxuICAgICAgICBfeGhyT25sb2FkZW5kOiAoZSk9PiAjICd0aGlzJyBoZXJlIG1lYW5zIHRoZSBSZXF1ZXN0cywgJ2UnIGhlcmUgbWVhbnMgWE1MSHR0cFJlcXVlc3RQcm9ncmVzc0V2ZW50XG4gICAgICAgICAgICAjIEhBQ0s6IGxvYWQgYW5kIGVycm9yIGlzIHF1aXRlIGNvbmZ1c2luZ1xuICAgICAgICAgICAgIyBzbyB3ZSBjaGVjayB0aGUgeGhyLnN0YXR1cyB0byBkZWNpZGVcbiAgICAgICAgICAgIGlmIEB4aHIuc3RhdHVzID4gMzk5XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuICd4aHIgZmFpbGVkJ1xuICAgICAgICAgICAgICAgIEBfeGhyT25lcnJvcihlKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgX19yZXNwb25zZSA9IEpTT04ucGFyc2UgQHhoci5yZXNwb25zZVxuICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IgJ25vdCBqc29uISEnXG4gICAgICAgICAgICAgICAgX19yZXNwb25zZSA9IEB4aHIucmVzcG9uc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgX19ERUJVR19SRVFVRVNUU1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICdPbmxvYWQ6IHRoaXM6ICcsIEB4aHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBfX3Jlc3BvbnNlXG4gICAgICAgICAgICBAY3VzX29wdC5sb2FkIChAX2V4dGVuZCBAY3VzX29wdC5sb2FkX2FyZywgX19yZXNwb25zZSkgaWYgQGN1c19vcHQubG9hZFxuXG4gICAgICAgIF94aHJPbmVycm9yOiAoZSk9PiAjICd0aGlzJyBoZXJlIG1lYW5zIHRoZSBSZXF1ZXN0cywgJ2UnIGhlcmUgbWVhbnMgWE1MSHR0cFJlcXVlc3RQcm9ncmVzc0V2ZW50XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yICdYSFIgRkFJTEVEJywgQHhoclxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgX19yZXNwb25zZSA9IGlmIEB4aHIucmVzcG9uc2UgdGhlbiBKU09OLnBhcnNlIEB4aHIucmVzcG9uc2UgZWxzZSB7fVxuICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgIF9fcmVzcG9uc2UgPSBAeGhyLnJlc3BvbnNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIEBjdXNfb3B0LmVycm9yXG4gICAgICAgICAgICAgICAgQGN1c19vcHQuZXJyb3IgKEBfZXh0ZW5kIEBjdXNfb3B0LmVycm9yX2FyZywgX19yZXNwb25zZSkgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICdYSFIgRkFJTEVEJ1xuXG4gICAgICAgIF94aHJPbmFib3J0OiAoZSk9PiAjICd0aGlzJyBoZXJlIG1lYW5zIHRoZSBSZXF1ZXN0cywgJ2UnIGhlcmUgbWVhbnMgWE1MSHR0cFJlcXVlc3RQcm9ncmVzc0V2ZW50XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yICdYSFIgQUJPUlQnXG4gICAgICAgICAgICBAY3VzX29wdC5hYm9ydCAoQGN1c19vcHQuYWJvcnRfYXJnKSBpZiBAY3VzX29wdC5hYm9ydFxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIEp1c3QgbGlrZSBqUXVlcnkuZXh0ZW5kLCBtaXggdG93IG9yIG1vcmUgb2JqZWN0XG4gICAgICAgICoqIFNoYWxsb3cgY29weSAqKiBcblxuICAgICAgICBAbWV0aG9kIF9leHRlbmRcbiAgICAgICAgQHBhcmFtIC4uLiB7T2JqZWN0fSBcbiAgICAgICAgQHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgIyMjXG4gICAgICAgIF9leHRlbmQ6ICgpPT4gIyAndGhpcycgaGVyZSBtZWFucyB0aGUgUmVxdWVzdHNcbiAgICAgICAgICAgIF9faWQgPSAnJ1xuICAgICAgICAgICAgbmV3X29iaiA9IHt9XG4gICAgICAgICAgICBmb3Igb2JqIGluIGFyZ3VtZW50c1xuICAgICAgICAgICAgICAgIGlmIHR5cGVvZiBvYmogPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciAnY2Fubm90IGV4dGVuZCBzdHJpbmchISdcbiAgICAgICAgICAgICAgICAgICAgbmV3X29ialsnX19zdHJpbmcnK19faWRdID0gb2JqXG4gICAgICAgICAgICAgICAgICAgIF9faWQgKz0gJ18nXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBmb3IgaywgdiBvZiBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5ld19vYmpba11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4gJ2V4dGVuZCBjb25mbGljdDogJywgb2JqLCBrXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfb2JqW2tdID0gdiBcbiAgICAgICAgICAgIHJldHVybiBuZXdfb2JqXG5cblxuICAgICAgICAjIyNcbiAgICAgICAgQWRkIHBhcmFtcyBpbnRvIHF1ZXJ5U3RyaW5nIG9mIFVSTC5cbiAgICAgICAgKiogVGhpcyB3b24ndCBjaGVjayBpZiB0aGUga2V5IGlzIGFscmVhZHkgaW4gdGhlIHF1ZXJ5U3RyaW5nICoqXG5cbiAgICAgICAgQG1ldGhvZCBfbWl4VVJMXG4gICAgICAgIEBwYXJhbSB1cmwge1N0cmluZ30gXG4gICAgICAgIEBwYXJhbSBwYXJhbXMge09iamVjdH0gXG4gICAgICAgIEByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgICMjI1xuICAgICAgICBfbWl4VVJMOiAodXJsLCBwYXJhbXMpPT5cbiAgICAgICAgICAgIHBhcmFtX3N0ciA9ICcnXG4gICAgICAgICAgICBwYXJhbV9zdHIgKz0gay50b1N0cmluZygpICsgJz0nICsgdi50b1N0cmluZygpICsgJyYnIGZvciBrLCB2IG9mIHBhcmFtc1xuICAgICAgICAgICAgX19pbmRleF9xdWVyeSA9IHVybC5pbmRleE9mICc/J1xuICAgICAgICAgICAgX19pbmRleF9oYXNoID0gdXJsLmluZGV4T2YgJyMnXG4gICAgICAgICAgICBpZiBfX2luZGV4X3F1ZXJ5IDwwIGFuZCBfX2luZGV4X2hhc2ggPDBcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsICsgJz8nICsgcGFyYW1fc3RyLnNsaWNlIDAsIHBhcmFtX3N0ci5sZW5ndGgtMVxuICAgICAgICAgICAgaWYgX19pbmRleF9xdWVyeSA8MCBhbmQgX19pbmRleF9oYXNoID49IDBcbiAgICAgICAgICAgICAgICByZXR1cm4gKHVybC5zbGljZSAwLCBfX2luZGV4X2hhc2gpICsgJz8nICsgKHBhcmFtX3N0ci5zbGljZSAwLCBwYXJhbV9zdHIubGVuZ3RoLTEpICsgKHVybC5zbGljZSBfX2luZGV4X2hhc2gpXG4gICAgICAgICAgICBpZiBfX2luZGV4X3F1ZXJ5ID49MCBhbmQgX19pbmRleF9oYXNoIDwwXG4gICAgICAgICAgICAgICAgcmV0dXJuICh1cmwuc2xpY2UgMCwgX19pbmRleF9xdWVyeSsxKSArIChwYXJhbV9zdHIpICsgKHVybC5zbGljZSBfX2luZGV4X3F1ZXJ5KzEpXG4gICAgICAgICAgICBpZiBfX2luZGV4X3F1ZXJ5ID49MCBhbmQgX19pbmRleF9oYXNoID49MFxuICAgICAgICAgICAgICAgIHJldHVybiAodXJsLnNsaWNlIDAsIF9faW5kZXhfcXVlcnkrMSkgKyAocGFyYW1fc3RyKSArICh1cmwuc2xpY2UgX19pbmRleF9xdWVyeSsxKVxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIE1ldGhvZCB0aGF0IGhhbmRlbCBhbGwgdGhlIFhIUlxuICAgICAgICAqKiB5b3Ugc2hvdWxkbid0IHVzZSB0aGlzIHVubGVzcyBpdCdzIGZvciBkZWJ1ZyAqKlxuXG4gICAgICAgIEBtZXRob2QgX2h0dHBcbiAgICAgICAgQHBhcmFtIG1ldGhvZCB7U3RyaW5nfSBbZ2V0fHBvc3R8cHV0fGRlbGV0ZV0gICoqIGNhc2UtaW5zZW5zaXRpdmUgKipcbiAgICAgICAgQHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgIyMjXG4gICAgICAgIF9odHRwOiAobWV0aG9kKS0+XG4gICAgICAgICAgICAjIGluaXQgeGhyXG4gICAgICAgICAgICBAeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgICAgIEB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJwcm9ncmVzc1wiLCBAX3VwZGF0ZVByb2dyZXNzLCBmYWxzZSlcbiAgICAgICAgICAgICMgQHhoci5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgQF94aHJPbmVycm9yLCBmYWxzZSlcbiAgICAgICAgICAgICMgQHhoci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBAX3hock9ubG9hZCwgZmFsc2UpXG4gICAgICAgICAgICBAeGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZW5kXCIsIEBfeGhyT25sb2FkZW5kLCBmYWxzZSlcbiAgICAgICAgICAgIEB4aHIuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIEBfeGhyT25hYm9ydCwgZmFsc2UpXG4gICAgICAgICAgICBAeGhyLm9wZW4obWV0aG9kLCBAb3B0LnVybClcblxuICAgICAgICAgICAgaWYgbWV0aG9kLnRvTG93ZXJDYXNlKCkgPT0gJ3Bvc3QnIG9yIG1ldGhvZC50b0xvd2VyQ2FzZSgpID09ICdwdXQnXG4gICAgICAgICAgICAgICAgIyBpbml0IGZvcm1cbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yICd5b3VyIGJyb3dzZXIgaXMgb3V0IGRhdGVkIChmb3JtRGF0YSBub3Qgc3VwcG9ydGVkKSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoaywgdikgZm9yIGssIHYgb2YgQG9wdC5mb3JtIGlmIEBvcHQuZm9ybVxuICAgICAgICAgICAgICAgICMgZm9ybURhdGEuYXBwZW5kKCBAb3B0LmZpbGVLZXksIGZpbGVPYmopXG4gICAgICAgICAgICAgICAgIyBmb3JtRGF0YS5hcHBlbmQoXCJvcmlnaW5hbF9maWxlbmFtZVwiLCBmaWxlT2JqLmZpbGVOYW1lIHx8IGZpbGVPYmoubmFtZSlcblxuICAgICAgICAgICAgICAgICMgc2VuZFxuICAgICAgICAgICAgICAgIEB4aHIuc2VuZChmb3JtRGF0YSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAeGhyLnNlbmQoKVxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIEBleGFtcGxlOlxuICAgICAgICBuZXcgUmVxdWVzdHMoe1xuICAgICAgICAgICAgdXJsOiAnaHR0cDovL3NlcnZlci5jb206OTA0MD91aWQgPWFkbWluJnRva2VuPXF3ZXInLFxuICAgICAgICAgICAgcGFyYW1zOiB7c3NpZDpcInBpdXBpdXBpXCJ9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGFyZ3Mpe2NvbnNvbGUud2FybignTVkgRVJST1IgSEFORExFUjogJywgYXJncyl9LFxuICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oYXJncyl7Y29uc29sZS53YXJuKCdNWSBMT0FEIEhBTkRMRVI6ICcsIGFyZ3MpfVxuICAgICAgICB9KS5nZXQoKVxuICAgICAgICBAbWV0aG9kIGdldFxuICAgICAgICBAcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICAjIyNcbiAgICAgICAgZ2V0OiAoKS0+XG4gICAgICAgICAgICBAX2h0dHAoJ2dldCcpXG4gICAgICAgICAgICByZXR1cm4gQFxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIEBleGFtcGxlOlxuICAgICAgICAgICAgbmV3IFJlcXVlc3RzKHtcbiAgICAgICAgICAgICAgICB1cmw6ICdodHRwOi8vc2VydmVyLmNvbTo5MDQwP3VpZD1hZG1pbiZ0b2tlbj1xd2VyJyxcbiAgICAgICAgICAgICAgICBmb3JtOntcbiAgICAgICAgICAgICAgICAgICAgaGE6XCJoYWhhaGhhXCIsXG4gICAgICAgICAgICAgICAgICAgIGhlaTonaGVpaGllJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTplbGUuZmlsZXNbMF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOmZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01ZIEVSUk9SIEhBTkRMRVI6ICcsIGFyZ3MpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsb2FkOmZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01ZIExPQUQgSEFORExFUjogJywgYXJncylcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOmZ1bmN0aW9uKGFyZ3Mpe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01ZIHByb2dyZXNzIEhBTkRMRVI6ICcsIGFyZ3MpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkucG9zdCgpO1xuICAgICAgICBAbWV0aG9kIHBvc3RcbiAgICAgICAgQHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgIyMjXG4gICAgICAgIHBvc3Q6ICgpLT5cbiAgICAgICAgICAgIEBfaHR0cCgncG9zdCcpXG4gICAgICAgICAgICByZXR1cm4gQFxuXG5cbiAgICAgICAgIyMjXG4gICAgICAgIEBtZXRob2QgcHV0XG4gICAgICAgIEByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgICMjI1xuICAgICAgICBwdXQ6ICgpLT5cbiAgICAgICAgICAgIEBfaHR0cCgncHV0JylcbiAgICAgICAgICAgIHJldHVybiBAXG5cblxuICAgICAgICAjIyNcbiAgICAgICAgQG1ldGhvZCBkZWxldGVcbiAgICAgICAgQHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgIyMjXG4gICAgICAgIGRlbGV0ZTogKCktPlxuICAgICAgICAgICAgQF9odHRwKCdkZWxldGUnKVxuICAgICAgICAgICAgcmV0dXJuIEBcblxuXG4gICAgICAgICMjI1xuICAgICAgICBUaGVzZSBmb3VyIG1ldGhvZHMgYXJlIGZvciAqKiBNZXRob2QgY2hhaW5pbmcgKipcbiAgICAgICAgKiogVGhlc2Ugd2lsbCBjb3ZlciB0aGUgZnVuY3Rpb25zIHlvdSBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yIG9wdCAqKlxuXG4gICAgICAgIEBtZXRob2QgbG9hZC9lcnJvci9wcm9ncmVzcy9hYm9ydFxuICAgICAgICBAcGFyYW0gaGFuZGxlciB7RnVuY3Rpb259IFxuICAgICAgICBAcmV0dXJuIHRoaXMge1JlcXVlc3RzfVxuICAgICAgICAjIyNcbiAgICAgICAgbG9hZDogKGxvYWRfaGFuZGxlcik9PlxuICAgICAgICAgICAgQGN1c19vcHQubG9hZCA9IGxvYWRfaGFuZGxlclxuICAgICAgICAgICAgcmV0dXJuIEBcblxuXG4gICAgICAgIGVycm9yOiAoZXJyb3JfaGFuZGxlcik9PlxuICAgICAgICAgICAgQGN1c19vcHQuZXJyb3IgPSBlcnJvcl9oYW5kbGVyXG4gICAgICAgICAgICByZXR1cm4gQFxuXG5cbiAgICAgICAgcHJvZ3Jlc3M6IChwcm9ncmVzc19oYW5kbGVyKT0+XG4gICAgICAgICAgICBAY3VzX29wdC5wcm9ncmVzcyA9IHByb2dyZXNzX2hhbmRsZXJcbiAgICAgICAgICAgIHJldHVybiBAXG5cblxuICAgICAgICBhYm9ydDogKGFib3J0X2hhbmRsZXIpPT5cbiAgICAgICAgICAgIEBjdXNfb3B0LmFib3J0ID0gYWJvcnRfaGFuZGxlclxuICAgICAgICAgICAgcmV0dXJuIEBcbikiXX0=
