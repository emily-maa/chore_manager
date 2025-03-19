import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const Users = () => {
  const [children, setChildren] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:3001/child')
      .then(response => {
        setChildren(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the users!', error);
      });
  };
  // NEED TO CHANGE
  const handleAddUser = () => {
    axios.post('http://localhost:3001/users', { name, email })
      .then(response => {
        // setUsers([...users, response.data]);
        setName('');
        setEmail('');
      })
      .catch(error => {
        console.error('There was an error adding the user!', error);
      });
  };

  return (
    <div>
      <h1>Childrens List</h1>
      <ul>
        {children.map(child => (
          <li key={child.userid}>{child.username}</li>
        ))}
      </ul>

      <h2>Add New User</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default Users;