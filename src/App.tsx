import { useCallback, useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@mui/material";

import { Calendar, Plus, Search } from "lucide-react";

import TodoForm, { type TodoFormState } from "./components/TodoForm";

import { Toaster, toast } from "react-hot-toast";

import { socket } from "./socket";

export type TodoStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Todo {
	id: string;
	title: string;
	description: string;
	status: TodoStatus;
	reminderAt?: string;
	fileUrl?: string;
}

interface GetAllResponse<T> {
	count: number;
	data: T[];
}

const API_BASE_URL = "http://localhost:3000";

const INITIAL_FORM: TodoFormState = {
	title: "",
	description: "",
	status: "PENDING",
	reminderAt: "",
	file: null,
};

export default function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
	const [search, setSearch] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [form, setForm] = useState<TodoFormState>(INITIAL_FORM);
	const isEditing = selectedTodo !== null;

	useEffect(() => {
		if (Notification.permission !== "granted") {
			void Notification.requestPermission();
		}
	}, []);
	useEffect(() => {
		socket.on("todo-reminder", (data) => {
			toast.success(`🔔 ${data.title}`);
			if (Notification.permission === "granted") {
				new Notification(data.title, { body: data.description });
			}
		});

		return () => {
			socket.off("todo-reminder");
		};
	}, []);
	useEffect(() => {
		void fetchTodos();
	}, [search, statusFilter]);

	const fetchTodos = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (search.trim()) {
				params.append("search", search);
			}
			if (statusFilter !== "ALL") {
				params.append("status", statusFilter);
			}
			const response = await fetch(`${API_BASE_URL}/todos?${params.toString()}`);
			if (!response.ok) {
				throw new Error("Failed to fetch todos");
			}
			const result: GetAllResponse<Todo> = await response.json();
			setTodos(result.data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter]);

	function handleOpenCreate(): void {
		setSelectedTodo(null);
		setForm(INITIAL_FORM);
		setDialogOpen(true);
	}

	function handleOpenEdit(todo: Todo): void {
		setSelectedTodo(todo);

		setForm({
			title: todo.title,
			description: todo.description,
			status: todo.status,
			reminderAt: todo.reminderAt || "",
			file: null,
		});

		setDialogOpen(true);
	}

	function handleCloseDialog(): void {
		setDialogOpen(false);
		setSelectedTodo(null);
		setForm(INITIAL_FORM);
	}

	function handleChange(field: keyof TodoFormState, value: string | File | null): void {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	}

	async function createTodo(): Promise<void> {
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("status", form.status);
		if (form.reminderAt) {
			formData.append("reminderAt", form.reminderAt);
		}
		if (form.file) {
			formData.append("file", form.file);
		}
		const response = await fetch(`${API_BASE_URL}/todos`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to create todo");
		}
	}

	async function updateTodo(): Promise<void> {
		if (!selectedTodo) {
			return;
		}
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("status", form.status);
		if (form.reminderAt) {
			formData.append("reminderAt", form.reminderAt);
		}
		if (form.file) {
			formData.append("file", form.file);
		}
		const response = await fetch(`${API_BASE_URL}/todos/${selectedTodo.id}`, {
			method: "PATCH",
			body: formData,
		});
		if (!response.ok) {
			throw new Error("Failed to update todo");
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		try {
			if (isEditing) {
				await updateTodo();
			} else {
				await createTodo();
			}
			handleCloseDialog();
			await fetchTodos();
		} catch (error) {
			console.error(error);
		}
	}

	async function handleDelete(id: string): Promise<void> {
		try {
			const response = await fetch(
				`${API_BASE_URL}/todos/${id}`,

				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete todo");
			}

			await fetchTodos();
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="min-h-screen bg-slate-100">
			<header className="border-b bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<div>
						<h1 className="text-2xl font-bold text-slate-800">Todo App</h1>

						<p className="text-sm text-slate-500">Manage your daily tasks</p>
					</div>

					<button
						onClick={handleOpenCreate}
						className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
					>
						<Plus size={18} />
						Create Todo
					</button>
				</div>
			</header>

			<main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[350px_1fr]">
				<aside className="space-y-6">
					<div className="rounded-2xl bg-white p-5 shadow-sm">
						<h2 className="mb-4 text-lg font-semibold">Overview</h2>

						<div className="space-y-4">
							<div className="rounded-xl bg-slate-100 p-4">
								<p className="text-sm text-slate-500">Total Todos</p>

								<h3 className="mt-1 text-2xl font-bold">{todos.length}</h3>
							</div>
						</div>
					</div>
				</aside>

				<section className="space-y-6">
					<div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
						<div className="flex items-center gap-3 rounded-xl border px-4 py-3">
							<Search size={18} className="text-slate-400" />

							<input
								type="text"
								placeholder="Search todos..."
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								className="w-full bg-transparent text-sm outline-none"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							{["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((status) => (
								<button
									key={status}
									onClick={() => setStatusFilter(status)}
									className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
										statusFilter === status
											? "bg-black text-white"
											: "border hover:bg-slate-50"
									}`}
								>
									{status}
								</button>
							))}
						</div>
					</div>

					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
						{loading ? (
							<div>Loading...</div>
						) : (
							todos.map((todo) => (
								<div
									key={todo.id}
									className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
								>
									<div className="mb-4 flex items-start justify-between">
										<div>
											<h3 className="text-lg font-semibold text-slate-800">
												{todo.title}
											</h3>

											<p className="mt-1 text-sm text-slate-500">{todo.description}</p>
										</div>

										<span
											className={`rounded-full px-3 py-1 text-xs font-medium ${
												todo.status === "PENDING"
													? "bg-yellow-100 text-yellow-800"
													: todo.status === "IN_PROGRESS"
														? "bg-blue-100 text-blue-800"
														: todo.status === "COMPLETED"
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
											}`}
										>
											{todo.status.replace("_", " ")}
										</span>
									</div>

									{todo.reminderAt && (
										<div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
											<Calendar size={16} />

											<span>{new Date(todo.reminderAt).toLocaleString()}</span>
										</div>
									)}

									{todo.fileUrl && (
										<div className="mb-5">
											<p className="mb-2 text-sm font-medium text-slate-600">
												Attachment
											</p>

											{todo.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
												<img
													src={todo.fileUrl}
													alt="Todo Attachment"
													className="h-40 w-full rounded-xl border object-cover"
												/>
											) : (
												<a
													href={todo.fileUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
												>
													View File
												</a>
											)}
										</div>
									)}

									<div className="flex gap-3">
										<button
											onClick={() => handleOpenEdit(todo)}
											className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
										>
											Edit
										</button>

										<button
											onClick={() => void handleDelete(todo.id)}
											className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
										>
											Delete
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</section>
			</main>

			<Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
				<DialogTitle>{isEditing ? "Update Todo" : "Create Todo"}</DialogTitle>

				<DialogContent>
					<TodoForm
						form={form}
						isEditing={isEditing}
						onChange={handleChange}
						onSubmit={handleSubmit}
					/>
				</DialogContent>
			</Dialog>
			<Toaster position="top-right" />
		</div>
	);
}
