const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const express = require('express')
const app = express()
const port = 4000
const db = new sqlite3.Database('./DB_DELIASIA.db');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const convertirString = (string) =>{
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: process.env.CONNECTIONLIMIT
});
//------------------
const salt = bcrypt.genSaltSync()
const pass = bcrypt.hashSync('Hola mundo',salt)
//------------------
app.get('/', (req, res) => {
  console.log('get /')
  res.send('holas')
})
app.get('/get-productos', (req, res) => {
  //console.log('get /')
  pool.query('SELECT * FROM productos order by fecha desc', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})


app.get('/get-recetas', (req, res) => {
  //console.log('get /')
  pool.query('SELECT * FROM recetas', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})

app.get('/get-recetas-distinct', (req, res) => {
  //console.log('get-precios/')
  pool.query('SELECT distinct nomb_plato FROM recetas', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})
app.get('/get-precio', (req, res) => {
  //console.log('get /')
  pool.query('SELECT * FROM precio_venta', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})
app.get('/get-compras', (req, res) => {
  //console.log('get-compras /')
  pool.query('SELECT * FROM compras', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})
app.get('/get-movimiento', (req, res) => {
  //console.log('get-movimiento /')
  pool.query('SELECT * FROM movimientos', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})

app.get('/get-ventas', (req, res) => {
  //console.log('get-compras /')
  pool.query('SELECT * FROM ventas', (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(results);
    }
  });
})
//POST
  

app.post('/post-productos', (req, res) => {
    //res.send('/post')
  console.log(req.body)
  db.serialize(function() {
    const date = (new Date(Date.now()))
    const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes() + ":00"

    console.log(date1)
    pool.query(`insert into productos values('${convertirString(req.body.Nombre )}','${convertirString(req.body.Categoria)}','${convertirString(req.body.Unidad)}',${req.body.Merma},0,0,'${convertirString(date1)}')`, (error, results, fields) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.json(results);
      }
    });
  })
  
  })

app.post('/post-recetas', (req, res) => {
  res.send('/post-recetas')
  console.log(req.body)
  pool.query(`insert into recetas values('${convertirString(req.body.Nombre)}','${convertirString(req.body.Categoria)}','${convertirString(req.body.Producto)}',${req.body.Cantidad},'${convertirString(req.body.Unidad)}')`, (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      console.log(results)
      //res.json(results);
    }
  });
})

app.post('/post-delete-recetas', (req, res) => {
  res.send('/post-recetas')
  console.log(req.body)
  pool.query(`DELETE FROM recetas where nomb_plato = '${convertirString(req.body.nomb_plato)}' AND categoria = '${convertirString(req.body.categoria)}' AND nomb_producto = '${convertirString(req.body.nomb_producto)}' AND cantidad = ${req.body.cantidad} AND unidad_cantidad = '${convertirString(req.body.unidad_cantidad)}'`, (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      //res.json(results);
    }
  });
})

app.post('/post-precios', (req, res) => {
  console.log(req.body)
  pool.query(`SELECT nomb_plato FROM precio_venta WHERE nomb_plato = '${convertirString(req.body.Nombre)}'`,(error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      if(results.length !== 0){
        const date = (new Date(Date.now()))
        const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes() + ":00"
        pool.query(`update precio_venta set  precio = ${req.body.Precio}, fecha = '${convertirString(date1)}' where nomb_plato = '${convertirString(req.body.Nombre)}'`);
      }else{
        const date = (new Date(Date.now()))
        const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes() + ":00"
        pool.query(`insert into precio_venta values('${convertirString(req.body.Nombre)}',${req.body.Precio},'${convertirString(date1)}')`);
      }
      res.status(200).send('/post-precios')
    }
  });
})
app.post('/post-compras', (req, res) => {
  res.send('/post-compras')
  console.log(req.body)
    const date = (new Date(Date.now()))
    const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes() + ":00"
        pool.query(`SELECT * FROM productos where nomb_producto = '${convertirString(req.body.Nombre)}'`, (error, results, fields) => {
      if (error) {
        res.status(500).send(error);
      } else {
        let newPrecio,newCantidad
        if(results[0].precio_unidad<(Number(req.body.Precio)/(Number(req.body.Cantidad)-(Number(req.body.Cantidad)*Number(results[0].merma))))){
          newPrecio = (Number(req.body.Precio)/(Number(req.body.Cantidad)-(Number(req.body.Cantidad)*Number(results[0].merma))))
        }
        else{
          newPrecio = results[0].precio_unidad
        }
        newCantidad = Number(results[0].cantidad) + Number(req.body.Cantidad)
        const query = `update productos set precio_unidad = ${newPrecio}, cantidad = ${newCantidad},fecha = '${convertirString(date1)}' where nomb_producto = '${convertirString(req.body.Nombre)}'`
        pool.query(query);
      }
      pool.query(`insert into compras values('${convertirString(req.body.Nombre)}',${req.body.Cantidad},${req.body.Precio},'${convertirString(req.body.Tienda)}','${convertirString(date1)}')`);
    });
})
app.post('/post-ventas', (req, res) => {
  res.send('/post-ventas')
  console.log(req.body)
  const date = (new Date(Date.now()))
  const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes() + ":00"
    pool.query(`insert into ventas values('${convertirString(req.body.Nombre)}',${req.body.Cantidad},'${convertirString(req.body.Local)}','${convertirString(date1)}')`, (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      //res.json(results);
    }
  });
  pool.query(`SELECT 
    A.nomb_producto as nombre ,A.cantidad-(B.cantidad * ${Number(req.body.Cantidad)}) as cantidad
    FROM productos A
    right join recetas B on A.nomb_producto = B.nomb_producto 
    Where B.nomb_plato = '${convertirString(req.body.Nombre)}'`, (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      results.map(row =>
        pool.query(`update productos set  cantidad = ${row.cantidad}, fecha = '${convertirString(date1)}' where nomb_producto = '${convertirString(row.nombre)}'`)
      )
    }
  });
})

