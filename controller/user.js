const { json } = require('express')
const util = require('../util/common')
var express = require('express')
const app = express()
let redis = require('../util/redisDb')
const crypto = require('crypto')
var {dealMsg}=require('../routes/dealMsg')
// 获取IP
function getCllientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        '';
    /**
     * express直接用req.ip
     */
}


//发送私信
exports.sendMail = (req, res, next) => {

    // 对胡采用自增的key键值，book:mail:mail_id,保存对话内容
    // book:user:username:mail 将键值的唯一id保存，
    // let checkKey = req.headers.fapp + ':user:info:' + req.params.username
    //验证用户是否存在
    // redis.get(checkKey).then(user=>{
    //     if(user&&req.body.text){
    //         let userKey1=req.headers.fapp+':user:'+req.body.username+':mail'
    //         let userKey2=req.headers.fapp+':user:'+req.params.username+':mail'
    //         let mailKey=req.headers.fapp+':mail:'
    //         //保证两个用户只能出现一次对话
    //         redis.get(userKey1).then(mail=>{
    //             if(!mail) mail=[]
    //             let has =false
    //             for (let i=0;i<mail.length;i++){
    //                 if(mail[i].users.indexOf(req.params.username)>-1){
    //                     has=true
    //                     //对话已经存在
    //                     mailKey=mailKey+mail[i].m_id
    //                     redis.get(mailKey).then((mailData=[])=>{
    //                         mailData.push({
    //                             text:req.body.text,
    //                             time:Date.now(),
    //                             read:[]
    //                         })
    //                         res.json(util.getReturnData(0,'发送私信成功'))
    //                         next()
    //                     })
    //                 }
    //             }
    //             if(!has) {
    //                 //新对话
    //                 mailKey=mailKey+mail[i].m_id
    //                 redis.incr(mailKey).then(m_id=>{
    //                     redis.set(mailKey,[{text:req.body.text,time:Date.now(),read:[]}])
    //                     mail.push({m_id:m_id,users:[req.body.username,req.params.username]})
    //                     redis.set(userKey1,mail)
    //                     redis.get(userKey2).then(mail2=>{
    //                         if(!mail2) mail2=[]
    //                         mail2.push({
    //                             m_id:m_id,
    //                             users:[req.body.username,req.params.username]
    //                         })
    //                         redis.set(userKey2,mail2)
    //                         res.json(util.getReturnData(0,'发送新的私信成功'))
    //                     })
    //                 })
    //             }
    //         })
    //     } else {
    //         res.json(util.getReturnData(1,'用户不存在,发送失败'))
    //     }
    // })
    // redis.get(checkKey).then(user => {
    //     if (user && req.body.text) {
    //         let userKey1 = req.headers.fapp + ':user:' + req.body.username + ':mail'
    //         let userKey2 = req.headers.fapp + ':user:' + req.params.username + ':mail'
    //         let mailKey = req.headers.fapp + ':mail:'
    //         //保证两个用户只能出现一次对话
    //         redis.get(userKey2).then(mail => {
    //             if (!mail) mail = []
    //             let has = false
    //             for (let i = 0; i < mail.length; i++) {
    //                mail=JSON.parse(mail)
    //                 if (mail[i].users.indexOf(req.params.username) > -1) {
    //                     has = true
    //                     //对话已经存在
    //                     mailKey = mailKey + mail[i].m_id
    //                     console.log(mailKey);
    //                     redis.lpush(mailKey, `{ text: ${req.body.text}, time: ${Date.now()}, read: []}`)
    //                     res.json(util.getReturnData(0, '发送私信成功'))
    //                     next()

    //                 }
    //             }
    //             if (!has) {
    //                 //新对话
    //                 redis.incr(mailKey).then(m_id => {
    //                     mailKey = mailKey + m_id
    //                     redis.lpush(mailKey, `{ text: ${req.body.text}, time: ${Date.now()}, read: []}`)
    //                     // redis.set(mailKey,[{text:req.body.text,time:Date.now(),read:[]}])
    //                     mail.push({ m_id: m_id, users: [req.body.username, req.params.username] })
    //                     redis.set(userKey1, mail)
    //                     redis.get(userKey2).then(mail2 => {
    //                         if (!mail2) mail2 = []
    //                         mail2.push({
    //                             m_id: m_id,
    //                             users: [req.body.username, req.params.username]
    //                         })
    //                         redis.set(userKey2, mail2)
    //                         res.json(util.getReturnData(0, '发送新的私信成功'))
    //                     })
    //                 })
    //             }
    //         })
    //     } else {
    //         res.json(util.getReturnData(1, '用户不存在,发送失败'))
    //     }
    // })
    const to = req.body.to //接收方
    const from = req.body.from //发送方
    const message={ from: from, msg: req.body.msg, type: 'message',time:req.body.time }
    //将消息写入数据库
    /** 
     * format: {`chat:${from}:${to}`,message}
     *         {`chat:${to}:${from}`,message} 
     *  双方都要写入
    */
    dealMsg(from,to,message)
    /**
     * 返回响应部分需要完善
     */
    res.json('ok')
}

