export default function StudentLoginForm() {
  return (
    <form className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Username"
        className="p-2 border rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 border rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  );
}
