import { Trash2, Pencil, Power, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type Stop = {
  id: string;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
};

type Props = {
  onDelete: (id: string) => void;
  onEdit: (stop: Stop) => void;
  onReorder: (stops: Stop[]) => void;
  onToggle: (id: string, isActive: boolean) => void;
  stops: Stop[];
};

type RowProps = {
  index: number;
  onDelete: (id: string) => void;
  onEdit: (stop: Stop) => void;
  onToggle: (id: string, isActive: boolean) => void;
  stop: Stop;
};

function ActionButtons({ onDelete, onEdit, onToggle, stop }: Omit<RowProps, "index">) {
  const isActive = stop.is_active ?? true;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="rounded-xl border border-slate-200 p-2 text-sky-700 transition hover:bg-sky-50"
        onClick={() => onEdit(stop)}
        type="button"
      >
        <Pencil size={16} />
      </button>

      <button
        className="rounded-xl border border-slate-200 p-2 text-amber-700 transition hover:bg-amber-50"
        onClick={() => onToggle(stop.id, !isActive)}
        type="button"
      >
        <Power size={16} />
      </button>

      <button
        className="rounded-xl border border-slate-200 p-2 text-rose-700 transition hover:bg-rose-50"
        onClick={() => onDelete(stop.id)}
        type="button"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function SortableRow({ stop, index, onDelete, onToggle, onEdit }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const isActive = stop.is_active ?? true;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} className="transition-colors hover:bg-slate-50" style={style}>
      <td className="px-3" {...attributes} {...listeners}>
        <button className="cursor-grab rounded-xl p-2 text-slate-400 transition hover:bg-slate-100" type="button">
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-5 py-4 font-semibold text-slate-700">{index + 1}</td>
      <td className="px-5 py-4 font-medium text-slate-900">
        {stop.name ? stop.name : <span className="italic text-slate-400">Unnamed Stop</span>}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <ActionButtons onDelete={onDelete} onEdit={onEdit} onToggle={onToggle} stop={stop} />
      </td>
    </tr>
  );
}

function SortableMobileCard({ stop, index, onDelete, onEdit, onToggle }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const isActive = stop.is_active ?? true;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      className="space-y-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Stop #{index + 1}</p>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            {stop.name ? stop.name : <span className="italic text-slate-400">Unnamed Stop</span>}
          </h3>
        </div>

        <button
          className="cursor-grab rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <ActionButtons onDelete={onDelete} onEdit={onEdit} onToggle={onToggle} stop={stop} />
    </article>
  );
}

export default function StopsTable({ stops, onDelete, onToggle, onEdit, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = stops.findIndex((stop) => stop.id === active.id);
    const newIndex = stops.findIndex((stop) => stop.id === over.id);

    onReorder(arrayMove(stops, oldIndex, newIndex));
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h3 className="text-base font-semibold text-slate-900">Stops</h3>
        <p className="text-sm text-slate-500">Drag to reorder, then publish when the route is ready.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:hidden">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {stops.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm italic text-slate-400">
                  No stops added yet
                </div>
              ) : (
                stops.map((stop, index) => (
                  <SortableMobileCard
                    key={stop.id}
                    index={index}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onToggle={onToggle}
                    stop={stop}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="hidden min-h-0 flex-1 overflow-auto md:block">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <table className="min-w-[760px] w-full text-sm">
            <thead className="sticky top-0 bg-emerald-950 text-left text-xs uppercase tracking-[0.18em] text-white">
              <tr>
                <th className="w-[72px] px-3 py-3"></th>
                <th className="w-[110px] px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Bus Stop</th>
                <th className="w-[150px] px-5 py-3 font-semibold">Status</th>
                <th className="w-[180px] px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
              <tbody className="divide-y divide-slate-100">
                {stops.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-400" colSpan={5}>
                      No stops added yet
                    </td>
                  </tr>
                ) : (
                  stops.map((stop, index) => (
                    <SortableRow
                      key={stop.id}
                      index={index}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onToggle={onToggle}
                      stop={stop}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
