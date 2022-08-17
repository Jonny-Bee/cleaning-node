var mysql = require('mysql');
var fs = require('fs');
const express = require('express');
const app = express();
const crypto = require('crypto');
const secret = 'jpbcleaning';





const con = mysql.createConnection({
    host: "oliadkuxrl9xdugh.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    user: "pgdal4uxfgf9t6yc",
    password: "ycmvbb6qwdhpkgrz",
    database : 'hcsmo7sbmn8rvyn8'
  });

    app.get('/layouts/',(request,res) =>{
		res.set('Access-Control-Allow-Origin', '*');
        if(request.query.section)
            get_layouts_section(res,request.query.section);
        else
            get_layouts(res);
        //res.send(get_layouts());
    })
	
	 app.get('/layouts/update/',(request,res) =>{
		res.set('Access-Control-Allow-Origin', '*');
        update_layout(res,request);
        //res.send(get_layouts());
    })
	
	const update_layout =(res,req) =>{
    let sql;
    
    sql =  `UPDATE layout SET ${req.query.field} = ${req.query.value} WHERE id = '${req.query.id}'`;
    
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
 }
    app.get('/location/',(request,res) =>{
        res.set('Access-Control-Allow-Origin', '*');
        get_locations(res,request.query.section);
        
    })
    app.get('/store/',(request,res) =>{
        res.set('Access-Control-Allow-Origin', '*');
        get_store(res);
        
    })

    app.get('/location/insert/',(request,res) =>{
		res.set('Access-Control-Allow-Origin', '*');
        if(request.query.date)
            create_location(res,request.query.layout,request.query.bay,request.query.date);
        else
            create_location(res,request.query.layout,request.query.bay);
    })

    app.get('/location/update/',(request,res) =>{
        res.set('Access-Control-Allow-Origin', '*');
        update_location(res,request.query.field,request.query.value,request.query.bay_id);
        
    })

   
  con.on('error', function() {
    console.log('error')
  });

app.post('/login/',(request,res) =>{
  res.set('Access-Control-Allow-Origin', '*');
  handleLogin(request,res);
})

const handleLogin = (req,res) =>{
  con.query(`SELECT * FROM w_users WHERE user_name = '${req.query.user_name}'`, function (err, result, fields) {
    if (err) throw err;
    if(result.length > 0)
    {
      if(result.pass_word === req.query.pass_word)
      {
        var hash = crypto.createHash('md5').update(result.store_number + secret).digest('hex');
        var rslt = {user_name:result.user_name,store_number:result.store_number,hash:hash};
        res.send(rslt)
      }
      else{
        var rslt = {msg:'bad_pass'};
        res.send(rslt);
      }
    }
    else
    {
        var rslt = {msg:'no_user'};
        res.send(rslt);
    }
    
  });
}


const create_location = (res,layoutid,bay,lstDate) =>{
    let sql;
    if(lstDate)
        sql =  `INSERT INTO location (layout_id,bay,last_clean) VALUES ('${layoutid}','${bay}','${lstDate}')`;
    else
        sql =  `INSERT INTO location (layout_id,bay) VALUES ('${layoutid}','${bay}')`;
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
}

const update_location = (res,field,value,id) =>{
    let sql;
    
    sql =  `UPDATE location SET ${field} = '${value}' WHERE bay_id = '${id}'`;
    
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
}


 app.listen(process.env.PORT || 5000,() =>{});

 con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!"); 
  });

 const get_layouts = (onComplete) =>{
      con.query("SELECT * FROM layout", function (err, result, fields) {
        if (err) throw err;
        onComplete.send(result)
      });
      
 }

 const get_layouts_section = (onComplete,section) =>{

      con.query(`SELECT * FROM layout WHERE section = '${section}'`, function (err, result, fields) {
        if (err) throw err;
        onComplete.send(result)
      });
 }

 const get_locations = (onComplete,section) =>{
    con.query(`SELECT * FROM location JOIN layout WHERE layout.section = '${section}' AND location.layout_id = layout.id ORDER BY location.bay_id`, function (err, result, fields) {
        if (err) throw err;
        onComplete.send(result)
      });
 }
const get_store = (onComplete) =>{
    con.query(`SELECT * FROM location JOIN layout WHERE location.layout_id = layout.id ORDER BY location.bay_id`, function (err, result, fields) {
        if (err) throw err;
        onComplete.send(result)
      });
 }
 app.get('/weeks/',(request,res) =>{
    res.set('Access-Control-Allow-Origin', '*');
    get_weeks(res);
    
})

app.get('/weeks/insert/',(request,res) =>{
    res.set('Access-Control-Allow-Origin', '*');  
    insert_week(res,request);
    
})

 const get_weeks = (res) =>{
    con.query(`SELECT * FROM weeks`, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.send(result)
      });
 }
 

 const insert_week = (res,req) => {
    let sql;
    let p = {...req.query};
    if(!req.promo)
        p.promo = false;
    if(!req.seasonal)
        p.seasonal = false;
    sql =  `INSERT INTO weeks (start_date,is_promo,is_seasonal) VALUES ('${p.date}','${p.promo}','${p.seasonal}')`;
    
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
 }
 app.get('/weeks/update/',(request,res) =>{
   res.set('Access-Control-Allow-Origin', '*'); 
   update_week(res,request);
    
})

 const update_week =(res,req) =>{
    let sql;
    
    sql =  `UPDATE weeks SET ${req.query.field} = ${req.query.value} WHERE id = '${req.query.id}'`;
    
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) console.log(err);
        res.send(result);
      });
 }
   
 const generate_weeks = () =>{
    let sunday = new Date();
    sunday.setDate(sunday.getDate() - 560 - sunday.getDay());

    for (var i = 0; i < 156; i++) {
        d = sunday.toISOString().slice(0, 19).replace('T', ' ');
        console.log(d);
        sql =  `INSERT INTO weeks (start_date,is_promo,is_seasonal) VALUES ('${d}','false','false')`;
        con.query(sql, function (err, result) {
            if (err) console.log(err);
            
          });
        sunday.setDate(sunday.getDate() + 7);
    }

 }
 