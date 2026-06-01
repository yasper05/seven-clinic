const db = require('./db.js');
db.all('SELECT * FROM agendamentos', [], (err, rows) => {
    console.log('Agendamentos:', rows);
    process.exit(0);
});

