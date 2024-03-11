const router = require("./users");
var express=require('express')
var {setArticle,showArticle,setArticleType,articleDelete, getUser, setLoginStatus}=require('../controller/admin')

router.post('/setArticle',setArticle)
router.post('/showArticle',showArticle)
router.post('/setArticleType',setArticleType)
router.post('/deleteArticle',articleDelete)
router.get('/getUser',getUser)
router.post('/setUserLogin',setLoginStatus)
module.exports=router