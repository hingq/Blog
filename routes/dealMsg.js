const util = require('../util/common');
let redis = require('../util/redisDb');

function dealMsg(from, to, msg) {
  if (from != undefined && to != undefined) {
    if (global.wsClient[to] !== undefined) {
      //将信息写入数据库
      redis.lpush(`chat:${from}:${to}`, msg);
      redis.lpush(`chat:${to}:${from}`, msg);

      global.wsClient[to].forEach(Client => {
        Client.send(JSON.stringify(msg));
      });
      return ''
    }
    else {
      //存放入未读消息队列
      redis.lpush(`noSend:${from}:${to}`, msg);
      redis.lpush(`chat:${from}:${to}`, msg);

      return ''
    }
  } else {
    return ''
  }
}
  /**
   * `noSend:${from}:${to}` 对方发送的未接收的消息 param1代表接收方，param2代表发送方
   * `chat:${from}:${to}` 消息记录
   */
function dealMsgWhenLogin(from, to) {
  let Msg = []
  if (from == undefined || to == undefined) {
    return ''
  }
  let str = `noSend:${to}:${from}`

  let oldOnlineMsg = redis.lrange(str, 0, 100).then(res => {
    //读取最新的100条消息
    /**
     * 数据从最左侧插入，获取最新的100，反转数组， 按时间的先后加载
     */
    res.forEach(ele => {
      Msg.push(ele)
    })
    // 反转数组
    Msg = Msg.reverse()
    redis.delete(str) //删除
    return Msg
  }
  )
  return oldOnlineMsg
}

function dealMsg_All(from, to) {
  let All_Msg = []
  if (from == undefined || to == undefined) {
    return ''
  }
  redis.lrange(`chat:${from}:${to}`, 0, 100).then(data => {
    data.forEach(ele => {
      All_Msg.push(ele)
    })
    // 反转数组
    All_Msg = All_Msg.reverse()
    All_Msg.forEach(item => {
      item = JSON.parse(item)
      console.log('item', item);
      wsClient[from].forEach(client => {
        client.send(JSON.stringify(item))
      })
    })

  })

}
exports.dealMsgWhenLogin = dealMsgWhenLogin;
exports.dealMsg = dealMsg;
exports.dealMsg_All=dealMsg_All
