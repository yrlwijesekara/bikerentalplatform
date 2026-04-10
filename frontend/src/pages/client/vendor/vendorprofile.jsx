import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit, FaSave, FaTimes, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import Loader from "../../../components/loader.jsx";
import Footer from "../../../components/footer.jsx";

export default function VendorProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    image: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = response.data;
      setUser(profile);
      setFormData({
        firstname: profile.firstname || "",
        lastname: profile.lastname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        image: profile.image || "",
      });
    } catch (error) {
      console.error("Error loading vendor profile:", error);
      toast.error(error.response?.data?.error || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstname.trim()) return toast.error("First name is required"), false;
    if (!formData.lastname.trim()) return toast.error("Last name is required"), false;
    if (!formData.email.trim()) return toast.error("Email is required"), false;
    if (!formData.phone.trim()) return toast.error("Phone number is required"), false;
    if (!formData.address.trim()) return toast.error("Address is required"), false;
    if (!formData.city.trim()) return toast.error("City is required"), false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid phone number (at least 10 digits)");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setIsEditing(false);
      toast.success("Vendor profile updated successfully!");
    } catch (error) {
      console.error("Error saving vendor profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      image: user.image || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--main-background)">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--main-background)">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-(--navbar-bg)">Failed to load vendor profile</h2>
          <button
            onClick={fetchProfile}
            className="rounded-lg px-6 py-2 font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--main-background) pt-6">
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <div className="mb-8 text-center">
          <p className="mb-2 inline-flex rounded-full bg-(--navbar-hover) px-4 py-1 text-sm font-medium text-white">
            Vendor Profile
          </p>
          <h1 className="text-3xl font-bold text-(--navbar-bg)">Manage your account profile</h1>
          <p className="mt-2 text-gray-600">Update your personal account details from one place.</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-(--brand-primary) text-2xl text-white">
                {user.image ? (
                  <img src={user.image} alt="Vendor" className="h-full w-full object-cover" />
                ) : (
                  <FaUser />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-sm font-medium text-slate-600">Vendor account</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {user.vendorDetails?.isApproved ? "Approved business" : "Pending approval"}
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--brand-secondary)" }}
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Details</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First Name" value={formData.firstname} name="firstname" onChange={handleChange} isEditing={isEditing} />
                <Field label="Last Name" value={formData.lastname} name="lastname" onChange={handleChange} isEditing={isEditing} />
                <Field label="Email" value={formData.email} name="email" onChange={handleChange} isEditing={isEditing} type="email" icon={<FaEnvelope className="text-sm text-(--brand-primary)" />} />
                <Field label="Phone" value={formData.phone} name="phone" onChange={handleChange} isEditing={isEditing} type="tel" icon={<FaPhone className="text-sm text-(--brand-primary)" />} />
                <Field label="City" value={formData.city} name="city" onChange={handleChange} isEditing={isEditing} />
               
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Address" value={formData.address} name="address" onChange={handleChange} isEditing={isEditing} textarea />
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Approval Status</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {user.vendorDetails?.isApproved ? "Approved by admin" : "Waiting for admin approval"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "var(--section-divider)" }}
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: saving ? "var(--button-primary-disabled)" : "var(--brand-success)" }}
              >
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Field({ label, value, name, onChange, isEditing, type = "text", textarea = false, icon = null }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {isEditing ? (
        textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows="4"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-(--brand-primary)"
          />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
            {icon}
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              className="w-full outline-none"
            />
          </div>
        )
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
          {value || "N/A"}
        </div>
      )}
    </div>
  );
}