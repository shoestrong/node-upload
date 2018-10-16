var express=require('express');
var fs=require('fs');
var bodyParser=require('body-parser');
var multer=require('multer');
var path=require('path');

// 创建
var app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use('/lib', express.static('lib'));
app.use('/upload', express.static('upload'));

// 设置文件上传的public/upload路径
var uploadDir='./upload/';
// 规定只上传一张图片 使用single
var upload = multer({ dest: uploadDir }).single('image');

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/'+'index.html');
});

app.get('/getFiles', function (req, res) {
    var fileList = [];
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.readdir(uploadDir, (err, files) => {
        if(err){
            console.error(err.message);
            return false;
        }else{
            files.forEach(file => {
                fileList.push(file);
            });
            res.end(JSON.stringify(fileList));
        }
    })
});


app.post('/file_upload', function(req, res, next) {
    // 文件上传
    upload(req, res, function(err){
        if (err) {
            console.error(err.message);
            return false;
        } else {
            if (!req.file) {
                next('上传图片不能为空');
                return false;
            }
            var fileSplit = req.file.originalname.split('.');
            var fileName = req.body.name ? (req.body.name + '.' + fileSplit[fileSplit.length-1]) : req.file.originalname;
            // 获取文件的名称，然后拼接成将来要存储的文件路径
            var des_file = uploadDir + fileName;
            // 读取临时文件
            fs.readFile(req.file.path, function(err, data) {
                // 将data写入文件中，写一个新的文件
                fs.writeFile(des_file, data, function(err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        var reponse = {
                            message: 'File uploaded successfully',
                            filename: req.file.originalname
                        };
                        // 删除临时文件
                        fs.unlink(req.file.path, function(err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                console.log('delete '+req.file.path+' successfully!');
                            }
                        });
                    }
                    res.end(JSON.stringify(reponse));
                });

            });
        }
    });

});

var server=app.listen(8080,function(){
    var port = server.address().port;
    console.log('Server at http://127.0.0.1:%s',port);
});