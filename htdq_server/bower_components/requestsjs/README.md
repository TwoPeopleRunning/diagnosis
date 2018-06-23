# requests
ajax in python Requests style

----

**author** Meng G. <gaomeng1900@gmail.com>

**date** 2016-03-19

**github** https://github.com/gaomeng1900/requests

**ref** XHR 2 ducoment:  https://xhr.spec.whatwg.org/

----

A pack of useful ajax methods, 
including:
- `GET`
- `POST (form/file)`
- `PUT (form/file)`
- `DELETE`
- `single file upload`

Support `ADM/commonJS/global`

简单的xhr 2封装

1. 不依赖jquery ：），不依赖任何组件
2. 接口类似于python的 requests组件，更加简洁、扁平，同时也支持了类似于ajax的链式调用
3. 为上传文件而设计，可非常简单地扩展成一个文件上传组件
4. 轻量级，功能内聚，易于集成入其他组件（如centralperk.js）来提供封装的网络接口，不用去折腾fine-uploader等过度封装的组件

----

####example:
```javascript
new Requests({
    url: 'http://server.com:9040?uid=admin&token=qwer#jiajiajia',
    params:{
        page:1,
        size:10
    },
    form: {
        name: 'form-data',
        file:ele.files[0]
    },
    load:function(args){
        console.log('MY LOAD HANDLER: ', args)
    },
    progress:function(args){
        console.log('MY progress HANDLER: ', args)
    }
}).post()
```
or:
```javascript
new Requests('http://server.com:9040?uid=admin&token=qwer#jiajiajia').post()
    .load(function(args) { console.log(args) })
    .error(function(args) { console.error(args) });
```

Read more in `src/requests.coffee` 

Examples in `dist/index.html` (包含一个阿里云的实例)

----

#### todo

- [x] error 收不到回调，400时会调用load，需要用load转发
- [ ] XHR2 的 error回调只会在网络错误时触发，其他错误（如返回码>399），似乎并不会触发
- [ ] error 回调格式应该满足 promise 标准
- [ ] 使用frame hack来支持到IE9 (maybe 8?)
