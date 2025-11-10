import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import DeleteConfirmButton from "./DeleteConfirmButton";
const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  numberPlate: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isActive: z.string().optional(), // "on" if checked
});

async function updateUser(_prev: unknown, formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const parsed = editSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    numberPlate: formData.get("numberPlate")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    isActive: formData.get("isActive")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }
  const d = parsed.data;
  await prisma.user.update({
    where: { id },
    data: {
      name: d.name.trim(),
      email: d.email || null,
      address: d.address || null,
      numberPlate: d.numberPlate || null,
      phone: d.phone || null,
      isActive: d.isActive === "on",
    },
  });
  revalidatePath(`/admin/users/${id}`);
  return { ok: true };
}

async function deleteUser(_prev: unknown, formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  // Delete dependent rows first if needed
  await prisma.parkingSession.deleteMany({ where: { userId: id } });
  await prisma.invoice.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export default async function UserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next 15+ style
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-semibold">Edit user</h2>

      <form action={updateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-4">
        <input type="hidden" name="id" value={user.id} />
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Name *</span>
          <input name="name" defaultValue={user.name} className="border p-2 rounded" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Email</span>
          <input name="email" type="email" defaultValue={user.email ?? ""} className="border p-2 rounded" />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm opacity-70">Address</span>
          <input name="address" defaultValue={user.address ?? ""} className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Number plate</span>
          <input name="numberPlate" defaultValue={user.numberPlate ?? ""} className="border p-2 rounded" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Phone</span>
          <input name="phone" defaultValue={user.phone ?? ""} className="border p-2 rounded" />
        </label>
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" name="isActive" defaultChecked={user.isActive} />
          <span className="text-sm">Active</span>
        </label>

        <div className="md:col-span-2 flex gap-3">
          <button className="bg-black text-white px-4 py-2 rounded">Save changes</button>
          {/* Delete on right */}
        </div>
      </form>

      <form action={deleteUser} className="border rounded p-4">
        <input type="hidden" name="id" value={user.id} />
        <DeleteConfirmButton
            type="submit"
            className="px-4 py-2 rounded border border-red-600 text-red-600"
            confirmText="Delete this user and all related sessions/invoices?"
        >
            Delete user
        </DeleteConfirmButton>
        </form>

      {/* Quick info */}
      <section className="border rounded p-4 text-sm">
        <div><b>Registered:</b> {new Date(user.registeredAt).toLocaleString()}</div>
        <div><b>User ID:</b> {user.id}</div>
      </section>
    </div>
  );
}
