import React, {useEffect, useState} from 'react';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';
export default function Users(){
  const [users,setUsers]=useState([]);
  const [form,setForm]=useState({name:'',email:''});
  useEffect(()=>{ fetch(API+'/users').then(r=>r.json()).then(setUsers); },[]);
  async function login(e){ e.preventDefault();
    const res = await fetch(API+'/users/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(form)});
    const data=await res.json(); setUsers(u=>[data,...u]); setForm({name:'',email:''});
  }
  return (<div>
    <h2>Users</h2>
    <form onSubmit={login}>
      <input placeholder='name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder='email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <button>Login / Create</button>
    </form>
    <ul>{users.map(u=> <li key={u.id}>{u.name} — {u.email}</li>)}</ul>
  </div>);
}
