let redis = require('../util/redisDb')
let util = require('../util/common')
let crypto = require('crypto')
// 添加文章                      
exports.setArticle = (req, res, next) => {
    let data = {
        title: req.body.title,
        writer: req.body.writer,
        text: req.body.valueHtml,
        type: req.body.type
    }
    //任何修改或者新上线的文章不会显示
    data.show = 1
    let key = ''
    if ('a_id' in data) {
        key = req.headers.fapp + ':article:' + req.body.a_id
        //储存
        redis.set(key, data)
        res.json(util.getReturnData(0, '修改成功'))
    } else {
        // 新文章需要初始胡点赞数，观看数，和时间戳
        data.time = Date.now()
        key = req.headers.fapp + ':article:'
        redis.incr(key).then(id => {
            data.a_id = id
            key = 'book:article:' + id
            //储存文章
            redis.set(key, data)
            data.type.forEach(item => {
                let a_type = item

                // 直接获取分类数据，存在则表明分类存在
                redis.get(req.headers.fapp + ':a_type:' + a_type).then(datal => {
                    datal = JSON.parse(datal)
                    if (!datal) {
                        datal = []
                        datal.push(key)
                        redis.set(req.headers.fapp + ':a_type:' + a_type, datal)
                        //向分类中添加数据

                        redis.incr(req.headers.fapp + ':a_type:').then(id => {
                            redis.get(req.headers.fapp + ':a_type').then((res) => {
                                console.log(121);
                                if (!res) {
                                    type_data = []
                                    type_data.push({ uid: id, name: a_type })
                                    redis.set(req.headers.fapp + ':a_type', type_data)

                                } else {
                                    type_data = JSON.parse(res)
                                    type_data.push({ uid: id, name: a_type })
                                    redis.set(req.headers.fapp + ':a_type', type_data)

                                }
                            })
                        })
                    }
                    else {
                        // 数组对象
                        datal.push(key)
                        redis.set(req.headers.fapp + ':a_type:' + a_type, datal)

                    }
                })
            });

            // // 小标签需要循环操作
            // let tags = data.tag
            // if (tags) {
            //     tags.map(item => {
            //         // 可以使用MD5算法，也可以使用base64编码或文字编码其他方式生成
            //         let tKeyMd5 = crypto.createHash('md5').update(item).digest('hex')

            //         redis.get(req.headers.fapp + ':tag:' + tKeyMd5).then(datal => {
            //             if (!datal) {
            //                 datal = []
            //                 datal.push(key)
            //                 redis.set(req.headers.fapp + ':tag:' + tKeyMd5, datal)
            //             }
            //             datal = JSON.parse(datal)
            //             datal.push(key)
            //             redis.set(req.headers.fapp + ':tag:' + tKeyMd5, datal)
            //         })
            //     })
            // }
            // // 新文章需要建立新的有序集合，点赞数，观看数，时间戳。
            redis.zadd(req.headers.fapp + ':a_time', key, data.time)
            redis.zadd(req.headers.fapp + ':a_view', key, 0)
            redis.zadd(req.headers.fapp + ':a_like', key, 0)
            redis.zadd(req.headers.fapp + ':a_collection', key, 0)
            res.json(util.getReturnData(0, '新建文章成功'))
        })

    }
}

// 文章发布与下线
exports.showArticle = (req, res, next) => {
    let key = req.headers.fapp + ':article:' + req.body.a_id
    redis.get(key).then(data => {
        data = eval('(' + data + ')'); //把字符串转为object
        if (!data) res.json(util.getReturnData(404, '没有该文章'))
        //修改显示 
        if (data.show == 1) {
            data.show = 0
        } else {
            data.show = 1
        }
        redis.set(key, data)
        res.json(util.getReturnData(0, '文章修改成功'))
    })
}

//发布分类
exports.setArticleType = (req, res, next) => {
    //获取传递的值
    //应确定的是type中对于的唯一key是不重复的
    let data = req.body.type
    let key = req.headers.fapp + 'a:type'
    redis.set(key, data)
    //循环整个传递的值，依次创建唯一id对应的键值对
    data.map(item => {
        let tKey = req.headers.fapp + ':a_type:' + item.uid
        redis.get(tKey).then(datal => {
            // 不存在则添加
            if (!datal) {
                redis.set(tKey, {})
            }

        })
    })
    res.json(util.getReturnData(0, '创建分类成功'))

}
//删除文章
exports.articleDelete = (req, res, next) => {
    var datal = []
    let key = req.headers.fapp + ':article:' + req.body.a_id
    let talkKey = req.headers.fapp + ":article:" + req.body.a_id + ":talk"
    let typeKey = req.headers.fapp + ':a_type:' + req.body.a_type
    //删除文章
    redis.delete(key)
    redis.delete(talkKey)
    // 删除分类数据
    redis.get(typeKey).then(data => {

        data = eval('(' + data + ')');
        datal = data.filter(item => {
            return item !== key
        })
    })
    redis.set(typeKey, datal)

    redis.zrem(req.headers.fapp + ':a_time', key)
    redis.zrem(req.headers.fapp + ':a_view', key)
    redis.zrem(req.headers.fapp + ':a_like', key)
    redis.zrem(req.headers.fapp + ':a_collection', key)
    res.json(util.getReturnData(0, '删除文章成功', ''))
}
//获取用户信息
exports.getUser=(req,res,next)=>{
    let userData=[]
    let str=`book:user:info:`
    redis.lrange(str).then( datal=>{
        console.log(datal);
        if(datal.length!==0){
            datal.forEach(async user=>{
                user=eval(user)
                let str_user=str+user
                await redis.get(str_user).then(data=>{
                    data=JSON.parse(data)
                    userData.push(data)
                })
                res.json(util.getReturnData(0,'',userData))    
            })
        } else {
            res.json(util.getReturnData(1,'','no any data'))
        }
    })
}
//更改登录状态
exports.setLoginStatus=(req,res,next)=>{
    let username=req.body.username
    let login_status=req.body.login
    let str=`book:user:info:`

    redis.get(str+username).then(data=>{
        data=JSON.parse(data)
        if(login_status===0&&data.login){
            data.login=1
        }else if(login_status===1&&data.login) {
            data.login=0
        }
        res.json(util.getReturnData(0,'success',''))
    })
}