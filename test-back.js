const sqlite3 = require('sqlite3').verbose();
const express = require('express')
const app = express()
const port = 4000
const db = new sqlite3.Database('./DB_DELIASIA.db');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());

app.get('/', (req, res) => {
  console.log('get /')
  res.send('holas')
  })
app.get('/get-productos', (req, res) => {
  console.log('get /')
    db.all('SELECT * FROM productos', function(err, rows) {
        
        res.send(rows)
      });
  })


app.get('/get-recetas', (req, res) => {
  console.log('get /')
    db.all('SELECT * FROM recetas', function(err, rows) {
        
        res.send(rows)
      });
  })

app.get('/get-recetas-distinct', (req, res) => {
  console.log('get-precios/')
    db.all('SELECT distinct nomb_plato FROM recetas', function(err, rows) {
        
        res.send(rows)
      });
  })
app.get('/get-precio', (req, res) => {
    console.log('get /')
      db.all('SELECT * FROM precio_venta', function(err, rows) {
          
          res.send(rows)
        });
    })
app.get('/get-compras', (req, res) => {
  console.log('get-compras /')
    db.all('SELECT * FROM compras', function(err, rows) {
        
        res.send(rows)
      });
  })
app.get('/get-movimiento', (req, res) => {
  console.log('get-movimiento /')
    db.all('SELECT * FROM movimientos', function(err, rows) {
        
        res.send(rows)
      });
  })
  app.get('/get-ventas', (req, res) => {
    console.log('get-compras /')
      db.all('SELECT * FROM ventas', function(err, rows) {
          res.send(rows)
        });
    })

// app.get('/get-test', (req, res) => {
//   console.log('get /')
//     db.all('SELECT nomb_plato FROM precio_venta', function(err, rows) {
//         console.log(rows)
//         res.send(rows)
//       });
//   })  
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/post-productos', (req, res) => {
    //res.send('/post')
    console.log(req.body)
    db.serialize(function() {
      const date = (new Date(Date.now()))
      const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
      console.log(date1)
      db.run(`insert into productos values('${req.body.Nombre}','${req.body.Categoria}','${req.body.Unidad}',${req.body.Merma},0,0,'${date1}')`,function (err) {
        if (err){
          res.status(400).send('err')
          console.log(err)
        }
        else{
          res.status(200).send('ok')
        }
      });
    })
  
  })

app.post('/post-recetas', (req, res) => {
  res.send('/post-recetas')
  console.log(req.body)
  db.serialize(function() {
      db.run(`insert into recetas values('${req.body.Nombre}','${req.body.Categoria}','${req.body.Producto}',${req.body.Cantidad},'${req.body.Unidad}')`);
  })
})

app.post('/post-delete-recetas', (req, res) => {
  res.send('/post-recetas')
  console.log(req.body)

  db.serialize(function() {
      db.run(`DELETE FROM recetas where nomb_plato = '${req.body.nomb_plato}' AND categoria = '${req.body.categoria}' AND nomb_producto = '${req.body.nomb_producto}' AND cantidad = ${req.body.cantidad} AND unidad_cantidad = '${req.body.unidad_cantidad}'`);
  })
})

app.post('/post-precios', (req, res) => {
  res.send('/post-precios')
  console.log(req.body)
  db.all(`SELECT nomb_plato FROM precio_venta WHERE nomb_plato = '${req.body.Nombre}'`, function(err, rows) {
            if(rows.length !== 0){
              db.serialize(function() {
                const date = (new Date(Date.now()))
                const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
                db.run(`update precio_venta set  precio = ${req.body.Precio}, fecha = '${date1}' where nomb_plato = '${req.body.Nombre}'`);
              })
            }else{
              db.serialize(function() {
                const date = (new Date(Date.now()))
                const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
                db.run(`insert into precio_venta values('${req.body.Nombre}',${req.body.Precio},'${date1}')`);
              })
            }
          });
})
app.post('/post-compras', (req, res) => {
  res.send('/post-compras')
  console.log(req.body)
  db.serialize(function() {
      const date = (new Date(Date.now()))
      const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
      db.all(`SELECT * FROM productos where nomb_producto = '${req.body.Nombre}'`, function(err, rows) {
        let newPrecio,newCantidad
        if(rows[0].precio_unidad<(Number(req.body.Precio)/(Number(req.body.Cantidad)-(Number(req.body.Cantidad)*Number(rows[0].merma))))){
          newPrecio = (Number(req.body.Precio)/(Number(req.body.Cantidad)-(Number(req.body.Cantidad)*Number(rows[0].merma))))
        }
        else{
          newPrecio = rows[0].precio_unidad
        }
        console.log(newPrecio)
        newCantidad = Number(rows[0].cantidad) + Number(req.body.Cantidad)
        const query = `update productos set precio_unidad = ${newPrecio}, cantidad = ${newCantidad},fecha = '${date1}' where nomb_producto = '${req.body.Nombre}'`
        db.run(query);

      });
      db.run(`insert into compras values('${req.body.Nombre}',${req.body.Cantidad},${req.body.Precio},'${req.body.Tienda}','${date1}')`);
      

  })
})
app.post('/post-ventas', (req, res) => {
  res.send('/post-ventas')
  console.log(req.body)
  const date = (new Date(Date.now()))
  const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
  db.serialize(function() {
      db.run(`insert into ventas values('${req.body.Nombre}',${req.body.Cantidad},'${req.body.Local}','${date1}')`);
      db.all(`SELECT 
                A.nomb_producto as nombre ,A.cantidad-(B.cantidad * ${Number(req.body.Cantidad)}) as cantidad
                FROM productos A
                right join recetas B on A.nomb_producto = B.nomb_producto 
                Where B.nomb_plato = '${req.body.Nombre}'`
            ,function(err, rows) {
              console.log(rows)
              rows.map(row =>
                db.run(`update productos set  cantidad = ${row.cantidad}, fecha = '${date1}' where nomb_producto = '${row.nombre}'`)
              )
      });
  })
})

app.post('/post-movimiento', (req, res) => {
  res.send('/post-movimientos')
  console.log(req.body)
  const date = (new Date(Date.now()))
  const date1 = date.getDate() + "-"  + (date.getMonth()+1) + "-" + date.getFullYear()
  db.serialize(function() {
      db.run(`insert into movimientos values('${req.body.Movimiento}','${req.body.Tipo}',${req.body.Monto},'${req.body.Descripcion}','${date1}')`);
  })
})


  
app.listen(port, () => {
    console.log(`Example app listening on port ${process.env.PORT||port}`)
  })  