app.post('/post-movimiento', (req, res) => {
  res.send('/post-movimientos')
  console.log(req.body)
  const date = (new Date(Date.now()))
  const date1 = date.getFullYear() + "-"  + (date.getMonth()+1) + "-" + date.getDate() + " "+ date.getHours() + ":" + date.getMinutes().toString() + ":00"
  console.log(date1)
    pool.query(`insert into movimientos values('${convertirString(req.body.Movimiento)}','${convertirString(req.body.Tipo)}',${req.body.Monto},'${convertirString(req.body.Descripcion)}','${convertirString(date1)}')`);
})

app.post('/post-login', (req, res) => {
  //res.send('/post-login')
  console.log(req.body)
  pool.query(`SELECT * FROM users WHERE user = '${req.body.User}'`,(error, results, fields) => {
    if (error) {
      res.status(400).send(error);
    } else {
      if(results.length !== 0){
        const validPass = bcrypt.compareSync(req.body.Password,results[0].password)
        if(!validPass){
          res.status(400).send('Usuario o contraseña invalidas')
        }else{
          res.status(200).send({auth:True,msg:'Logged'})
        }
      }else{
        res.status(400).send('Usuario no existe')
      }


    }
  })
  
})

app.post('/post-register', (req, res) => {
  //res.send('/post-register')
  console.log(req.body)
  pool.query(`SELECT * FROM users WHERE user = '${req.body.User}'`,(error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      if(results.length === 0){

        const salt = bcrypt.genSaltSync()
        const pass = bcrypt.hashSync(req.body.Password,salt)
        pool.query(`insert into users (user,password,email) values('${req.body.User}','${pass}','${req.body.Email}')`,(error,results) =>{
          if(error){
            console.log(error)
          }
          else{
            res.status(200).send('Usuario Creado')
          }
        })

      }
      else{
        res.status(200).send('Usuario ya existe')
      }

    }
  })
})  

  
app.listen(process.env.PORT||port, () => {
    console.log(`Example app listening on port ${process.env.PORT||port}`)
  })