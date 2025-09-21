import { useState } from "react";
import axios from "axios";

export default function UploadCSV({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a CSV file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("orgToken");

      const res = await axios.post(
        "http://localhost:5000/api/org/upload-csv",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(`✅ ${res.data.message}`);
      onUploadSuccess && onUploadSuccess(res.data.students);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to upload CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10 w-full max-w-md text-white">
      <h2 className="text-xl font-bold mb-4">📤 Upload CSV</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-2 w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 px-4 rounded font-semibold"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
