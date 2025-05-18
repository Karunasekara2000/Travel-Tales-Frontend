import React, { useEffect, useState } from "react";
import axios from "../service/baseService";
import NavBar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/users", {
                headers: {
                    "x-csrf-token": localStorage.getItem("csrfToken")
                },
                withCredentials: true
            });
            setUsers(res.data.users);  // 🔥 FIXED: access res.data.users
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`/users/${userId}`, {
                headers: {
                    "x-csrf-token": localStorage.getItem("csrfToken")
                },
                withCredentials: true
            });
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const openEditModal = (user) => {
        setEditUser({ ...user });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/users/${editUser.id}`, {
                username: editUser.username,
                role: editUser.role
            }, {
                headers: {
                    "x-csrf-token": localStorage.getItem("csrfToken")
                },
                withCredentials: true
            });
            setEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error("Failed to update user", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <>
            <div className="container mt-4" style={{paddingTop: "80px"}}>
                <h2 className="text-primary mb-4">User Management</h2>
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => openEditModal(user)}>
                                    <i className="bi bi-pencil-fill"></i> Edit
                                </button>
                                <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(user.id)}>
                                    <i className="bi bi-trash-fill"></i> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {editModalOpen && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit User</h5>
                                    <button type="button" className="btn-close"
                                            onClick={() => setEditModalOpen(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Username:</label>
                                    <input className="form-control mb-2" name="username"
                                           value={editUser.username} onChange={handleEditChange}  />

                                    <label className="form-label">Role:</label>
                                    <select className="form-select" name="role"
                                            value={editUser.role} onChange={handleEditChange}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-success">Save</button>
                                    <button type="button" className="btn btn-secondary"
                                            onClick={() => setEditModalOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Users;
