// 数据库连接 

// 封装一些方法

let redis = require('redis');

//获取数据库的配置
const { redisConfig } = require('../config/db')

///获取redis连接
let redis_client = redis.createClient()
exports.redis_client
redis_client.on('connect', () => {
    console.log('连接成功');
})
redis_client.on('error', (err) => {
    console.log(err);
})
redis = redis_client.connect(6379, '127.0.0.1')
redis = {};

//根据模式获取全部键
keys = async (cursor, re, count) => {
    let getTempkeys = await new Promise((resolve, reject) => {

        //从连接中获取值并返回
        redis_client.scan([cursor, 'MATCH', re, 'COUNT', count], (err, res) => {
            console.log(err);
            return resolve(res)
        });
    });
    return getTempkeys
}
redis.scan = async (re, cursor = 0, count = 100) => {
    return await keys(cursor, re, count)
}

//设置该值进入数据库
redis.set = (key, value) => {
    //将所有对象转换为json存储 
    // 字符春太大，可能导致性能下降
    value = JSON.stringify(value)
    return redis_client.set(key, value, (err) => {
        if (err) {
            console.log(err);
        }
    })
}


//返回获取的值
redis.get = async (key) => {
    return await redis_client.get(key, function (error, result) {
        if (error) {
            console.log(error);
            reject(error);
        }

        resolve();
    });

}

/**
 *  需要对用户的token进行时间控制，不能让其一直有效
 * 
 */

//设置key的过期时间
redis.expire = (key, ttl) => {
    redis_client.expire(key, parseInt(ttl))
}

// 获取id自增
id = async (key) => {
    // let id = await new Promise((resolve => {
    //     redis_client.incr(key, (err, res) => {
    //         console.log(res);
    //         return resolve(res)
    //     })
    // }))
    let id = redis_client.INCR(key, (err, res) => {
        return res
    })
    return id
}
redis.incr = async (key) => {
    return await id(key)
}

//有序数据集合
//新增有序集合（键，成员，分值）

redis.zadd = (key, member, num) => {
    if (key !== undefined && member !== undefined) {
        redis_client.zAdd(key, [{ score: num, value: member }], (err, res) => {
            if (err) throw err;
        })
    }
}

//获取一定范围内的元素
redis.getRange = async (key,num=5) => {
    let tData = []
    let Data = await redis_client.zRange(key, 0, num, '[WITHSCORES]')
    tData = Data
    return tData //tdata->[array]
}


//有序集合的自增
redis.zincrby = (key, member, NUM = 1) => {
    redis_client.zIncrBy(key, NUM, member, (err) => {
        if (err) console.log(err);
    })
}

//有序集合通过member获取其score
tempZscore = async (key, member) => {
    let score =0
    await redis_client.zScore(key, member).then(res=>{
        score=res
    })
    return score
}

redis.zScore = async (key, member) => {
    return tempZscore(key, member)
}
// 移除有序集合一个或多个成员
redis.zrem=async(key,member)=>{
    return await redis_client.zRem(key,member)
}
// list 头部插入元素
redis.lpush = async (key, value) => {
    value=JSON.stringify(value)
    return await redis_client.lPush(key, value)
}
// 尾部插入
redis.rpush=async (key,value)=>{
    value=JSON.stringify(value)
    return await redis_client.rPush(key,value)
}
// 获取list一定范围的值
redis.lrange=async(key,s=0,e=-1)=>{
    return await redis_client.lRange(key, s,e)
}

redis.delete=async(key)=>{
    return await redis_client.DEL(key)
}


module.exports = redis;


//频繁地修改json并不适宜，采用redisi提供的散列或队列效果更好