import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Loader from "../../components/loader.jsx";

export default function Users() {
    const USERS_PER_PAGE = 15;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [vendorProductsLoading, setVendorProductsLoading] = useState(false);
    const [vendorProductsError, setVendorProductsError] = useState("");

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
                toast.success("Users fetched successfully");
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

    const filteredUsers = useMemo(() => {
        const loweredSearch = searchTerm.toLowerCase();

        return users.filter((user) => {
            const userId = (user.id || user._id || "").toString();
            const matchesSearch =
                !searchTerm ||
                userId.toLowerCase().includes(loweredSearch) ||
                (user.name || "").toLowerCase().includes(loweredSearch) ||
                (user.email || "").toLowerCase().includes(loweredSearch) ||
                (user.phone || "").toLowerCase().includes(loweredSearch) ||
                (user.city || "").toLowerCase().includes(loweredSearch) ||
                (user.address || "").toLowerCase().includes(loweredSearch);

            const matchesRole = !selectedRole || user.role === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, selectedRole]);

    useEffect(() => {
        const pages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
        if (currentPage > pages) {
            setCurrentPage(pages);
        }
    }, [filteredUsers, currentPage]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedRole("");
        setCurrentPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

    const getPaginationItems = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push("left-ellipsis");
        for (let p = start; p <= end; p += 1) {
            pages.push(p);
        }
        if (end < totalPages - 1) pages.push("right-ellipsis");

        pages.push(totalPages);
        return pages;
    };

    const openDetails = async (user) => {
        setSelectedUser(user);
        setVendorProducts([]);
        setVendorProductsError("");

        if (user.role !== "vendor") {
            return;
        }

        try {
            setVendorProductsLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setVendorProductsError("Please login first");
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/products`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const allProducts = response.data?.products || [];
            const selectedUserId = (user.id || user._id || "").toString();

            const vendorBikeList = allProducts.filter((product) => {
                const vendorId = (product.vendor?._id || product.vendor || "").toString();
                return vendorId === selectedUserId;
            });

            setVendorProducts(vendorBikeList);
        } catch (err) {
            const message = err.response?.data?.message || "Failed to load vendor bikes";
            setVendorProductsError(message);
        } finally {
            setVendorProductsLoading(false);
        }
    };

    const closeDetails = () => {
        if (approvalLoading) return;
        setSelectedUser(null);
        setVendorProducts([]);
        setVendorProductsError("");
    };

    const handleVendorApproval = async (user, nextApprovalState) => {
        try {
            setApprovalLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/users/vendor/${user.id}/approval`,
                { isApproved: nextApprovalState },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            const updatedUser = response.data?.user;
            setUsers((prevUsers) =>
                prevUsers.map((item) =>
                    item.id === user.id
                        ? {
                              ...item,
                              vendorDetails: {
                                  ...(item.vendorDetails || {}),
                                  isApproved: updatedUser?.vendorDetails?.isApproved ?? nextApprovalState,
                                  approvedAt: updatedUser?.vendorDetails?.approvedAt ?? (nextApprovalState ? new Date().toISOString() : null),
                              },
                          }
                        : item
                )
            );

            setSelectedUser((prevUser) =>
                prevUser && prevUser.id === user.id
                    ? {
                          ...prevUser,
                          vendorDetails: {
                              ...(prevUser.vendorDetails || {}),
                              isApproved: updatedUser?.vendorDetails?.isApproved ?? nextApprovalState,
                              approvedAt: updatedUser?.vendorDetails?.approvedAt ?? (nextApprovalState ? new Date().toISOString() : null),
                          },
                      }
                    : prevUser
            );

            toast.success(response.data?.message || "Vendor approval updated successfully");
        } catch (err) {
            const message = err.response?.data?.error || "Failed to update vendor approval";
            toast.error(message);
        } finally {
            setApprovalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
                <Loader />
                <p className="text-gray-600 mt-4">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <div className="w-full max-w-[98vw] xl:max-w-400 mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Users</h1>

                <div className="mb-6 text-center text-sm text-gray-600">
                    Total: {users.length} user{users.length !== 1 ? "s" : ""} |
                    Showing: {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Search User</label>
                                <input
                                    type="text"
                                    placeholder="Search by user ID, name, email, phone, city..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Filter by Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="user">User</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 invisible">Clear</label>
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {(searchTerm || selectedRole) && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Found {filteredUsers.length} user(s) matching your criteria
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-600">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No users found.</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">No users match your filters.</div>
                    ) : (
                        <div className="overflow-x-auto show-scrollbar">
                            <table className="w-full border-collapse min-w-225">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Name</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Email</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Phone</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Role</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Approval</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.map((user) => {
                                        const isVendor = user.role === "vendor";
                                        const isApproved = Boolean(user.vendorDetails?.isApproved);

                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 border border-gray-300">{user.name || "N/A"}</td>
                                                <td className="py-3 px-4 border border-gray-300">{user.email || "N/A"}</td>
                                                <td className="py-3 px-4 border border-gray-300">{user.phone || "N/A"}</td>
                                                <td className="py-3 px-4 border border-gray-300">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.role === "admin"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : user.role === "vendor"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300">
                                                    {isVendor ? (
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                isApproved
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {isApproved ? "Approved" : "Pending"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Not required</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 border border-gray-300">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetails(user)}
                                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
                                                    >
                                                        <FaEye /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1}-{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Prev
                                        </button>

                                        {getPaginationItems().map((item, idx) => {
                                            if (typeof item === "string") {
                                                return <span key={`${item}-${idx}`} className="px-2 text-gray-500">...</span>;
                                            }

                                            const isActive = item === currentPage;
                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setCurrentPage(item)}
                                                    className={`px-3 py-1 rounded-md border transition-colors duration-200 ${
                                                        isActive
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
                    <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                                <p className="text-sm text-gray-500">Full information for {selectedUser.name || "this account"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetails}
                                disabled={approvalLoading}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-6 show-scrollbar">
                            <div className="grid gap-6 md:grid-cols-2">
                                <InfoCard icon={<FaUser />} label="Name" value={selectedUser.name || "N/A"} />
                                <InfoCard icon={<FaEnvelope />} label="Email" value={selectedUser.email || "N/A"} />
                                <InfoCard icon={<FaPhone />} label="Phone" value={selectedUser.phone || "N/A"} />
                                <InfoCard icon={<FaMapMarkerAlt />} label="City" value={selectedUser.city || "N/A"} />
                                <InfoCard label="Address" value={selectedUser.address || "N/A"} />
                                <InfoCard label="Role" value={selectedUser.role || "N/A"} />
                                <InfoCard label="Email Verified" value={selectedUser.isemailverified ? "Yes" : "No"} />
                                <InfoCard label="Blocked" value={selectedUser.isblocked ? "Yes" : "No"} />
                            </div>

                            {selectedUser.role === "vendor" && (
                                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                                    <div className="text-blue-800 font-semibold text-lg">Vendor Approval</div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <InfoCard
                                            label="Approval Status"
                                            value={selectedUser.vendorDetails?.isApproved ? "Approved" : "Pending Approval"}
                                        />
                                        <InfoCard
                                            label="Approved At"
                                            value={selectedUser.vendorDetails?.approvedAt ? new Date(selectedUser.vendorDetails.approvedAt).toLocaleString() : "N/A"}
                                        />
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleVendorApproval(selectedUser, true)}
                                            disabled={approvalLoading || Boolean(selectedUser.vendorDetails?.isApproved)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FaCheck /> Approve Vendor
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleVendorApproval(selectedUser, false)}
                                            disabled={approvalLoading || !Boolean(selectedUser.vendorDetails?.isApproved)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <FaTimes /> Remove Approval
                                        </button>
                                    </div>

                                    <div className="mt-6 rounded-xl border border-blue-200 bg-white p-4">
                                        <h4 className="text-sm font-semibold text-gray-800">Vendor Bikes Added</h4>
                                        <p className="mt-1 text-sm text-gray-700">
                                            Bike Count: <span className="font-semibold">{vendorProducts.length}</span>
                                        </p>

                                        {vendorProductsLoading ? (
                                            <p className="mt-3 text-sm text-gray-600">Loading bikes...</p>
                                        ) : vendorProductsError ? (
                                            <p className="mt-3 text-sm text-red-600">{vendorProductsError}</p>
                                        ) : vendorProducts.length === 0 ? (
                                            <p className="mt-3 text-sm text-gray-600">No bikes added by this vendor yet.</p>
                                        ) : (
                                            <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 show-scrollbar">
                                                <ul className="space-y-2">
                                                    {vendorProducts.map((bike) => (
                                                        <li key={bike._id} className="rounded-md border border-gray-200 bg-white p-2">
                                                            <p className="text-sm font-medium text-gray-900">{bike.bikeName || "Unnamed Bike"}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {bike.bikeType || "N/A"} | {bike.city || "N/A"} | Rs. {Number(bike.pricePerDay || 0).toLocaleString()}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedUser.role !== "vendor" && selectedUser.preferences && (
                                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <InfoCard label="Preferred Bike Type" value={selectedUser.preferences.preferredBikeType || "N/A"} />
                                        <InfoCard label="Travel Style" value={selectedUser.preferences.travelStyle || "N/A"} />
                                        <InfoCard label="Budget Range" value={selectedUser.preferences.budgetRange || "N/A"} />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <InfoCard label="Registered At" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"} />
                                <InfoCard
                                    label={selectedUser.role === "vendor" ? "Approval Updated At" : "Updated At"}
                                    value={
                                        selectedUser.role === "vendor"
                                            ? (selectedUser.vendorDetails?.approvedAt ? new Date(selectedUser.vendorDetails.approvedAt).toLocaleString() : "N/A")
                                            : (selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : "N/A")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ label, value, icon = null }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                {icon}
                <span>{label}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-900 wrap-break-word break-all">{value}</p>
        </div>
    );
}
