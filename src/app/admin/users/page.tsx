import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  numberPlate: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

async function createUser(formData: FormData) {
  "use server";
  const parsed = userSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    numberPlate: formData.get("numberPlate")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;
  await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email || null,
      address: data.address || null,
      numberPlate: data.numberPlate || null,
      phone: data.phone || null,
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Users</h2>

      {/* Create user */}
      <section className="border rounded p-4 max-w-2xl">
        <h3 className="font-medium mb-3">Create user</h3>
        <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Name *</span>
            <input name="name" className="border p-2 rounded" required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Email</span>
            <input name="email" type="email" className="border p-2 rounded" />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm opacity-70">Address</span>
            <input name="address" className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Number plate</span>
            <input name="numberPlate" className="border p-2 rounded" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Phone</span>
            <input name="phone" className="border p-2 rounded" />
          </label>
          <div className="md:col-span-2">
            <button className="bg-black text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      </section>

      {/* List */}
      <section>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border">Name</th>
              <th className="text-left p-2 border">Plate</th>
              <th className="text-left p-2 border">Phone</th>
              <th className="text-left p-2 border">Email</th>
              <th className="text-left p-2 border">Registered</th>
              <th className="text-left p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.numberPlate ?? ""}</td>
                <td className="p-2 border">{u.phone ?? ""}</td>
                <td className="p-2 border">{u.email ?? ""}</td>
                <td className="p-2 border">
                  {new Date(u.registeredAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <Link className="underline" href={`/admin/users/${u.id}`}>
                    View / Edit
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center opacity-70">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
