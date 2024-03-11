let redis = require('../util/redisDb')
const util = require('../util/common')
const crypto = require('crypto'); //引入MD5
const exp = require('constants');
const { extname } = require('path');
let email=require('../util/nodemailer')

exports.getNavMenu = (req, res, next) => {
    // redis.set('nav_menu',str)
    redis.get('nav_menu').then((data) => {
        console.log(data);
        res.json(data)
    }).catch((err) => {
        console.log(err);
    });
}
// footer
exports.getFooter = (req, res, next) => {
    let key = 'footer'
    redis.get(key).then((data) => {
        res.json(util.getReturnData(0, '', data))
    })
}
//indexPic
exports.getIndexPic = (req, res, next) => {
    let key = req.headers.fapp + ':indexPic'
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}

//hotArticle
exports.getHotArticle = (req, res, next) => {
    let key = req.headers.fapp + ':a_view'
    //获取集合，只取五条数据
    redis.getRange(key).then(async (data) => {
        data = eval(data)
        console.log(data);
        let result = data.map(item => {
            //获取每篇文章的题目，id，日期
            // item = eval(item)
            return redis.get(item).then(datal => {
                datal = JSON.parse(datal)
                if (datal) {
                    return {
                        'title': datal.title,
                        'date': util.getLocalDate(datal.time),
                        'id': datal.a_id,
                    }
                } else {
                    return {
                        'title': '文章未上线',
                        'date': '',
                        'id': 0,
                    }
                }
            })
        })
        // 等待多个异步执行完毕
        let t_data = await Promise.all(result)
        console.log(t_data);
        res.json(util.getReturnData(0, '', t_data))
    })
}

//newarticle
//获取最新文章
exports.getNewArticle = (req, res, next) => {
    let key = req.headers.fapp + ':a_time'
    redis.getRange(key).then(async (data) => {
        let result = data.map((item) => {
            return redis.get(item).then(datal => {
                datal = JSON.parse(datal)
                if (datal) {
                    return {
                        'title': datal.title,
                        'date': util.getLocalDate(datal.time),
                        'id': datal.a_id,
                        'show': datal.show,
                        'type': datal.type
                    }
                } else {
                    return {
                        'title': '文章未上线',
                        'date': '',
                        'id': 0
                    }
                }
            })

        })
        let t_data = await Promise.all(result)
        res.json(util.getReturnData(0, '', t_data))
    })
}


//article

//根据id获取文章的基本内容
exports.getArticle = (req, res, next) => {
    var d_view;
    var d_like;
    var d_collection;
    let key = req.headers.fapp + ":article:" + req.params.id
    redis.get(key).then(async data => {
        //判断是否显示文章内容
        data = JSON.parse(data)
        if (data !== undefined) {
            if (data.show === 1 ) {
                console.log(data.show===1);
                //获取文章分类详情
                await redis.zScore(req.headers.fapp + ":a_view", key).then(res=>{
                   d_view=res
                })
                //获取文章点赞 
                await redis.zScore(req.headers.fapp + ":a_like", key).then(res=>{
                    d_like=res
                })
                // 收藏数
                await redis.zScore(req.headers.fapp + ":a_collection", key).then(res=>{
                    d_collection= res
                })
                data.view=d_view
                data.like=d_like
                data.collection=d_collection
                res.json(util.getReturnData(0, 'success', data))

            } else {
                res.json(util.getReturnData(403, '该文帐未发布'))
            }
        } else {
            res.json(util.getReturnData(404, '文章不存在或被删除'))
        }
    })
}
// 根据小标签或分类获取所有文章
exports.getArticleBytype = (req, res, next) => {
    let key = req.headers.fapp
    if ('tag' in req.query) {
        let tKeyMd5 = crypto.createHash('md5').update(req.query.tag).digest('hex')
        key = key + ':tag:' + tKeyMd5
    } else if ('type' in req.query) {
        key = key + ':a_type:' + req.query.type

    } else {
        return res.json(util.getLocalDate(1, '数据参数错误'))
    }
    console.log(key);
    redis.get(key).then(async (data) => {
        //获取所有数据
        console.log(data);
        data = JSON.parse(data)
        var count = 0
        let result = data.map(item => {
            //获取每篇文章的题目及日期
            return redis.get(item).then(datal => {
                datal = JSON.parse(datal)
                if (datal && datal.show != 0) {
                    return { 'title': datal.title, 'date': util.getLocalDate(datal.time), 'id': datal.a_id, 's': 0 }
                } else {
                    return { 'title': '文章暂未上线', 'date': '', 'id': count++, 's': 1 }
                }
            })
        })
        count = 0
        let t_data = await Promise.all(result)
        res.json(util.getReturnData(0, '', t_data))
    })
}

