export default function Dashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-700 mb-6">Welcome to the admin dashboard! Here you can manage users, products, orders, and reviews.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                    <p className="text-3xl font-bold text-blue-600">1,234</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Total Products</h2>
                    <p className="text-3xl font-bold text-green-600">567</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
                    <p className="text-3xl font-bold text-yellow-600">890</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Total Reviews</h2>
                    <p className="text-3xl font-bold text-purple-600">1,234</p>
                </div>
            </div>
        </div>
    );
}