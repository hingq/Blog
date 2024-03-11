const { getReturnData } = require("../util/common")
const util = require('../util/common')
let redis = require('../util/redisDb')
const crypto = require('crypto')


//文件上传
exports.upload = (req, res, next) => {
    const form = formidable()
    const uploadFolder =
        console.log(uploadFolder);
    // form.parse(req, (err, fields, files) => { //fields是上传的文本信息 files文件信息
    //     if (err) {
    //         next(err)
    //         return
    //     }
    //     console.log(files);
    //     // const oldpath=files.path
    // })
    res.json('1213')
}