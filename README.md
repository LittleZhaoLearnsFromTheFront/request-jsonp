# 使用
   npm i request-jsonp


   const data=await requestJsonp("htttp://127.0.0.1:4000",{
    jsonpCallback:'fn',
    jsonpCallbackName:'getUser',
    params:{
        id:'1',
        name:'哈哈'
    }
   })

