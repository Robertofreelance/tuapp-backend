const { model, Schema } = require("mongoose");

const adicionalSchema = new Schema({
  arte: String,
  cine: String,
  musica: String,
});
module.exports = model("Adicional", adicionalSchema);
