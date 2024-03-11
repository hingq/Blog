const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'qq',
    port: 465,
    secure: true, //true for 465,false for other ports
    auth: {
        user: 'amazyko@foxmail.com', //发送方邮箱
        pass: 'vhfisururwqqdfda' //smtp 授权码
    }
})

function sendMail(mail, code) {
    //options
    let mailOptions = {
        from: 'amazyko@foxmail.com',
        to: 'amazyko@foxmail.com',// 
        subject: 'this is a title', //title
        text: 'this is testing text', //content
        html: '',//页面内容
        // attachments: [{//发送文件
        // 		filename: 'index.html', //文件名字
        // 		path: './index.html' //文件路径
        // 	},
        // 	{
        // 		filename: 'sendEmail.js', //文件名字
        // 		content: 'sendEmail.js' //文件路径
        // 	}
        // ]
    };

    //发送函数
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
           reject()
        } else {
            resolve()
        }
    })
}

module.exports={
    sendMail
}