// 获取私信列表
exports.getMails = (req, res, next) => {
    console.log(req.query.username);
    let userKey1 = req.headers.fapp + ':user:' + req.query.username + ':mail'
    console.log(userKey1);
    redis.get(userKey1).then(mail => {
        res.json(util.getReturnData(0, '', mail))
    })
}


//文章收藏
exports.articleCollection = (req, res, next) => {
    let key = req.headers.fapp + ":user:" + req.body.username + ":collection"
    let a_key = req.headers.fapp + ":article:" + req.params.id
    let flag = false
    redis.get(a_key).then(data => {
        if (data) {
            redis.get(key).then(async tData => {
                console.log('tdata', tData);
                if (!tData) {
                    tData = []
                    tData.push({ time: Date.now(), a_id: req.params.id, title: req.body.title })
                    await redis.zincrby(req.headers.fapp + ':a_collection', key)
                    redis.set(key, tData)
                    res.json(util.getReturnData(0, '文章收藏成功'))
                }
                else {
                    tData = JSON.parse(tData)
                    tData = await tData.filter(item => {
                        if (item.a_id === req.params.id) {
                            flag = true
                        }
                        return item.a_id !== req.params.id
                    });
                    if (flag === false) {
                        tData.push({ time: Date.now(), a_id: req.params.id, title: req.body.title })
                        await redis.zincrby(req.headers.fapp + ":a_collection", a_key, 1)
                        console.log('new', tData);
                        redis.set(key, tData)
                        res.json(util.getReturnData(0, 'success'))
                    }
                    else {
                        await redis.zincrby(req.headers.fapp + ":a_collection", a_key, -1)
                        await redis.set(key, tData)
                        res.json(util.getReturnData(1, '文章取消收藏'))
                    }
                }
            })
        } else {
            res.json(util.getReturnData(1, '文章不存在'))
        }
    })
}
//收藏列表
exports.getCollection = (req, res, next) => {
    console.log(req.data);
    let key = req.headers.fapp + ":user:" + req.body.username + ":collection"
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}
//文章评论
exports.articleTalk = (req, res, next) => {
    if ('a_id' in req.body && 'talk' in req.body) {
        console.log(req.body);
        let talk = { talk: req.body.talk, time: Date.now(), username: req.body.username }
        let key = req.headers.fapp + ':article:' + req.body.a_id + ':talk'
        redis.get(key).then(data => {
            data = JSON.parse(data)
            let tData = []
            if (data) {
                tData = [...data]
                tData.push(talk)
            } else {
                tData.push(talk)
            }
            redis.set(key, tData)
            res.json(util.getReturnData(0, '评论成功'))
        })
    } else {
        res.json(util.getReturnData(1, '评论错误'))
    }
}
