/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('mongoose');
host = 'localhost';
db = 'TouchSpace-X';
mongoose.connect('mongodb://' + host + '/' + db);
module.exports = mongoose;