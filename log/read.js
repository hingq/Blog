
// var fs=require('fs')
// console.log(__dirname);
// fs.readdir(__dirname,(error,data)=>{
//     console.log(data);
// })
// fs.readFile('E:/ser/server/log/access-20240115.log',(error,data)=>{
//     let arr;
//     arr=data.toString().split('\n')
//     let browser_reg=/(")[\w\/0-9\.\s]+\(.+/g //浏览器信息
//     let ip_reg=/(::)[\w:]+[\d.]+/g // ip
//     let time_reg=/[0-9]+\/[\w\/:\s+]+/g //time
//     let method_reg=/"[A-Za-z]+\s\/[A-z\s\/0-9.]*"\s[\d\s]*/ //method
//     let url_reg=new RegExp('(http://)[A-z:0-9\/]+',"g") //url
//     let data_declared={
//         ip:arr[0].match(ip_reg)||'::',
//         time:arr[27].match(time_reg).toString(),
//         method_reg:arr[27].match(method_reg).toString(),
//         url:arr[27].match(url_reg).toString(),
//         browser:arr[27].match(browser_reg).toString()
//     }
//     console.log(data_declared);
// })

// arr=[1,2,3,4,5]
// console.log(arr);
// arr.forEach(ele => {
//     if(ele==3){
//         delete ele
//     } else {
//         return ele
//     }
// });
// console.log(arr);