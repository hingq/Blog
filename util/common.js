
//存放通用的方法或验证内容
let util = {}
util.getReturnData = (code, message = '', data = []) => {

    //保证数据验证
    if (!data) {
        data = []
    }
    return {code: code, message: message, data: data}
} 

//格式化时间戳
util.getLocalDate=(t)=>{
    let date=new Date(parseInt(t))
    return date.getFullYear()+'-'+(parseInt(date.getMonth())+1)+'-'+date.getDate()+
    ''+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
}
module.exports=util 

//箭头函数不需要显式的return，以及花括号