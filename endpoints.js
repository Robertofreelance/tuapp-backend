const Adicional = require("./models/Adicional");
const Users = require("./models/Users");
const { body, validationResult } = require("express-validator");

const successCode = "2501";
const errorCode = "2504";

module.exports = function (app) {
  app.get("/users", async (_, res) => {
    try {
      const result = await Users.find().populate("adicional");
      if (result.length < 1) {
        return res.status(500).json({
          code: errorCode,
          msg: { error: "Ningun usuario se ha registrado" },
        });
      }
      return res.status(200).json({
        code: successCode,
        msg: {
          data: result,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        code: errorCode,
        msg: {
          error: err.toString(),
        },
      });
    }
  });
  app.post(
    "/user",
    body("email").isEmail(),
    body("telefono").isMobilePhone(),
    body("direccion").isString(),
    body("nombres").isString(),
    body("apellidos").isString(),
    body("arte").isString(),
    body("musica").isString(),
    body("cine").isString(),
    body("nombres").isLength(4),
    body("apellidos").isLength(4),
    body("direccion").isLength(4),
    body("arte").isLength(1),
    body("musica").isLength(1),
    body("cine").isLength(1),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {
          email,
          nombres,
          telefono,
          direccion,
          apellidos,
          arte,
          musica,
          cine,
        } = req.body;

        const oldEmail = await Users.findOne({ email });
        if (oldEmail) {
          return res.status(500).json({
            code: errorCode,
            msg: { error: "Este email ya esta registrado" },
          });
        }

        const adicional = new Adicional({
          arte,
          musica,
          cine,
        });

        const adiResult = await adicional.save();

        const user = new Users({
          email: email.toLowerCase(),
          nombres,
          telefono,
          direccion,
          apellidos,
          adicional: adiResult._id,
        });

        const result = await user.save();
        return res.status(200).json({
          code: successCode,
          msg: {
            data: {
              id: result._id,
              ...result._doc,
              adicional: {
                ...adiResult._doc,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          code: errorCode,
          msg: {
            error: err.toString(),
          },
        });
      }
    }
  );
  app.get("/user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) {
        return res.status(500).json({
          code: errorCode,
          msg: { error: "No se ha introducido el email de ningun usuario" },
        });
      }
      const result = await Users.findOne({ email }).populate("adicional");

      if (!result) {
        return res.status(500).json({
          code: errorCode,
          msg: { error: "Ningun usuario se ha registrado con este correo" },
        });
      }
      return res.status(200).json({
        code: successCode,
        msg: {
          data: result,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        code: errorCode,
        msg: {
          error: err.toString(),
        },
      });
    }
  });
  app.get("/aditionals", async (_, res) => {
    try {
      const result = await Adicional.find();
      if (result.length < 1) {
        return res.status(500).json({
          code: errorCode,
          msg: {
            error: "No se ha proporcionado ninguna información adicional",
          },
        });
      }
      return res.status(200).json({
        code: successCode,
        msg: {
          data: result,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        code: errorCode,
        msg: {
          error: err.toString(),
        },
      });
    }
  });
  app.put(
    "/user/:email",
    body("nombres").isString(),
    body("direccion").isString(),
    body("apellidos").isString(),
    body("telefono").isString(),
    body("musica").isString(),
    body("arte").isString(),
    body("cine").isString(),
    async (req, res) => {
      try {
        const email = req.params.email;
        if (!email) {
          return res.status(500).json({
            code: errorCode,
            msg: { error: "No se ha introducido el email de ningun usuario" },
          });
        }
        const user = await Users.findOne({ email }).populate("adicional");

        if (!user) {
          return res.status(500).json({
            code: errorCode,
            msg: { error: "Ningun usuario se ha registrado con este correo" },
          });
        }

        const { nombres, apellidos, direccion, telefono, musica, arte, cine } =
          req.body;
        const adicional = await Adicional.findById(user.adicional.id);
        if (!adicional) throw new Error("Algo fallo");

        if (musica && musica.length > 0) {
          adicional.musica = musica;
        }
        if (arte && arte.length > 0) {
          adicional.arte = arte;
        }
        if (cine && cine.length > 0) {
          adicional.cine = cine;
        }
        const adResult = await adicional.save();

        if (nombres && nombres !== "") {
          user.nombres = nombres;
        }
        if (apellidos && apellidos !== "") {
          user.apellidos = apellidos;
        }
        if (direccion && direccion !== "") {
          user.direccion = direccion;
        }
        if (telefono && telefono !== "") {
          user.telefono = telefono;
        }

        const result = await user.save();

        return res.status(200).json({
          code: successCode,
          msg: {
            data: {
              ...result._doc,
              adicional: {
                id: adResult._id,
                ...adResult._doc,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          code: errorCode,
          msg: {
            error: err.toString(),
          },
        });
      }
    }
  );
  app.delete("/user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) {
        return res.status(500).json({
          code: errorCode,
          msg: { error: "No se ha introducido el email de ningun usuario" },
        });
      }
      const user = await Users.findOne({ email });

      if (!user) {
        return res.status(500).json({
          code: errorCode,
          msg: { error: "Ningun usuario se ha registrado con este correo" },
        });
      }
      await Adicional.findByIdAndRemove(user.adicional._id);
      await user.delete();
      return res.status(200).json({
        code: successCode,
        msg: "El usuario y su información adicional fue borrada exitosamente",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        code: errorCode,
        msg: {
          error: err.toString(),
        },
      });
    }
  });
};
