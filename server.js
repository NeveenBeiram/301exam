'use strict';

require('dotenv');

const superagent = require('superagent');

const pg = require('pg');

const cors = require('cors');

const methodOverride = require('method-override');

const PORT = process.env.PORT || 3000;

const express = require('express');

const server = express();

server.use(cors());

server.use(express.static('./public'));

server.set('view engine', 'ejs');

server.use(express.urlencoded({ extended: true }));

server.use(methodOverride('_method'));

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }
});


server.get('/', homeRender);
server.post('/search', searchHandler);
server.get('/maybelline', maybellineHandler);
server.post('/addToMyProduct',insertproductHandler);
server.get('/myProduct',renderMyProducts);
server.get('/viewDetails/:id',renderDetails);
server.put('/update/:id',updateRender);
server.delete('/delete/:id',deleteHandler);



function homeRender(req, res) {
  res.render('index');
}

function searchHandler(req, res) {
  let brand = req.body.brand;
  let grater = req.body.grater;
  let lower = req.body.lower;

  let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${grater}&price_less_than=${lower}`;
  superagent.get(url)
    .then(data => {
      let bodyData = data.body;
      //   let correctData=bodyData.map(val=>{
      //   console.log(val);
      // return val;
      // console.log(bodyData);
      res.render('productByPrice', { data: bodyData });
    })
    .catch(err => {
      console.log(err);
    });
}

function maybellineHandler(req, res) {
  let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
  superagent.get(url)
    .then(data => {
      let bodyData = data.body;
      bodyData.map(element => {
        return new Product(element);

      });
      res.render('maybelline', { data: bodyData });
    }).catch(err => {
      console.log(err);
    });
}


function insertproductHandler(req,res){
  let {name, price, image, description}=req.body;
  let sql=`INSERT INTO products (name, price, image, description) VALUES ($1,$2,$3,$4);`;
  let safeValues=[name, price, image, description];
  client.query(sql,safeValues)
    .then (data=>{
      res.redirect('/myProducts');
    }).catch(err => {
      console.log(err);
    });

}

function renderMyProducts(req,res){
  let sql=`SELECT * FROM products;`;
  client.query(sql)
    .then(data=>{
      res.render('myProducts',{data:data.rows});
    }).catch(err => {
      console.log(err);
    });

}

function renderDetails(req,res){

  let id=req.params.id;

  let sql=`select * from products where id=$1; `;
  let safeValues=[id];
  client.query(sql,safeValues)
    .then(data=>{
      res. render('detalis',{data:data.rows[0]});
    }).catch(err => {
      console.log(err);
    });
}

function updateRender(req,res){
  let {name, price, image, description}=req.body;
  let id=req.params.id;
  let sql=`UPDATE products SET name=$1, price=$2, image=$3, description=$4 where id=$5 ;`;
  let safe=[name, price, image, description,id];
  client.query(sql,safe)
    .then(val=>{
      res.redirect(`/viewDetails/${id}`);
    }).catch(err => {
      console.log(err);
    });
}

function deleteHandler(req,res){
  let id=req.params.id;
  let sql=`delete from products where id=$1;`;
  let safe=[id];
  client.query(sql,safe)
    .then(()=>{
      res.redirect('/myProduct');
    }).catch(err => {
      console.log(err);
    });
}


function Product(data) {
  this.name = data.name;
  this.price = data.price;
  this.image = data.image;
  this.description = data.description;
}


client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening on PORT : ${PORT}`);
    }).catch(err => {
      console.log(err);
    });
  });
