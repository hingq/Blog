var express = require('express');
var router = express.Router();
let redis = require('../util/redisDb')
var { getNavMenu,
  getFooter,
  getHotArticle,
  getNewArticle,
  getArticle,
  getArticleBytype,
  getArticleTalk,
  viewArticle,
  articleLike,
  userLogin,
  userRegister,
  email
} = require('../controller/getData');
var { dealMsgWhenLogin, dealMsg_All } = require('./dealMsg');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

global.wsClient = {}
// setInterval(()=>{
//   console.log(global.wsClient.length);
// },5000)
//socket
router.ws('/ws/:id', async (ws, req) => {
  // 将连接记录在连接池中
  const users = req.params.id.split('_')
  const from = users[0]
  const to = users[1]
  if (!wsClient[from]) {
    wsClient[from] = []
    wsClient[from].push(ws)
  }
  else {
    if (wsClient[from].length > 3) {
      wsClient[from].shift()
    }
    wsClient[from].push(ws)
  }
  ws.send('connect to express server')
  setInterval(() => {
    ws.send('check')
  }, 1000)
  ws.on('message', (data) => {
    console.log(data);
  })

  // 获取未发送消息列表
 await dealMsgWhenLogin(from, to, flag = true).then(oldOnlineMsg=>{
    console.log('oldMsg',oldOnlineMsg);
    try {
      oldOnlineMsg.forEach(async msg => {
        msg=JSON.parse(msg)
        
        await redis.lpush(`chat:${from}:${to}`, msg);
        // await redis.lpush(`chat:${to}:${from}`, msg);
      })
    } catch {
  
    }
  
  })
  //将未读消息写入数据库
  //获取消息记录并发送
  dealMsg_All(from, to, flag = false)
  ws.on('close', function (e) {
    console.log('close');
    try {
      // wsClient[from].forEach(client => { //client=>array
      //   if (client.length === 0) {
      //     delete client
      //   }
      //   else {
      //     wsClient[from] = wsClient[from].filter(client => {
      //       return client !== ws
      //     })
      //   }
      // })
      wsClient[from] = wsClient[from].filter(client => {
        if (client.length === 0) {
          delete client
        } else {
          return client != ws
        }
      })
    } catch (error) {
      console.log(error);
    }

  })
})

//nav
router.get('/getNavMenu', getNavMenu);
// 获取footer
router.get('/getFooter', getFooter)

//获取轮播图
// router.get('/getIndexPic',getIndexPic)
//热点文章
router.get('/getHotArticle', getHotArticle)
// // 最新文章列表   
router.get('/getNewArticle', getNewArticle)

router.get('/getArticle/:id', getArticle)

//根据类型查询
router.get('/getArticleBytype', getArticleBytype)

//获取评论
router.get('/getArticleTalk/:id', getArticleTalk)

//文章浏览量
router.get('/viewArticle/:id', viewArticle)

//文章点赞和踩
router.get('/articleLike/:id/:like', articleLike)


router.post('/login', userLogin)

router.post('/regist', userRegister)

router.post('/email', email)

module.exports = router;
