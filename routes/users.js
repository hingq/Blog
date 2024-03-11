var express = require('express');
var router = express.Router();
var { getMails, sendMail, getUserMail, articleCollection, getCollection, articleTalk } = require('../controller/user')
const multer = require('multer')
const path = require('path');
const { dealMsg} = require('./dealMsg');
const baseUrl='http://localhost:3002'
let file_storage = multer.diskStorage({

  //文件储存路径
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../.", "File"))
  },
  //名称
  filename: (req, file, cb) => {
    let extname = path.extname(file.originalname);
    let filename = file.fieldname + '-' + Date.now() + extname;
    console.log(filename);
    cb(null, filename)
  }
})
let photo_stotage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../.", "pirture"))
  },
  filename: (req, file, cb) => {
    let extname = path.extname(file.originalname);
    let filename = file.fieldname + '-' + Date.now() + extname;
    cb(null, filename)

  }
})
let upload = multer({ storage: file_storage })
let photo = multer({
  storage: photo_stotage,
  limits: {
    fileSize: 1024 * 1024 * 10, //单个文件大小限制为10MB
    files: 3 //最多上传三张图片
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') && (file.mimetype.endsWith('png') || file.mimetype.endsWith('jpeg'))) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPG image files are allowed!'), false);
    }
  }
})

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/mail/:username', sendMail)

router.get('/getMails', getMails)
//对话文件上传
router.post('/upload', upload.single('file'), (req, res) => {
  const name = req.file.filename
  const from=req.body.from
  const to=req.body.to
  const time=req.body.time
  const msg={ type: 'file', filename: name, url: `http://localhost:3002/users/download/${name}`,from:from,time:time}
  dealMsg(from,to,msg)
})
//对话图片发送
router.post('/pirture', photo.single('photo'), (req, res) => {
  const name=req.file.filename
  const from=req.body.from
  const to=req.body.to
  const time=req.body.time
  const msg={ type: 'photo', filename: name, url: baseUrl+'/'+'photo'+'/'+name,from:from ,time:time}
  dealMsg(from,to,msg)
})
//收藏
router.post('/save/:id', articleCollection)
// 获取收藏
router.post('/saveList', getCollection)

router.get('/download/:id', (req, res, next) => {
  // var downPath = path.join(__dirname, "../.", "File", req.params.id)
  var downPath = path.join("E:/ser/server/File", req.params.id)
  console.log(downPath);
  // 设置 Content-Disposition 头
  //  res.setHeader('Content-Disposition', `attachment; filename=${req.params.id}`);
  res.download(downPath)
})
//评论
router.post('/articleTalk', articleTalk)

module.exports = router;
