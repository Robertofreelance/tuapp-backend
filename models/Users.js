const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  nombres: String,
  apellidos: String,
  telefono: String,
  email: String,
  direccion: String,
  adicional: {
    type: Schema.Types.ObjectId,
    ref: "Adicional",
  },
});
module.exports = model("Users", userSchema);
