var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://Robert:#Anirban95@ds163340.mlab.com:63340/meanquiz');

var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

var mongodbUri = 'mongodb://Eagle:sharkasm@ds145639.mlab.com:45639/aptitude';

mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {console.log("Great success!")});

var Schema = mongoose.Schema;

//We can also keep the models in a separate route

var userDataSchema = new Schema({
  name: {type: String, required: true},
  id: {type: String, required: true, unique:true},
  score: {type: Number}
});
var UserData = mongoose.model('UserData', userDataSchema);

var adminDataSchema = new Schema({
  num: {type: Number,unique:true},
  question: {type: String},
  option1: {type: String},
  option2: {type: String},
  option3: {type: String},
  option4: {type: String},
  optionCorrect: {type: String,}
});

var AdminData = mongoose.model('AdminData', adminDataSchema);


/* All Routes Go Here */

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('The Raven that refused to sing');
  res.render('page1');
});
//Route to see all registered candidates
router.get('/page8', function(req, res, next) {
  if(session.uniqueId=='admin'){
    UserData.find({},function(err, doc){
        res.render('page8',{items:doc});
    });
  }
    else {
      res.end('Unauthorized Access');
    }
    console.log('The Raven that refused to sing');
});
//Route to delete all registered people
router.get('/deleteName', function(req, res){
  if(session.uniqueId='admin'){
    UserData.remove({}, function(err){
      console.log('Collection Removed');
    });
  }
});
//Route to get latest score
router.get('/scoreCard', function(req, res, next) {
    var passedVariable = req.query.valid;
    console.log(passedVariable);
  res.render('page1', {score:passedVariable});
});
//Route to page 2
router.get('/page2', function(req, res, next) {
  session=req.session;
  //var passedVariable = req.query.valid;
  if(session.uniqueId){
    var passedVariable = req.query.valid;
    res.render('page2', {name:passedVariable});
  }else{
    res.end('Unauthorized access');
  }

});
//Route to a not so important page(Good luck page)
router.get('/page5', function(req, res, next) {
  session=req.session;
  //var passedVariable = req.query.valid;
  if(session.uniqueId){
    var passedVariable = req.query.valid;
    res.render('page5', {name:passedVariable});
  }else{
    res.end('Unauthorized access');
  }

});
//Route to Finish Test page
router.get('/page6', function(req, res, next){
  if(session.uniqueId){
    var passedVariable;
    UserData.findOne({id:session.uniqueId}, function(err, doc){
      passedVariable=doc.score;
      res.render('page6', {marks:passedVariable});
    });
  }
});
//ROute to Admin's dashboard
router.get('/admin', function(req, res, next) {
  session=req.session;
  if(session.uniqueId=='admin'){
    res.render('page3');
  }else {
    res.end('Unauthorized Access');
  }
});
//Route to submision of answers
router.post('/submit', function(req, res, next){
  AdminData.findOne({num:no},function(err,doc)
{
  if(err){
    res.end('Please try again');
  }
  if(req.body.option.toString().trim()===doc.optionCorrect.toString().trim())
  {
    mark++;
    console.log('Correct Answer');
  }
  else {
    console.log('Wrong Answer');
  }

});
  no++;
  AdminData.count({},function(err, count){
    total=count;
  if(no<=total){
  AdminData.findOne({num:no},function(err,doc)
    //  .then(function(doc)
       {
        res.render('page4', {item: doc});
      });
    }
    else{
          console.log(mark);
          var string = encodeURIComponent(mark);
          UserData.findOne({id:session.uniqueId}, function(err, data){
            if (err){
              res.send('fucked up');
            }
            else{
            data.score=mark;
            data.save();
              res.redirect('/page6?valid=' + string);
              console.log(data.score);
          }
          });

    }
});
});
// Route to Admin Login page
router.post('/adminLogin', function(req, res, next) {
  session=req.session;
  if(session.uniqueId){
    res.redirect('/admin');
  }
  var username=req.body.username;
  var password=req.body.password;
  if(username=='admin' && password=='admin'){
  session.uniqueId = req.body.username;
  console.log(session.uniqueId);
  res.redirect('/admin');
}

});
//Route to logging out of your sessions
router.get('/logout', function(req, res, next){
  session=req.session;
  if(session.uniqueId){
    req.session.destroy(function(error){
      console.log(error);
      res.redirect('/');
    });
  }
});
//Route to saving entries
router.post('/save', function(req, res, next) {
    var item = {
    num: req.body.number,
    question: req.body.question,
    option1: req.body.option1,
    option2: req.body.option2,
    option3: req.body.option3,
    option4: req.body.option4,
    optionCorrect: req.body.optionCorrect
  };

  var data = new AdminData(item);
  data.save(function(err, result){
    if (err){
      console.log(err);
      res.end('Enter a unique question number.')
    }
    else{
      res.redirect('/admin');
    }
  });
});
//Route to display entries
router.get('/get-data', function(req, res, next) {
  AdminData.find({}, function(err,doc){
    if(session.uniqueId=='admin'){
    res.render('page7', {items: doc});
  }
  else{
    res.end('Unauthorized Access');
  }
});
});
//Route to Startpage
router.get('/startTest', function(req, res, next) {
  if(session.uniqueId){

    no = 1;
    AdminData.findOne({num:no},function(err,doc)
      //  .then(function(doc)
         {
           mark=0;
          res.render('page4', {item: doc});
        });
      }
  });
