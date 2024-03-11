let redis=require('../util/redisDb')
// 检测用户登录状态
const util = require('./common')

exports.checkUser=(req,res,next)=>{
    console.log('检测用户登录状态');
    if('token' in req.headers) {
        let key =req.headers.fapp+':user:token:'+req.headers.token
        redis.get(key).then(data=>{
            if(data){
                // 保存用户名称
                req.username=data.username
                next()
            } else {
                // key值过期或登录过期
                res.json(util.getReturnData(403,'登录过期，请重新登录'))
            }
        })
    } else {
        res.json(util.getReturnData(403,'请登录'))
    }
}