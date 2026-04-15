import { useEffect, useState } from "react";
import { Search, Download, Plus, Pencil, Trash2, X } from "lucide-react";
import { passengerService } from "./services/passengerService";

type Passenger = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username?: string;
  email?: string;
  contact_number?: string;
  status: "active" | "inactive" | "banned";
  created_at: string;
  last_active?: string;
};

export function AdminPassengerManagement() {
  const [search, setSearch] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    contact_number: "",
    email: "",
    password: "",
    status: "active"
  });

  useEffect(() => {
    loadPassengers();
  }, []);

  async function loadPassengers() {
    try {
      const data = await passengerService.getPassengers();
      setPassengers(data);
    } catch (error) {
      console.error("Failed to load passengers", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = passengers.filter((p) => {
    const searchText = search.toLowerCase();

    const values = [
      p.first_name,
      p.last_name,
      p.username ?? "",
      p.email ?? ""
    ].join(" ").toLowerCase();

    return values.includes(searchText);
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-600";
      case "banned":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleCreatePassenger() {
    try {
      await passengerService.createPassenger(form);
      setShowModal(false);
      resetForm();
      loadPassengers();
    } catch (error) {
      console.error("Create passenger failed", error);
    }
  }

  async function handleUpdatePassenger() {
    if (!editingPassenger) return;

    await passengerService.updatePassenger(editingPassenger.id, form);

    setEditingPassenger(null);
    setShowModal(false);
    resetForm();
    loadPassengers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this passenger?")) return;

    await passengerService.deletePassenger(id);
    loadPassengers();
  }

  function resetForm() {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      username: "",
      contact_number: "",
      email: "",
      password: "",
      status: "active"
    });
  }

  function exportCSV() {
    const csv = [
      ["First Name", "Last Name", "Username", "Email", "Contact", "Status"],
      ...filtered.map((p) => [
        p.first_name,
        p.last_name,
        p.username ?? "",
        p.email ?? "",
        p.contact_number ?? "",
        p.status
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "passengers.csv";
    a.click();
  }

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-xl font-semibold">Passenger Management</h1>

        <div className="flex gap-2">

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => {
              setEditingPassenger(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Passenger
          </button>

        </div>

      </div>

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-72 bg-white">

        <Search size={16} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search username, email, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="outline-none text-sm w-full"
        />

      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="w-full overflow-x-auto">

          <table className="table-auto min-w-[900px] w-full text-sm">

            <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider sticky top-0 z-10">

              <tr>
                <th className="px-4 py-3 text-left w-[280px]">Passenger</th>
                <th className="px-6 py-3 text-center">Username</th>
                <th className="px-6 py-3 text-center">Contact</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Last Active</th>
                <th className="px-6 py-3 text-center">Created</th>
                <th className="px-6 py-3 text-center w-[120px]">Actions</th>
              </tr>

            </thead>

            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    Loading passengers...
                  </td>
                </tr>

              ) : filtered.length === 0 ? (

                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No passengers found
                  </td>
                </tr>

              ) : (

                filtered.map((user) => {

                  const fullName =
                    `${user.first_name} ${user.middle_name ?? ""} ${user.last_name}`;

                  return (

                    <tr key={user.id} className="hover:bg-gray-50 transition">

                      {/* Passenger */}
                      <td className="px-6 py-4 flex items-center gap-3 border-r border-gray-200 hover:bg-gray-200 transition ">

                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                          {user.first_name.charAt(0)}
                        </div>

                        <div className="flex flex-col ">

                          <span className="font-medium text-gray-800 transition">
                            {fullName}
                          </span>

                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-center text-gray-700">
                        {user.username ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-center text-gray-600">
                        {user.contact_number ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge(user.status)}`}
                        >
                          {user.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-center text-xs text-gray-600">

                        {user.last_active
                          ? new Date(user.last_active).toLocaleDateString()
                          : "Never"}

                      </td>

                      <td className="px-6 py-4 text-center text-xs text-gray-600">

                        {new Date(user.created_at).toLocaleDateString()}

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => {
                              setEditingPassenger(user);
                              setForm({
                                first_name: user.first_name,
                                middle_name: user.middle_name ?? "",
                                last_name: user.last_name,
                                username: user.username ?? "",
                                contact_number: user.contact_number ?? "",
                                email: user.email ?? "",
                                password: "",
                                status: user.status
                              });
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-[420px] space-y-4 shadow-xl">

            <div className="flex justify-between items-center">

              <h2 className="text-lg font-semibold">
                {editingPassenger ? "Edit Passenger" : "Add Passenger"}
              </h2>

              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>

            </div>

            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            <input name="middle_name" placeholder="Middle Name" value={form.middle_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            <input name="contact_number" placeholder="Contact Number" value={form.contact_number} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />

            {!editingPassenger && (
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
            )}

            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>

            <button
              onClick={editingPassenger ? handleUpdatePassenger : handleCreatePassenger}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {editingPassenger ? "Update Passenger" : "Create Passenger"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