//Route to Register
router.post('/register', function(req, res, next) {
  var item = {
    name: req.body.name,
    id: req.body.id
  };

  var data = new UserData(item);
  data.save(function(err, result){
    if (err){
      console.log(err);
      res.end('You are already registered with us');
    }
    else{
      session=req.session;
      session.uniqueId = req.body.id;
      if(session.uniqueId){
        var string = encodeURIComponent(req.body.name);
        res.redirect('/page5?valid=' + string);
        }
    }
  });

});

//The route Get-Score redirects to anotehr route to display scorecard

router.post('/getScore', function(req, res, next){
  var sid = req.body.id;
  UserData.findOne({id:sid}, function(err, user){
    if(err){
      console.log(err);
    }
    if(!user) {
      return res.status(404).send("Sorry No Match.");
    }
      console.log("Your score is",user.score);
      var string = encodeURIComponent(user.score);
      res.redirect('/scoreCard?valid=' + string);

  });
});
//Route to Log In
router.post('/login', function(req, res, next){
var username = req.body.name;
var id = req.body.id;

UserData.findOne({name: username, id :id},function(err, user){
  if(err) {
    console.log(err);
    return res.status(500).send();
  }
  if(!user) {
    return res.status(404).send("Sorry No Match.");
  }
  session=req.session;
  session.uniqueId = req.body.id;
  if(session.uniqueId){
    var string = encodeURIComponent(req.body.name);
    res.redirect('/page2?valid=' + string);
    }

});
});
//Roite to updation of entries
router.post('/update', function(req, res) {
  var id = req.body.num;

  AdminData.findOne({num:id}, function(err, doc) {

    if (err) {
      console.error('error, no entry found');
    }

    doc.num = req.body.num1;
    doc.question = req.body.question;
    doc.option1 = req.body.op1;
    doc.option2 = req.body.op2;
    doc.option3 = req.body.op3;
    doc.option4 = req.body.op4;
    doc.optionCorrect = req.body.op;
    doc.save();

  })
  res.redirect('/admin');
});
//Route to dleleting one entry
router.post('/delete', function(req, res, next) {
  var id= req.body.num;
  AdminData.findOne({num:id},function(err,doc){
    doc.remove();
  });
  res.redirect('/admin');
});

//Route to remove all entries
router.get('/deleteAll', function(req, res){
  if(session.uniqueId='admin'){
AdminData.remove({}, function(err){
  console.log("Collection Removed");
});
res.redirect('/admin');
}
else{
  res.end('Unauthorized Access');
}
});

module.exports = router;
