const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: '',
      database: 'avantus_db'
    });
    await conn.query("UPDATE cms_team_members SET image_url = '/team/laiba-baig-ceo.jpg', title = 'CEO Laiba Baig', role = 'Chief Executive Officer' WHERE id = 1");
    await conn.query("UPDATE cms_team_members SET image_url = '/team/maira.jpg', title = 'Maira', role = 'Graphic Designer' WHERE id = 2");
    const [rows] = await conn.query('SELECT id, name, title, role, image_url FROM cms_team_members');
    console.log('Updated DB rows:', rows);
    await conn.end();
  } catch(e) {
    console.log('DB Note:', e.message);
  }
}

run();
