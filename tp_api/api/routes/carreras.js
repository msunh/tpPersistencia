//en este archivo , que es el controlador de carrera. se obtiene la funcionalidad
var express = require("express");
var router = express.Router();
var models = require("../models");

//si se invoca a este metodo /car/ sin nada despuesde de '/' devolvería todo los datos
router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.carrera                    //modelo carrera = tabla llamada carrera
    .findAll({                      //findAll = en sql a : "select * from carrera"
      attributes: ["id", "nombre"]
    })
    .then(carreras => res.send(carreras)) // obtiene un resultado de la promise anterior y me aseguro que sucedió
    .catch(() => res.sendStatus(500));
});


// post localhost:3001/car/
router.post("/", (req, res) => { //tiene req y res (request y response , req.body hace referencia a lo que va en el cuerpo del post)
  models.carrera
    .create({ nombre: req.body.nombre })  //le seteo al nombre de la materia lo que que viene en el req.body.nombre
    .then(carrera => res.status(201).send({ id: carrera.id })) //una vez que termina la insercion del registro devuelve el id insertado
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => { // aparte de id recibo onSucess, oNotFound, onError {esto es una funcion}
  models.carrera                      
    .findOne({                      //metodo de sequalize que devuelve un solo elemento a partir de un  id con el id que recibo
      attributes: ["id", "nombre"],  // esto es lo que devuelve , un solo registro de la base de datos.
      where: { id }   // el campo este debe coioncidir con el que recibo por parametro
    }) //toda esta expresion en su equivalente en sql = select id,nombre from carreras where id = 'algo'

    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound())) // if ternario , then recibe carrera
    .catch(() => onError());
};

/* if ternario, todo ese te bloque de abajo corresponde a la linea 41 :

if(carrera){
  onSuccess(carrera);
}else{
  oNotFound();
}

*/

//si se invoca a este metodo /car/numero (id) devolvería aquello que coincide con el id que le paso como parametro
router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

// metodo enviado desde postman = delete localhost:3001/id 
router.delete("/:id", (req, res) => {  
  const onSuccess = carrera =>   // arrow function o funcion de flecha - variable onSuccess almacena una función, se define la funcionalidad
    carrera                      // entonces onSuccess hace un destroy dentro del modelo que esta indicado, en este caso la tabla carrera
      .destroy()                 // o su equivalente en sql 'delete from carrera where id = "algo" '
      .then(() => res.sendStatus(200))  //borrado correctamente
      .catch(() => res.sendStatus(500)); //


  findCarrera(req.params.id, { // el findCarrera, busca 
    onSuccess,                            // cuando sea invocado, va al elemnto carrera y ejecuta el distroy
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
