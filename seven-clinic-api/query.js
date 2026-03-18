const db = require('./db.js');
db.all('SELECT * FROM usuarios', [], (err, rows) => {
    console.log('Usuarios:', rows);
    db.all('SELECT * FROM profissionais', [], (err, rows2) => {
        console.log('Profissionais:', rows2);
        process.exit(0);
    });
});
