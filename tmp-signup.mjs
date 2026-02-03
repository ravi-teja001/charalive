import pg from 'pg';
import bcrypt from 'bcryptjs';
const client=new pg.Client({connectionString:'postgresql://postgres:yPjyyvkIibFCjPEkVGjLKBiJhkKpPlUh@switchback.proxy.rlwy.net:53307/railway', ssl:{rejectUnauthorized:false}});
await client.connect();
const email='temp@example.com';
const {rows}=await client.query('SELECT id FROM users WHERE email=$1',[email]);
if(rows.length){
  console.log('exists', rows[0]);
}else{
  const hash=await bcrypt.hash('Test123!',10);
  const {rows:r}=await client.query('INSERT INTO users (email,name,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id',[email,'Temp User',hash,'supervisor_stockpoint']);
  await client.query('INSERT INTO user_roles (user_id, role) VALUES ($1,$2)',[r[0].id,'supervisor_stockpoint']);
  console.log('inserted',r[0]);
}
await client.end();
