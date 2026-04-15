import api from "@/features/shared/services/api";

type PassengerStatus = "active" | "banned" | "inactive";

type BackendEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
  success: boolean;
};

type BackendUser = {
  contact?: string | null;
  createdAt?: string | null;
  email?: string | null;
  firstName: string;
  id: string;
  lastName: string;
  middleName?: string | null;
  role: "admin" | "driver" | "passenger" | "staff";
  status?: string | null;
  updatedAt?: string | null;
};

type PassengerRecord = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username?: string;
  email?: string;
  contact_number?: string;
  status: PassengerStatus;
  created_at: string;
  last_active?: string;
};

function mapStatus(status?: string | null): PassengerStatus {
  if (status === "suspended") {
    return "banned";
  }

  if (status === "inactive") {
    return "inactive";
  }

  return "active";
}

function mapPassenger(user: BackendUser): PassengerRecord {
  const createdAt = user.createdAt ?? new Date().toISOString();
  const lastActive = user.updatedAt ?? undefined;
  const username = user.email
    ? user.email.split("@")[0]
    : undefined;

  return {
    contact_number: user.contact ?? undefined,
    created_at: createdAt,
    email: user.email ?? undefined,
    first_name: user.firstName,
    id: user.id,
    last_active: lastActive,
    last_name: user.lastName,
    middle_name: user.middleName ?? undefined,
    status: mapStatus(user.status),
    username,
  };
}

export const passengerService = {
  async getPassengers() {
    const res = await api.get<BackendEnvelope<BackendUser[]>>("/admin/users", {
      params: {
        role: "passenger",
      },
    });

    return res.data.data.map((user) => mapPassenger(user));
  },

  async createPassenger(data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username?: string;
    contact_number?: string;
    email: string;
    password: string;
    status?: string;
  }) {
    const res = await api.post<BackendEnvelope<BackendUser>>("/users", {
      contact_number: data.contact_number,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      password: data.password,
      role: "passenger",
    });

    return mapPassenger(res.data.data);
  },

  async updatePassenger(id: string, data: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    email?: string;
    status?: string;
  }) {
    const res = await api.patch<BackendEnvelope<BackendUser>>(`/users/${id}`, {
      contact_number: data.contact_number,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      role: "passenger",
    });

    return mapPassenger(res.data.data);
  },

  async deletePassenger(id: string) {
    const res = await api.delete<BackendEnvelope<{ id: string }>>(`/users/${id}`);
    return res.data.data;
  },
};