//获取文章评论
exports.getArticleTalk = (req, res, next) => {
    let key = req.headers.fapp + ":article:" + req.params.id + ":talk"
    redis.get(key).then(data => {

        res.json(util.getReturnData(0, 'success', data))
    })
}

// 浏览量
exports.viewArticle = async (req, res, next) => {
    let key = req.headers.fapp + ':article:' + req.params.id
    await redis.zincrby(req.headers.fapp + ":a_view", key)
    res.json(util.getReturnData(0, 'success'))
}

// 文章点赞,踩
exports.articleLike = (req, res, next) => {
    // let key = req.headers.fapp + ":article:" + req.params.id
    // let like = req.params.like
    let msg="点赞成功"
    let member = req.headers.fapp + ":article:" + req.params.id
    let like = req.params.like
    if (like === '0') {
        redis.zScore(req.params.fapp+":a_like",member).then(async res=>{
            res=eval(res)
            if(res>0){
                await redis.zincrby(req.headers.fapp + ":a_like", member, -1)
                msg="执行踩操作"        
            }
        })
    }
    else {
        redis.zincrby(req.headers.fapp + ":a_like", member)
    }
    res.json(util.getReturnData(0, msg))
}


//用户登录
exports.userLogin = (req, res, next) => {
    //获取用户名和密码
    let username = req.body.username
    let password = req.body.password
    let ip=req.ip
    if(ip.split(',').length>0){
        ip=ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':')+1,ip.length);
    redis.get(req.headers.fapp + ':user:info:' + username).then(data => {
        console.log(data);
        data = JSON.parse(data)
        if (data !== '') {
            if (data.login === 0) {
                if (data.password !== password) {
                    res.json(util.getReturnData(1, '用户名或密码错误'))
                } else {
                    //生成简单的token ，根据用户名和当前时间戳直接生成MD5值
                    let token = crypto.createHash('md5').update(Date.now() + username).digest('hex')
                    let tokenKey = req.headers.fapp + ':user:token:' + token
                    // 以token为键k-v的形式储存
                    delete data.password
                    // 写入数据库
                    redis.set(tokenKey, data)
                    // 设置1000过期
                    redis.expire(tokenKey, 1000)
                    res.json(util.getReturnData(1, '登陆成功', { username: req.body.username, token: token,ip:ip }))
                }
            } else {
                res.json(util.getReturnData(1, '用户被封停'))
            }
        } else {
            res.json(util.getReturnData(1, '用户名不存在'))
        }
    })
    /**
     * 用户多次登录，上一次的登录不会删除，保证可以多点登录
     * 如果需要单点登录，第二次登录前可以清楚之前所有的token
     */
}
// 用户注册

exports.userRegister = (req, res, next) => {
    //获取用户名，密码和其他资料
    let username = req.body.username
    let password = req.body.password
    let ip = req.ip
    if (username || password) {
        let key = 'book:user:info:' + username
        redis.get(key).then(user => {

            if (user) {
                res.json(res.json(util.getReturnData(1, '用户已存在')))
            } else {
                let userData = {
                    phone: 'phone' in req.body ? req.body.phone : '未知',
                    nikename: 'nikename' in req.body ? req.body.nikename : '未知',
                    age: 'age' in req.body ? req.body.age : '未知',
                    sex: 'sex' in req.body ? req.body.sex : '未知',
                    ip: ip,
                    username: username,
                    password: password,
                    //是否封停
                    login: 0

                }

                redis.set(key, userData)
                redis.lpush(`book:user:info:`,username)
                res.json(util.getReturnData(0, '注册成功', ''))
            }
        })
    } else {
        res.json(util.getReturnData(1, '资料不完整', ''))
    }
}

exports.email=(req,res,next)=>{
    const mail=req.body.mail
    // const data={

    // }
    if(!mail){
        return res.send('error')
    }
    const code =parseInt(Math.random(0,1)*10000)
    email.sendMail(mail,code,(state)=>{
        if(state){
            return res.send('success')
        } else {
            return res.send('error')
        }
    })
    
}