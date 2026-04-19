import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/loader.jsx";

const SUBSCRIBERS_PER_PAGE = 20;

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/newsletter/admin/subscribers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            limit: SUBSCRIBERS_PER_PAGE,
            search: searchTerm || undefined,
            status: statusFilter,
          },
        }
      );

      toast.success("subscribers fetched successfully");
      setSubscribers(response.data?.subscribers || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalSubscribers(response.data?.pagination?.totalSubscribers || 0);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch newsletter subscribers";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchSubscribers();
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/newsletter/admin/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: statusFilter,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "text/csv",
      });

      const disposition = response.headers["content-disposition"] || "";
      const matchedFilename = disposition.match(/filename=([^;]+)/i);
      const filename = matchedFilename
        ? matchedFilename[1].replaceAll('"', "")
        : "newsletter_subscribers.csv";

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success("Newsletter subscribers exported successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to export subscribers";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleString("en-GB");
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader />
        <p className="text-gray-600 mt-4">Loading newsletter subscribers...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full max-w-[98vw] xl:max-w-400 mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Newsletter Subscribers</h1>

        <div className="mb-6 text-center text-sm text-gray-600">
          Total Subscribers: {totalSubscribers}
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Search by Email</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type subscriber email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 invisible">Actions</label>
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : subscribers.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No newsletter subscribers found.</div>
          ) : (
            <div className="overflow-x-auto show-scrollbar">
              <table className="w-full border-collapse min-w-220">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Email</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Audience</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Source</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border border-gray-300">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border border-gray-300 font-medium text-gray-900">{item.email}</td>
                      <td className="py-3 px-4 border border-gray-300 text-gray-700 capitalize">{item.audienceType || "general"}</td>
                      <td className="py-3 px-4 border border-gray-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 border border-gray-300 text-gray-700">{item.source || "footer"}</td>
                      <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!error && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!canGoPrev}
              className="px-3 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <span className="text-sm text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={!canGoNext}
              className="px-3 py-2 text-sm rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
