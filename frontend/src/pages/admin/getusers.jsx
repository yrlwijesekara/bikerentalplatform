import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/loader.jsx";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login first");
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/users/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUsers(response.data?.users || []);
            } catch (err) {
                const message = err.response?.data?.error || "Failed to fetch users";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader />
                <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <div className="w-full max-w-[98vw] xl:max-w-[1600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Users</h1>

                <div className="mb-4 text-center text-sm text-gray-600">
                    Total Users: {users.length}
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No users found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[700px]">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Name</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Email</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Phone</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Address</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border border-gray-300">{user.name || "N/A"}</td>
                                            <td className="py-3 px-4 border border-gray-300">{user.email || "N/A"}</td>
                                            <td className="py-3 px-4 border border-gray-300">{user.phone || "N/A"}</td>
                                            <td className="py-3 px-4 border border-gray-300">{user.address || "N/A"}</td>
                                            <td className="py-3 px-4 border border-gray-300">

                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : user.role === "vendor"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-green-100 text-green-800"
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}