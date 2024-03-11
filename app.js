var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs=require('fs')
var FileStreamRotator = require('file-stream-rotator')
var app = express();
const cors = require('cors') //跨域解决
var expressWs = require('express-ws')(app);

//路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var {checkUser}=require('./util/middleware')
const exp = require('constants');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})
//自定义格式
// logger.format('node_log',':remote-user - - :remote-addr - - :date - - :method - - :url - - status - - user-agent')
app.use(logger('combined',{stream:accessLogStream}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//跨域设置
app.use(cors())

app.use('/', indexRouter);
app.use('/users',usersRouter);
app.use('/admin',adminRouter)

//使用静态文件
app.use('/public', express.static('public'))
app.use('/file',express.static("File"))
app.use('/photo',express.static("pirture"))
app.use(express.static(path.join(__dirname,'dist')))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(3002, () => {
  console.log('server is running');
})


module.exports = app;
