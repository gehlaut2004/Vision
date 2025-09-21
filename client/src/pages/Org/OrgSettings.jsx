import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./OrgSidebar";
import Header from "./OrgHeader";

export default function OrgSettings() {
  const [org, setOrg] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailStep, setEmailStep] = useState("input");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("org"));
    if (stored?._id) {
      setOrg(stored);
      setOrgName(stored.orgName);
    } else {
      alert("Not logged in. Please login.");
      window.location.href = "/org-auth";
    }
  }, []);

  const updateOrgName = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/org/settings/name", {
        orgId: org._id,
        newName: orgName,
      });
      alert("✅ Name updated to " + res.data.orgName);
      const updatedOrg = { ...org, orgName: res.data.orgName };
      setOrg(updatedOrg);
      localStorage.setItem("org", JSON.stringify(updatedOrg));
    } catch (err) {
      alert("❌ Failed to update name");
    }
  };

  const updatePassword = async () => {
    try {
      await axios.put("http://localhost:5000/api/org/settings/password", {
        orgId: org._id,
        oldPassword,
        newPassword,
      });
      alert("✅ Password updated");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      alert("❌ Failed to update password: " + err.response?.data?.error);
    }
  };

  const sendOtpToEmail = async () => {
    try {
      await axios.post("http://localhost:5000/api/org/settings/email/send-otp", {
        orgId: org._id,
        newEmail,
      });
      setEmailStep("otp");
      alert("📨 OTP sent to " + newEmail);
    } catch (err) {
      alert("❌ Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.put("http://localhost:5000/api/org/settings/email/verify", {
        orgId: org._id,
        newEmail,
        otp,
      });
      alert("✅ Email updated successfully");
      setOrg({ ...org, email: newEmail });
      localStorage.setItem("org", JSON.stringify({ ...org, email: newEmail }));
      setEmailStep("input");
      setNewEmail("");
      setOtp("");
    } catch (err) {
      alert("❌ Invalid OTP or error updating email");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-mono">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="⚙️ Organization Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* 👤 View Mode */}
            {!isEditing && (
              <div className="bg-gray-800 rounded-lg p-6 shadow border border-cyan-600/20 space-y-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">👤 Account Info</h3>
                <p><span className="text-gray-400">Organization Name:</span> {org.orgName}</p>
                <p><span className="text-gray-400">Email:</span> {org.email}</p>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-bold"
                >
                  Edit Info
                </button>
              </div>
            )}

            {/* ✏️ Edit Mode */}
            {isEditing && (
              <div className="space-y-10">

                {/* Org Name */}
                <div className="bg-gray-800 rounded-lg p-6 shadow border border-cyan-600/20">
                  <h3 className="text-lg font-bold mb-4 text-cyan-300">Change Organization Name</h3>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white border border-cyan-400/20 focus:border-cyan-400 outline-none"
                  />
                  <button
                    onClick={updateOrgName}
                    className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded text-white font-bold"
                  >
                    Update Name
                  </button>
                </div>

                {/* Password */}
                <div className="bg-gray-800 rounded-lg p-6 shadow border border-purple-600/20">
                  <h3 className="text-lg font-bold mb-4 text-purple-300">Change Password</h3>
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white border border-purple-400/20 focus:border-purple-400 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white border border-purple-400/20 focus:border-purple-400 outline-none"
                  />
                  <button
                    onClick={updatePassword}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-bold"
                  >
                    Change Password
                  </button>
                </div>

                {/* Email */}
                <div className="bg-gray-800 rounded-lg p-6 shadow border border-yellow-600/20">
                  <h3 className="text-lg font-bold mb-4 text-yellow-300">Update Email</h3>
                  {emailStep === "input" ? (
                    <>
                      <input
                        type="email"
                        placeholder="New Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white border border-yellow-400/20 focus:border-yellow-400 outline-none"
                      />
                      <button
                        onClick={sendOtpToEmail}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-bold"
                      >
                        Send OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white border border-yellow-400/20 focus:border-yellow-400 outline-none"
                      />
                      <button
                        onClick={verifyOtp}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-bold"
                      >
                        Verify & Update Email
                      </button>
                    </>
                  )}
                </div>

                <div className="text-right">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
